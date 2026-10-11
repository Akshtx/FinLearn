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

## 4. Repository Structure & Directory Map

The project is structured into clear, self-contained directories so you can immediately find models, outputs, data, notebooks, and runner scripts:

```
finlearn-ai/
│
├── 📁 data/                           # All Market Datasets (Raw & Processed)
│   ├── raw/
│   │   └── Screener_Query_Results_Page1.xlsx   # 2,650 Indian stock snapshot from Screener.in
│   ├── processed/
│   │   ├── Final_Project_Data.csv             # 2,001 Unique deduplicated Indian stocks with 4-pillar scores
│   │   └── Labelled_Financial_Data.csv        # Scored intermediate dataset
│   └── README.md
│
├── 📁 models/                         # Trained ML Models, Pipelines & Schemas
│   ├── XGBoost_Model.pkl                      # Champion Classifier (~85.3% accuracy, ~86.3% CV)
│   ├── RandomForest_Model.pkl                 # 300 Balanced Trees Classifier (~84.5% accuracy)
│   ├── AdaBoost_Model.pkl                     # Adaptive Boosting Classifier (~81.1% accuracy)
│   ├── LabelEncoder.pkl                       # Class mappings (Undervalued, Fairly Valued, Overvalued)
│   ├── scaler.pkl & imputer.pkl               # Leakage-resistant RobustScaler & SimpleImputer
│   ├── feature_schema.json                    # 8 Fundamental indicators, weights, & percentile thresholds
│   ├── model_stats.json                       # Comprehensive evaluation metrics & CV splits
│   └── README.md
│
├── 📁 outputs/                        # Experimental Results, Metrics & Visualizations
│   ├── tables/                                # Evaluation CSV tables & prediction logs
│   │   ├── model_comparison.csv               # Head-to-head performance benchmarks
│   │   ├── cross_validation_results.csv       # 5-fold stratified CV breakdown per fold
│   │   ├── classification_reports.csv         # Class-level precision, recall, and F1
│   │   ├── all_model_predictions.csv          # Holdout test set predictions & agreement flags
│   │   ├── model_disagreements.csv            # Test samples where models differ from heuristic
│   │   ├── feature_availability_report.csv    # Indicator coverage and missingness audit
│   │   ├── feature_importance_xgboost.csv     # Champion XGBoost feature weightings
│   │   └── feature_importance_randomforest.csv
│   ├── charts/                                # 13 High-resolution publication figures & EDA plots
│   │   ├── confusion_matrix_xgboost.png       # Normalized confusion matrices
│   │   ├── confusion_matrix_randomforest.png
│   │   ├── confusion_matrix_adaboost.png
│   │   ├── model_comparison.png               # Multi-metric comparative bar plot
│   │   ├── eda_correlation_heatmap.png        # Correlation matrix of financial indicators
│   │   ├── score_distribution.png             # Directional percentile threshold distributions
│   │   └── ... (boxplots, histograms, pairplots)
│   └── README.md
│
├── 📁 notebooks/                      # Research Notebooks, Milestone Reports & Documentation
│   ├── FinLearn_Minor_Project_Detailed_Three_Models.ipynb          # Master clean research notebook
│   ├── FinLearn_Minor_Project_Detailed_Three_Models_Executed.ipynb # Pre-executed validation run
│   ├── docs/FinLearn_10_Week_Project_Plan.docx                     # Official 10-week project plan
│   ├── milestone_reports/                                          # Week 2 through Week 9 CSV reports
│   └── README.md
│
├── 📁 scripts/                        # 1-Click Execution Runner Scripts
│   ├── run_all.sh                             # Starts backend (:5001) + frontend (:3000) concurrently
│   ├── run_frontend.sh                        # Starts React Vite dev server
│   ├── run_backend.sh                         # Starts Flask REST API
│   ├── run_training.sh                        # Retrains models & syncs all outputs
│   └── README.md
│
├── 📁 finlearn-backend/               # Flask REST API Server & ML Pipelines
│   ├── server.py                              # Flask application entry point
│   ├── requirements.txt                       # Python dependencies
│   ├── config/                                # API configurations
│   └── modules/ml_valuation/                  # Indian market training pipeline, routes, loader
│
├── 📁 src/                            # Frontend React 19 + TypeScript + Vite UI
│   ├── App.tsx                         # Application shell and routes
│   ├── main.tsx                         # Frontend entrypoint
│   ├── components/                      # Reusable UI components by feature
│   ├── hooks/                           # Shared React hooks
│   ├── pages/                           # Route-level screens
│   ├── services/                        # API and integration services
│   ├── constants.ts                     # Shared application constants
│   └── types.ts                         # Shared TypeScript types
├── QUICKSTART.md                      # Fast navigation and single-command cheat sheet
└── README.md                          # Full academic & framework documentation
```

---

## 5. How to Run the Application

For a quick cheat-sheet, see [`QUICKSTART.md`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/QUICKSTART.md).

### 5.1 Run Full Stack (Backend + Frontend Concurrently)
```bash
npm start
# OR: bash scripts/run_all.sh
```
- **Backend API**: `http://localhost:5001`
- **Frontend App**: `http://localhost:3000`
- **ML Valuation Layer**: `http://localhost:3000/#/ml-model`

### 5.2 Run Frontend Only
```bash
npm run dev
# OR: bash scripts/run_frontend.sh
```

### 5.3 Run Backend API Only
```bash
npm run backend
# OR: bash scripts/run_backend.sh
```

### 5.4 Re-Train Models & Regenerate All Outputs
To re-run the research pipeline from scratch (EDA, 4-pillar formulation, 3-model training, 5-fold CV, and 13 plots):
```bash
npm run train
# OR: bash scripts/run_training.sh
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
