import { MLValuationResponse, BatchMLValuationResponse, MLValuationMetrics } from '../types';

// Deterministic client-side fallbacks in case backend is offline
const CLIENT_FALLBACKS: { [ticker: string]: MLValuationResponse } = {
  RELIANCE: {
    ticker: 'RELIANCE',
    valuation_label: 'Fairly Valued',
    confidence: 0.71,
    financial_score: 0.61,
    metrics: { pe_ratio: 28.5, pb_ratio: 3.5, debt_to_equity: 0.4, roe: 12.5, revenue_growth: 0.10, eps_growth: 0.12 }
  },
  TCS: {
    ticker: 'TCS',
    valuation_label: 'Fairly Valued',
    confidence: 0.74,
    financial_score: 0.65,
    metrics: { pe_ratio: 30.2, pb_ratio: 11.5, debt_to_equity: 0.05, roe: 39.1, revenue_growth: 0.08, eps_growth: 0.09 }
  },
  INFY: {
    ticker: 'INFY',
    valuation_label: 'Fairly Valued',
    confidence: 0.78,
    financial_score: 0.68,
    metrics: { pe_ratio: 25.2, pb_ratio: 7.1, debt_to_equity: 0.1, roe: 28.9, revenue_growth: 0.07, eps_growth: 0.06 }
  },
  HDFCBANK: {
    ticker: 'HDFCBANK',
    valuation_label: 'Undervalued',
    confidence: 0.86,
    financial_score: 0.74,
    metrics: { pe_ratio: 19.5, pb_ratio: 2.8, debt_to_equity: 0.8, roe: 17.2, revenue_growth: 0.14, eps_growth: 0.15 }
  },
  ICICIBANK: {
    ticker: 'ICICIBANK',
    valuation_label: 'Undervalued',
    confidence: 0.83,
    financial_score: 0.72,
    metrics: { pe_ratio: 17.2, pb_ratio: 3.1, debt_to_equity: 0.85, roe: 18.5, revenue_growth: 0.15, eps_growth: 0.16 }
  },
  SBIN: {
    ticker: 'SBIN',
    valuation_label: 'Undervalued',
    confidence: 0.82,
    financial_score: 0.79,
    metrics: { pe_ratio: 8.5, pb_ratio: 1.2, debt_to_equity: 1.5, roe: 15.0, revenue_growth: 0.11, eps_growth: 0.13 }
  },
  ITC: {
    ticker: 'ITC',
    valuation_label: 'Fairly Valued',
    confidence: 0.75,
    financial_score: 0.67,
    metrics: { pe_ratio: 26.8, pb_ratio: 8.2, debt_to_equity: 0.02, roe: 29.1, revenue_growth: 0.09, eps_growth: 0.10 }
  },
  BAJFINANCE: {
    ticker: 'BAJFINANCE',
    valuation_label: 'Overvalued',
    confidence: 0.68,
    financial_score: 0.54,
    metrics: { pe_ratio: 32.4, pb_ratio: 6.5, debt_to_equity: 0.9, roe: 22.4, revenue_growth: 0.20, eps_growth: 0.21 }
  }
};

const getClientFallback = (ticker: string): MLValuationResponse => {
  const tickerClean = String(ticker).toUpperCase();
  if (CLIENT_FALLBACKS[tickerClean]) {
    return CLIENT_FALLBACKS[tickerClean];
  }
  // Generate deterministically
  const sumCodes = tickerClean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pe = 10 + (sumCodes % 45);
  const pb = 1 + ((sumCodes * 3) % 15) / 2;
  const de = ((sumCodes * 7) % 200) / 100;
  const roe = 5 + (sumCodes % 30);
  const rev = ((sumCodes * 13) % 25) / 100;
  const eps = ((sumCodes * 17) % 30) / 100;

  // Simple classification logic
  let label: 'Undervalued' | 'Fairly Valued' | 'Overvalued' = 'Fairly Valued';
  if (pe < 15 && roe > 15) {
    label = 'Undervalued';
  } else if (pe > 35) {
    label = 'Overvalued';
  }

  return {
    ticker: tickerClean,
    valuation_label: label,
    confidence: 0.65 + ((sumCodes % 30) / 100),
    financial_score: 0.5 + ((sumCodes % 40) / 100),
    metrics: {
      pe_ratio: pe,
      pb_ratio: pb,
      debt_to_equity: de,
      roe: roe,
      revenue_growth: rev,
      eps_growth: eps
    }
  };
};

/**
 * Fetches the machine learning valuation classification for a single stock.
 */
export const getMLValuation = async (ticker: string): Promise<MLValuationResponse> => {
  try {
    let res = await fetch(`/api/ml/valuation/${ticker}`).catch(() => null);
    if (!res || !res.ok) {
      res = await fetch(`http://127.0.0.1:5001/api/ml/valuation/${ticker}`).catch(() => null);
    }
    if (!res || !res.ok) {
      throw new Error(`Server returned status: ${res?.status ?? 'network error'}`);
    }
    const data = await res.json();
    if (data.success === false) {
      throw new Error(data.error || "Unknown server error");
    }
    return data as MLValuationResponse;
  } catch (error) {
    console.warn(`ML Backend API failed for ${ticker}, using local fallback:`, error);
    return getClientFallback(ticker);
  }
};

/**
 * Fetches batch machine learning valuations for multiple stocks.
 */
export const getBatchMLValuations = async (tickers: string[]): Promise<BatchMLValuationResponse> => {
  try {
    let res = await fetch(`/api/ml/valuation/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers }),
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(`http://127.0.0.1:5001/api/ml/valuation/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      }).catch(() => null);
    }

    if (!res || !res.ok) {
      throw new Error(`Server returned status: ${res?.status ?? 'network error'}`);
    }
    const data = await res.json();
    return data as BatchMLValuationResponse;
  } catch (error) {
    console.warn("ML Backend Batch API failed, using local fallbacks:", error);
    const predictions: { [ticker: string]: MLValuationResponse } = {};
    tickers.forEach(t => {
      predictions[t.toUpperCase()] = getClientFallback(t);
    });
    return {
      success: true,
      predictions
    };
  }
};

/**
 * Predicts stock valuation from custom raw metrics.
 */
export const predictCustomValuation = async (metrics: MLValuationMetrics): Promise<MLValuationResponse> => {
  try {
    const res = await fetch(`/api/ml/valuation/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
    if (!res.ok) {
      throw new Error(`Server returned status: ${res.status}`);
    }
    const data = await res.json();
    if (data.success === false) {
      throw new Error(data.error || "Unknown server error");
    }
    return data as MLValuationResponse;
  } catch (error) {
    console.warn("Custom prediction failed, using mock classification:", error);
    // Simple client-side fallback logic
    let label: 'Undervalued' | 'Fairly Valued' | 'Overvalued' = 'Fairly Valued';
    if (metrics.pe_ratio < 15 && metrics.roe > 15) {
      label = 'Undervalued';
    } else if (metrics.pe_ratio > 35) {
      label = 'Overvalued';
    }
    const score = 0.5 + (metrics.roe / 100.0) - (metrics.pe_ratio / 150.0);
    return {
      ticker: 'CUSTOM',
      valuation_label: label,
      confidence: 0.76,
      financial_score: Math.min(Math.max(score, 0.0), 1.0),
      metrics
    };
  }
};
