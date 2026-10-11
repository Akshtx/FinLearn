import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

FEATURE_ALIASES = {
    "PE_Ratio": ["PE_Ratio", "pe_ratio", "pe", "P_E"],
    "Price_to_Book": ["Price_to_Book", "PB_Ratio", "pb_ratio", "pb", "cmp_bv"],
    "PEG": ["PEG", "PEG_Ratio", "peg_ratio"],
    "ROE_pct": ["ROE_pct", "ROE", "roe", "roe_pct"],
    "ROA_12M_pct": ["ROA_12M_pct", "ROA", "roa", "roa_12m", "roa_pct"],
    "Profit_Growth_pct": [
        "Profit_Growth_pct", "profit_growth", "Profit_Margins", "profit_margins",
        "Revenue_Growth", "revenue_growth"
    ],
    "Debt_to_Equity": ["Debt_to_Equity", "debt_to_equity", "debt_eq", "debt_to_equity_ratio"],
    "ROCE_pct": ["ROCE_pct", "ROCE", "roce", "roce_pct", "EPS_Growth", "eps_growth"],
}

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._load()
        return cls._instance

    def reload(self):
        self._load()

    def _load(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.models_dir = os.path.abspath(os.path.join(current_dir, "../../models_store"))

        # Load feature schema
        schema_path = os.path.join(self.models_dir, "feature_schema.json")
        if os.path.exists(schema_path):
            with open(schema_path) as f:
                self.schema = json.load(f)
            self.feature_names = self.schema.get("feature_names", [
                "PE_Ratio", "Price_to_Book", "PEG", "ROE_pct",
                "ROA_12M_pct", "Profit_Growth_pct", "Debt_to_Equity", "ROCE_pct"
            ])
        else:
            self.schema = None
            self.feature_names = [
                "PE_Ratio", "Price_to_Book", "PEG", "ROE_pct",
                "ROA_12M_pct", "Profit_Growth_pct", "Debt_to_Equity", "ROCE_pct"
            ]

        # Load preprocessing
        self.imputer = self._load_artifact("imputer.pkl")
        self.scaler  = self._load_artifact("scaler.pkl")
        self.encoder = self._load_artifact("LabelEncoder.pkl")

        # Load all three models
        self.models = {}
        for name in ["RandomForest", "XGBoost", "AdaBoost"]:
            m = self._load_artifact(f"{name}_Model.pkl")
            if m is not None:
                self.models[name] = m
                print(f"{name}_Model.pkl loaded successfully.")

        self.loaded = (
            len(self.models) > 0 and
            self.encoder is not None
        )
        self.model = self.models.get("RandomForest", next(iter(self.models.values()), None))

    def _load_artifact(self, filename):
        path = os.path.join(self.models_dir, filename)
        if os.path.exists(path):
            try:
                return joblib.load(path)
            except Exception as e:
                print(f"Error loading {filename}: {e}")
        return None

    MODEL_KEY_MAP = {
        "randomforest": "RandomForest",
        "random_forest": "RandomForest",
        "rf": "RandomForest",
        "xgboost": "XGBoost",
        "xgb": "XGBoost",
        "adaboost": "AdaBoost",
        "ada": "AdaBoost",
    }

    def _resolve_model(self, key):
        normalized = self.MODEL_KEY_MAP.get(str(key).lower(), "RandomForest")
        return self.models.get(normalized, self.model)

    def _get_val(self, raw_feature_dict, fname):
        if fname in raw_feature_dict:
            v = raw_feature_dict[fname]
            if v is not None and str(v).lower() != "nan":
                return float(v)
        for alias in FEATURE_ALIASES.get(fname, []):
            if alias in raw_feature_dict:
                v = raw_feature_dict[alias]
                if v is not None and str(v).lower() != "nan":
                    return float(v)
        return np.nan

    def predict(self, raw_feature_dict, model_key="RandomForest"):
        """
        raw_feature_dict: dict with keys matching feature names or aliases.
        Supports both raw pipeline predictions (scikit-learn Pipelines) and legacy estimators.
        """
        if not self.loaded:
            raise RuntimeError("ML models are not loaded.")

        values = [self._get_val(raw_feature_dict, f) for f in self.feature_names]
        X_df = pd.DataFrame([values], columns=self.feature_names)

        model = self._resolve_model(model_key)

        # Scikit-learn Pipeline contains SimpleImputer + Classifier
        if isinstance(model, Pipeline) or hasattr(model, "named_steps"):
            pred = model.predict(X_df)[0]
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(X_df)[0]
            else:
                proba = [0.33, 0.33, 0.34]
        else:
            # Standalone estimator fallback
            X_imp = self.imputer.transform(X_df) if self.imputer else X_df.values
            X_sc = self.scaler.transform(X_imp) if self.scaler else X_imp
            pred = model.predict(X_sc)[0]
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(X_sc)[0]
            else:
                proba = [0.33, 0.33, 0.34]

        label = self.encoder.inverse_transform([pred])[0]
        confidence = float(max(proba))
        class_probs = {cls: float(p) for cls, p in zip(self.encoder.classes_, proba)}

        return str(label), float(confidence), class_probs
