import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ML_BACKEND = '/api/ml';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ModelMetrics {
  accuracy: number;
  balanced_accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_score_macro: number;
  f1_score_weighted: number;
  training_time_seconds: number;
  train_dataset_size: number;
  test_dataset_size: number;
  last_trained: string;
  feature_importances: Record<string, number>;
  confusion_matrix?: number[][];
  classification_report?: Record<string, {
    precision: number;
    recall: number;
    'f1-score': number;
    support: number;
  }>;
}

interface CVModelResult {
  folds: number[];
  mean: number;
}

interface AgreementRate {
  agreement_pct: number;
  agreed: number;
  disagreed: number;
  total: number;
}

interface DisagreementRow {
  company: string;
  score: number;
  rank: number;
  formula_label: string;
  rf_pred: string;
  xgb_pred: string;
  ada_pred: string;
}

interface EDAOutlier {
  feature: string;
  outliers: number;
  lower_bound: number;
  upper_bound: number;
  min: number;
  max: number;
}

interface ReportChart {
  id: string;
  title: string;
  category: string;
  file: string;
  description: string;
}

const DEFAULT_REPORT_CHARTS: ReportChart[] = [
  {
    id: "score_distribution",
    title: "Composite Financial Score & Percentile Thresholds",
    category: "Data & Scoring",
    file: "score_distribution.png",
    description: "Histogram & KDE of composite financial scores across 2,001 Indian companies with 70th (0.365) and 30th (-0.213) percentile threshold lines."
  },
  {
    id: "class_distribution",
    title: "Valuation Class Distribution",
    category: "Data & Scoring",
    file: "class_distribution.png",
    description: "Categorical breakdown across Undervalued (601), Fairly Valued (799), and Overvalued (601) categories derived from the 4-pillar financial model."
  },
  {
    id: "eda_correlation_heatmap",
    title: "Financial Feature Correlation Heatmap",
    category: "Exploratory Data Analysis",
    file: "eda_correlation_heatmap.png",
    description: "Pairwise correlation heatmap highlighting key interactions between multiples (P/E, P/B, PEG) and profitability (ROE, ROA, OPM, ROCE)."
  },
  {
    id: "eda_boxplots",
    title: "Feature Box Plots & Outlier Identification",
    category: "Exploratory Data Analysis",
    file: "eda_boxplots.png",
    description: "Individual boxplots per financial feature revealing high-multiple outliers in the Indian market universe using 1.5× IQR."
  },
  {
    id: "eda_histograms",
    title: "Feature Distribution Histograms",
    category: "Exploratory Data Analysis",
    file: "eda_histograms.png",
    description: "Distribution curves showing right-skewed valuation ratios and profitability margins across Indian equities."
  },
  {
    id: "eda_pairplot",
    title: "Key Indicators Multivariate Pairplot",
    category: "Exploratory Data Analysis",
    file: "eda_pairplot.png",
    description: "Pairwise scatter distribution matrix comparing P/E, P/B, ROE, Debt/Equity, and growth figures."
  },
  {
    id: "model_comparison",
    title: "Multi-Model Comparison Chart",
    category: "Model Performance",
    file: "model_comparison.png",
    description: "Benchmark comparison of Accuracy, Balanced Accuracy, Weighted F1, and Macro F1 across XGBoost, Random Forest, and AdaBoost."
  },
  {
    id: "feature_importance_xgboost",
    title: "XGBoost Feature Importance",
    category: "Model Insights",
    file: "feature_importance_xgboost.png",
    description: "Normalized importance weightings from the champion XGBoost model (85.29% test accuracy)."
  },
  {
    id: "feature_importance_randomforest",
    title: "Random Forest Feature Importance",
    category: "Model Insights",
    file: "feature_importance_randomforest.png",
    description: "Mean decrease in impurity across 300 decision trees in the Random Forest ensemble."
  },
  {
    id: "feature_importance_adaboost",
    title: "AdaBoost Feature Importance",
    category: "Model Insights",
    file: "feature_importance_adaboost.png",
    description: "Feature contribution weights determined by sequential AdaBoost boosting rounds."
  },
  {
    id: "confusion_matrix_xgboost",
    title: "XGBoost Confusion Matrix",
    category: "Validation & Matrices",
    file: "confusion_matrix_xgboost.png",
    description: "Holdout test set confusion matrix (401 Indian stocks) showing true vs predicted classes for XGBoost."
  },
  {
    id: "confusion_matrix_randomforest",
    title: "Random Forest Confusion Matrix",
    category: "Validation & Matrices",
    file: "confusion_matrix_randomforest.png",
    description: "Holdout test set confusion matrix (401 Indian stocks) showing true vs predicted classes for Random Forest."
  },
  {
    id: "confusion_matrix_adaboost",
    title: "AdaBoost Confusion Matrix",
    category: "Validation & Matrices",
    file: "confusion_matrix_adaboost.png",
    description: "Holdout test set confusion matrix (401 Indian stocks) showing true vs predicted classes for AdaBoost."
  }
];

interface AllStats {
  models: Record<string, ModelMetrics>;
  best_model?: string;
  dataset?: {
    excel_file: string;
    usable_rows: number;
    unique_stocks: number;
    train_rows: number;
    test_rows: number;
    available_features: string[];
    label_methodology: string;
  };
}

interface PredictionResult {
  valuation_label: 'Undervalued' | 'Fairly Valued' | 'Overvalued';
  confidence: number;
  financial_score: number;
  selected_model: string;
  class_probabilities: Record<string, number>;
  feature_importances: Record<string, number>;
  metrics: Record<string, number | null>;
}

interface SampleRow {
  company: string;
  label: string;
  score: number;
  PE_Ratio?: string | number;
  PB_Ratio?: string | number;
  ROE?: string | number;
  ROA?: string | number;
  Debt_to_Equity?: string | number;
}

// ── Label styling helper ────────────────────────────────────────────────────
const labelStyle = (label: string) =>
  label === 'Undervalued' ? 'bg-green-500/15 text-green-400 border-green-500/30'
  : label === 'Overvalued' ? 'bg-red-500/15 text-red-400 border-red-500/30'
  : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

const MODEL_COLORS: Record<string, string> = {
  RandomForest: '#38bdf8',
  XGBoost:      '#818cf8',
  AdaBoost:     '#fb923c',
};

const FEATURE_LABELS: Record<string, string> = {
  PE_Ratio:       'P/E Ratio',
  PB_Ratio:       'P/B Ratio',
  PEG_Ratio:      'PEG Ratio',
  ROE:            'ROE (%)',
  ROA:            'ROA (%)',
  Profit_Margins: 'Profit Margins (%)',
  Revenue_Growth: 'Revenue Growth (%)',
  EPS_Growth:     'EPS Growth (%)',
  Debt_to_Equity: 'Debt / Equity',
};

const MODEL_NAMES = ['RandomForest', 'XGBoost', 'AdaBoost'];

// ── Mini bar chart for feature importance ─────────────────────────────────────
const FeatureBar: React.FC<{ name: string; value: number; max: number; color: string }> = ({ name, value, max, color }) => (
  <div className="flex items-center gap-3 text-xs">
    <span className="text-gray-400 w-36 shrink-0">{FEATURE_LABELS[name] ?? name}</span>
    <div className="flex-1 bg-gray-700/50 h-2 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
    <span className="text-gray-300 font-mono w-10 text-right">{(value * 100).toFixed(1)}%</span>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const MLModelPage: React.FC = () => {
  const [selectedModel, setSelectedModel]     = useState<string>('XGBoost');
  const [statsData, setStatsData]             = useState<AllStats | null>(null);
  const [sampleData, setSampleData]           = useState<SampleRow[]>([]);
  const [totalRows, setTotalRows]             = useState<number>(0);
  const [cvData, setCvData]                   = useState<Record<string, CVModelResult>>({});
  const [agreementRates, setAgreementRates]   = useState<Record<string, AgreementRate>>({});
  const [disagreements, setDisagreements]     = useState<DisagreementRow[]>([]);
  const [edaOutliers, setEdaOutliers]         = useState<EDAOutlier[]>([]);
  const [reportCharts, setReportCharts]       = useState<ReportChart[]>(DEFAULT_REPORT_CHARTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalImg, setActiveModalImg]   = useState<{ url: string; title: string; desc: string } | null>(null);
  const [showMatrixImg, setShowMatrixImg]     = useState<boolean>(false);
  const [statsLoading, setStatsLoading]       = useState(true);

  // Sandbox inputs
  const [pe,  setPe]  = useState(25.0);
  const [pb,  setPb]  = useState(4.0);
  const [peg, setPeg] = useState(1.5);
  const [roe, setRoe] = useState(20.0);
  const [roa, setRoa] = useState(12.0);
  const [pm,  setPm]  = useState(18.0);
  const [rg,  setRg]  = useState(15.0);
  const [eg,  setEg]  = useState(18.0);
  const [de,  setDe]  = useState(0.4);

  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxModel,   setSandboxModel]   = useState<string>('XGBoost');
  const [prediction, setPrediction]         = useState<PredictionResult | null>(null);
  const [predError, setPredError]           = useState<string | null>(null);

  // ── Fetch stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    let success = false;
    const endpoints = [
      `${ML_BACKEND}/valuation/stats`,
      'http://127.0.0.1:5001/api/ml/valuation/stats'
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.success && data.stats) {
          setStatsData(data.stats as AllStats);
          setSampleData(data.sample_data ?? []);
          setTotalRows(data.total_rows ?? 0);
          setCvData(data.cv_results ?? {});
          setAgreementRates(data.agreement_rates ?? {});
          setDisagreements(data.disagreements ?? []);
          setEdaOutliers(data.eda_outliers ?? []);
          if (data.report_charts && data.report_charts.length > 0) {
            setReportCharts(data.report_charts);
          }
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Fetch error for ${url}:`, err);
      }
    }

    if (!success) {
      console.error("Unable to load ML stats from endpoints.");
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const currentMetrics: ModelMetrics | null = statsData?.models?.[selectedModel] ?? null;

  // ── Sandbox prediction ────────────────────────────────────────────────────
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setSandboxLoading(true);
    setPredError(null);
    setPrediction(null);
    let success = false;

    const payload = {
      pe_ratio: pe, pb_ratio: pb, peg_ratio: peg,
      roe, roa, profit_margins: pm,
      revenue_growth: rg, eps_growth: eg,
      debt_to_equity: de,
      model: sandboxModel,
    };

    const endpoints = [
      `${ML_BACKEND}/valuation/predict`,
      'http://127.0.0.1:5001/api/ml/valuation/predict'
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.success) {
          setPrediction(data as PredictionResult);
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Predict fetch error for ${url}:`, err);
      }
    }

    if (!success) {
      setPredError('Unable to connect to ML prediction backend. Please ensure server is running.');
    }
    setSandboxLoading(false);
  };

  // ── Slider helper ─────────────────────────────────────────────────────────
  const SliderField: React.FC<{
    label: string; hint: string; value: number;
    min: number; max: number; step: number;
    onChange: (v: number) => void;
  }> = ({ label, hint, value, min, max, step, onChange }) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-300">{label}</label>
        <input
          type="number" step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-20 text-center text-xs bg-gray-800 border border-gray-600 rounded py-1 text-gray-200"
        />
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
      />
      <span className="text-[10px] text-gray-500">{hint}</span>
    </div>
  );

  const bestFI   = currentMetrics?.feature_importances ?? {};
  const maxFI    = Math.max(...Object.values(bestFI), 0.001);
  const modelColor = MODEL_COLORS[selectedModel] ?? '#38bdf8';

  const classLabels = ['Fairly Valued', 'Overvalued', 'Undervalued'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-100">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-xs font-semibold text-sky-400 mb-3">
          Colab Financial Methodology Extended to Indian Market
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 mb-2">
          ML Stock Valuation Engine
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm">
          Complete implementation of the 4-pillar financial scoring workflow trained on real Indian stock market data (Screener.in) across three machine-learning algorithms.
        </p>
      </div>

      {/* ── 4-Pillar Financial Methodology Banner ────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 border border-indigo-500/20 rounded-xl p-5 mb-8 shadow-xl">
        <h4 className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-3">Colab 4-Pillar Scoring Architecture (RobustScaler Normalized)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60">
            <span className="text-sky-400 font-bold block mb-1">1. Valuation Pillar</span>
            <p className="text-gray-400 text-[11px]">P/E, P/B, PEG (Inverted: lower ratio yields higher score)</p>
          </div>
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60">
            <span className="text-emerald-400 font-bold block mb-1">2. Profitability Pillar</span>
            <p className="text-gray-400 text-[11px]">ROE, ROA, Operating Margin (Positive indicators)</p>
          </div>
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60">
            <span className="text-purple-400 font-bold block mb-1">3. Growth Pillar</span>
            <p className="text-gray-400 text-[11px]">YoY Revenue Growth, 5-Yr EPS Growth Trend</p>
          </div>
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60">
            <span className="text-amber-400 font-bold block mb-1">4. Financial Health</span>
            <p className="text-gray-400 text-[11px]">Debt-to-Equity (Inverted: lower leverage is safer)</p>
          </div>
        </div>
      </div>

      {/* ── Model Selector Tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-3 justify-center mb-8">
        {MODEL_NAMES.map(m => (
          <button
            key={m}
            onClick={() => setSelectedModel(m)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm border transition-all flex items-center gap-2 ${
              selectedModel === m
                ? 'border-sky-500 bg-sky-500/15 text-sky-300 shadow-lg scale-105'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
            style={selectedModel === m ? { boxShadow: `0 0 20px ${MODEL_COLORS[m]}30` } : {}}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MODEL_COLORS[m] }}></span>
            {m}
            {statsData?.best_model === m && (
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded font-mono">Best</span>
            )}
          </button>
        ))}
      </div>

      {statsLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : (
        <>
          {/* ── Row 1: Model Summary + Feature Importance ────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Model Summary */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: modelColor }}>
                  {selectedModel} — Model Summary
                </h3>
                {agreementRates[selectedModel] && (
                  <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-md font-mono">
                    {agreementRates[selectedModel].agreement_pct}% Score Agreement
                  </span>
                )}
              </div>
              {currentMetrics ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Accuracy',          pct(currentMetrics.accuracy)],
                    ['Balanced Accuracy', pct(currentMetrics.balanced_accuracy)],
                    ['Macro F1',          currentMetrics.f1_score_macro.toFixed(4)],
                    ['Weighted F1',       currentMetrics.f1_score_weighted.toFixed(4)],
                    ['Macro Precision',   currentMetrics.precision_macro.toFixed(4)],
                    ['Macro Recall',      currentMetrics.recall_macro.toFixed(4)],
                    ['Train Size',        String(currentMetrics.train_dataset_size || 800)],
                    ['Test Size',         String(currentMetrics.test_dataset_size || 200)],
                    ['Training Time',     `${currentMetrics.training_time_seconds}s`],
                    ['Last Trained',      currentMetrics.last_trained],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-800/60 rounded-lg p-3">
                      <div className="text-gray-400 text-[11px] uppercase tracking-wide">{k}</div>
                      <div className="font-mono font-bold text-gray-100 text-sm mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No metrics available.</p>
              )}
            </div>

            {/* Feature Importance */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: modelColor }}>
                Feature Importances — {selectedModel}
              </h3>
              <p className="text-[11px] text-gray-500 mb-4">
                Computed from the fitted model. Reflects how much each Indian financial indicator contributed to classification decisions.
              </p>
              <div className="space-y-2.5">
                {Object.entries(bestFI)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, val]) => (
                    <FeatureBar key={name} name={name} value={val} max={maxFI} color={modelColor} />
                  ))}
                {Object.keys(bestFI).length === 0 && (
                  <p className="text-gray-500 text-sm">Feature importances loading…</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Row 2: Model Comparison Table ───────────────────────────────── */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl mb-6">
            <h3 className="text-lg font-bold text-sky-400 mb-4">Model Comparison — All Three Models</h3>
            {statsData?.models && Object.keys(statsData.models).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">Metric</th>
                      {MODEL_NAMES.filter(m => statsData.models[m]).map(m => (
                        <th key={m} className="text-right py-2 px-3 font-semibold"
                          style={{ color: MODEL_COLORS[m] }}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {[
                      ['Test Accuracy',     'accuracy'],
                      ['Balanced Accuracy', 'balanced_accuracy'],
                      ['Macro Precision',   'precision_macro'],
                      ['Macro Recall',      'recall_macro'],
                      ['Macro F1',          'f1_score_macro'],
                      ['Weighted F1',       'f1_score_weighted'],
                      ['Training Time (s)', 'training_time_seconds'],
                    ].map(([label, key]) => (
                      <tr key={key} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-gray-400">{label}</td>
                        {MODEL_NAMES.filter(m => statsData.models[m]).map(m => {
                          const v = statsData.models[m][key as keyof ModelMetrics] as number;
                          const isBest = MODEL_NAMES
                            .filter(n => statsData.models[n])
                            .reduce((best, n) => {
                              const nv = statsData.models[n][key as keyof ModelMetrics] as number;
                              const bv = statsData.models[best]?.[key as keyof ModelMetrics] as number ?? 0;
                              return (key === 'training_time_seconds' ? nv < bv : nv > bv) ? n : best;
                            }, MODEL_NAMES[0]) === m;
                          return (
                            <td key={m} className={`py-2.5 px-3 text-right font-mono ${isBest ? 'font-bold' : ''}`}
                              style={isBest ? { color: MODEL_COLORS[m] } : {}}>
                              {key === 'training_time_seconds' ? `${v}s` : (v < 1 ? v.toFixed(4) : pct(v))}
                              {isBest && ' ★'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {statsData.best_model && (
                  <p className="text-xs text-gray-500 mt-3">
                    ★ Best model by Weighted F1: <span style={{ color: MODEL_COLORS[statsData.best_model] }} className="font-bold">{statsData.best_model}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Model metrics unavailable.</p>
            )}
          </div>

          {/* ── Row 3: 5-Fold Cross Validation + Formula Agreement (Colab Week 5) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* 5-Fold Stratified CV Breakdown */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-indigo-400 mb-2">5-Fold Stratified Cross-Validation</h3>
              <p className="text-xs text-gray-500 mb-4">
                Stratified 5-Fold CV verifying that accuracy generalises across non-overlapping partitions of the Indian dataset.
              </p>
              {Object.keys(cvData).length > 0 ? (
                <div className="space-y-4">
                  {MODEL_NAMES.filter(m => cvData[m]).map(m => (
                    <div key={m} className="bg-gray-800/50 p-3.5 rounded-lg border border-gray-700/60">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm" style={{ color: MODEL_COLORS[m] }}>{m}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          Mean CV: {(cvData[m].mean * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        {cvData[m].folds.map((foldVal, idx) => (
                          <div key={idx} className="bg-gray-900/80 p-2 rounded border border-gray-700">
                            <div className="text-[10px] text-gray-400">Fold {idx + 1}</div>
                            <div className="font-mono text-gray-200 font-semibold mt-0.5">{(foldVal * 100).toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Cross-validation data loading…</p>
              )}
            </div>

            {/* Model vs Financial Score Agreement */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">Mathematical Score vs ML Agreement</h3>
              <p className="text-xs text-gray-500 mb-4">
                Comparison of ML classifier decisions against the deterministic composite financial score formula on the test holdout.
              </p>
              {Object.keys(agreementRates).length > 0 ? (
                <div className="space-y-4">
                  {MODEL_NAMES.filter(m => agreementRates[m]).map(m => {
                    const ag = agreementRates[m];
                    return (
                      <div key={m} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/60">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm" style={{ color: MODEL_COLORS[m] }}>{m}</span>
                          <span className="text-xs font-mono font-bold text-sky-400">
                            {ag.agreement_pct}% Agreement ({ag.agreed}/{ag.total})
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${ag.agreement_pct}%`,
                              backgroundColor: MODEL_COLORS[m]
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 font-mono">
                          <span>Agreed: {ag.agreed} stocks</span>
                          <span>Disagreed: {ag.disagreed} stocks</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Agreement metrics loading…</p>
              )}
            </div>
          </div>

          {/* ── Row 4: Confusion Matrix & Classification Report ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Confusion Matrix Display */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: modelColor }}>
                  Confusion Matrix — {selectedModel}
                </h3>
                <button
                  onClick={() => setShowMatrixImg(!showMatrixImg)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 transition-colors"
                >
                  {showMatrixImg ? 'Hide Chart Image' : 'View Plot Chart'}
                </button>
              </div>

              {showMatrixImg ? (
                <div className="flex justify-center bg-gray-950 p-4 rounded-lg border border-gray-800">
                  <img
                    src={`/api/ml/valuation/confusion-matrix?model=${selectedModel}`}
                    alt={`${selectedModel} Confusion Matrix`}
                    className="max-h-72 rounded shadow"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : currentMetrics?.confusion_matrix ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr>
                        <th className="p-2 text-gray-500 text-[10px] uppercase">Actual \ Pred</th>
                        {classLabels.map(l => (
                          <th key={l} className="p-2 text-gray-300 font-semibold">{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentMetrics.confusion_matrix.map((row, i) => (
                        <tr key={i} className="border-t border-gray-800">
                          <td className="p-2.5 font-semibold text-gray-400 text-left">{classLabels[i]}</td>
                          {row.map((val, j) => {
                            const isDiag = i === j;
                            return (
                              <td
                                key={j}
                                className={`p-2.5 font-mono text-sm font-bold rounded ${
                                  isDiag
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : val > 0
                                    ? 'bg-red-500/10 text-red-300'
                                    : 'text-gray-600'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-gray-500 mt-3 text-center">
                    Diagonal cells indicate correct classifications on the 200-stock test holdout.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Confusion matrix loading…</p>
              )}
            </div>

            {/* Classification Report Table */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-sky-400 mb-2">Classification Report Breakdown</h3>
              <p className="text-xs text-gray-500 mb-4">
                Detailed per-class evaluation metrics for {selectedModel} on Indian stock labels.
              </p>
              {currentMetrics?.classification_report ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-800/80">
                      <tr>
                        <th className="p-2.5 text-gray-400">Class</th>
                        <th className="p-2.5 text-right text-gray-400">Precision</th>
                        <th className="p-2.5 text-right text-gray-400">Recall</th>
                        <th className="p-2.5 text-right text-gray-400">F1-Score</th>
                        <th className="p-2.5 text-right text-gray-400">Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {['Fairly Valued', 'Overvalued', 'Undervalued'].map(cls => {
                        const cr = currentMetrics.classification_report?.[cls];
                        if (!cr) return null;
                        return (
                          <tr key={cls} className="hover:bg-gray-800/30">
                            <td className="p-2.5 font-semibold text-gray-200">
                              <span className={`px-2 py-0.5 rounded border text-[10px] ${labelStyle(cls)}`}>{cls}</span>
                            </td>
                            <td className="p-2.5 text-right font-mono text-gray-300">{cr.precision.toFixed(3)}</td>
                            <td className="p-2.5 text-right font-mono text-gray-300">{cr.recall.toFixed(3)}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-sky-300">{cr['f1-score'].toFixed(3)}</td>
                            <td className="p-2.5 text-right font-mono text-gray-400">{cr.support}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Classification report loading…</p>
              )}
            </div>
          </div>

          {/* ── Row 5: Model vs Formula Disagreements Table (Colab Week 5) ────── */}
          {disagreements.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl mb-6">
              <h3 className="text-lg font-bold text-amber-400 mb-1">
                Model vs Formula Disagreements Inspection (Colab Week 5)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Real Indian companies where ML non-linear decision boundaries differed from the simple arithmetic threshold formula.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left divide-y divide-gray-800">
                  <thead className="bg-gray-800/80">
                    <tr>
                      <th className="p-2.5 text-gray-400">Company</th>
                      <th className="p-2.5 text-gray-400 text-center">Score</th>
                      <th className="p-2.5 text-gray-400 text-center">Formula Label</th>
                      <th className="p-2.5 text-gray-400 text-center">RF Prediction</th>
                      <th className="p-2.5 text-gray-400 text-center">XGBoost Prediction</th>
                      <th className="p-2.5 text-gray-400 text-center">AdaBoost Prediction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-mono">
                    {disagreements.map((d, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/40">
                        <td className="p-2.5 font-sans font-semibold text-gray-200">{d.company}</td>
                        <td className="p-2.5 text-center text-gray-300 font-bold">{d.score}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded border text-[10px] ${labelStyle(d.formula_label)}`}>
                            {d.formula_label}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded border text-[10px] ${labelStyle(d.rf_pred)}`}>
                            {d.rf_pred}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded border text-[10px] ${labelStyle(d.xgb_pred)}`}>
                            {d.xgb_pred}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded border text-[10px] ${labelStyle(d.ada_pred)}`}>
                            {d.ada_pred}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Row 6: Sandbox + Dataset Info ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Valuation Sandbox */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-sky-400 mb-1">Interactive Valuation Sandbox</h3>
              <p className="text-xs text-gray-500 mb-5">
                Enter financial indicators (in percentages for ROE/ROA/Margins/Growth) and get a real prediction from the trained model.
              </p>

              {/* Sandbox model selector */}
              <div className="flex gap-2 mb-5">
                {MODEL_NAMES.map(m => (
                  <button key={m} onClick={() => setSandboxModel(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      sandboxModel === m
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>

              <form onSubmit={handlePredict} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SliderField label="P/E Ratio"           hint="Lower = better. Negatives = losses."  value={pe}  min={0}   max={150} step={0.5}  onChange={setPe}  />
                <SliderField label="P/B Ratio"           hint="Lower = better. Price vs book value."  value={pb}  min={0.1} max={50}  step={0.1}  onChange={setPb}  />
                <SliderField label="PEG Ratio"           hint="<1 = undervalued growth."               value={peg} min={-5}  max={20}  step={0.1}  onChange={setPeg} />
                <SliderField label="ROE (%)"             hint="Higher = better. Return on equity."     value={roe} min={-20} max={150} step={0.5}  onChange={setRoe} />
                <SliderField label="ROA (%)"             hint="Higher = better. Return on assets."     value={roa} min={-10} max={80}  step={0.5}  onChange={setRoa} />
                <SliderField label="Operating Margins (%)"  hint="Higher = better."                   value={pm}  min={-50} max={100} step={0.5}  onChange={setPm}  />
                <SliderField label="Profit Growth (%)"  hint="YoY profit/revenue growth."              value={rg}  min={-100} max={500} step={1}  onChange={setRg}  />
                <SliderField label="EPS Growth 5yr (%)" hint="Higher = better long-term."             value={eg}  min={-80} max={300} step={1}   onChange={setEg}  />
                <SliderField label="Debt / Equity"      hint="Lower = less leveraged."                value={de}  min={0}   max={5}   step={0.05} onChange={setDe}  />

                <div className="sm:col-span-2 mt-2">
                  <button type="submit" disabled={sandboxLoading}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform active:scale-95 disabled:opacity-50">
                    {sandboxLoading ? 'Running inference…' : `Classify with ${sandboxModel} ✦`}
                  </button>
                </div>
              </form>

              {predError && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg text-sm text-center">
                  {predError}
                </div>
              )}

              {prediction && (
                <div className="mt-6 p-5 bg-gray-800/60 rounded-xl border border-gray-700 animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className={`px-4 py-2 rounded-xl text-lg font-extrabold border ${labelStyle(prediction.valuation_label)}`}>
                      {prediction.valuation_label}
                    </span>
                    <span className="text-sm text-gray-400">
                      Confidence: <span className="font-bold text-sky-300">{(prediction.confidence * 100).toFixed(1)}%</span>
                    </span>
                    <span className="text-sm text-gray-400">
                      Model: <span className="font-semibold" style={{ color: MODEL_COLORS[prediction.selected_model] }}>{prediction.selected_model}</span>
                    </span>
                  </div>

                  {/* Class Probabilities */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Class Probabilities</p>
                    {Object.entries(prediction.class_probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cls, prob]) => (
                        <div key={cls} className="flex items-center gap-3 text-xs">
                          <span className={`w-28 shrink-0 px-2 py-0.5 rounded text-center font-semibold border text-[10px] ${labelStyle(cls)}`}>{cls}</span>
                          <div className="flex-1 bg-gray-700/50 h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${prob * 100}%` }} />
                          </div>
                          <span className="font-mono text-gray-300 w-10 text-right">{(prob * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>

                  {/* Financial Score */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-gray-400">
                      <span>Composite Financial Score</span>
                      <span className="font-mono text-gray-200">{prediction.financial_score.toFixed(3)} / 1.0</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prediction.financial_score * 100}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dataset Info */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-bold text-sky-400">Dataset Information</h3>
              {statsData?.dataset ? (
                <>
                  <div className="space-y-3">
                    {[
                      ['Source File',       statsData.dataset.excel_file],
                      ['Total Usable Rows', String(statsData.dataset.usable_rows)],
                      ['Unique Stocks',     String(statsData.dataset.unique_stocks)],
                      ['Train Records',     String(statsData.dataset.train_rows)],
                      ['Test Records',      String(statsData.dataset.test_rows)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between items-start gap-2">
                        <span className="text-gray-400 text-xs">{k}</span>
                        <span className="text-gray-200 text-xs font-mono font-semibold text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">Features Used</p>
                    <div className="flex flex-wrap gap-1.5">
                      {statsData.dataset.available_features.map(f => (
                        <span key={f} className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-[10px] text-sky-400 font-mono">
                          {FEATURE_LABELS[f] ?? f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-[10px] text-yellow-400/80 leading-relaxed">
                      <strong>Label Methodology:</strong> {statsData.dataset.label_methodology}.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Dataset info loading…</p>
              )}
            </div>
          </div>

          {/* ── Row 6.5: Colab EDA & Preprocessing Breakdown (IQR & RobustScaler) ── */}
          {edaOutliers.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-amber-400">Data Cleaning, EDA & Feature Preprocessing</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Colab Week 2/3 methodology: 649 duplicates removed, extreme multiple suppression via 1.5× IQR outlier detection, and RobustScaler normalization.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded">
                    2,001 Unique Companies
                  </span>
                  <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded">
                    RobustScaler
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-gray-300 divide-y divide-gray-800">
                  <thead className="bg-gray-800/80">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Financial Feature</th>
                      <th className="px-3 py-2 text-center text-gray-400 font-semibold uppercase tracking-wide text-[10px]">IQR Outliers Detected</th>
                      <th className="px-3 py-2 text-right text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Lower Bound (Q1 - 1.5×IQR)</th>
                      <th className="px-3 py-2 text-right text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Upper Bound (Q3 + 1.5×IQR)</th>
                      <th className="px-3 py-2 text-right text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Indian Universe Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {edaOutliers.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-gray-200">
                          {FEATURE_LABELS[row.feature] ?? row.feature}
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-amber-400">
                          {row.outliers} companies
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-gray-400">
                          {row.lower_bound.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-gray-400">
                          {row.upper_bound.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-gray-400">
                          [{row.min} → {row.max}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Row 6.7: Colab Research Visualizations & Artifacts Gallery ─────── */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
                  Colab Research Visualizations & Model Artifacts
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Full suite of generated analytical charts from your Colab pipeline: EDA correlation matrices, distributions, boxplots, multi-model benchmarks, feature importances, and confusion matrices.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-gray-800/80 rounded-lg border border-gray-700 text-xs">
                {['All', 'Data & Scoring', 'Exploratory Data Analysis', 'Model Performance', 'Model Insights', 'Validation & Matrices'].map(cat => {
                  const count = cat === 'All' 
                    ? reportCharts.length 
                    : reportCharts.filter(c => c.category === cat).length;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/60'
                      }`}
                    >
                      {cat === 'Exploratory Data Analysis' ? 'EDA' : cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Report Plots */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {reportCharts
                .filter(chart => selectedCategory === 'All' || chart.category === selectedCategory)
                .map(chart => {
                  const imgUrl = `${ML_BACKEND}/reports/plot/${chart.file}`;
                  return (
                    <div
                      key={chart.id}
                      className="bg-gray-800/50 border border-gray-700/80 hover:border-indigo-500/50 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group"
                    >
                      {/* Plot Image Preview Container */}
                      <div 
                        onClick={() => setActiveModalImg({ url: imgUrl, title: chart.title, desc: chart.description })}
                        className="relative bg-gray-950/70 p-3 h-52 flex items-center justify-center cursor-pointer overflow-hidden border-b border-gray-700/60"
                      >
                        <img
                          src={imgUrl}
                          alt={chart.title}
                          className="max-h-full max-w-full object-contain rounded group-hover:scale-[1.03] transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to direct backend url if proxied path is delayed
                            const target = e.currentTarget;
                            if (!target.src.includes('127.0.0.1')) {
                              target.src = `http://127.0.0.1:5001/api/ml/reports/plot/${chart.file}`;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-indigo-600/90 text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 shadow-lg">
                            🔍 Click to Enlarge
                          </span>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-700/70 text-indigo-300 border border-gray-600/60">
                              {chart.category}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {chart.file}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-100 group-hover:text-indigo-300 transition-colors">
                            {chart.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                            {chart.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs">
                          <button
                            type="button"
                            onClick={() => setActiveModalImg({ url: imgUrl, title: chart.title, desc: chart.description })}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                          >
                            Inspect Full Chart →
                          </button>
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-200 text-[11px]"
                          >
                            Open Raw ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ── Row 7: Training Dataset Sample ──────────────────────────────── */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-sky-400">Training Dataset Sample</h3>
              <span className="text-xs text-gray-500 font-mono">Total usable rows: {totalRows.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Actual records from the Screener.in Excel dataset used to train the models. Showing first 8 rows.
            </p>
            {sampleData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-gray-300 divide-y divide-gray-800">
                  <thead className="bg-gray-800/80">
                    <tr>
                      {['Company', 'P/E', 'P/B', 'ROE (%)', 'ROA (%)', 'D/E', 'Score', 'Label'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-gray-400 font-semibold uppercase tracking-wide text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {sampleData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-gray-200 max-w-[140px] truncate">{row.company}</td>
                        <td className="px-3 py-2.5 font-mono">{row.PE_Ratio ?? '—'}</td>
                        <td className="px-3 py-2.5 font-mono">{row.PB_Ratio ?? '—'}</td>
                        <td className="px-3 py-2.5 font-mono">{row.ROE ?? '—'}</td>
                        <td className="px-3 py-2.5 font-mono">{row.ROA ?? '—'}</td>
                        <td className="px-3 py-2.5 font-mono">{row.Debt_to_Equity ?? '—'}</td>
                        <td className="px-3 py-2.5 font-mono text-emerald-400 font-bold">{row.score}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${labelStyle(row.label)}`}>
                            {row.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sample data loading…</p>
            )}
          </div>
        </>
      )}

      {/* ── High-Res Image Lightbox Modal ── */}
      {activeModalImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModalImg(null)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-gray-900/90">
              <div>
                <h3 className="text-base font-bold text-gray-100">{activeModalImg.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{activeModalImg.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activeModalImg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-indigo-300 px-3 py-1.5 rounded-lg border border-gray-700 font-medium transition-colors"
                >
                  Open Original ↗
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalImg(null)}
                  className="text-gray-400 hover:text-white text-lg w-8 h-8 rounded-lg bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-6 bg-gray-950 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={activeModalImg.url}
                alt={activeModalImg.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLModelPage;
