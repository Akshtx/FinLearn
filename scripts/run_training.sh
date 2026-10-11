#!/usr/bin/env bash
# ==============================================================================
# run_training.sh — Retrain ML Models & Regenerate All Outputs & Reports
# ==============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/finlearn-backend"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo " Executing FinLearn AI Indian Market ML Pipeline"
echo " Dataset: 2,001 Unique Listed Equities (Screener.in)"
echo " Models:  RandomForest, XGBoost (Champion), AdaBoost"
echo "=========================================================="

PYTHON_BIN="python3"
if [ -f "$BACKEND_DIR/venv/bin/python3" ]; then
    PYTHON_BIN="$BACKEND_DIR/venv/bin/python3"
elif [ -f "$PROJECT_ROOT/.venv/bin/python3" ]; then
    PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python3"
fi

cd "$BACKEND_DIR"
$PYTHON_BIN modules/ml_valuation/indian_market_pipeline.py

echo "----------------------------------------------------------"
echo "Synchronizing generated artifacts to top-level directories:"
echo "  - models/          <- Serialized models, scaler, schema, stats"
echo "  - outputs/tables/  <- Metrics, CV tables, prediction CSVs"
echo "  - outputs/charts/  <- 13 High-resolution evaluation charts"
echo "  - data/processed/  <- Cleaned & scored datasets"
echo "----------------------------------------------------------"

cd "$PROJECT_ROOT"
mkdir -p models outputs/tables outputs/charts data/processed

# Sync models
cp finlearn-backend/models_store/*.pkl models/ 2>/dev/null || true
cp finlearn-backend/models_store/*.joblib models/ 2>/dev/null || true
cp finlearn-backend/models_store/feature_schema.json models/ 2>/dev/null || true
cp finlearn-backend/models_store/model_stats.json models/ 2>/dev/null || true

# Sync outputs
cp finlearn-backend/models_store/outputs/*.csv outputs/tables/ 2>/dev/null || true
cp finlearn-backend/models_store/reports/* outputs/charts/ 2>/dev/null || true

# Sync data
cp finlearn-backend/models_store/Final_Project_Data.csv data/processed/ 2>/dev/null || true
cp finlearn-backend/models_store/Labelled_Financial_Data.csv data/processed/ 2>/dev/null || true
cp finlearn-backend/models_store/outputs/cleaned_indian_market_data.csv data/processed/ 2>/dev/null || true
cp finlearn-backend/models_store/outputs/ml_ready_dataset.csv data/processed/ 2>/dev/null || true

echo "=========================================================="
echo " Pipeline training and artifact synchronization completed!"
echo " Models saved to:  $PROJECT_ROOT/models/"
echo " Outputs saved to: $PROJECT_ROOT/outputs/tables/"
echo " Charts saved to:  $PROJECT_ROOT/outputs/charts/"
echo "=========================================================="
