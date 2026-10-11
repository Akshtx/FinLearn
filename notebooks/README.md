# FinLearn AI — Notebooks & Research Directory

This directory contains research notebooks, exploratory analysis, project planning documents, and weekly milestone validation reports.

---

## 📁 Directory Structure

```
notebooks/
├── FinLearn_Minor_Project_Detailed_Three_Models.ipynb           # Clean runnable notebook
├── FinLearn_Minor_Project_Detailed_Three_Models_Executed.ipynb  # Validated notebook with all outputs
├── minipro1.py                                                  # Legacy Google Colab research script
├── README.txt                                                   # Original Colab package instructions
├── docs/                                                        # Project plan & documentation
│   └── FinLearn_10_Week_Project_Plan.docx                       # Official 10-week minor project plan
├── milestone_reports/                                           # Week 2 through Week 9 CSV reports
└── artifacts/                                                   # Fitted pipelines & metrics from notebook
```

---

## 📓 1. Jupyter & Google Colab Notebooks

| Notebook | Status | Description |
|---|---|---|
| [`FinLearn_Minor_Project_Detailed_Three_Models.ipynb`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/FinLearn_Minor_Project_Detailed_Three_Models.ipynb) | Clean | Master research notebook. Contains all 72 cells for data ingestion, cleaning, 4-pillar formulation, 3-model training (Random Forest, XGBoost, AdaBoost), and cross-validation. Run top-to-bottom. |
| [`FinLearn_Minor_Project_Detailed_Three_Models_Executed.ipynb`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/FinLearn_Minor_Project_Detailed_Three_Models_Executed.ipynb) | Executed | Pre-executed validation run with all terminal outputs, metric tables, and confusion matrices preserved for review. |

---

## 📋 2. Weekly Research Milestone Reports (`milestone_reports/`)

The 10-week minor project validation progression generated the following audit reports:

- **Week 2**: [`Week2_Parsed_Screener_Data.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week2_Parsed_Screener_Data.csv), [`Week2_Schema_Coverage_Report.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week2_Schema_Coverage_Report.csv)
- **Week 3**: [`Week3_Missingness_Report.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week3_Missingness_Report.csv), [`Week3_IQR_Outlier_Report.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week3_IQR_Outlier_Report.csv), [`Week3_Correlation_Matrix.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week3_Correlation_Matrix.csv), [`Week3_High_Correlation_Pairs.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week3_High_Correlation_Pairs.csv), [`Week3_RobustScaled_EDA_Demo.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week3_RobustScaled_EDA_Demo.csv)
- **Week 4**: [`Week4_Feature_Audit.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week4_Feature_Audit.csv), [`Week4_Financial_Data_With_Scores.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week4_Financial_Data_With_Scores.csv), [`Week4_Ranked_Company_Scores.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week4_Ranked_Company_Scores.csv)
- **Week 5**: [`Week5_Model_Comparison_Test_Metrics.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week5_Model_Comparison_Test_Metrics.csv), [`Week5_Model_Comparison_Cross_Validation.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week5_Model_Comparison_Cross_Validation.csv), [`Week5_Feature_Importance.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week5_Feature_Importance.csv), [`Week5_Test_Set_Predictions.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week5_Test_Set_Predictions.csv), [`Week5_All_Companies_Model_Predictions.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week5_All_Companies_Model_Predictions.csv)
- **Week 8**: [`Week8_Notebook_Validation_Checks.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week8_Notebook_Validation_Checks.csv)
- **Week 9**: [`Week9_Label_Threshold_Sensitivity.csv`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/notebooks/milestone_reports/Week9_Label_Threshold_Sensitivity.csv)

---

## 💻 How to Run in Google Colab

1. Open [Google Colab](https://colab.research.google.com/).
2. Upload `FinLearn_Minor_Project_Detailed_Three_Models.ipynb`.
3. Upload `data/raw/Screener_Query_Results_Page1.xlsx` into the Colab file pane.
4. Run all cells from top to bottom (`Runtime -> Run all`).
