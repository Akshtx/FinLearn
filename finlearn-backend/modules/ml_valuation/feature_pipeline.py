import os
import json
import numpy as np

FEATURE_NAMES = [
    "PE_Ratio", "PB_Ratio", "PEG_Ratio", "ROE", "ROA",
    "Profit_Margins", "Revenue_Growth", "EPS_Growth", "Debt_to_Equity"
]

def load_schema():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.abspath(os.path.join(current_dir, "../../models_store/feature_schema.json"))
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            return json.load(f)
    return {}

def compute_financial_score(metrics_dict):
    """
    Computes a composite financial health score from raw metrics.
    Returns a float in approximately [0, 1].
    """
    schema = load_schema()
    weights = schema.get("score_weights", {
        "PE_Ratio": 0.12, "PB_Ratio": 0.08, "PEG_Ratio": 0.08,
        "ROE": 0.20, "ROA": 0.15, "Profit_Margins": 0.15,
        "Revenue_Growth": 0.12, "EPS_Growth": 0.10, "Debt_to_Equity": 0.10,
    })
    neg_indicators = schema.get("neg_indicators", ["PE_Ratio", "PB_Ratio", "PEG_Ratio", "Debt_to_Equity"])
    clip_stats = schema.get("clip_stats", {})

    total_weight = 0.0
    score = 0.0

    for feature, weight in weights.items():
        if weight <= 0:
            continue
        raw = metrics_dict.get(feature, None)
        if raw is None or (isinstance(raw, float) and np.isnan(raw)):
            continue

        val = float(raw)
        if feature in clip_stats:
            lo, hi = clip_stats[feature]
            val = max(lo, min(hi, val))
            rng = hi - lo
            if rng > 1e-9:
                scaled = (val - lo) / rng
            else:
                scaled = 0.5
        else:
            scaled = 0.5  # fallback if no clip stats

        if feature in neg_indicators:
            scaled = 1.0 - scaled

        score += weight * scaled
        total_weight += weight

    if total_weight < 1e-9:
        return 0.5

    return round(float(np.clip(score / total_weight, 0.0, 1.0)), 4)


class FeaturePipeline:
    """Thin wrapper retained for backward compatibility with routes.py."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FeaturePipeline, cls).__new__(cls)
        return cls._instance

    def build_dict(self, pe, pb, peg, roe, roa, profit_margins, rev_g, eps_g, de):
        return {
            "PE_Ratio":       pe,
            "PB_Ratio":       pb,
            "PEG_Ratio":      peg,
            "ROE":            roe,
            "ROA":            roa,
            "Profit_Margins": profit_margins,
            "Revenue_Growth": rev_g,
            "EPS_Growth":     eps_g,
            "Debt_to_Equity": de,
        }
