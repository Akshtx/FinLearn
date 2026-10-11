# FinLearn AI — Data Directory

This directory contains the primary datasets used by FinLearn AI for machine learning model training and analysis of Indian listed equities (NSE & BSE).

---

## 📁 Directory Structure

```
data/
├── raw/        # Original, unmodified data exports
└── processed/  # Cleaned, deduplicated, scored, and ML-ready datasets
```

---

## 📄 1. Raw Data (`data/raw/`)

| File | Rows | Description |
|---|---|---|
| [`Screener_Query_Results_Page1.xlsx`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/data/raw/Screener_Query_Results_Page1.xlsx) | 2,650 rows | Complete financial query export downloaded from Screener.in containing multiple financial metrics for Indian listed companies across NSE and BSE. |

---

## 📊 2. Processed Data (`data/processed/`)

| File | Rows | Description |
|---|---|---|
| [`Final_Project_Data.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/data/processed/Final_Project_Data.csv) | 2,001 rows | **Primary Cleaned Dataset**: 649 duplicate ticker records eliminated $\rightarrow$ 2,001 unique companies. Includes canonical column names, outlier clipping, calculated 4-pillar financial scores, rankings, and ground-truth valuation labels. |
| [`Labelled_Financial_Data.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/data/processed/Labelled_Financial_Data.csv) | 2,001 rows | Scored equity records with intermediate metric percentiles and directional indicators. |
| [`cleaned_indian_market_data.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/data/processed/cleaned_indian_market_data.csv) | 2,001 rows | Cleaned feature columns with placeholder dashes (`—`) and infinities resolved to `NaN`. |
| [`ml_ready_dataset.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/data/processed/ml_ready_dataset.csv) | 2,001 rows | Stripped numeric feature matrix formatted directly for Scikit-learn and XGBoost training. |

---

## 🏛️ The 4 Fundamental Pillars

Each company is evaluated across 4 fundamental dimensions using directional percentile ranking:

1. **Valuation Multiple Score (Lower is better $\rightarrow$ Negative Direction)**:
   - P/E Ratio (`PE_Ratio`)
   - Price to Book (`Price_to_Book`)
   - PEG Ratio (`PEG`)
2. **Profitability Score (Higher is better $\rightarrow$ Positive Direction)**:
   - Return on Equity (`ROE_pct`)
   - Return on Assets 12M (`ROA_12M_pct`)
   - Return on Capital Employed (`ROCE_pct`)
3. **Growth Score (Higher is better $\rightarrow$ Positive Direction)**:
   - Annual Profit Growth (`Profit_Growth_pct`)
4. **Financial Health & Leverage (Lower is better $\rightarrow$ Negative Direction)**:
   - Debt to Equity Ratio (`Debt_to_Equity`)

### Composite Formulation
$$\text{Composite Score} = \frac{\text{Valuation} + \text{Profitability} + \text{Growth} + \text{Health}}{4}$$

- **Undervalued ($\ge 70\text{th}$ percentile, Score $\ge 0.5758$)**: 600 companies (Top 30%)
- **Fairly Valued ($30\text{th} - 70\text{th}$ percentile)**: 800 companies (Middle 40%)
- **Overvalued ($\le 30\text{th}$ percentile, Score $\le 0.4152$)**: 600 companies (Bottom 30%)
