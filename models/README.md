# FinLearn AI — Machine Learning Models Directory

This directory contains all serialized machine learning models, preprocessors, feature schemas, and performance benchmarks for Indian equity fundamental valuation.

---

## 📁 Files in this Directory

| File | Type | Description |
|---|---|---|
| [`XGBoost_Model.pkl`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/XGBoost_Model.pkl) | Model Pipeline | **Champion Classifier**: Scikit-learn Pipeline (SimpleImputer + RobustScaler + XGBClassifier). Achieves **85.29% holdout test accuracy** and **86.31% 5-fold CV**. |
| [`RandomForest_Model.pkl`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/RandomForest_Model.pkl) | Model Pipeline | Scikit-learn Pipeline (SimpleImputer + RobustScaler + RandomForestClassifier with 300 balanced trees). Achieves **84.54% holdout test accuracy**. |
| [`AdaBoost_Model.pkl`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/AdaBoost_Model.pkl) | Model Pipeline | Scikit-learn Pipeline (SimpleImputer + RobustScaler + AdaBoostClassifier with 200 estimators). Achieves **81.05% holdout test accuracy**. |
| `*.joblib` | Joblib Pipelines | Exact serialized copies of the pipelines with `.joblib` format for alternate serialization loaders. |
| [`LabelEncoder.pkl`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/LabelEncoder.pkl) | Preprocessor | Scikit-learn LabelEncoder mapping integer classes `[0, 1, 2]` to `['Fairly Valued', 'Overvalued', 'Undervalued']`. |
| [`scaler.pkl`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/scaler.pkl) | Preprocessor | `RobustScaler` (median-centered, IQR-scaled) fitted strictly on the 1,600 training equity samples. |
| [`imputer.pkl`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/imputer.pkl) | Preprocessor | `SimpleImputer(strategy='median')` fitted strictly on training feature distributions. |
| [`feature_schema.json`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/feature_schema.json) | Config Schema | Complete definition of the 8 fundamental financial indicators, their directional orientations (+1/-1), and percentile classification thresholds. |
| [`model_stats.json`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/models/model_stats.json) | Metrics Record | Comprehensive benchmark metrics, precision, recall, F1-scores, 5-fold CV splits, and feature importance arrays for all 3 models. |

---

## 🚀 How to Load and Use a Model in Python (3 Lines)

```python
import joblib
import pandas as pd

# 1. Load the champion XGBoost pipeline
model = joblib.load("models/XGBoost_Model.pkl")
encoder = joblib.load("models/LabelEncoder.pkl")

# 2. Provide the 8 financial indicators for any stock
sample_stock = pd.DataFrame([{
    "PE_Ratio": 22.5,
    "Price_to_Book": 3.2,
    "PEG": 1.1,
    "ROE_pct": 24.5,
    "ROA_12M_pct": 14.2,
    "Profit_Growth_pct": 18.0,
    "Debt_to_Equity": 0.35,
    "ROCE_pct": 28.0
}])

# 3. Predict valuation class and probabilities
prediction = model.predict(sample_stock)[0]
valuation_label = encoder.inverse_transform([prediction])[0]
probabilities = model.predict_proba(sample_stock)[0]

print(f"Predicted Valuation: {valuation_label}")
for cls, prob in zip(encoder.classes_, probabilities):
    print(f"  {cls}: {prob*100:.2f}%")
```

---

## 🔄 How to Retrain Models
To retrain all models on the latest dataset and automatically update these serialized files:
```bash
bash scripts/run_training.sh
```
Or with npm:
```bash
npm run train
```
