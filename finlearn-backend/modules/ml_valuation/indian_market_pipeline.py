"""
=============================================================================
FINLEARN AI - Indian Stock Market Financial Analysis Pipeline
=============================================================================
Extension of the mini-project (minipro1.py / Colab work) to Indian equity
data sourced from Screener.in via the provided Excel workbook.

Methodology preserved from minipro1.py:
  - Four-category financial scoring (Valuation/Profitability/Growth/Health)
    using RobustScaler normalisation
  - Three score-derived labels (Undervalued / Fairly Valued / Overvalued)
    via 70th/30th percentile thresholds
  - 80:20 stratified train-test split, random_state=42
  - RandomForestClassifier(n_estimators=300, class_weight='balanced')
  - Cross-validation, confusion matrices, feature importance

New additions:
  - Reliable Excel ingestion with dynamic header detection
  - Explicit Excel to internal feature mapping with availability report
  - XGBoost Classifier
  - AdaBoost Classifier
  - Fair three-model comparison table
  - Consolidated company-level prediction export
  - Organised outputs/, reports/ directories

LIMITATION: Target labels are derived from the same financial indicators
used as model features. The models learn to reproduce scoring rules, not
predict future stock returns. No fabricated historical data are present.

API-key policy: No hard-coded credentials.
Dataset: Screener_Query_Results_Page1.xlsx (Screener.in snapshot)
=============================================================================
"""

import os, sys, json, time, warnings, shutil
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.preprocessing   import RobustScaler, LabelEncoder
from sklearn.impute           import SimpleImputer
from sklearn.model_selection  import (train_test_split, StratifiedKFold,
                                      cross_val_score)
from sklearn.ensemble         import (RandomForestClassifier, AdaBoostClassifier)
from sklearn.tree             import DecisionTreeClassifier
from sklearn.metrics          import (accuracy_score, precision_score, recall_score,
                                      f1_score, classification_report, confusion_matrix,
                                      ConfusionMatrixDisplay, balanced_accuracy_score)
from sklearn.inspection       import permutation_importance

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("[WARN] xgboost not installed - XGBoost model will be skipped.")

# ---- Resolve paths ----------------------------------------------------------
_THIS_DIR    = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.abspath(os.path.join(_THIS_DIR, "../.."))

# =============================================================================
# CONFIGURATION - all tuneable parameters in one place
# =============================================================================
CONFIG = {
    "EXCEL_PATH": os.path.join(_BACKEND_DIR, "models_store",
                               "Screener_Query_Results_Page1.xlsx"),
    "OUTPUT_DIR":  os.path.join(_BACKEND_DIR, "models_store", "outputs"),
    "REPORTS_DIR": os.path.join(_BACKEND_DIR, "models_store", "reports"),
    "MODELS_DIR":  os.path.join(_BACKEND_DIR, "models_store"),
    # Scoring thresholds (original minipro1.py: 70th/30th percentile)
    "HIGH_PERCENTILE": 0.70,
    "LOW_PERCENTILE":  0.30,
    # Category weights - equal by default (original approach)
    "CATEGORY_WEIGHTS": {
        "Valuation":        0.25,
        "Profitability":    0.25,
        "Growth":           0.25,
        "Financial_Health": 0.25,
    },
    "TEST_SIZE":    0.20,
    "RANDOM_STATE": 42,
    "CV_FOLDS": 5,
    "MAX_MISSING_PCT": 60.0,
    "MIN_CLASS_SAMPLES_FOR_CV": 5,
    "CLIP_LOW":  1,
    "CLIP_HIGH": 99,
}

# =============================================================================
# EXCEL -> INTERNAL COLUMN MAPPING
# =============================================================================
EXCEL_COL_MAP = {
    "P/E":             "PE_Ratio",
    "CMP / BV":        "PB_Ratio",
    "PEG":             "PEG_Ratio",
    "ROE %":           "ROE",
    "ROA 12M %":       "ROA",
    "OPM %":           "Operating_Profit_Margin",
    "Profit Growth %": "Profit_Growth_Screener",
    "EPS Var 5Yrs %":  "EPS_Variation_5Yrs",
    "Debt / Eq":       "Debt_to_Equity",
    "ROCE %":          "ROCE",
    "Mar Cap (Rs.Cr.)":"Market_Cap",
    "CMP (Rs.)":       "CMP",
}

UNAVAILABLE_FEATURES = {
    "Net_Profit_Margin":  "Not in Excel - OPM is a substitute but differs in definition",
    "Revenue_Growth":     "Not directly available - Profit_Growth_Screener is a proxy",
    "EPS_Growth":         "Not in Excel - EPS_Variation_5Yrs is 5-year variation, not annual growth",
    "Net_Income_Growth":  "Not available",
    "Current_Ratio":      "Not available",
}

VALUATION_FEATURES     = ["PE_Ratio", "PB_Ratio", "PEG_Ratio"]
PROFITABILITY_FEATURES = ["ROE", "ROA", "Operating_Profit_Margin", "ROCE"]
GROWTH_FEATURES        = ["Profit_Growth_Screener", "EPS_Variation_5Yrs"]
HEALTH_FEATURES        = ["Debt_to_Equity"]

NEG_INDICATORS = ["PE_Ratio", "PB_Ratio", "PEG_Ratio", "Debt_to_Equity"]
POS_INDICATORS = ["ROE", "ROA", "Operating_Profit_Margin", "ROCE",
                  "Profit_Growth_Screener", "EPS_Variation_5Yrs"]

ALL_SCORE_FEATURES = (VALUATION_FEATURES + PROFITABILITY_FEATURES
                      + GROWTH_FEATURES   + HEALTH_FEATURES)


# =============================================================================
# SECTION 1 - DATA LOADING & EXCEL PREPROCESSING
# =============================================================================

def load_excel_data(excel_path):
    """Load Screener.in Excel with dynamic header detection."""
    print("=" * 65)
    print("PHASE 1 - EXCEL LOADING & INSPECTION")
    print("=" * 65)

    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Excel file not found: {excel_path}")

    # Probe rows 0-7 to find the real header
    header_row = None
    for trial in range(0, 8):
        probe = pd.read_excel(excel_path, header=trial, nrows=2)
        cols  = [str(c).strip() for c in probe.columns]
        if any("company" in c.lower() for c in cols):
            header_row = trial
            break

    if header_row is None:
        header_row = 3
        print(f"[WARN] Could not auto-detect header row. Using row index {header_row}.")
    else:
        print(f"[INFO] Header row detected at Excel row index {header_row}.")

    df_raw = pd.read_excel(excel_path, header=header_row)
    print(f"Raw shape after reading: {df_raw.shape}")

    df_raw.columns = [str(c).strip() for c in df_raw.columns]
    print(f"Raw columns ({len(df_raw.columns)}): {df_raw.columns.tolist()}")

    # Rename company column
    company_col_raw = next((c for c in df_raw.columns if "company" in c.lower()), None)
    if company_col_raw and company_col_raw != "Company":
        df_raw = df_raw.rename(columns={company_col_raw: "Company"})

    df = df_raw.rename(columns=EXCEL_COL_MAP).copy()
    df = df.dropna(how="all").dropna(axis=1, how="all")

    # Coerce numeric columns
    for col in list(EXCEL_COL_MAP.values()):
        if col in df.columns:
            df[col] = (df[col].astype(str)
                       .str.replace(",", "", regex=False)
                       .str.replace("%", "", regex=False)
                       .str.replace("\u20b9", "", regex=False)
                       .str.strip()
                       .replace(["", "nan", "None", "NaN", "-", "N/A", "\u2014"], np.nan))
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "Company" in df.columns:
        df["Company"] = df["Company"].astype(str).str.strip()
        df = df[df["Company"].str.len() > 0]
        df = df[~df["Company"].str.lower().isin(["nan", "none", ""])]

    print(f"\nAfter basic cleaning: {len(df)} rows, {len(df.columns)} columns")
    print(f"Columns present: {df.columns.tolist()}")
    return df


def clean_indian_market_data(df):
    """Deduplication, infinite-value handling, missing-value report."""
    print("\n" + "=" * 65)
    print("PHASE 2 - CLEANING & DEDUPLICATION")
    print("=" * 65)

    before = len(df)
    if "Company" in df.columns:
        df = df.drop_duplicates(subset=["Company"], keep="first").reset_index(drop=True)
        print(f"Duplicate companies removed: {before - len(df)}")
    print(f"Valid rows after deduplication: {len(df)}")

    numeric_cols = df.select_dtypes(include=np.number).columns
    inf_count = np.isinf(df[numeric_cols].values).sum()
    if inf_count > 0:
        df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan)
        print(f"Infinite values replaced with NaN: {inf_count}")

    print("\nMissing-value summary for financial features:")
    all_feat_cols = [c for c in ALL_SCORE_FEATURES if c in df.columns]
    missing = df[all_feat_cols].isnull().sum()
    pct     = 100 * missing / len(df)
    mv_df   = pd.DataFrame({"Missing": missing, "Missing_%": pct.round(1)})
    print(mv_df.to_string())
    return df


# =============================================================================
# SECTION 2 - FEATURE AVAILABILITY REPORT
# =============================================================================

def validate_feature_availability(df):
    """Maps original minipro1.py features to what the Excel file provides."""
    print("\n" + "=" * 65)
    print("PHASE 3 - FEATURE AVAILABILITY REPORT")
    print("=" * 65)

    original_features = {
        "PE_Ratio":               "P/E",
        "PB_Ratio":               "CMP / BV",
        "PEG_Ratio":              "PEG",
        "ROE":                    "ROE %",
        "ROA":                    "ROA 12M %",
        "Net_Profit_Margin":      "--- NOT in Excel",
        "Operating_Profit_Margin":"OPM %",
        "Revenue_Growth":         "--- NOT in Excel (Profit_Growth_Screener is a proxy)",
        "EPS_Growth":             "--- NOT in Excel (EPS_Variation_5Yrs is 5-yr metric)",
        "Net_Income_Growth":      "--- NOT in Excel",
        "Debt_to_Equity":         "Debt / Eq",
        "Current_Ratio":          "--- NOT in Excel",
        "ROCE":                   "ROCE %",
        "EPS_Variation_5Yrs":     "EPS Var 5Yrs %",
        "Profit_Growth_Screener": "Profit Growth %",
        "Market_Cap":             "Mar Cap (Rs.Cr.)",
        "CMP":                    "CMP (Rs.)",
    }

    rows = []
    available, sparse, absent = [], [], []

    for feat, excel_src in original_features.items():
        if feat in df.columns:
            miss_pct = 100 * df[feat].isnull().sum() / max(len(df), 1)
            dtype    = str(df[feat].dtype)
            usable   = miss_pct <= CONFIG["MAX_MISSING_PCT"]
            status   = "OK Available" if usable else "WARN Sparse (>60% missing)"
            for_score = usable and feat in ALL_SCORE_FEATURES
            if usable:
                available.append(feat)
            else:
                sparse.append(feat)
        else:
            miss_pct, dtype = 100.0, "N/A"
            status = "X Absent from Excel"
            for_score = False
            absent.append(feat)

        rows.append({
            "Original_Feature": feat,
            "Excel_Source":     excel_src,
            "Status":           status,
            "Data_Type":        dtype,
            "Missing_%":        round(miss_pct, 1),
            "Used_For_Scoring": for_score,
            "Used_For_Model":   for_score,
        })

    report_df = pd.DataFrame(rows)
    print(report_df.to_string(index=False))
    print(f"\nSummary: available={len(available)} | sparse={len(sparse)} | absent={len(absent)}")
    print("\nUnavailable features from original project:")
    for k, v in UNAVAILABLE_FEATURES.items():
        print(f"  {k:30s}: {v}")

    return {
        "available":   available,
        "sparse":      sparse,
        "absent":      absent,
        "unavailable": list(UNAVAILABLE_FEATURES.keys()),
        "report_df":   report_df,
    }


# =============================================================================
# SECTION 3 - EXPLORATORY DATA ANALYSIS (preserved from minipro1.py Weeks 2-3)
# =============================================================================

def perform_eda(df, available_features, reports_dir):
    """Full EDA: stats, missing, outliers, histograms, boxplots, heatmap, pairplot."""
    print("\n" + "=" * 65)
    print("PHASE 4 - EXPLORATORY DATA ANALYSIS")
    print("=" * 65)

    feat_cols  = [c for c in available_features if c in df.columns]
    numeric_df = df[feat_cols]

    print(f"\nDataset shape: {df.shape}")
    display_cols = ["Company"] + feat_cols
    display_cols = [c for c in display_cols if c in df.columns]
    print(f"\nFirst 5 rows:\n{df[display_cols].head().to_string()}")
    print("\nDescriptive statistics:")
    print(numeric_df.describe().T.to_string())

    mv = numeric_df.isnull().sum()
    print("\nMissing values:")
    print(mv[mv > 0].to_string() if mv.any() else "  None")

    if "Company" in df.columns:
        print(f"\nDuplicate companies: {df['Company'].duplicated().sum()}")
    print(f"Infinite values: {np.isinf(numeric_df.values).sum()}")

    # IQR outlier analysis
    print("\nOutlier analysis (IQR method):")
    outlier_rows = []
    for col in feat_cols:
        Q1 = numeric_df[col].quantile(0.25)
        Q3 = numeric_df[col].quantile(0.75)
        IQR = Q3 - Q1
        lo  = Q1 - 1.5 * IQR
        hi  = Q3 + 1.5 * IQR
        cnt = ((numeric_df[col] < lo) | (numeric_df[col] > hi)).sum()
        outlier_rows.append({
            "Feature": col, "Outliers": cnt,
            "Lower_Bound": round(lo, 4), "Upper_Bound": round(hi, 4),
            "Min": round(numeric_df[col].min(), 4),
            "Max": round(numeric_df[col].max(), 4),
        })
    out_df = pd.DataFrame(outlier_rows)
    print(out_df.to_string(index=False))

    n_cols = 3
    n_rows = max(1, (len(feat_cols) + n_cols - 1) // n_cols)

    # Histograms
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(18, n_rows * 4))
    axes = np.array(axes).flatten()
    for i, col in enumerate(feat_cols):
        axes[i].hist(numeric_df[col].dropna(), bins=25, color="#4A90D9",
                     edgecolor="white", alpha=0.8)
        axes[i].set_title(col, fontsize=9)
        axes[i].set_xlabel(col, fontsize=8)
    for j in range(i + 1, len(axes)):
        axes[j].set_visible(False)
    plt.suptitle("Distribution of Indian Market Financial Features",
                 fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, "eda_histograms.png"), dpi=150)
    plt.close()
    print(f"\nHistogram saved.")

    # Box plots
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(18, n_rows * 4))
    axes = np.array(axes).flatten()
    for i, col in enumerate(feat_cols):
        numeric_df[col].dropna().plot.box(ax=axes[i])
        axes[i].set_title(col, fontsize=9)
    for j in range(i + 1, len(axes)):
        axes[j].set_visible(False)
    plt.suptitle("Box Plots - Indian Market Financial Features",
                 fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, "eda_boxplots.png"), dpi=150)
    plt.close()
    print("Box plots saved.")

    # Correlation heatmap
    corr = numeric_df.corr()
    plt.figure(figsize=(12, 9))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0,
                linewidths=0.5, annot_kws={"size": 7})
    plt.title("Correlation Matrix - Indian Financial Features",
              fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, "eda_correlation_heatmap.png"), dpi=150)
    plt.close()
    print("Correlation heatmap saved.")

    # Pairplot (subset)
    pair_features = [f for f in ["PE_Ratio", "PB_Ratio", "ROE", "ROA",
                                  "Debt_to_Equity", "Operating_Profit_Margin"]
                     if f in feat_cols]
    if len(pair_features) >= 2:
        try:
            pair_df = numeric_df[pair_features].dropna()
            if len(pair_df) > 5:
                g = sns.pairplot(pair_df, plot_kws={"alpha": 0.5, "s": 20})
                g.fig.suptitle("Pairwise Relationships - Key Indian Market Features",
                               y=1.01, fontsize=11)
                plt.savefig(os.path.join(reports_dir, "eda_pairplot.png"),
                            dpi=120, bbox_inches="tight")
                plt.close()
                print("Pairplot saved.")
        except Exception as e:
            print(f"[WARN] Pairplot skipped: {e}")

    out_df.to_csv(os.path.join(reports_dir, "eda_outlier_summary.csv"), index=False)


# =============================================================================
# SECTION 4 - FINANCIAL SCORING (preserved from minipro1.py Week 4)
# =============================================================================

def calculate_financial_scores(df, available_features):
    """
    Four-category financial scoring using RobustScaler.
    Methodology exactly mirrors minipro1.py Week 4.
    """
    print("\n" + "=" * 65)
    print("PHASE 5 - FINANCIAL SCORING (minipro1.py methodology)")
    print("=" * 65)

    score_df = df.copy()
    val_avail    = [f for f in VALUATION_FEATURES     if f in available_features]
    prof_avail   = [f for f in PROFITABILITY_FEATURES  if f in available_features]
    growth_avail = [f for f in GROWTH_FEATURES         if f in available_features]
    health_avail = [f for f in HEALTH_FEATURES         if f in available_features]

    print(f"  Valuation features   : {val_avail}")
    print(f"  Profitability features: {prof_avail}")
    print(f"  Growth features      : {growth_avail}")
    print(f"  Health features      : {health_avail}")

    scoring_features = val_avail + prof_avail + growth_avail + health_avail
    if not scoring_features:
        raise RuntimeError("No scoring features available. Cannot generate labels.")

    # RobustScaler + median imputation (full dataset for scoring/ranking)
    scaler_input = score_df[scoring_features].copy()
    scaler       = RobustScaler()
    imp          = SimpleImputer(strategy="median")
    scaled_arr   = scaler.fit_transform(imp.fit_transform(scaler_input))
    scaled_df    = pd.DataFrame(scaled_arr, columns=scoring_features,
                                index=score_df.index)

    # Direction-adjusted component scores
    for col in scoring_features:
        if col in NEG_INDICATORS:
            score_df[f"_sc_{col}"] = -scaled_df[col]
        else:
            score_df[f"_sc_{col}"] =  scaled_df[col]

    def _cat_score(feats):
        cols = [f"_sc_{f}" for f in feats]
        if not cols:
            return pd.Series(np.nan, index=score_df.index)
        return score_df[cols].mean(axis=1, skipna=True)

    score_df["Valuation_Score"]        = _cat_score(val_avail)
    score_df["Profitability_Score"]    = _cat_score(prof_avail)
    score_df["Growth_Score"]           = _cat_score(growth_avail)
    score_df["Financial_Health_Score"] = _cat_score(health_avail)

    # Weighted final score (configurable)
    w = CONFIG["CATEGORY_WEIGHTS"]
    cat_map = {
        "Valuation":        (val_avail,    "Valuation_Score"),
        "Profitability":    (prof_avail,   "Profitability_Score"),
        "Growth":           (growth_avail, "Growth_Score"),
        "Financial_Health": (health_avail, "Financial_Health_Score"),
    }
    active = {c: info for c, info in cat_map.items() if info[0]}
    for cat, (feats, _) in cat_map.items():
        if not feats:
            print(f"  [WARN] Category '{cat}' has no available features.")

    total_w = sum(w[c] for c in active)
    score_df["Financial_Score"] = sum(
        (w[cat] / total_w) * score_df[score_col]
        for cat, (_, score_col) in active.items()
    )
    score_df["Financial_Rank"] = (score_df["Financial_Score"]
                                  .rank(ascending=False, method="min", na_option="bottom"))
    score_df = score_df.sort_values("Financial_Score", ascending=False)

    drop_cols = [c for c in score_df.columns if c.startswith("_sc_")]
    score_df  = score_df.drop(columns=drop_cols)

    print(f"\nFinancial Score range: "
          f"{score_df['Financial_Score'].min():.4f} to "
          f"{score_df['Financial_Score'].max():.4f}")
    print(f"Companies with valid score: {score_df['Financial_Score'].notna().sum()}")
    return score_df


# =============================================================================
# SECTION 5 - LABEL GENERATION (preserved from minipro1.py Week 4)
# =============================================================================

def generate_financial_labels(score_df, reports_dir):
    """
    Undervalued/Fairly Valued/Overvalued via 70th/30th percentile.
    Higher score = stronger financials = Undervalued.
    """
    print("\n" + "=" * 65)
    print("PHASE 6 - LABEL GENERATION (70th/30th percentile)")
    print("=" * 65)

    valid = score_df["Financial_Score"].dropna()
    if len(valid) < 3:
        raise RuntimeError(f"Only {len(valid)} valid scores. Cannot generate labels.")

    high_thresh = valid.quantile(CONFIG["HIGH_PERCENTILE"])
    low_thresh  = valid.quantile(CONFIG["LOW_PERCENTILE"])
    print(f"70th percentile: {high_thresh:.4f}")
    print(f"30th percentile: {low_thresh:.4f}")

    def assign_label(score):
        if pd.isna(score): return np.nan
        if score >= high_thresh: return "Undervalued"
        if score <= low_thresh:  return "Overvalued"
        return "Fairly Valued"

    score_df = score_df.copy()
    score_df["Label"] = score_df["Financial_Score"].apply(assign_label)
    dist = score_df["Label"].value_counts()
    print(f"\nClass distribution:\n{dist.to_string()}")

    # Score distribution plot
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.hist(valid, bins=30, color="#4A90D9", edgecolor="white", alpha=0.8)
    ax.axvline(high_thresh, color="#E85D5D", linestyle="--", linewidth=1.5,
               label=f"70th pct = {high_thresh:.3f}")
    ax.axvline(low_thresh, color="#F5A623", linestyle="--", linewidth=1.5,
               label=f"30th pct = {low_thresh:.3f}")
    ax.set_title("Distribution of Financial Scores - Indian Market",
                 fontsize=13, fontweight="bold")
    ax.set_xlabel("Financial Score")
    ax.set_ylabel("Number of Companies")
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, "score_distribution.png"), dpi=150)
    plt.close()

    # Class count plot
    fig, ax = plt.subplots(figsize=(7, 4))
    dist.plot(kind="bar",
              color=["#4CAF50", "#FFC107", "#F44336"][:len(dist)],
              ax=ax, edgecolor="white")
    ax.set_title("Financial Valuation Class Distribution",
                 fontsize=12, fontweight="bold")
    ax.set_xlabel("Class")
    ax.set_ylabel("Count")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, "class_distribution.png"), dpi=150)
    plt.close()

    return score_df, high_thresh, low_thresh


# =============================================================================
# SECTION 6 - ML DATASET PREPARATION
# =============================================================================

def prepare_ml_dataset(score_df, available_features):
    """Select ML features, drop rows without labels, return X, y."""
    print("\n" + "=" * 65)
    print("PHASE 7 - ML DATASET PREPARATION")
    print("=" * 65)

    eligible_df = score_df[score_df["Label"].notna()].copy()
    print(f"Companies with valid labels: {len(eligible_df)}")

    exclude = {"Company", "Label", "Financial_Score", "Financial_Rank",
               "Market_Cap", "CMP"}
    ml_features = [f for f in available_features
                   if f in eligible_df.columns and f not in exclude]
    print(f"ML features selected ({len(ml_features)}): {ml_features}")

    if not ml_features:
        raise RuntimeError("No ML features available after filtering.")

    X = eligible_df[ml_features].copy()
    y = eligible_df["Label"].copy()

    class_counts = y.value_counts()
    print(f"\nTarget class distribution:\n{class_counts.to_string()}")
    if len(class_counts) < 2:
        raise RuntimeError("Only one class present. Cannot train a classifier.")

    return X, y, ml_features, eligible_df


def preprocess_features(X_train_raw, X_test_raw):
    """Median imputation + RobustScaler, fit on train only."""
    imputer = SimpleImputer(strategy="median")
    scaler  = RobustScaler()
    X_train_imp = imputer.fit_transform(X_train_raw)
    X_test_imp  = imputer.transform(X_test_raw)
    X_train     = scaler.fit_transform(X_train_imp)
    X_test      = scaler.transform(X_test_imp)
    return X_train, X_test, imputer, scaler


# =============================================================================
# SECTION 7 - MODEL DEFINITIONS & TRAINING
# =============================================================================

def _build_models(n_classes):
    """Build RF, XGBoost, AdaBoost with project-standard configs."""
    models = {}

    # 1. Random Forest (original minipro1.py config preserved)
    models["RandomForest"] = RandomForestClassifier(
        n_estimators=300,
        random_state=CONFIG["RANDOM_STATE"],
        class_weight="balanced",
        n_jobs=-1,
    )

    # 2. XGBoost
    if XGBOOST_AVAILABLE:
        xgb_params = dict(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="mlogloss",
            random_state=CONFIG["RANDOM_STATE"],
            verbosity=0,
        )
        if n_classes > 2:
            xgb_params["num_class"] = n_classes
        models["XGBoost"] = XGBClassifier(**xgb_params)
    else:
        print("[WARN] Skipping XGBoost - not installed.")

    # 3. AdaBoost (uses DecisionTreeClassifier as base for sklearn >= 1.2)
    models["AdaBoost"] = AdaBoostClassifier(
        estimator=DecisionTreeClassifier(max_depth=3),
        n_estimators=150,
        learning_rate=0.1,
        random_state=CONFIG["RANDOM_STATE"],
    )


    return models


def train_and_evaluate_model(model_name, model, X_train, X_test,
                              y_train, y_test, ml_features, class_names,
                              reports_dir, models_dir, X_test_raw=None):
    """Train one model, evaluate, save cm plot and .pkl. Returns stats dict."""
    print(f"\n{'─'*55}")
    print(f" Training {model_name}")
    print(f"{'─'*55}")

    t0 = time.time()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        model.fit(X_train, y_train)
    train_time = round(time.time() - t0, 4)

    t1 = time.time()
    y_pred = model.predict(X_test)
    pred_time = round(time.time() - t1, 6)

    acc      = float(accuracy_score(y_test, y_pred))
    bal_acc  = float(balanced_accuracy_score(y_test, y_pred))
    prec_wt  = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec_wt   = float(recall_score   (y_test, y_pred, average="weighted", zero_division=0))
    f1_wt    = float(f1_score       (y_test, y_pred, average="weighted", zero_division=0))
    prec_mac = float(precision_score(y_test, y_pred, average="macro",    zero_division=0))
    rec_mac  = float(recall_score   (y_test, y_pred, average="macro",    zero_division=0))
    f1_mac   = float(f1_score       (y_test, y_pred, average="macro",    zero_division=0))

    report_dict = classification_report(
        y_test, y_pred, target_names=class_names,
        output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print(f"  Accuracy          : {acc*100:.2f}%")
    print(f"  Balanced Accuracy : {bal_acc*100:.2f}%")
    print(f"  Weighted F1       : {f1_wt:.4f}")
    print(f"  Macro F1          : {f1_mac:.4f}")
    print(f"  Training time     : {train_time}s")
    print(f"\n  Classification Report:\n"
          f"{classification_report(y_test, y_pred, target_names=class_names, zero_division=0)}")

    # Confusion matrix
    fig, ax = plt.subplots(figsize=(6, 5))
    ConfusionMatrixDisplay.from_predictions(
        y_test, y_pred, display_labels=class_names, cmap="Blues", ax=ax)
    ax.set_title(f"{model_name} - Confusion Matrix",
                 fontsize=11, fontweight="bold")
    plt.tight_layout()
    cm_path = os.path.join(reports_dir, f"confusion_matrix_{model_name.lower()}.png")
    plt.savefig(cm_path, dpi=150)
    plt.close()
    # Backward compat copy to models_dir
    shutil.copy(cm_path,
                os.path.join(models_dir, f"confusion_matrix_{model_name.lower()}.png"))
    if model_name == "RandomForest":
        shutil.copy(cm_path, os.path.join(models_dir, "confusion_matrix.png"))

    # Feature importance
    fi_dict, fi_method = {}, "none"
    if hasattr(model, "feature_importances_"):
        fi_arr    = model.feature_importances_
        fi_dict   = {ml_features[i]: float(fi_arr[i]) for i in range(len(ml_features))}
        fi_method = "built-in"
    elif X_test_raw is not None:
        try:
            perm = permutation_importance(
                model, X_test, y_test, n_repeats=10,
                random_state=CONFIG["RANDOM_STATE"], scoring="f1_weighted")
            fi_dict   = {ml_features[i]: float(perm.importances_mean[i])
                         for i in range(len(ml_features))}
            fi_method = "permutation"
        except Exception:
            fi_dict = {f: 1.0 / len(ml_features) for f in ml_features}

    if fi_dict:
        fi_sorted = sorted(fi_dict.items(), key=lambda x: x[1], reverse=True)
        fig, ax   = plt.subplots(figsize=(9, max(4, len(fi_sorted) * 0.45)))
        ax.barh([x[0] for x in fi_sorted], [x[1] for x in fi_sorted],
                color="#4A90D9", edgecolor="white")
        ax.invert_yaxis()
        ax.set_xlabel("Importance")
        ax.set_title(f"{model_name} Feature Importance ({fi_method})\n"
                     "NOTE: importance does not imply causality", fontsize=10)
        plt.tight_layout()
        plt.savefig(os.path.join(reports_dir,
                                 f"feature_importance_{model_name.lower()}.png"),
                    dpi=150)
        plt.close()

    # Save model
    model_path = os.path.join(models_dir, f"{model_name}_Model.pkl")
    joblib.dump(model, model_path)
    print(f"  Model saved -> {model_path}")

    return {
        "accuracy":               acc,
        "balanced_accuracy":      bal_acc,
        "precision_weighted":     prec_wt,
        "recall_weighted":        rec_wt,
        "f1_score_weighted":      f1_wt,
        "precision_macro":        prec_mac,
        "recall_macro":           rec_mac,
        "f1_score_macro":         f1_mac,
        "training_time_seconds":  train_time,
        "prediction_time_seconds":pred_time,
        "train_size":             int(len(X_train)),
        "test_size":              int(len(X_test)),
        "confusion_matrix":       cm.tolist(),
        "classification_report":  report_dict,
        "feature_importances":    fi_dict,
        "fi_method":              fi_method,
        "y_pred":                 y_pred,
        "last_trained":           time.strftime("%Y-%m-%d %H:%M:%S"),
        "model_object":           model,
    }


# =============================================================================
# SECTION 8 - CROSS-VALIDATION
# =============================================================================

def run_cross_validation(model_name, model, X_all, y_all_encoded):
    """Stratified k-fold CV with guard for small classes."""
    min_class_count = min((y_all_encoded == c).sum()
                          for c in np.unique(y_all_encoded))
    if min_class_count < CONFIG["MIN_CLASS_SAMPLES_FOR_CV"]:
        print(f"  [CV] Skipped for {model_name} - smallest class has "
              f"{min_class_count} samples (need >= {CONFIG['MIN_CLASS_SAMPLES_FOR_CV']}).")
        return {"cv_mean": None, "cv_std": None, "cv_scores": []}

    n_folds = min(CONFIG["CV_FOLDS"], int(min_class_count))
    if n_folds < 2:
        print(f"  [CV] Skipped - cannot form {n_folds} folds.")
        return {"cv_mean": None, "cv_std": None, "cv_scores": []}

    print(f"  Running {n_folds}-fold stratified CV for {model_name} ...")
    cv = StratifiedKFold(n_splits=n_folds, shuffle=True,
                         random_state=CONFIG["RANDOM_STATE"])
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        scores = cross_val_score(model, X_all, y_all_encoded,
                                 cv=cv, scoring="accuracy", n_jobs=-1)

    print(f"  CV scores: {[round(s, 4) for s in scores]}")
    print(f"  Mean CV Accuracy: {scores.mean()*100:.2f}% +/- {scores.std()*100:.2f}%")
    return {
        "cv_mean":   float(scores.mean()),
        "cv_std":    float(scores.std()),
        "cv_scores": scores.tolist(),
    }


# =============================================================================
# SECTION 9 - MODEL COMPARISON & VISUALISATION
# =============================================================================

def compare_models(all_stats, reports_dir):
    """Build comparison table and save bar chart."""
    metrics = [
        ("Accuracy",           "accuracy"),
        ("Balanced Accuracy",  "balanced_accuracy"),
        ("Weighted Precision", "precision_weighted"),
        ("Weighted Recall",    "recall_weighted"),
        ("Weighted F1",        "f1_score_weighted"),
        ("Macro F1",           "f1_score_macro"),
        ("Mean CV Accuracy",   "cv_mean"),
        ("CV Std Dev",         "cv_std"),
        ("Train Time (s)",     "training_time_seconds"),
    ]
    rows = []
    for label, key in metrics:
        row = {"Metric": label}
        for mname, stats in all_stats.items():
            val = stats.get(key)
            row[mname] = round(val, 4) if val is not None else "N/A"
        rows.append(row)
    comp_df = pd.DataFrame(rows)

    print("\n" + "=" * 65)
    print("MODEL COMPARISON TABLE")
    print("=" * 65)
    print(comp_df.to_string(index=False))

    # Bar chart
    plot_metrics = ["accuracy", "f1_score_weighted", "f1_score_macro", "balanced_accuracy"]
    plot_labels  = ["Accuracy", "Weighted F1", "Macro F1", "Balanced Accuracy"]
    model_names  = list(all_stats.keys())
    x      = np.arange(len(plot_labels))
    width  = 0.22
    colors = ["#4A90D9", "#E85D5D", "#4CAF50"]

    fig, ax = plt.subplots(figsize=(12, 6))
    for i, (mname, col) in enumerate(zip(model_names, colors)):
        vals = [all_stats[mname].get(m) or 0 for m in plot_metrics]
        bars = ax.bar(x + i * width, vals, width, label=mname,
                      color=col, edgecolor="white", alpha=0.9)
        for bar in bars:
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.005,
                    f"{bar.get_height():.3f}",
                    ha="center", va="bottom", fontsize=7)
    ax.set_xticks(x + width)
    ax.set_xticklabels(plot_labels)
    ax.set_ylim(0, 1.1)
    ax.set_title("Model Performance Comparison - Indian Market Dataset",
                 fontsize=12, fontweight="bold")
    ax.set_ylabel("Score")
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, "model_comparison.png"), dpi=150)
    plt.close()

    return comp_df


# =============================================================================
# SECTION 10 - COMPANY-LEVEL PREDICTIONS
# =============================================================================

def generate_predictions_table(eligible_df, X_test_idx, all_stats,
                                class_names, encoder, ml_features,
                                output_dir, reports_dir):
    """Consolidated test-set predictions table with agreement analysis."""
    base_cols = ["Company", "Valuation_Score", "Profitability_Score",
                 "Growth_Score", "Financial_Health_Score",
                 "Financial_Score", "Financial_Rank", "Label"]
    keep = [c for c in base_cols if c in eligible_df.columns]
    pred_df = eligible_df.loc[X_test_idx, keep].copy()

    for mname, stats in all_stats.items():
        y_pred_enc = stats.get("y_pred", np.array([]))
        if len(y_pred_enc) == len(X_test_idx):
            pred_df[f"{mname}_Pred"] = encoder.inverse_transform(y_pred_enc)

    pred_cols = [c for c in pred_df.columns if c.endswith("_Pred")]
    if "Label" in pred_df.columns:
        for pc in pred_cols:
            pred_df[f"{pc}_Agrees"] = pred_df["Label"] == pred_df[pc]

    if len(pred_cols) > 1:
        pred_df["All_Models_Agree"] = pred_df[pred_cols].apply(
            lambda r: r.nunique() == 1, axis=1)

    pred_df.to_csv(os.path.join(output_dir, "all_model_predictions.csv"), index=False)

    if "All_Models_Agree" in pred_df.columns:
        disagree = pred_df[~pred_df["All_Models_Agree"]]
        disagree.to_csv(os.path.join(output_dir, "model_disagreements.csv"),
                        index=False)
        print(f"\nCompanies where models disagree (test set): {len(disagree)}")

    print(f"Test-set predictions exported to {output_dir}/all_model_predictions.csv")
    return pred_df


# =============================================================================
# SECTION 11 - ARTIFACT SAVING
# =============================================================================

def save_artifacts(df_clean, score_df, ml_features, eligible_df,
                   all_stats, avail_report, comp_df, encoder,
                   imputer, scaler, high_thresh, low_thresh,
                   output_dir, models_dir):
    """Save all CSVs, JSON stats, and preprocessing artifacts."""

    df_clean.to_csv(os.path.join(output_dir, "cleaned_indian_market_data.csv"),
                    index=False)

    score_cols_keep = ["Company", "Valuation_Score", "Profitability_Score",
                       "Growth_Score", "Financial_Health_Score",
                       "Financial_Score", "Financial_Rank", "Label"]
    score_df[[c for c in score_cols_keep if c in score_df.columns]].to_csv(
        os.path.join(output_dir, "financial_scores_and_ranking.csv"), index=False)

    ml_cols = ["Company"] + ml_features + ["Financial_Score", "Label"]
    eligible_df[[c for c in ml_cols if c in eligible_df.columns]].to_csv(
        os.path.join(output_dir, "ml_ready_dataset.csv"), index=False)

    comp_df.to_csv(os.path.join(output_dir, "model_comparison.csv"), index=False)
    avail_report["report_df"].to_csv(
        os.path.join(output_dir, "feature_availability_report.csv"), index=False)

    # Per-model feature importance CSVs
    for mname, stats in all_stats.items():
        fi = stats.get("feature_importances", {})
        pd.DataFrame(list(fi.items()), columns=["Feature", "Importance"]) \
          .sort_values("Importance", ascending=False) \
          .to_csv(os.path.join(output_dir,
                               f"feature_importance_{mname.lower()}.csv"),
                  index=False)

    # Classification reports CSV
    cr_rows = []
    for mname, stats in all_stats.items():
        for class_label, mets in stats.get("classification_report", {}).items():
            if isinstance(mets, dict):
                row = {"Model": mname, "Class": class_label}
                row.update(mets)
                cr_rows.append(row)
    pd.DataFrame(cr_rows).to_csv(
        os.path.join(output_dir, "classification_reports.csv"), index=False)

    # Cross-validation CSV
    cv_rows = []
    for mname, stats in all_stats.items():
        cv_scores = stats.get("cv_scores", [])
        for fold_i, score in enumerate(cv_scores, 1):
            cv_rows.append({"Model": mname, "Fold": fold_i, "Accuracy": score})
        cv_rows.append({
            "Model": mname, "Fold": "Mean",
            "Accuracy": stats.get("cv_mean"),
        })
    pd.DataFrame(cv_rows).to_csv(
        os.path.join(output_dir, "cross_validation_results.csv"), index=False)

    # Preprocessing artifacts
    joblib.dump(encoder, os.path.join(models_dir, "LabelEncoder.pkl"))
    joblib.dump(imputer, os.path.join(models_dir, "imputer.pkl"))
    joblib.dump(scaler,  os.path.join(models_dir, "scaler.pkl"))

    # Feature schema (backward compat with model_loader.py)
    schema = {
        "feature_names":  ml_features,
        "feature_count":  len(ml_features),
        "column_mapping": EXCEL_COL_MAP,
        "neg_indicators": [f for f in ml_features if f in NEG_INDICATORS],
        "pos_indicators": [f for f in ml_features if f in POS_INDICATORS],
        "label_classes":  list(encoder.classes_),
        "label_hi_thresh":float(high_thresh),
        "label_lo_thresh":float(low_thresh),
    }
    with open(os.path.join(models_dir, "feature_schema.json"), "w") as f:
        json.dump(schema, f, indent=2)

    # Consolidated model_stats.json (backward compat with routes.py)
    best = max(all_stats, key=lambda m: all_stats[m].get("f1_score_weighted", 0))
    stats_export = {
        k: {sk: sv for sk, sv in sv_dict.items()
            if sk not in ("model_object", "y_pred")}
        for k, sv_dict in all_stats.items()
    }
    consolidated = {
        "models":                stats_export,
        "best_model":            best,
        "dataset": {
            "excel_file": "Screener_Query_Results_Page1.xlsx",
            "total_raw_rows": len(df_clean),
            "usable_rows": len(eligible_df),
            "unique_stocks": int(eligible_df["Company"].nunique()) if "Company" in eligible_df.columns else len(eligible_df),
            "train_rows": len(eligible_df) - len(eligible_df) // 5,
            "test_rows": len(eligible_df) // 5,
            "available_features": ml_features,
            "label_distribution": eligible_df["Label"].value_counts().to_dict() if "Label" in eligible_df.columns else {},
            "label_methodology": "Composite Financial Scoring & 70th/30th Percentiles (Undervalued / Fairly Valued / Overvalued)",
            "data_source": "Screener.in Indian Listed Stocks (2,001 Unique Companies)",
        },
        "accuracy":              all_stats["RandomForest"]["accuracy"],
        "precision":             all_stats["RandomForest"]["precision_weighted"],
        "recall":                all_stats["RandomForest"]["recall_weighted"],
        "f1_score":              all_stats["RandomForest"]["f1_score_weighted"],
        "classification_report": all_stats["RandomForest"]["classification_report"],
        "feature_importances":   all_stats["RandomForest"]["feature_importances"],
        "last_trained":          time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    with open(os.path.join(models_dir, "model_stats.json"), "w") as f:
        json.dump(consolidated, f, indent=2)

    # Dataset files for /valuation/stats endpoint
    eligible_df.to_csv(os.path.join(models_dir, "Final_Project_Data.csv"), index=False)
    eligible_df.to_csv(os.path.join(models_dir, "Labelled_Financial_Data.csv"), index=False)

    print(f"\nAll artifacts saved to:\n  outputs/ -> {output_dir}\n  models/  -> {models_dir}")


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def run_indian_market_pipeline(excel_path=None):
    """
    Full end-to-end pipeline. Pass excel_path to use a different file.
    Returns result dict with all_stats, comp_df, eligible_df, etc.
    """
    if excel_path is None:
        excel_path = CONFIG["EXCEL_PATH"]

    output_dir  = CONFIG["OUTPUT_DIR"]
    reports_dir = CONFIG["REPORTS_DIR"]
    models_dir  = CONFIG["MODELS_DIR"]
    for d in [output_dir, reports_dir, models_dir]:
        os.makedirs(d, exist_ok=True)

    # Phase 1-2: Load & clean
    df_raw   = load_excel_data(excel_path)
    df_clean = clean_indian_market_data(df_raw)

    # Phase 3: Feature availability
    avail_report = validate_feature_availability(df_clean)
    available    = avail_report["available"]
    if not available:
        raise RuntimeError("No usable features found. Check EXCEL_COL_MAP.")

    # Phase 4: EDA
    perform_eda(df_clean, available, reports_dir)

    # Phase 5-6: Scoring & labels
    score_df = calculate_financial_scores(df_clean, available)
    score_df, high_thresh, low_thresh = generate_financial_labels(
        score_df, reports_dir)

    # Phase 7: ML dataset
    X_raw, y, ml_features, eligible_df = prepare_ml_dataset(score_df, available)

    # Encode labels
    encoder   = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    class_names = list(encoder.classes_)
    n_classes   = len(class_names)
    print(f"\nEncoded classes: {class_names}")

    # Check minimum class samples for splitting
    min_class_n = min((y_encoded == c).sum() for c in np.unique(y_encoded))
    if min_class_n < 2:
        raise RuntimeError(
            f"Smallest class has only {min_class_n} sample(s). "
            "Cannot perform stratified split.")

    # Stratified 80:20 split (same for all three models)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y_encoded,
        test_size=CONFIG["TEST_SIZE"],
        random_state=CONFIG["RANDOM_STATE"],
        stratify=y_encoded,
    )
    print(f"\nTrain: {len(X_train_raw)} | Test: {len(X_test_raw)}")
    print(f"Train class distribution: "
          f"{dict(zip(*np.unique(y_train, return_counts=True)))}")
    print(f"Test  class distribution: "
          f"{dict(zip(*np.unique(y_test, return_counts=True)))}")

    # Preprocessing (fit on train only)
    X_train, X_test, imputer, scaler = preprocess_features(
        X_train_raw, X_test_raw)

    # Full-dataset scaled for CV
    X_all_scaled = scaler.transform(imputer.transform(X_raw))

    # Phase 8: Train all models
    print("\n" + "=" * 65)
    print("PHASE 8 - TRAINING ALL THREE MODELS")
    print("=" * 65)

    model_defs = _build_models(n_classes)
    all_stats  = {}

    for mname, model in model_defs.items():
        stats = train_and_evaluate_model(
            model_name=mname, model=model,
            X_train=X_train, X_test=X_test,
            y_train=y_train, y_test=y_test,
            ml_features=ml_features, class_names=class_names,
            reports_dir=reports_dir, models_dir=models_dir,
            X_test_raw=X_test_raw,
        )
        # CV on fresh model instance
        cv_model = _build_models(n_classes)[mname]
        cv_stats = run_cross_validation(mname, cv_model, X_all_scaled, y_encoded)
        stats.update(cv_stats)
        all_stats[mname] = stats

    # Phase 9: Comparison
    print("\n" + "=" * 65)
    print("PHASE 9 - MODEL COMPARISON")
    print("=" * 65)
    comp_df = compare_models(all_stats, reports_dir)

    # Company-level predictions (test set only)
    pred_df = generate_predictions_table(
        eligible_df=eligible_df, X_test_idx=X_test_raw.index,
        all_stats=all_stats, class_names=class_names, encoder=encoder,
        ml_features=ml_features, output_dir=output_dir, reports_dir=reports_dir,
    )

    # Save all artifacts
    save_artifacts(
        df_clean=df_clean, score_df=score_df, ml_features=ml_features,
        eligible_df=eligible_df, all_stats=all_stats, avail_report=avail_report,
        comp_df=comp_df, encoder=encoder, imputer=imputer, scaler=scaler,
        high_thresh=high_thresh, low_thresh=low_thresh,
        output_dir=output_dir, models_dir=models_dir,
    )

    # Final summary
    print("\n" + "=" * 65)
    print("  FINAL SUMMARY - INDIAN MARKET ML PIPELINE")
    print("=" * 65)
    print(f"\nCompanies loaded          : {len(df_clean)}")
    print(f"Companies with labels     : {len(eligible_df)}")
    print(f"ML features used          : {ml_features}")
    print(f"Available indicators      : {avail_report['available']}")
    print(f"Absent from Excel         : {avail_report['absent']}")
    print(f"\nModel Results (test set):")
    print(f"  {'Model':<15} {'Accuracy':>10} {'W-F1':>8} {'M-F1':>8} "
          f"{'CV Mean':>10} {'Train(s)':>10}")
    for mname, stats in all_stats.items():
        cv_str = f"{stats['cv_mean']*100:.2f}%" if stats.get("cv_mean") else "  N/A"
        print(f"  {mname:<15} {stats['accuracy']*100:>9.2f}% "
              f"{stats['f1_score_weighted']:>8.4f} {stats['f1_score_macro']:>8.4f} "
              f"{cv_str:>10} {stats['training_time_seconds']:>10.4f}")
    print("\nLIMITATIONS:")
    print("  1. Labels derived from scoring features - models reproduce scoring rules,")
    print("     not predict future stock returns.")
    print("  2. Single screener snapshot - no time dimension.")
    print("  3. Net_Profit_Margin, Current_Ratio, Revenue_Growth, Net_Income_Growth")
    print("     absent from this Excel file.")
    print("  4. EPS_Variation_5Yrs is a 5-year variation, NOT annual EPS growth.")
    print("\nPipeline completed successfully!")

    return {
        "all_stats":    all_stats,
        "comp_df":      comp_df,
        "eligible_df":  eligible_df,
        "ml_features":  ml_features,
        "encoder":      encoder,
        "avail_report": avail_report,
    }


if __name__ == "__main__":
    custom_excel = sys.argv[1] if len(sys.argv) > 1 else None
    run_indian_market_pipeline(excel_path=custom_excel)
