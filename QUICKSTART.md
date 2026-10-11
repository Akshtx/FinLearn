# ⚡ FinLearn AI — Quickstart & File Navigation Guide

Welcome! This quick guide helps you instantly find every model, dataset, output, and report, and explains how to run everything with single commands.

---

## 🧭 File Navigator: "Where Is What?"

| Looking for... | Exact Directory Path | What's Inside |
|---|---|---|
| **Trained ML Models** | [`models/`](models/) | `XGBoost_Model.pkl` (Champion), `RandomForest_Model.pkl`, `AdaBoost_Model.pkl`, `LabelEncoder.pkl`, `scaler.pkl`, `feature_schema.json`, `model_stats.json` |
| **Output Metrics & CSVs** | [`outputs/tables/`](outputs/tables/) | `model_comparison.csv`, `cross_validation_results.csv`, `all_model_predictions.csv`, `classification_reports.csv`, `feature_importance_*.csv` |
| **Output Plots & Charts** | [`outputs/charts/`](outputs/charts/) | 13 high-resolution publication PNG figures (confusion matrices, correlation heatmap, score distribution, boxplots, histograms) |
| **Datasets (Raw & Cleaned)** | [`data/`](data/) | `data/raw/Screener_Query_Results_Page1.xlsx` (raw 2,650 rows)<br>`data/processed/Final_Project_Data.csv` (deduplicated 2,001 unique Indian stocks with scores & labels) |
| **Jupyter & Research Notebooks** | [`notebooks/`](notebooks/) | Master and executed notebooks, 10-week project plan, weekly milestone CSVs, and notebook artifacts |
| **Execution Scripts** | [`scripts/`](scripts/) | `run_all.sh`, `run_frontend.sh`, `run_backend.sh`, `run_training.sh` |
| **Backend Code & API** | [`finlearn-backend/`](finlearn-backend/) | `server.py` (Flask REST API), `modules/ml_valuation/` (training pipeline & routes) |
| **Frontend Web App** | [`src/`](src/) | React 19 + TypeScript + Vite app organized into pages, components, hooks, and services |

---

## 🏃 How to Run It

### Option 1: Run Full App (Backend + Frontend together)
```bash
npm start
# OR: bash scripts/run_all.sh
```
- **Backend API**: `http://localhost:5001`
- **Frontend App**: `http://localhost:3000`
- **Interactive ML Layer**: `http://localhost:3000/#/ml-model`

Before starting the frontend, put your Gemini credential in a local `.env.local` file:
```bash
GEMINI_API_KEY=your_api_key_here
```
This file is ignored by Git and must not be committed.

---

### Option 2: Run Individual Components

#### A. Run Frontend Only
```bash
npm run dev
# OR: bash scripts/run_frontend.sh
```

#### B. Run Backend API Only
```bash
npm run backend
# OR: bash scripts/run_backend.sh
```

#### C. Retrain Machine Learning Models & Regenerate Outputs
```bash
npm run train
# OR: bash scripts/run_training.sh
```

---

## 🐍 Load Trained Model in Python (Quick Snippet)

```python
import joblib
import pandas as pd

# Load the champion XGBoost model and label encoder
model = joblib.load("models/XGBoost_Model.pkl")
encoder = joblib.load("models/LabelEncoder.pkl")

# Predict on stock ratios
features = pd.DataFrame([{
    "PE_Ratio": 22.5, "Price_to_Book": 3.2, "PEG": 1.1,
    "ROE_pct": 24.5, "ROA_12M_pct": 14.2, "Profit_Growth_pct": 18.0,
    "Debt_to_Equity": 0.35, "ROCE_pct": 28.0
}])

prediction = model.predict(features)[0]
print("Valuation Class:", encoder.inverse_transform([prediction])[0])
```
