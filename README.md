# FinLearn AI: Machine Learning Framework for Indian Equity Valuation

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/react-19-cyan.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-orange.svg)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/xgboost-2.0+-green.svg)](https://xgboost.readthedocs.io/)
[![Dataset](https://img.shields.io/badge/dataset-2%2C001%20Indian%20Stocks-purple.svg)](https://www.screener.in/)

## Abstract & Research Overview
**FinLearn AI** is an end-to-end machine learning framework designed for automated fundamental valuation and financial health classification of Indian equities listed on the NSE and BSE. 

Traditional valuation methods often rely on isolated single-variable multiples (such as P/E or P/B), which fail to capture multidimensional trade-offs between capital efficiency, leverage, and growth. This project implements a **4-Pillar Composite Financial Scoring Methodology** combined with three machine learning classifiers (**XGBoost**, **Random Forest**, and **AdaBoost**) trained on a deduplicated universe of **2,001 Indian companies** sourced from Screener.in.

---

## 1. Dataset & Market Universe

- **Data Source**: Screener.in comprehensive financial query export ([`Screener_Query_Results_Page1.xlsx`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/finlearn-backend/models_store/Screener_Query_Results_Page1.xlsx)).
- **Raw Records**: 2,650 company rows.
- **Deduplication**: 649 duplicate ticker/company records eliminated $\rightarrow$ **2,001 unique companies**.
- **Data Partitioning**: Leakage-resistant **80:20 Stratified Split**:
  - **Training Set**: 1,600 companies (80%)
  - **Testing Holdout**: 401 companies (20%)
- **Target Classes**:
  - **Undervalued**: Top 30% composite financial score ($\ge 0.3655$) — 601 companies.
  - **Fairly Valued**: Interquartile range ($-0.2131 < \text{Score} < 0.3655$) — 799 companies.
  - **Overvalued**: Bottom 30% composite financial score ($\le -0.2131$) — 601 companies.

---

## 2. Methodology & Feature Engineering

### 2.1 Data Cleaning & Preprocessing (Weeks 2–3)
1. **Placeholder & Infinity Handling**: Screener dash placeholders (`—`), `N/A`, and $\pm\infty$ coerced to `NaN`.
2. **Outlier Detection via Interquartile Range (IQR)**:
   $$\text{Lower Bound} = Q_1 - 1.5 \times \text{IQR}, \quad \text{Upper Bound} = Q_3 + 1.5 \times \text{IQR}$$
   Extreme financial multiples (e.g. P/E $> 1,600$, P/B $> 10,000$) bound-checked across all features ([`reports/eda_outlier_summary.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/finlearn-backend/models_store/reports/eda_outlier_summary.csv)).
3. **Leakage-Resistant Preprocessing**:
   - Imputation: Median imputation fitted strictly on the 1,600 training samples.
   - Normalization: `RobustScaler` (median-centered and scaled by IQR) to prevent high-skew multiples from distorting gradient updates.

### 2.2 The 4-Pillar Financial Health Metric Formulation (Week 4)
Each company is evaluated across four core fundamental dimensions:

$$\text{Valuation Score} = \text{mean}\left(-\text{P/E}, -\text{P/B}, -\text{PEG}\right)$$

$$\text{Profitability Score} = \text{mean}\left(\text{ROE}, \text{ROA}, \text{OPM}, \text{ROCE}\right)$$

$$\text{Growth Score} = \text{mean}\left(\text{Profit Growth}, \text{EPS 5Y Variation}\right)$$

$$\text{Financial Health Score} = -\text{Debt-to-Equity}$$

$$\text{Composite Financial Score} = \frac{\text{Valuation} + \text{Profitability} + \text{Growth} + \text{Health}}{4}$$

---

## 3. Experimental Results & Model Evaluation

### 3.1 Model Performance Benchmarks (401 Holdout Test Samples)

| Metric | Random Forest | XGBoost (Champion) | AdaBoost |
|---|:---:|:---:|:---:|
| **Test Accuracy** | **84.54%** | **85.29%** | **81.05%** |
| **Balanced Accuracy** | 85.03% | 85.05% | 80.35% |
| **Weighted Precision** | 84.65% | 85.70% | 82.41% |
| **Weighted Recall** | 84.54% | 85.29% | 81.05% |
| **Weighted F1-Score** | 0.8453 | **0.8535** | 0.8118 |
| **Macro F1-Score** | 0.8492 | **0.8558** | 0.8139 |
| **5-Fold Stratified CV Mean** | 86.26% ($\pm$ 0.44%) | **86.31% ($\pm$ 0.97%)** | 81.26% ($\pm$ 0.85%) |
| **Agreement with Formula** | 84.54% (339 / 401) | **85.29% (342 / 401)** | 81.05% (325 / 401) |
| **Training Latency** | 0.251s | 0.581s | 0.478s |

*Generated benchmark table:* [`finlearn-backend/models_store/outputs/model_comparison.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/finlearn-backend/models_store/outputs/model_comparison.csv)

### 3.2 5-Fold Stratified Cross-Validation Breakdown

| Model | Fold 1 | Fold 2 | Fold 3 | Fold 4 | Fold 5 | Mean Accuracy |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **XGBoost** | 87.03% | 87.25% | 85.25% | 85.00% | 87.00% | **86.31%** |
| **Random Forest** | 86.03% | 85.75% | 86.00% | 86.50% | 87.00% | **86.26%** |
| **AdaBoost** | 80.80% | 82.75% | 81.00% | 80.25% | 81.50% | **81.26%** |

*Generated CV table:* [`finlearn-backend/models_store/outputs/cross_validation_results.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/finlearn-backend/models_store/outputs/cross_validation_results.csv)

---

## 4. Repository Structure & Research Artifacts

```
finlearn-ai/
├── collab work/
│   └── minipro1.py                   # Original end-to-end research notebook code
│
├── finlearn-backend/
│   ├── server.py                     # Flask REST application entry point
│   ├── modules/ml_valuation/
│   │   ├── indian_market_pipeline.py # Full execution pipeline (EDA, scaling, 3 models, plots)
│   │   ├── train_from_excel.py       # Standalone training script for 2,001 Indian stocks
│   │   ├── data_pipeline.py          # Data ingestion and deduplication module
│   │   ├── feature_pipeline.py       # 4-pillar calculation and preprocessing
│   │   ├── model_loader.py           # Model deserialization and inference engine
│   │   └── routes.py                 # REST API endpoints for predictions and plots
│   │
│   └── models_store/
│       ├── Screener_Query_Results_Page1.xlsx # Raw Indian equities snapshot (2,650 rows)
│       ├── Final_Project_Data.csv    # Cleaned & labelled dataset (2,001 rows)
│       ├── RandomForest_Model.pkl    # Serialized Random Forest classifier
│       ├── XGBoost_Model.pkl         # Serialized XGBoost classifier
│       ├── AdaBoost_Model.pkl        # Serialized AdaBoost classifier
│       ├── LabelEncoder.pkl          # Class label mapping
│       ├── scaler.pkl                # Preprocessing RobustScaler
│       ├── imputer.pkl               # SimpleImputer
│       │
│       ├── outputs/                  # Numerical Evaluation Artifacts
│       │   ├── model_comparison.csv
│       │   ├── cross_validation_results.csv
│       │   ├── classification_reports.csv
│       │   ├── all_model_predictions.csv
│       │   ├── model_disagreements.csv
│       │   ├── feature_availability_report.csv
│       │   ├── feature_importance_xgboost.csv
│       │   ├── feature_importance_randomforest.csv
│       │   └── feature_importance_adaboost.csv
│       │
│       └── reports/                  # High-Resolution Publication Plots (13 charts)
│           ├── score_distribution.png
│           ├── class_distribution.png
│           ├── eda_correlation_heatmap.png
│           ├── eda_boxplots.png
│           ├── eda_histograms.png
│           ├── eda_pairplot.png
│           ├── eda_outlier_summary.csv
│           ├── model_comparison.png
│           ├── feature_importance_xgboost.png
│           ├── feature_importance_randomforest.png
│           ├── feature_importance_adaboost.png
│           ├── confusion_matrix_xgboost.png
│           ├── confusion_matrix_randomforest.png
│           └── confusion_matrix_adaboost.png
│
├── pages/
│   └── MLModelPage.tsx               # Interactive React ML Layer with Research Gallery
├── components/                       # UI components (charts, cards, navigation)
└── vite.config.ts                    # Vite dev server with proxy configuration
```

---

## 5. How to Reproduce & Run Locally

### 5.1 Re-run Full ML Training & Generate All Artifacts
To execute the complete research pipeline from scratch (loading the Excel file, performing EDA, calculating 4 pillars, training all 3 models, and rendering all 13 plots):
```bash
cd finlearn-backend
python3 modules/ml_valuation/indian_market_pipeline.py
```

### 5.2 Launch the Backend API
```bash
cd finlearn-backend
python3 server.py
# Backend runs at http://localhost:5001
```

### 5.3 Launch the Interactive Frontend App
```bash
npm install
npm run dev
# Frontend runs at http://localhost:3000
# ML Valuation Layer: http://localhost:3000/#/ml-model
```

---

## 6. Citation & Academic Reference
If you are writing a research paper using this codebase or dataset, cite this framework as:
```bibtex
@misc{finlearn_ai_2026,
  author = {Sugandhi, Akshath and Contributors},
  title = {FinLearn AI: A Multidimensional Machine Learning Framework for Indian Equity Fundamental Valuation},
  year = {2026},
  publisher = {GitHub},
  howpublished = {\url{https://github.com/Akshtx/FinLearn}}
}
```
