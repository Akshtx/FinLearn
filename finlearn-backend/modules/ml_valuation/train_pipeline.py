import os
import time
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix, ConfusionMatrixDisplay
)
from dotenv import load_dotenv

from data_pipeline import collect_and_prepare_dataset, FEATURE_COLS

load_dotenv()

def train_and_evaluate_models():
    print("=" * 60)
    print("FINLEARN AI - MACHINE LEARNING VALUATION TRAINING PIPELINE")
    print("=" * 60)

    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.abspath(os.path.join(current_dir, "../../models_store"))
    os.makedirs(models_dir, exist_ok=True)
    data_path = os.path.join(models_dir, "Final_Project_Data.csv")

    # 1. Collect / Load Dataset
    if os.path.exists(data_path):
        print(f"Loading existing dataset from {data_path}...")
        df = pd.read_csv(data_path)
    else:
        print("Dataset not found locally. Running data collection pipeline...")
        df = collect_and_prepare_dataset()

    print(f"Total dataset size: {len(df)} observations across symbols.")

    # Sort chronologically by observation_date to prevent data leakage in evaluation
    if "observation_date" in df.columns:
        df = df.sort_values(by="observation_date").reset_index(drop=True)

    X = df[FEATURE_COLS]
    y_raw = df["Label"]

    # 2. Encode Labels
    encoder = LabelEncoder()
    y = encoder.fit_transform(y_raw)
    class_names = [str(c) for c in encoder.classes_]

    # 3. Leakage-Resistant Train / Test Split
    # Using chronological split: first 80% as train, last 20% as test
    split_idx = int(len(df) * 0.8)
    if split_idx >= len(df) - 5:
        # Fallback to stratified train-test split if dataset is small
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    else:
        X_train_raw = X.iloc[:split_idx].copy()
        X_test_raw = X.iloc[split_idx:].copy()
        y_train = y[:split_idx]
        y_test = y[split_idx:]

    print(f"Train Dataset Size: {len(X_train_raw)}, Test Dataset Size: {len(X_test_raw)}")

    # 4. Leakage-Resistant Preprocessing (Fit ONLY on X_train)
    imputer = SimpleImputer(strategy="median")
    scaler = StandardScaler()

    X_train_imp = imputer.fit_transform(X_train_raw)
    X_test_imp = imputer.transform(X_test_raw)

    X_train = scaler.fit_transform(X_train_imp)
    X_test = scaler.transform(X_test_imp)

    # Define the 3 models
    models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, eval_metric="mlogloss"),
        "AdaBoost": AdaBoostClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
    }

    all_stats = {}

    for model_name, model in models.items():
        print(f"\n--- Training {model_name} Classifier ---")
        start_time = time.time()
        model.fit(X_train, y_train)
        training_time = round(time.time() - start_time, 4)

        y_pred = model.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        bal_acc = float(balanced_accuracy_score(y_test, y_pred))
        prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
        prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
        rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
        f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

        report_dict = classification_report(y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0)
        cm_matrix = confusion_matrix(y_test, y_pred).tolist()

        # Extract Feature Importances
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            feature_imp_dict = {feat: float(imp) for feat, imp in zip(FEATURE_COLS, importances)}
        else:
            feature_imp_dict = {feat: 1.0/len(FEATURE_COLS) for feat in FEATURE_COLS}

        # Plot & Save Confusion Matrix Image
        cm_path = os.path.join(models_dir, f"confusion_matrix_{model_name.lower()}.png")
        fig, ax = plt.subplots(figsize=(6, 5))
        ConfusionMatrixDisplay.from_predictions(
            y_test, y_pred, display_labels=class_names, cmap="Blues", ax=ax
        )
        plt.title(f"{model_name} Valuation Confusion Matrix")
        plt.tight_layout()
        plt.savefig(cm_path, dpi=150)
        plt.close()

        # Backward compatibility for default confusion_matrix.png
        if model_name == "RandomForest":
            default_cm_path = os.path.join(models_dir, "confusion_matrix.png")
            fig, ax = plt.subplots(figsize=(6, 5))
            ConfusionMatrixDisplay.from_predictions(
                y_test, y_pred, display_labels=class_names, cmap="Blues", ax=ax
            )
            plt.title("Model Valuation Confusion Matrix")
            plt.tight_layout()
            plt.savefig(default_cm_path, dpi=150)
            plt.close()

        # Save Model Artifact
        model_pkl_path = os.path.join(models_dir, f"{model_name}_Model.pkl")
        joblib.dump(model, model_pkl_path)
        print(f"Saved {model_name} model to {model_pkl_path}")

        all_stats[model_name] = {
            "accuracy": acc,
            "balanced_accuracy": bal_acc,
            "precision_macro": prec_macro,
            "precision_weighted": prec_weighted,
            "recall_macro": rec_macro,
            "recall_weighted": rec_weighted,
            "f1_score_macro": f1_macro,
            "f1_score_weighted": f1_weighted,
            "training_time_seconds": training_time,
            "test_dataset_size": len(X_test),
            "confusion_matrix": cm_matrix,
            "classification_report": report_dict,
            "feature_importances": feature_imp_dict,
            "last_trained": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        print(f"{model_name} Accuracy: {acc*100:.2f}%, F1 (weighted): {f1_weighted:.4f}, Time: {training_time}s")

    # Save Preprocessing Artifacts
    joblib.dump(encoder, os.path.join(models_dir, "LabelEncoder.pkl"))
    joblib.dump(imputer, os.path.join(models_dir, "imputer.pkl"))
    joblib.dump(scaler, os.path.join(models_dir, "scaler.pkl"))

    # Consolidated stats JSON containing detailed results for all 3 models + top-level legacy fields for compatibility
    consolidated_stats = {
        "models": all_stats,
        "accuracy": all_stats["RandomForest"]["accuracy"],
        "precision": all_stats["RandomForest"]["precision_weighted"],
        "recall": all_stats["RandomForest"]["recall_weighted"],
        "f1_score": all_stats["RandomForest"]["f1_score_weighted"],
        "classification_report": all_stats["RandomForest"]["classification_report"],
        "feature_importances": all_stats["RandomForest"]["feature_importances"],
        "last_trained": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    stats_json_path = os.path.join(models_dir, "model_stats.json")
    with open(stats_json_path, "w") as f:
        json.dump(consolidated_stats, f, indent=4)

    print(f"\nAll 3 models trained successfully and artifacts saved to {models_dir}!")
    return consolidated_stats

if __name__ == "__main__":
    train_and_evaluate_models()
