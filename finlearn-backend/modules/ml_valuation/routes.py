import os
import json
import pandas as pd
import numpy as np
from flask import Blueprint, jsonify, request, send_file

from .feature_pipeline import compute_financial_score, FeaturePipeline
from .model_loader import ModelLoader

ml_blueprint = Blueprint('ml_valuation', __name__)

def _get_loader():
    return ModelLoader()

def _normalize_metric_pct(val):
    if val is None:
        return None
    try:
        f = float(val)
        return f if abs(f) > 1.0 else f * 100.0
    except (TypeError, ValueError):
        return None

@ml_blueprint.route('/valuation/<ticker>', methods=['GET'])
def get_stock_valuation(ticker):
    try:
        from .av_client import fetch_av_stock_metrics
        ticker_clean = ticker.upper().strip()
        selected_model = request.args.get('model', 'RandomForest')

        metrics = fetch_av_stock_metrics(ticker_clean)

        ml_loader = _get_loader()
        if not ml_loader.loaded:
            return jsonify({"success": False, "error": "ML models not loaded."}), 500

        # Map metrics to feature_schema names with percentage normalization
        feature_dict = {
            "PE_Ratio":       metrics.get("pe_ratio"),
            "PB_Ratio":       metrics.get("pb_ratio"),
            "PEG_Ratio":      metrics.get("peg_ratio"),
            "ROE":            _normalize_metric_pct(metrics.get("roe")),
            "ROA":            _normalize_metric_pct(metrics.get("roa")),
            "Profit_Margins": _normalize_metric_pct(metrics.get("profit_margins")),
            "Revenue_Growth": _normalize_metric_pct(metrics.get("revenue_growth")),
            "EPS_Growth":     _normalize_metric_pct(metrics.get("eps_growth")),
            "Debt_to_Equity": metrics.get("debt_to_equity"),
        }

        label, confidence, class_probs = ml_loader.predict(feature_dict, model_key=selected_model)

        # Comparative predictions across all 3 models
        all_preds = {}
        for m in ["RandomForest", "XGBoost", "AdaBoost"]:
            try:
                l, c, _ = ml_loader.predict(feature_dict, model_key=m)
                all_preds[m] = {"label": l, "confidence": round(c, 4)}
            except Exception:
                pass

        financial_score = compute_financial_score(feature_dict)

        return jsonify({
            "ticker": ticker_clean,
            "valuation_label": label,
            "confidence": round(confidence, 4),
            "financial_score": financial_score,
            "selected_model": selected_model,
            "all_model_predictions": all_preds,
            "class_probabilities": {k: round(v, 4) for k, v in class_probs.items()},
            "metrics": metrics
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@ml_blueprint.route('/valuation/batch', methods=['POST'])
def get_batch_valuations():
    try:
        from .av_client import fetch_av_stock_metrics
        data = request.get_json() or {}
        tickers = data.get("tickers", [])
        selected_model = data.get("model", "RandomForest")

        if not tickers:
            return jsonify({"success": False, "error": "Provide a list of tickers."}), 400

        ml_loader = _get_loader()
        predictions = {}

        for ticker in tickers:
            ticker_clean = ticker.upper().strip()
            try:
                metrics = fetch_av_stock_metrics(ticker_clean)
                feature_dict = {
                    "PE_Ratio":       metrics.get("pe_ratio"),
                    "PB_Ratio":       metrics.get("pb_ratio"),
                    "PEG_Ratio":      metrics.get("peg_ratio"),
                    "ROE":            _normalize_metric_pct(metrics.get("roe")),
                    "ROA":            _normalize_metric_pct(metrics.get("roa")),
                    "Profit_Margins": _normalize_metric_pct(metrics.get("profit_margins")),
                    "Revenue_Growth": _normalize_metric_pct(metrics.get("revenue_growth")),
                    "EPS_Growth":     _normalize_metric_pct(metrics.get("eps_growth")),
                    "Debt_to_Equity": metrics.get("debt_to_equity"),
                }
                label, confidence, _ = ml_loader.predict(feature_dict, model_key=selected_model)
                financial_score = compute_financial_score(feature_dict)
                predictions[ticker_clean] = {
                    "ticker": ticker_clean,
                    "valuation_label": label,
                    "confidence": round(confidence, 4),
                    "financial_score": financial_score,
                    "metrics": metrics
                }
            except Exception as e:
                predictions[ticker_clean] = {"error": str(e)}

        return jsonify({"success": True, "predictions": predictions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@ml_blueprint.route('/valuation/predict', methods=['POST'])
def predict_custom_valuation():
    try:
        data = request.get_json() or {}
        selected_model = data.get("model", "RandomForest")

        # Accept both percentage and decimal ROE/ROA/Margins/Growth
        def _get(key, default=None):
            v = data.get(key, default)
            return float(v) if v is not None else None

        feature_dict = {
            "PE_Ratio":       _get("pe_ratio"),
            "PB_Ratio":       _get("pb_ratio"),
            "PEG_Ratio":      _get("peg_ratio"),
            "ROE":            _get("roe"),
            "ROA":            _get("roa"),
            "Profit_Margins": _get("profit_margins"),
            "Revenue_Growth": _get("revenue_growth"),
            "EPS_Growth":     _get("eps_growth"),
            "Debt_to_Equity": _get("debt_to_equity"),
        }

        ml_loader = _get_loader()
        if not ml_loader.loaded:
            return jsonify({"success": False, "error": "ML models not loaded."}), 500

        label, confidence, class_probs = ml_loader.predict(feature_dict, model_key=selected_model)
        financial_score = compute_financial_score(feature_dict)

        # Get fi for selected model
        stats_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "../../models_store/model_stats.json"
        )
        fi = {}
        if os.path.exists(stats_path):
            with open(stats_path) as f:
                stats = json.load(f)
            model_key = ModelLoader.MODEL_KEY_MAP.get(selected_model.lower(), "RandomForest")
            fi = stats.get("models", {}).get(model_key, {}).get("feature_importances", {})

        return jsonify({
            "success": True,
            "valuation_label": label,
            "confidence": round(confidence, 4),
            "financial_score": financial_score,
            "selected_model": selected_model,
            "class_probabilities": {k: round(v, 4) for k, v in class_probs.items()},
            "feature_importances": fi,
            "metrics": {k: v for k, v in feature_dict.items() if v is not None}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@ml_blueprint.route('/valuation/stats', methods=['GET'])
def get_model_stats():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir  = os.path.abspath(os.path.join(current_dir, "../../models_store"))
    stats_path  = os.path.join(models_dir, "model_stats.json")
    schema_path = os.path.join(models_dir, "feature_schema.json")
    data_path   = os.path.join(models_dir, "Final_Project_Data.csv")

    stats_data = {}
    if os.path.exists(stats_path):
        with open(stats_path) as f:
            stats_data = json.load(f)

    schema = {}
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            schema = json.load(f)

    sample_rows = []
    total_rows  = 0
    if os.path.exists(data_path):
        try:
            df = pd.read_csv(data_path)
            total_rows = len(df)
            feature_cols = schema.get("feature_names", [])
            for _, r in df.head(8).iterrows():
                fs = r.get("Financial_Score")
                score_val = round(float(fs), 3) if (pd.notna(fs) and not np.isnan(float(fs))) else 0.50
                row = {
                    "company": str(r.get("Company", "N/A")),
                    "label": str(r.get("Label", "Fairly Valued")),
                    "score": score_val
                }
                for col in feature_cols:
                    val = r.get(col)
                    row[col] = round(float(val), 2) if (pd.notna(val) and not np.isnan(float(val))) else "—"
                sample_rows.append(row)
        except Exception as ex:
            print(f"Error parsing sample rows: {ex}")

    # Load 5-Fold Cross-Validation results
    cv_data = {}
    cv_path = os.path.join(models_dir, "outputs", "cross_validation_results.csv")
    if os.path.exists(cv_path):
        try:
            cv_df = pd.read_csv(cv_path)
            for m in ["RandomForest", "XGBoost", "AdaBoost"]:
                m_df = cv_df[cv_df["Model"] == m]
                if not m_df.empty:
                    folds = []
                    mean_val = 0.0
                    for _, row in m_df.iterrows():
                        f_name = str(row["Fold"])
                        acc = float(row["Accuracy"])
                        if f_name.lower() == "mean":
                            mean_val = round(acc, 4)
                        else:
                            folds.append(round(acc, 4))
                    cv_data[m] = {"folds": folds, "mean": mean_val}
        except Exception as ex:
            print(f"Error loading CV results: {ex}")

    # Load Model Disagreements & Agreement Rates from test set predictions
    disagreements = []
    agreement_rates = {}
    preds_path = os.path.join(models_dir, "outputs", "all_model_predictions.csv")
    dis_path = os.path.join(models_dir, "outputs", "model_disagreements.csv")

    if os.path.exists(preds_path):
        try:
            preds_df = pd.read_csv(preds_path)
            total_test = len(preds_df)
            for m in ["RandomForest", "XGBoost", "AdaBoost"]:
                col = f"{m}_Pred_Agrees"
                if col in preds_df.columns:
                    agreed = int(preds_df[col].sum())
                    dis_count = total_test - agreed
                    agreement_rates[m] = {
                        "agreement_pct": round((agreed / float(total_test)) * 100, 1),
                        "agreed": agreed,
                        "disagreed": dis_count,
                        "total": total_test
                    }
        except Exception as ex:
            print(f"Error calculating agreement from predictions: {ex}")

    if os.path.exists(dis_path):
        try:
            dis_df = pd.read_csv(dis_path)
            for _, r in dis_df.head(10).iterrows():
                disagreements.append({
                    "company": str(r.get("Company", "N/A")),
                    "score": round(float(r.get("Financial_Score", 0)), 3),
                    "rank": int(r.get("Financial_Rank", 0)),
                    "formula_label": str(r.get("Label", "N/A")),
                    "rf_pred": str(r.get("RandomForest_Pred", "N/A")),
                    "xgb_pred": str(r.get("XGBoost_Pred", "N/A")),
                    "ada_pred": str(r.get("AdaBoost_Pred", "N/A")),
                })
        except Exception as ex:
            print(f"Error loading disagreements: {ex}")

    # Load EDA Outlier Summary
    eda_outliers = []
    eda_path = os.path.join(models_dir, "reports", "eda_outlier_summary.csv")
    if os.path.exists(eda_path):
        try:
            eda_df = pd.read_csv(eda_path)
            for _, r in eda_df.iterrows():
                eda_outliers.append({
                    "feature": str(r.get("Feature", "")),
                    "outliers": int(r.get("Outliers", 0)),
                    "lower_bound": round(float(r.get("Lower_Bound", 0)), 2),
                    "upper_bound": round(float(r.get("Upper_Bound", 0)), 2),
                    "min": round(float(r.get("Min", 0)), 2),
                    "max": round(float(r.get("Max", 0)), 2)
                })
        except Exception as ex:
            print(f"Error loading EDA outliers: {ex}")

    methodology = {
        "pillars": {
            "Valuation": ["PE_Ratio", "Price_to_Book", "PEG"],
            "Profitability": ["ROE_pct", "ROA_12M_pct", "ROCE_pct"],
            "Growth": ["Profit_Growth_pct"],
            "Financial_Health": ["Debt_to_Equity"]
        },
        "scaler": "Directional Percentile Ranking (Average Method, 4 Fundamental Pillars)",
        "quantiles": "70th percentile (Undervalued >= 0.5758) / 30th percentile (Overvalued <= 0.4152)"
    }

    report_charts = [
        {
            "id": "score_distribution",
            "title": "Composite Score & Percentile Thresholds",
            "category": "Data & Scoring",
            "file": "score_distribution.png",
            "description": "Distribution of directional financial scores across Indian equities with 70th (0.5758) and 30th (0.4152) percentile thresholds."
        },
        {
            "id": "class_distribution",
            "title": "Valuation Class Distribution",
            "category": "Data & Scoring",
            "file": "class_distribution.png",
            "description": "Distribution across Fairly Valued (800), Undervalued (600), and Overvalued (600) categories."
        },
        {
            "id": "eda_correlation_heatmap",
            "title": "Financial Feature Correlation Heatmap",
            "category": "Exploratory Data Analysis",
            "file": "eda_correlation_heatmap.png",
            "description": "Correlation matrix coefficients highlighting linkages between valuation multiples and profitability metrics."
        },
        {
            "id": "eda_boxplots",
            "title": "Feature Box Plots (Outlier Identification)",
            "category": "Exploratory Data Analysis",
            "file": "eda_boxplots.png",
            "description": "Box plots illustrating distribution spread and 1.5x IQR outlier thresholds for Indian equities."
        },
        {
            "id": "eda_histograms",
            "title": "Feature Distribution Histograms",
            "category": "Exploratory Data Analysis",
            "file": "eda_histograms.png",
            "description": "Frequency histograms visualizing positive skewness in valuation multiples and growth figures."
        },
        {
            "id": "eda_pairplot",
            "title": "Key Indicators Pairwise Relationships",
            "category": "Exploratory Data Analysis",
            "file": "eda_pairplot.png",
            "description": "Multivariate scatter matrix across P/E, Price to Book, ROE, Debt/Equity, and growth indicators."
        },
        {
            "id": "model_comparison",
            "title": "Multi-Model Comparison Chart",
            "category": "Model Performance",
            "file": "model_comparison.png",
            "description": "Comparison of Accuracy, Balanced Accuracy, Weighted F1, and Macro F1 across XGBoost, Random Forest, and AdaBoost."
        },
        {
            "id": "feature_importance_xgboost",
            "title": "XGBoost Feature Importance",
            "category": "Model Insights",
            "file": "feature_importance_xgboost.png",
            "description": "Feature weightings for the top-performing XGBoost classifier (~89.25% test accuracy)."
        },
        {
            "id": "feature_importance_randomforest",
            "title": "Random Forest Feature Importance",
            "category": "Model Insights",
            "file": "feature_importance_randomforest.png",
            "description": "Mean decrease in impurity importance rankings across 300 balanced decision trees."
        },
        {
            "id": "feature_importance_adaboost",
            "title": "AdaBoost Feature Importance",
            "category": "Model Insights",
            "file": "feature_importance_adaboost.png",
            "description": "Relative feature importance assigned during iterative AdaBoost boosting rounds."
        },
        {
            "id": "confusion_matrix_xgboost",
            "title": "XGBoost Confusion Matrix",
            "category": "Validation & Matrices",
            "file": "confusion_matrix_xgboost.png",
            "description": "True vs Predicted classifications on the 400 holdout test set for XGBoost."
        },
        {
            "id": "confusion_matrix_randomforest",
            "title": "Random Forest Confusion Matrix",
            "category": "Validation & Matrices",
            "file": "confusion_matrix_randomforest.png",
            "description": "True vs Predicted classifications on the 400 holdout test set for Random Forest."
        },
        {
            "id": "confusion_matrix_adaboost",
            "title": "AdaBoost Confusion Matrix",
            "category": "Validation & Matrices",
            "file": "confusion_matrix_adaboost.png",
            "description": "True vs Predicted classifications on the 400 holdout test set for AdaBoost."
        }
    ]

    return jsonify({
        "success":         True,
        "stats":           stats_data,
        "schema":          schema,
        "sample_data":     sample_rows,
        "total_rows":      total_rows,
        "cv_results":      cv_data,
        "agreement_rates": agreement_rates,
        "disagreements":   disagreements,
        "eda_outliers":    eda_outliers,
        "report_charts":   report_charts,
        "methodology":     methodology
    })


@ml_blueprint.route('/valuation/schema', methods=['GET'])
def get_feature_schema():
    schema_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "../../models_store/feature_schema.json"
    )
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            return jsonify(json.load(f))
    return jsonify({"error": "Feature schema not found."}), 404


@ml_blueprint.route('/valuation/confusion-matrix', methods=['GET'])
def get_confusion_matrix():
    model_name = request.args.get('model', 'RandomForest').lower()
    models_dir = os.path.abspath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "../../models_store"
    ))
    target_file = f"confusion_matrix_{model_name}.png"
    image_path  = os.path.join(models_dir, target_file)
    if not os.path.exists(image_path):
        image_path = os.path.join(models_dir, "reports", target_file)
    if not os.path.exists(image_path):
        image_path = os.path.join(models_dir, "confusion_matrix.png")
    if os.path.exists(image_path):
        return send_file(image_path, mimetype='image/png')
    return jsonify({"success": False, "error": "Confusion matrix image not found."}), 404


@ml_blueprint.route('/reports/plot/<path:filename>', methods=['GET'])
@ml_blueprint.route('/valuation/plot/<path:filename>', methods=['GET'])
def get_report_plot(filename):
    models_dir = os.path.abspath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "../../models_store"
    ))
    filename = os.path.basename(filename)
    # Check reports/ first, then models_store/
    image_path = os.path.join(models_dir, "reports", filename)
    if not os.path.exists(image_path):
        image_path = os.path.join(models_dir, filename)

    if os.path.exists(image_path) and filename.endswith('.png'):
        return send_file(image_path, mimetype='image/png')
    return jsonify({"success": False, "error": f"Plot {filename} not found."}), 404

