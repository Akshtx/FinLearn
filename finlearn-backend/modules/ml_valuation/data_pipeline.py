"""
data_pipeline.py — Indian Stock Market Data Pipeline
=====================================================
Data source: Screener_Query_Results_Page1.xlsx  (Screener.in snapshot)

This module completely replaces the previous US-stock / Alpha Vantage
collection pipeline.  All data now comes exclusively from the supplied
Indian market Excel file.

Public API (preserved for backward compatibility with train_pipeline.py):
    FEATURE_COLS                 — ordered list of ML feature names
    collect_and_prepare_dataset() — loads, cleans, scores and labels data;
                                    returns a ready-to-train DataFrame

No API keys, no external network calls, no US-stock tickers.
"""

import os
import json
import warnings
import numpy  as np
import pandas as pd
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv()

# ─── Paths ────────────────────────────────────────────────────────────────────
_THIS_DIR    = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.abspath(os.path.join(_THIS_DIR, "../.."))

EXCEL_PATH = os.environ.get(
    "SCREENER_EXCEL_PATH",
    os.path.join(_BACKEND_DIR, "models_store",
                 "Screener_Query_Results_Page1.xlsx"),
)
MODELS_DIR = os.path.join(_BACKEND_DIR, "models_store")
os.makedirs(MODELS_DIR, exist_ok=True)

# ─── Excel → internal column map ─────────────────────────────────────────────
_EXCEL_COL_MAP = {
    "P/E":             "PE_Ratio",
    "CMP / BV":        "PB_Ratio",
    "PEG":             "PEG_Ratio",
    "ROE %":           "ROE",
    "ROA 12M %":       "ROA",
    "OPM %":           "Profit_Margins",       # Operating Profit Margin
    "Profit Growth %": "Revenue_Growth",        # Profit Growth as proxy
    "EPS Var 5Yrs %":  "EPS_Growth",            # 5-yr EPS variation (not annual)
    "Debt / Eq":       "Debt_to_Equity",
    "ROCE %":          "ROCE",
    "Mar Cap (Rs.Cr.)":"Market_Cap",
    "CMP (Rs.)":       "CMP",
}

# ─── Feature columns (public — used by train_pipeline.py) ────────────────────
# Core ML features (excludes identifiers and non-financial columns)
FEATURE_COLS = [
    "PE_Ratio",
    "PB_Ratio",
    "PEG_Ratio",
    "ROE",
    "ROA",
    "Profit_Margins",
    "Revenue_Growth",
    "EPS_Growth",
    "Debt_to_Equity",
]

# Indicators where LOWER = better (inverted for scoring)
_NEG_INDICATORS = ["PE_Ratio", "PB_Ratio", "PEG_Ratio", "Debt_to_Equity"]
# Indicators where HIGHER = better
_POS_INDICATORS = ["ROE", "ROA", "Profit_Margins", "Revenue_Growth", "EPS_Growth"]

# Score weights (sum = 1.0)
_WEIGHTS = {
    "PE_Ratio":      0.12,
    "PB_Ratio":      0.08,
    "PEG_Ratio":     0.08,
    "ROE":           0.20,
    "ROA":           0.15,
    "Profit_Margins":0.15,
    "Revenue_Growth":0.12,
    "EPS_Growth":    0.10,
    "Debt_to_Equity":0.00,   # filled below
}
_WEIGHTS["Debt_to_Equity"] = round(1.0 - sum(_WEIGHTS.values()), 4)

# Labelling thresholds (tertile split — consistent with train_from_excel.py)
_HIGH_PERCENTILE = 0.67
_LOW_PERCENTILE  = 0.33

# Maximum missing-value % for a feature to be retained
_MAX_MISSING_PCT = 60.0

# Outlier clip percentiles (used for label generation only)
_CLIP_LOW, _CLIP_HIGH = 1, 99


# =============================================================================
# Internal helpers
# =============================================================================

def _detect_header_row(excel_path: str) -> int:
    """Probe the first 8 rows to find the one that contains 'Company'."""
    for trial in range(8):
        probe = pd.read_excel(excel_path, header=trial, nrows=2)
        cols  = [str(c).strip().lower() for c in probe.columns]
        if any("company" in c for c in cols):
            return trial
    return 3   # fallback (consistent with train_from_excel.py)


def _load_raw(excel_path: str) -> pd.DataFrame:
    """Read Excel, apply column map, coerce numerics, strip empties."""
    header_row = _detect_header_row(excel_path)
    df = pd.read_excel(excel_path, header=header_row)
    df.columns = [str(c).strip() for c in df.columns]

    # Rename company column
    company_raw = next((c for c in df.columns if "company" in c.lower()), None)
    if company_raw and company_raw != "Company":
        df = df.rename(columns={company_raw: "Company"})

    # Apply feature mapping
    df = df.rename(columns=_EXCEL_COL_MAP).copy()
    df = df.dropna(how="all").dropna(axis=1, how="all")

    # Coerce all mapped numeric columns
    for col in list(_EXCEL_COL_MAP.values()):
        if col in df.columns:
            df[col] = (
                df[col].astype(str)
                .str.replace(",", "",  regex=False)
                .str.replace("%", "",  regex=False)
                .str.replace("\u20b9", "", regex=False)
                .str.strip()
                .replace(["", "nan", "None", "NaN", "-", "N/A", "\u2014"], np.nan)
            )
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Clean Company column
    if "Company" in df.columns:
        df["Company"] = df["Company"].astype(str).str.strip()
        df = df[df["Company"].str.len() > 0]
        df = df[~df["Company"].str.lower().isin(["nan", "none", ""])]

    return df


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    """Deduplicate by Company, replace infinities."""
    df = df.drop_duplicates(subset=["Company"], keep="first").reset_index(drop=True)
    num_cols = df.select_dtypes(include=np.number).columns
    df[num_cols] = df[num_cols].replace([np.inf, -np.inf], np.nan)
    return df


def _select_available_features(df: pd.DataFrame) -> list:
    """Return FEATURE_COLS members that are present and not too sparse."""
    available = []
    for col in FEATURE_COLS:
        if col not in df.columns:
            continue
        miss_pct = 100.0 * df[col].isna().sum() / max(len(df), 1)
        if miss_pct <= _MAX_MISSING_PCT:
            available.append(col)
        else:
            print(f"  [data_pipeline] EXCLUDE {col}: {miss_pct:.1f}% missing")
    return available


def _generate_labels(df: pd.DataFrame, available_features: list) -> pd.DataFrame:
    """
    Composite financial score → tertile labels.
    Algorithm mirrors train_from_excel.py exactly:
      1. Clip each feature to [1st, 99th] percentile.
      2. Min-max scale to [0, 1].
      3. Invert NEG_INDICATORS (lower = better).
      4. Compute weighted composite score.
      5. Assign labels via lo_thresh / hi_thresh.
    """
    df = df.copy()

    # Clip
    for col in available_features:
        lo = np.nanpercentile(df[col].dropna(), _CLIP_LOW)
        hi = np.nanpercentile(df[col].dropna(), _CLIP_HIGH)
        df[col] = df[col].clip(lo, hi)

    # Scale + score
    score_parts = pd.DataFrame(index=df.index)
    for col in available_features:
        s = df[col].copy()
        s_min, s_max = s.min(), s.max()
        if s_max - s_min < 1e-9:
            scaled = pd.Series(0.5, index=s.index)
        else:
            scaled = (s - s_min) / (s_max - s_min)
        if col in _NEG_INDICATORS:
            scaled = 1.0 - scaled
        score_parts[col] = scaled

    weight_sum = sum(_WEIGHTS[c] for c in available_features)
    composite  = sum(
        score_parts[col] * (_WEIGHTS[col] / weight_sum)
        for col in available_features
    )
    df["Financial_Score"] = composite.round(4)

    lo_thresh = df["Financial_Score"].quantile(_LOW_PERCENTILE)
    hi_thresh = df["Financial_Score"].quantile(_HIGH_PERCENTILE)

    def _label(score):
        if score >= hi_thresh: return "Undervalued"
        if score <= lo_thresh: return "Overvalued"
        return "Fairly Valued"

    df["Label"] = df["Financial_Score"].apply(_label)
    return df, lo_thresh, hi_thresh


# =============================================================================
# Public API
# =============================================================================

def collect_and_prepare_dataset(excel_path: str = None) -> pd.DataFrame:
    """
    Load, clean, score and label the Indian market Excel dataset.

    Returns a DataFrame with:
      - Company        : company name
      - <FEATURE_COLS> : available financial features (raw values)
      - Financial_Score: composite score in [0, 1]
      - Label          : Undervalued / Fairly Valued / Overvalued

    Parameters
    ----------
    excel_path : str, optional
        Path to the Screener.in Excel file.  Defaults to EXCEL_PATH
        (models_store/Screener_Query_Results_Page1.xlsx).
    """
    if excel_path is None:
        excel_path = EXCEL_PATH

    if not os.path.exists(excel_path):
        raise FileNotFoundError(
            f"Indian market Excel file not found: {excel_path}\n"
            f"Expected at: {EXCEL_PATH}\n"
            "Place Screener_Query_Results_Page1.xlsx in models_store/ "
            "or set the SCREENER_EXCEL_PATH environment variable."
        )

    print(f"[data_pipeline] Loading Indian market data from: {excel_path}")

    # 1. Load & clean
    df_raw = _load_raw(excel_path)
    df     = _clean(df_raw)
    print(f"[data_pipeline] {len(df)} companies after cleaning & deduplication.")

    # 2. Select usable features
    available = _select_available_features(df)
    if not available:
        raise RuntimeError(
            "No usable features found in the Excel file. "
            "Check EXCEL_COL_MAP against the actual column headers."
        )
    print(f"[data_pipeline] Usable features: {available}")

    # 3. Keep only relevant columns
    keep_cols = ["Company"] + available
    df_feat   = df[keep_cols].copy()

    # Drop rows with fewer than half the available features present
    min_required = max(3, len(available) // 2)
    df_feat["_n_avail"] = df_feat[available].notna().sum(axis=1)
    df_feat = (df_feat[df_feat["_n_avail"] >= min_required]
               .drop(columns=["_n_avail"])
               .reset_index(drop=True))
    print(f"[data_pipeline] {len(df_feat)} companies with >= {min_required} features.")

    # 4. Generate composite score and labels
    df_feat, lo_thresh, hi_thresh = _generate_labels(df_feat, available)
    dist = df_feat["Label"].value_counts()
    print(f"[data_pipeline] Label distribution:\n{dist.to_string()}")

    # 5. Save prepared dataset (for train_pipeline.py cache)
    out1 = os.path.join(MODELS_DIR, "Final_Project_Data.csv")
    out2 = os.path.join(MODELS_DIR, "Labelled_Financial_Data.csv")
    df_feat.to_csv(out1, index=False)
    df_feat.to_csv(out2, index=False)

    # 6. Persist thresholds for feature_pipeline.py / model_loader.py
    schema_path = os.path.join(MODELS_DIR, "feature_schema.json")
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            schema = json.load(f)
        schema["label_hi_thresh"] = float(hi_thresh)
        schema["label_lo_thresh"] = float(lo_thresh)
        schema["feature_names"]   = available
        schema["feature_count"]   = len(available)
        with open(schema_path, "w") as f:
            json.dump(schema, f, indent=2)

    print(f"[data_pipeline] Dataset ready: {len(df_feat)} rows, "
          f"{len(available)} features.  Saved to {out1}")
    return df_feat
