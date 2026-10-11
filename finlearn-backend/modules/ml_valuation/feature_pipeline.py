import os
import json
import numpy as np

FEATURE_NAMES = [
    "PE_Ratio", "Price_to_Book", "PEG", "ROE_pct", "ROA_12M_pct",
    "Profit_Growth_pct", "Debt_to_Equity", "ROCE_pct"
]

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

def load_schema():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.abspath(os.path.join(current_dir, "../../models_store/feature_schema.json"))
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            return json.load(f)
    return {}

def _extract_metric(metrics_dict, feature):
    if feature in metrics_dict:
        v = metrics_dict[feature]
        if v is not None and not (isinstance(v, float) and np.isnan(v)):
            return float(v)
    for alias in FEATURE_ALIASES.get(feature, []):
        if alias in metrics_dict:
            v = metrics_dict[alias]
            if v is not None and not (isinstance(v, float) and np.isnan(v)):
                return float(v)
    return None

def compute_financial_score(metrics_dict):
    """
    Computes directional percentile rank financial score from raw metrics
    matching the Colab notebook methodology. Returns float in [0, 1].
    """
    schema = load_schema()
    score_features = schema.get("feature_names", FEATURE_NAMES)
    feature_directions = schema.get("feature_directions", {
        "PE_Ratio": -1, "Price_to_Book": -1, "PEG": -1, "Debt_to_Equity": -1,
        "ROE_pct": 1, "ROA_12M_pct": 1, "Profit_Growth_pct": 1, "ROCE_pct": 1
    })
    feature_quantiles = schema.get("feature_quantiles", {})
    clip_stats = schema.get("clip_stats", {})

    total_score = 0.0
    valid_count = 0

    for f in score_features:
        val = _extract_metric(metrics_dict, f)
        if val is None:
            continue

        direction = feature_directions.get(f, 1)

        # Empirical quantile interpolation if distribution available
        if f in feature_quantiles and len(feature_quantiles[f]) > 1:
            q_vals = feature_quantiles[f]
            grid = np.linspace(0.0, 1.0, len(q_vals))
            p_rank = float(np.interp(val, q_vals, grid))
        elif f in clip_stats:
            lo, hi = clip_stats[f]
            val_clipped = max(lo, min(hi, val))
            rng = hi - lo
            p_rank = (val_clipped - lo) / rng if rng > 1e-9 else 0.5
        else:
            p_rank = 0.5

        if direction < 0:
            p_rank = 1.0 - p_rank

        total_score += p_rank
        valid_count += 1

    if valid_count < 1:
        return 0.5

    return round(float(np.clip(total_score / valid_count, 0.0, 1.0)), 4)


class FeaturePipeline:
    """Retained for backward compatibility with external routes."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FeaturePipeline, cls).__new__(cls)
        return cls._instance

    def build_dict(self, pe, pb, peg, roe, roa, profit_margins, rev_g, eps_g, de, roce=None):
        return {
            "PE_Ratio": pe,
            "Price_to_Book": pb,
            "PEG": peg,
            "ROE_pct": roe,
            "ROA_12M_pct": roa,
            "Profit_Growth_pct": profit_margins if profit_margins is not None else rev_g,
            "Debt_to_Equity": de,
            "ROCE_pct": roce if roce is not None else eps_g,
        }
