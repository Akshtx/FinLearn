import os
import json
import joblib
import numpy as np
import pandas as pd

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._load()
        return cls._instance

    def _load(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.models_dir = os.path.abspath(os.path.join(current_dir, "../../models_store"))

        # Load feature schema
        schema_path = os.path.join(self.models_dir, "feature_schema.json")
        if os.path.exists(schema_path):
            with open(schema_path) as f:
                self.schema = json.load(f)
            self.feature_names = self.schema["feature_names"]
        else:
            self.schema = None
            self.feature_names = [
                "PE_Ratio", "PB_Ratio", "PEG_Ratio", "ROE", "ROA",
                "Profit_Margins", "Revenue_Growth", "EPS_Growth", "Debt_to_Equity"
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
            self.encoder is not None and
            self.imputer is not None and
            self.scaler is not None
        )
        # Backward-compat attribute
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

    def predict(self, raw_feature_dict, model_key="RandomForest"):
        """
        raw_feature_dict: dict with keys matching feature_schema feature_names.
        Values should be raw (unscaled) numeric values or None/np.nan for missing.
        """
        if not self.loaded:
            raise RuntimeError("ML models are not loaded.")

        # Build feature vector in correct order
        values = []
        for fname in self.feature_names:
            v = raw_feature_dict.get(fname, np.nan)
            values.append(float(v) if (v is not None and str(v) != "nan") else np.nan)

        X_df = pd.DataFrame([values], columns=self.feature_names)

        # Apply clip stats if schema available
        if self.schema and "clip_stats" in self.schema:
            for col, (lo, hi) in self.schema["clip_stats"].items():
                if col in X_df.columns:
                    X_df[col] = X_df[col].clip(lo, hi)

        X_imp = self.imputer.transform(X_df)
        X_sc  = self.scaler.transform(X_imp)

        model = self._resolve_model(model_key)
        pred = model.predict(X_sc)[0]
        label = self.encoder.inverse_transform([pred])[0]

        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X_sc)[0]
            confidence = float(max(proba))
            class_probs = {cls: float(p) for cls, p in zip(self.encoder.classes_, proba)}
        else:
            confidence = 0.85
            class_probs = {cls: 0.33 for cls in self.encoder.classes_}

        return str(label), float(confidence), class_probs
