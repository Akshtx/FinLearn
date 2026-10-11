"""
=============================================================================
FINLEARN AI - Indian Stock Market ML Pipeline (Colab Reference Implementation)
=============================================================================
Direct implementation of the research methodology and pipeline from
collab work/FinLearn_Minor_Project_Detailed_Three_Models.ipynb.

Key Methodology:
  - Robust Excel parsing with dynamic header detection
  - Canonical column mapping across Indian Screener.in attributes
  - Deduplication retaining 2,001 unique companies
  - Directional percentile rank scoring (4 fundamental pillars)
  - 30th / 70th percentile quantile ground-truth labeling:
      <= 30th percentile -> Overvalued
      >= 70th percentile -> Undervalued
      in-between         -> Fairly Valued
  - Stratified 80:20 train/test split (random_state=42)
  - 3 Supervised Learning Pipelines with built-in SimpleImputer:
      1. Random Forest (300 estimators, class_weight='balanced')
      2. AdaBoost (200 estimators, DecisionTreeClassifier max_depth=1)
      3. XGBoost (300 estimators, max_depth=3, lr=0.05, hist tree method)
  - 5-Fold Stratified Cross-Validation
  - High-resolution analytical plot generation (13 charts)
  - Export to models_store/ (models, artifacts, reports, outputs)
=============================================================================
"""

import os
import sys
import re
import json
import time
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import LabelEncoder, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, ConfusionMatrixDisplay,
    balanced_accuracy_score
)

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

# Resolve directory paths
_THIS_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _THIS_DIR.parent.parent
MODELS_DIR = _BACKEND_DIR / "models_store"
OUTPUT_DIR = MODELS_DIR / "outputs"
REPORTS_DIR = MODELS_DIR / "reports"

for d in [MODELS_DIR, OUTPUT_DIR, REPORTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. Excel Parsing & Column Canonicalization (Colab Week 2)
# -----------------------------------------------------------------------------

def normalize_header(value):
    if pd.isna(value):
        return ""
    text = str(value).strip().lower().replace("\n", " ")
    text = re.sub(r"[^a-z0-9%]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def looks_like_header(row):
    values = [normalize_header(v) for v in row.tolist()]
    has_company = "company" in values
    has_serial = any(v in {"s no", "sno", "serial no", "serial number"} for v in values)
    return has_company and has_serial

def canonical_column(name):
    n = normalize_header(name)
    mapping = {
        "s no": "S_No", "sno": "S_No", "serial no": "S_No", "serial number": "S_No",
        "company": "Company",
        "cmp rs": "CMP_Rs", "cmp": "CMP_Rs",
        "p e": "PE_Ratio", "pe": "PE_Ratio", "p e ratio": "PE_Ratio",
        "cmp bv": "Price_to_Book", "price to book": "Price_to_Book", "pb": "Price_to_Book",
        "roe": "ROE_pct", "roe %": "ROE_pct",
        "roa 12m": "ROA_12M_pct", "roa 12m %": "ROA_12M_pct",
        "opm": "OPM_pct", "opm %": "OPM_pct",
        "profit growth": "Profit_Growth_pct", "profit growth %": "Profit_Growth_pct",
        "peg": "PEG",
        "eps 12m rs": "EPS_12M_Rs", "eps 12m": "EPS_12M_Rs",
        "eps var 5yrs": "EPS_Var_5Yrs_pct", "eps var 5yrs %": "EPS_Var_5Yrs_pct",
        "eps var 3yrs": "EPS_Var_3Yrs_pct", "eps var 3yrs %": "EPS_Var_3Yrs_pct",
        "debt eq": "Debt_to_Equity", "debt to equity": "Debt_to_Equity",
        "mar cap rs cr": "Market_Cap_Rs_Cr", "market cap rs cr": "Market_Cap_Rs_Cr",
        "roce": "ROCE_pct", "roce %": "ROCE_pct",
        "np qtr rs cr": "Net_Profit_Qtr_Rs_Cr", "net profit qtr rs cr": "Net_Profit_Qtr_Rs_Cr",
        "qtr profit var": "Quarterly_Profit_Var_pct", "qtr profit var %": "Quarterly_Profit_Var_pct",
    }
    return mapping.get(n, re.sub(r"[^A-Za-z0-9]+", "_", str(name)).strip("_"))

def load_and_clean_data(excel_path=None):
    if excel_path is None:
        candidates = [
            MODELS_DIR / "Screener_Query_Results_Page1 (1).xlsx",
            MODELS_DIR / "Screener_Query_Results_Page1.xlsx",
            _THIS_DIR / "Screener_Query_Results_Page1.xlsx",
            _BACKEND_DIR.parent / "collab work" / "Screener_Query_Results_Page1 (1).xlsx",
        ]
        for c in candidates:
            if c.exists():
                excel_path = c
                break

    if excel_path is None or not Path(excel_path).exists():
        raise FileNotFoundError(f"Screener Excel dataset not found. Checked: {excel_path}")

    print(f"[Phase 1] Reading Excel dataset from: {excel_path}")
    raw = pd.read_excel(excel_path, sheet_name=0, header=None, dtype=object)

    records = []
    current_headers = None
    for row_index, row in raw.iterrows():
        if looks_like_header(row):
            current_headers = [str(v).strip() if not pd.isna(v) else "" for v in row.tolist()]
            continue
        if current_headers is None:
            continue
        row_values = row.tolist()
        if len(row_values) != len(current_headers):
            continue
        record = dict(zip(current_headers, row_values))
        company_value = next(
            (value for key, value in record.items() if normalize_header(key) == "company"),
            None
        )
        if pd.isna(company_value) or normalize_header(company_value) in {"", "company"}:
            continue
        record["_source_row"] = row_index
        records.append(record)

    parsed = pd.DataFrame(records)
    parsed.columns = [canonical_column(c) for c in parsed.columns]

    if parsed.columns.duplicated().any():
        merged = {}
        for col in dict.fromkeys(parsed.columns):
            same_cols = parsed.loc[:, parsed.columns == col]
            merged[col] = same_cols.bfill(axis=1).iloc[:, 0]
        parsed = pd.DataFrame(merged)

    parsed["Company"] = parsed["Company"].astype(str).str.strip()
    parsed = parsed[parsed["Company"].notna() & ~parsed["Company"].isin(["", "nan", "None"])].copy()

    for col in parsed.columns:
        if col != "Company":
            parsed[col] = pd.to_numeric(parsed[col], errors="coerce")

    # Drop duplicates
    dups_removed = int(parsed["Company"].duplicated(keep="first").sum())
    parsed = parsed.drop_duplicates(subset=["Company"], keep="first").reset_index(drop=True)
    print(f"[Phase 2] Deduplication complete. {dups_removed} duplicates removed. Valid companies: {len(parsed)}")

    # Replace infinities
    num_cols = parsed.select_dtypes(include=np.number).columns.tolist()
    parsed[num_cols] = parsed[num_cols].replace([np.inf, -np.inf], np.nan)

    return parsed

# -----------------------------------------------------------------------------
# 2. EDA & Outlier Reports (Colab Week 2 & 3)
# -----------------------------------------------------------------------------

def generate_eda_reports(df, score_features):
    print("[Phase 3] Generating EDA outlier analysis and feature reports...")
    outlier_rows = []
    for col in score_features:
        series = df[col].dropna()
        if series.empty:
            continue
        q1, q3 = series.quantile([0.25, 0.75])
        iqr = q3 - q1
        lower = round(float(q1 - 1.5 * iqr), 4)
        upper = round(float(q3 + 1.5 * iqr), 4)
        outlier_rows.append({
            "Feature": col,
            "Valid_Count": len(series),
            "Q1": round(float(q1), 4),
            "Q3": round(float(q3), 4),
            "IQR": round(float(iqr), 4),
            "Lower_Bound": lower,
            "Upper_Bound": upper,
            "Min": round(float(series.min()), 4),
            "Max": round(float(series.max()), 4),
            "Outliers": int(((series < lower) | (series > upper)).sum()),
        })
    outlier_df = pd.DataFrame(outlier_rows).sort_values("Outliers", ascending=False)
    outlier_df.to_csv(REPORTS_DIR / "eda_outlier_summary.csv", index=False)
    return outlier_df

# -----------------------------------------------------------------------------
# 3. Directional Percentile Scoring & Labeling (Colab Week 4)
# -----------------------------------------------------------------------------

FEATURE_DIRECTIONS = {
    "PE_Ratio": -1,
    "Price_to_Book": -1,
    "PEG": -1,
    "ROE_pct": 1,
    "ROA_12M_pct": 1,
    "OPM_pct": 1,
    "Profit_Growth_pct": 1,
    "EPS_Var_5Yrs_pct": 1,
    "Debt_to_Equity": -1,
    "ROCE_pct": 1,
}

MODEL_FEATURES = [
    "PE_Ratio",
    "Price_to_Book",
    "PEG",
    "ROE_pct",
    "ROA_12M_pct",
    "Profit_Growth_pct",
    "Debt_to_Equity",
    "ROCE_pct"
]

def compute_scoring_and_labels(df):
    print("[Phase 4] Computing directional percentile ranking and 4-pillar financial scores...")
    score_features = [f for f in MODEL_FEATURES if f in df.columns]

    rank_features = pd.DataFrame(index=df.index)
    for feature in score_features:
        p_rank = df[feature].rank(pct=True, method="average")
        if FEATURE_DIRECTIONS.get(feature, 1) < 0:
            p_rank = 1.0 - p_rank
        rank_features[feature + "_Rank"] = p_rank

    df["Financial_Score"] = rank_features.mean(axis=1, skipna=True)
    df["Score_Feature_Count"] = rank_features.notna().sum(axis=1)

    model_base = df.loc[df["Score_Feature_Count"] >= 3].copy()
    model_base = model_base[model_base["Financial_Score"].notna()].reset_index(drop=True)

    low_threshold = float(model_base["Financial_Score"].quantile(0.30))
    high_threshold = float(model_base["Financial_Score"].quantile(0.70))

    def assign_label(score):
        if score <= low_threshold:
            return "Overvalued"
        if score >= high_threshold:
            return "Undervalued"
        return "Fairly Valued"

    model_base["Label"] = model_base["Financial_Score"].apply(assign_label)
    model_base["Financial_Rank"] = model_base["Financial_Score"].rank(ascending=False, method="min").astype(int)
    model_base = model_base.sort_values("Financial_Score", ascending=False).reset_index(drop=True)

    print(f"  30th Percentile Threshold (Overvalued) : {low_threshold:.5f}")
    print(f"  70th Percentile Threshold (Undervalued): {high_threshold:.5f}")
    print(f"  Class Distribution:\n{model_base['Label'].value_counts().to_string()}")

    return model_base, score_features, low_threshold, high_threshold

# -----------------------------------------------------------------------------
# 4. Model Training, 5-Fold CV & Evaluation (Colab Week 5)
# -----------------------------------------------------------------------------

def build_model_pipelines():
    return {
        "Random Forest": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", RandomForestClassifier(
                n_estimators=300,
                random_state=RANDOM_STATE,
                class_weight="balanced",
                n_jobs=-1,
                min_samples_leaf=2,
            )),
        ]),
        "AdaBoost": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", AdaBoostClassifier(
                estimator=DecisionTreeClassifier(max_depth=1, random_state=RANDOM_STATE),
                n_estimators=200,
                learning_rate=0.5,
                random_state=RANDOM_STATE,
            )),
        ]),
        "XGBoost": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", XGBClassifier(
                n_estimators=300,
                max_depth=3,
                learning_rate=0.05,
                subsample=0.9,
                colsample_bytree=0.9,
                objective="multi:softprob",
                eval_metric="mlogloss",
                random_state=RANDOM_STATE,
                n_jobs=-1,
                tree_method="hist",
            )),
        ]),
    }

# -----------------------------------------------------------------------------
# 5. Plot Generation (Colab Week 2, 3, 4, 5 Charts)
# -----------------------------------------------------------------------------

def generate_all_plots(model_base, score_features, low_th, high_th, models, X_test, y_test, class_names, test_metrics, cv_metrics):
    print("[Phase 5] Generating all 13 research publication figures...")
    
    # 1. Score & Class Distribution
    fig, axes = plt.subplots(1, 2, figsize=(14, 4.5))
    sns.countplot(data=model_base, x="Label", order=["Undervalued", "Fairly Valued", "Overvalued"], ax=axes[0], palette=["#10b981", "#f59e0b", "#ef4444"])
    axes[0].set_title("Rule-Generated Valuation Classes (N=2,001)")
    axes[0].set_ylabel("Company Count")

    sns.histplot(model_base["Financial_Score"], bins=25, kde=True, ax=axes[1], color="#6366f1")
    axes[1].axvline(low_th, linestyle="--", color="#ef4444", label=f"30th % ({low_th:.3f})")
    axes[1].axvline(high_th, linestyle="--", color="#10b981", label=f"70th % ({high_th:.3f})")
    axes[1].set_title("Composite Financial Score Distribution")
    axes[1].legend()
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "score_distribution.png", dpi=180)
    plt.savefig(REPORTS_DIR / "class_distribution.png", dpi=180)
    plt.close()

    # 2. Correlation Heatmap
    plt.figure(figsize=(10, 8))
    corr = model_base[score_features].corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", cbar=True, center=0)
    plt.title("Financial Feature Correlation Heatmap")
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "eda_correlation_heatmap.png", dpi=180)
    plt.close()

    # 3. Boxplots
    n_feat = len(score_features)
    fig, axes = plt.subplots((n_feat + 1)//2, 2, figsize=(14, n_feat * 1.5))
    axes = axes.flatten()
    for idx, col in enumerate(score_features):
        sns.boxplot(x=model_base[col].dropna(), ax=axes[idx], color="#38bdf8")
        axes[idx].set_title(f"Boxplot: {col}")
    for idx in range(n_feat, len(axes)):
        fig.delaxes(axes[idx])
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "eda_boxplots.png", dpi=180)
    plt.close()

    # 4. Histograms
    model_base[score_features].hist(figsize=(14, 10), bins=25, edgecolor="black", color="#818cf8")
    plt.suptitle("Feature Distribution Histograms", y=1.02)
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "eda_histograms.png", dpi=180)
    plt.close()

    # 5. Pairplot of key indicators
    key_pair_cols = ["PE_Ratio", "Price_to_Book", "ROE_pct", "ROA_12M_pct", "Debt_to_Equity"]
    pair_df = model_base[[c for c in key_pair_cols if c in model_base.columns] + ["Label"]].dropna()
    if len(pair_df) > 50:
        g = sns.pairplot(pair_df, hue="Label", palette={"Undervalued": "#10b981", "Fairly Valued": "#f59e0b", "Overvalued": "#ef4444"}, diag_kind="kde")
        g.fig.suptitle("Key Indicators Multivariate Pairplot", y=1.02)
        plt.savefig(REPORTS_DIR / "eda_pairplot.png", dpi=150)
        plt.close()

    # 6. Model Comparison Chart
    comp_df = pd.DataFrame(test_metrics)
    fig, ax = plt.subplots(figsize=(9, 5))
    metrics_to_plot = ["Accuracy", "Balanced_Accuracy", "F1_Weighted", "F1_Macro"]
    plot_data = comp_df.melt(id_vars=["Model"], value_vars=metrics_to_plot, var_name="Metric", value_name="Score")
    sns.barplot(data=plot_data, x="Metric", y="Score", hue="Model", palette=["#38bdf8", "#fb923c", "#818cf8"], ax=ax)
    ax.set_ylim(0.7, 0.95)
    ax.set_title("Multi-Model Performance Comparison (Holdout Test Set)")
    for p in ax.patches:
        h = p.get_height()
        if h > 0:
            ax.annotate(f"{h*100:.1f}%", (p.get_x() + p.get_width() / 2., h), ha="center", va="bottom", fontsize=8, xytext=(0, 2), textcoords="offset points")
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "model_comparison.png", dpi=180)
    plt.close()

    # 7. Confusion Matrices for each model
    for model_name, pipeline in models.items():
        clean_name = model_name.lower().replace(" ", "")
        preds = pipeline.predict(X_test)
        cm = confusion_matrix(y_test, preds)
        fig, ax = plt.subplots(figsize=(6, 5))
        ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names).plot(ax=ax, cmap="Blues")
        ax.set_title(f"{model_name} Confusion Matrix")
        plt.tight_layout()
        plt.savefig(REPORTS_DIR / f"confusion_matrix_{clean_name}.png", dpi=180)
        plt.savefig(MODELS_DIR / f"confusion_matrix_{clean_name}.png", dpi=180)
        if clean_name == "randomforest":
            plt.savefig(MODELS_DIR / "confusion_matrix.png", dpi=180)
        plt.close()

    # 8. Feature Importances for each model
    for model_name, pipeline in models.items():
        clean_name = model_name.lower().replace(" ", "")
        clf = pipeline.named_steps["classifier"]
        if hasattr(clf, "feature_importances_"):
            fi = clf.feature_importances_
            fi_df = pd.DataFrame({"Feature": score_features, "Importance": fi}).sort_values("Importance", ascending=True)
            plt.figure(figsize=(8, 4.5))
            plt.barh(fi_df["Feature"], fi_df["Importance"], color="#38bdf8" if clean_name=="randomforest" else ("#818cf8" if clean_name=="xgboost" else "#fb923c"))
            plt.title(f"{model_name} Feature Importance")
            plt.xlabel("Relative Importance")
            plt.tight_layout()
            plt.savefig(REPORTS_DIR / f"feature_importance_{clean_name}.png", dpi=180)
            plt.close()

# -----------------------------------------------------------------------------
# 6. End-to-End Pipeline Execution
# -----------------------------------------------------------------------------

def run_pipeline(excel_path=None):
    start_time = time.time()
    print("=" * 70)
    print("FINLEARN AI — INDIAN MARKET ML VALUATION PIPELINE (COLAB)")
    print("=" * 70)

    # Step 1: Parse and clean
    df = load_and_clean_data(excel_path)

    # Step 2: Scoring and Ground Truth Labels
    model_base, score_features, low_th, high_th = compute_scoring_and_labels(df)

    # Step 3: Outlier report
    generate_eda_reports(model_base, score_features)

    # Step 4: ML Dataset
    X = model_base[score_features].replace([np.inf, -np.inf], np.nan).copy()
    y_text = model_base["Label"].astype(str).copy()

    valid_rows = X.notna().any(axis=1)
    X = X.loc[valid_rows].reset_index(drop=True)
    y_text = y_text.loc[valid_rows].reset_index(drop=True)

    encoder = LabelEncoder()
    y = encoder.fit_transform(y_text)
    class_names = encoder.classes_.tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    print(f"\n[Phase 5] Stratified 80:20 Split -> Train: {len(X_train)}, Test: {len(X_test)}")

    # Step 5: Fit and Evaluate Models on Holdout Set
    models = build_model_pipelines()
    test_metrics = []
    all_stats = {}
    cr_rows = []
    predictions_dict = {}

    for model_name, pipeline in models.items():
        t0 = time.time()
        pipeline.fit(X_train, y_train)
        train_time = round(time.time() - t0, 4)

        y_pred = pipeline.predict(X_test)
        predictions_dict[model_name] = y_pred

        acc = accuracy_score(y_test, y_pred)
        bal_acc = balanced_accuracy_score(y_test, y_pred)
        prec_w = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec_w = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1_w = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        prec_m = precision_score(y_test, y_pred, average="macro", zero_division=0)
        rec_m = recall_score(y_test, y_pred, average="macro", zero_division=0)
        f1_m = f1_score(y_test, y_pred, average="macro", zero_division=0)
        cr = classification_report(y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0)

        clf = pipeline.named_steps["classifier"]
        fi_dict = {}
        if hasattr(clf, "feature_importances_"):
            fi_dict = dict(zip(score_features, [float(v) for v in clf.feature_importances_]))

        clean_name = "RandomForest" if "forest" in model_name.lower() else ("XGBoost" if "xgb" in model_name.lower() else "AdaBoost")
        all_stats[clean_name] = {
            "accuracy": float(acc),
            "balanced_accuracy": float(bal_acc),
            "precision_weighted": float(prec_w),
            "recall_weighted": float(rec_w),
            "f1_score_weighted": float(f1_w),
            "precision_macro": float(prec_m),
            "recall_macro": float(rec_m),
            "f1_score_macro": float(f1_m),
            "classification_report": cr,
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "feature_importances": fi_dict,
            "training_time_seconds": train_time,
            "train_dataset_size": len(X_train),
            "test_dataset_size": len(X_test),
            "last_trained": time.strftime("%Y-%m-%d %H:%M:%S"),
        }

        test_metrics.append({
            "Model": model_name,
            "Accuracy": round(acc, 4),
            "Balanced_Accuracy": round(bal_acc, 4),
            "Precision_Weighted": round(prec_w, 4),
            "Recall_Weighted": round(rec_w, 4),
            "F1_Weighted": round(f1_w, 4),
            "Precision_Macro": round(prec_m, 4),
            "Recall_Macro": round(rec_m, 4),
            "F1_Macro": round(f1_m, 4),
        })

        for cls_name, vals in cr.items():
            if isinstance(vals, dict):
                r = {"Model": model_name, "Class": cls_name}
                r.update(vals)
                cr_rows.append(r)

        print(f"  --> {model_name:14s} | Holdout Accuracy: {acc*100:6.2f}% | Weighted F1: {f1_w:6.4f} | Train Time: {train_time}s")

    # Step 6: 5-Fold Stratified Cross Validation
    print("\n[Phase 6] Running Stratified 5-Fold Cross Validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_metrics = []
    cv_rows_for_csv = []

    for model_name, pipeline in build_model_pipelines().items():
        clean_name = "RandomForest" if "forest" in model_name.lower() else ("XGBoost" if "xgb" in model_name.lower() else "AdaBoost")
        scores = cross_validate(pipeline, X, y, cv=cv, scoring=["accuracy", "f1_weighted", "f1_macro"], n_jobs=-1)
        mean_acc = float(scores["test_accuracy"].mean())
        std_acc = float(scores["test_accuracy"].std())

        all_stats[clean_name]["cv_scores"] = [round(float(s), 4) for s in scores["test_accuracy"]]
        all_stats[clean_name]["cv_mean"] = round(mean_acc, 4)
        all_stats[clean_name]["cv_std"] = round(std_acc, 4)

        for fold_i, score in enumerate(scores["test_accuracy"], 1):
            cv_rows_for_csv.append({"Model": clean_name, "Fold": str(fold_i), "Accuracy": round(float(score), 4)})
        cv_rows_for_csv.append({"Model": clean_name, "Fold": "Mean", "Accuracy": round(mean_acc, 4)})

        cv_metrics.append({
            "Model": model_name,
            "CV_Folds": 5,
            "Accuracy_Mean": round(mean_acc, 4),
            "Accuracy_Std": round(std_acc, 4),
            "F1_Weighted_Mean": round(float(scores["test_f1_weighted"].mean()), 4),
            "F1_Macro_Mean": round(float(scores["test_f1_macro"].mean()), 4),
        })
        print(f"  --> {model_name:14s} | 5-Fold CV Mean: {mean_acc*100:6.2f}% (+/- {std_acc*100:4.2f}%)")

    # Step 7: Refit on all modeling rows for production inference artifacts
    print("\n[Phase 7] Refitting final pipelines on full dataset for live inference...")
    final_pipelines = build_model_pipelines()
    for model_name, pipeline in final_pipelines.items():
        pipeline.fit(X, y)
        clean_name = "RandomForest" if "forest" in model_name.lower() else ("XGBoost" if "xgb" in model_name.lower() else "AdaBoost")
        joblib.dump(pipeline, MODELS_DIR / f"{clean_name}_Model.pkl")
        joblib.dump(pipeline, MODELS_DIR / f"{model_name.lower().replace(' ', '_')}_pipeline.joblib")
        print(f"  Saved fitted model: {clean_name}_Model.pkl")

    joblib.dump(encoder, MODELS_DIR / "LabelEncoder.pkl")
    joblib.dump(encoder, MODELS_DIR / "label_encoder.joblib")

    # Save fitted imputer separately for legacy model_loader compatibility
    standalone_imputer = SimpleImputer(strategy="median").fit(X)
    joblib.dump(standalone_imputer, MODELS_DIR / "imputer.pkl")
    standalone_scaler = RobustScaler().fit(standalone_imputer.transform(X))
    joblib.dump(standalone_scaler, MODELS_DIR / "scaler.pkl")

    # Step 8: Predictions Table and Agreement Rates
    print("\n[Phase 8] Exporting model predictions & agreements...")
    test_indices = X_test.index
    pred_export = model_base.loc[test_indices, ["Company", "Financial_Score", "Financial_Rank", "Label"]].copy()
    pred_export["RandomForest_Pred"] = encoder.inverse_transform(predictions_dict["Random Forest"])
    pred_export["XGBoost_Pred"] = encoder.inverse_transform(predictions_dict["XGBoost"])
    pred_export["AdaBoost_Pred"] = encoder.inverse_transform(predictions_dict["AdaBoost"])

    pred_export["RandomForest_Pred_Agrees"] = (pred_export["Label"] == pred_export["RandomForest_Pred"])
    pred_export["XGBoost_Pred_Agrees"] = (pred_export["Label"] == pred_export["XGBoost_Pred"])
    pred_export["AdaBoost_Pred_Agrees"] = (pred_export["Label"] == pred_export["AdaBoost_Pred"])
    pred_export["All_Models_Agree"] = (
        pred_export["RandomForest_Pred_Agrees"] &
        pred_export["XGBoost_Pred_Agrees"] &
        pred_export["AdaBoost_Pred_Agrees"]
    )
    pred_export.to_csv(OUTPUT_DIR / "all_model_predictions.csv", index=False)

    disagreements = pred_export[~pred_export["All_Models_Agree"]].copy()
    disagreements.to_csv(OUTPUT_DIR / "model_disagreements.csv", index=False)
    print(f"  Holdout samples with model disagreements: {len(disagreements)} / {len(pred_export)}")

    # Step 9: Save CSV Reports & Outputs
    pd.DataFrame(test_metrics).to_csv(OUTPUT_DIR / "model_comparison.csv", index=False)
    pd.DataFrame(cv_rows_for_csv).to_csv(OUTPUT_DIR / "cross_validation_results.csv", index=False)
    pd.DataFrame(cr_rows).to_csv(OUTPUT_DIR / "classification_reports.csv", index=False)

    for mname in ["RandomForest", "XGBoost", "AdaBoost"]:
        fi_dict = all_stats[mname].get("feature_importances", {})
        pd.DataFrame(list(fi_dict.items()), columns=["Feature", "Importance"]).sort_values("Importance", ascending=False).to_csv(OUTPUT_DIR / f"feature_importance_{mname.lower()}.csv", index=False)

    model_base.to_csv(OUTPUT_DIR / "financial_scores_and_ranking.csv", index=False)
    model_base.to_csv(MODELS_DIR / "Final_Project_Data.csv", index=False)
    model_base.to_csv(MODELS_DIR / "Labelled_Financial_Data.csv", index=False)

    # Feature Availability Report
    avail_rows = []
    for f in MODEL_FEATURES:
        avail_rows.append({
            "Original_Feature": f,
            "Excel_Source": f,
            "Status": "OK Available",
            "Data_Type": "float64",
            "Missing_%": round(float(model_base[f].isna().mean() * 100), 2),
            "Used_For_Scoring": True,
            "Used_For_Model": True,
        })
    pd.DataFrame(avail_rows).to_csv(OUTPUT_DIR / "feature_availability_report.csv", index=False)

    feature_quantiles = {}
    clip_stats = {}
    for f in score_features:
        s = model_base[f].dropna()
        if not s.empty:
            q_vals = [round(float(s.quantile(p / 100.0)), 4) for p in range(0, 101, 5)]
            feature_quantiles[f] = q_vals
            clip_stats[f] = [round(float(s.quantile(0.01)), 4), round(float(s.quantile(0.99)), 4)]

    # Schema JSON
    schema = {
        "feature_names": score_features,
        "feature_count": len(score_features),
        "feature_directions": {f: FEATURE_DIRECTIONS.get(f, 1) for f in score_features},
        "neg_indicators": [f for f in score_features if FEATURE_DIRECTIONS.get(f, 1) < 0],
        "pos_indicators": [f for f in score_features if FEATURE_DIRECTIONS.get(f, 1) > 0],
        "label_classes": class_names,
        "label_hi_thresh": float(high_th),
        "label_lo_thresh": float(low_th),
        "feature_quantiles": feature_quantiles,
        "clip_stats": clip_stats,
    }
    with open(MODELS_DIR / "feature_schema.json", "w") as f:
        json.dump(schema, f, indent=2)

    # Model Stats JSON
    best_m = max(all_stats, key=lambda m: all_stats[m]["f1_score_weighted"])
    consolidated_stats = {
        "models": all_stats,
        "best_model": best_m,
        "dataset": {
            "excel_file": "Screener_Query_Results_Page1 (1).xlsx",
            "total_raw_rows": len(df),
            "usable_rows": len(model_base),
            "unique_stocks": int(model_base["Company"].nunique()),
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "available_features": score_features,
            "label_distribution": model_base["Label"].value_counts().to_dict(),
            "label_methodology": f"Directional Percentile Ranking & 70th/30th Percentiles (Undervalued >= {high_th:.3f} / Overvalued <= {low_th:.3f})",
            "data_source": "Screener.in Indian Listed Equities (2,001 Unique Companies)",
        },
        "accuracy": all_stats[best_m]["accuracy"],
        "precision": all_stats[best_m]["precision_weighted"],
        "recall": all_stats[best_m]["recall_weighted"],
        "f1_score": all_stats[best_m]["f1_score_weighted"],
        "classification_report": all_stats[best_m]["classification_report"],
        "feature_importances": all_stats[best_m]["feature_importances"],
        "last_trained": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    with open(MODELS_DIR / "model_stats.json", "w") as f:
        json.dump(consolidated_stats, f, indent=2)

    # Step 10: Generate all 13 plots
    generate_all_plots(model_base, score_features, low_th, high_th, models, X_test, y_test, class_names, test_metrics, cv_metrics)

    elapsed = round(time.time() - start_time, 2)
    print("=" * 70)
    print(f"PIPELINE COMPLETED SUCCESSFULLY IN {elapsed}s")
    print(f"  Best Model: {best_m} ({all_stats[best_m]['accuracy']*100:.2f}% accuracy)")
    print("=" * 70)

    return consolidated_stats

if __name__ == "__main__":
    run_pipeline()
