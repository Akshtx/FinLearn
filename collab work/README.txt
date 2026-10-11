FINLEARN MINOR PROJECT — PACKAGE README

FILES
- FinLearn_Minor_Project_Detailed_Three_Models.ipynb: clean runnable notebook (run cells top to bottom).
- FinLearn_Minor_Project_Detailed_Three_Models_Executed.ipynb: validation run with output cells and metric tables captured.
- Screener_Query_Results_Page1 (1).xlsx: the input dataset used by the notebook.
- FinLearn_10_Week_Project_Plan.docx: the supplied 10-week plan.
- finlearn_artifacts/: fitted Random Forest, AdaBoost and XGBoost pipelines, label encoder, feature names and metrics.
- Week*.csv: intermediate data, audit reports, model comparisons and prediction outputs generated during validation.

HOW TO RUN IN GOOGLE COLAB
1. Upload the clean .ipynb notebook and the Excel workbook into the same Colab session.
2. Run the notebook from top to bottom. Cell execution installs/imports XGBoost if needed.
3. Download the generated CSVs and finlearn_artifacts directory when finished.
4. Read the model metrics only alongside the limitations explained in the notebook.

VALIDATION
The clean notebook was executed end-to-end against the supplied workbook in a Python notebook environment. All executable cells in the 72-cell notebook completed without execution errors in the validation run. Results and metrics are included in the executed notebook and CSV files.

IMPORTANT SCIENTIFIC LIMITATION
The workbook is a static cross-sectional Screener export and does not contain dated future stock returns. Labels are created by a heuristic financial score from the same indicators later used by the classifiers. Therefore, metrics evaluate reproduction of the heuristic classes, not genuine future stock-return prediction or investment performance.

SECURITY
The original minipro1.py contained a hard-coded Financial Modeling Prep API key. It is intentionally not included in this package. If the key is real, revoke/rotate it. Do not place API keys in notebooks committed to public repositories. The Excel-based workflow does not need an API key.
