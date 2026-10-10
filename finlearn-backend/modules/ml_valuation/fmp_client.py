import os
import requests
from config.fmp import FMP_API_KEY, FMP_BASE_URL

# Predefined realistic mock metrics for popular Indian stocks (NSE/BSE)
MOCK_METRICS = {
    "RELIANCE": {
        "pe_ratio": 28.5,
        "pb_ratio": 3.5,
        "debt_to_equity": 0.4,
        "roe": 12.5,
        "revenue_growth": 0.10,
        "eps_growth": 0.12
    },
    "TCS": {
        "pe_ratio": 30.2,
        "pb_ratio": 11.5,
        "debt_to_equity": 0.05,
        "roe": 39.1,
        "revenue_growth": 0.08,
        "eps_growth": 0.09
    },
    "INFY": {
        "pe_ratio": 25.2,
        "pb_ratio": 7.1,
        "debt_to_equity": 0.1,
        "roe": 28.9,
        "revenue_growth": 0.07,
        "eps_growth": 0.06
    },
    "HDFCBANK": {
        "pe_ratio": 19.5,
        "pb_ratio": 2.8,
        "debt_to_equity": 0.8,
        "roe": 17.2,
        "revenue_growth": 0.14,
        "eps_growth": 0.15
    },
    "ICICIBANK": {
        "pe_ratio": 17.2,
        "pb_ratio": 3.1,
        "debt_to_equity": 0.85,
        "roe": 18.5,
        "revenue_growth": 0.15,
        "eps_growth": 0.16
    },
    "SBIN": {
        "pe_ratio": 8.5,
        "pb_ratio": 1.2,
        "debt_to_equity": 1.5,
        "roe": 15.0,
        "revenue_growth": 0.11,
        "eps_growth": 0.13
    },
    "ITC": {
        "pe_ratio": 26.8,
        "pb_ratio": 8.2,
        "debt_to_equity": 0.02,
        "roe": 29.1,
        "revenue_growth": 0.09,
        "eps_growth": 0.10
    },
    "BAJFINANCE": {
        "pe_ratio": 32.4,
        "pb_ratio": 6.5,
        "debt_to_equity": 0.9,
        "roe": 22.4,
        "revenue_growth": 0.20,
        "eps_growth": 0.21
    }
}

def get_fallback_mock_data(ticker):
    """
    Returns realistic mock data deterministically based on ticker symbol
    """
    ticker_clean = ticker.upper().strip()
    if ticker_clean in MOCK_METRICS:
        return MOCK_METRICS[ticker_clean]
    
    # Deterministic generation for other tickers using a hash of the symbol
    h = sum(ord(c) for c in ticker_clean)
    
    # Generate realistic ranges
    pe_ratio = round(10.0 + (h % 45), 2)
    pb_ratio = round(1.0 + ((h * 3) % 15) / 2.0, 2)
    debt_to_equity = round(((h * 7) % 200) / 100.0, 2)
    roe = round(5.0 + ((h * 11) % 30), 2)
    revenue_growth = round(((h * 13) % 25) / 100.0, 4)
    eps_growth = round(((h * 17) % 30) / 100.0, 4)
    
    return {
        "pe_ratio": pe_ratio,
        "pb_ratio": pb_ratio,
        "debt_to_equity": debt_to_equity,
        "roe": roe,
        "revenue_growth": revenue_growth,
        "eps_growth": eps_growth
    }

def fetch_fmp_stock_metrics(ticker):
    """
    Fetches stock metrics from FMP API. If fails, falls back gracefully to mock data.
    """
    ticker_clean = ticker.upper().strip()
    
    # Check if FMP_API_KEY is not defined or is placeholder
    if not FMP_API_KEY or "mock" in FMP_API_KEY.lower() or "your_fmp" in FMP_API_KEY.lower():
        print(f"Using mock data for {ticker_clean} (FMP API Key missing or placeholder).")
        return get_fallback_mock_data(ticker_clean)

    # Attempt to fetch real-time financial metrics from FMP API
    try:
        # 1. Ratios: PE, PB
        ratios_url = f"{FMP_BASE_URL}/ratios?symbol={ticker_clean}&apikey={FMP_API_KEY}"
        ratios_res = requests.get(ratios_url, timeout=5)
        
        # 2. Key Metrics: Debt to Equity, ROE
        metrics_url = f"{FMP_BASE_URL}/key-metrics-ttm?symbol={ticker_clean}&apikey={FMP_API_KEY}"
        metrics_res = requests.get(metrics_url, timeout=5)
        
        # 3. Growth Data: Revenue Growth, EPS Growth
        growth_url = f"{FMP_BASE_URL}/financial-growth?symbol={ticker_clean}&apikey={FMP_API_KEY}"
        growth_res = requests.get(growth_url, timeout=5)
        
        ratios_data = ratios_res.json() if ratios_res.status_code == 200 else []
        metrics_data = metrics_res.json() if metrics_res.status_code == 200 else []
        growth_data = growth_res.json() if growth_res.status_code == 200 else []
        
        # Validate FMP response (often return dict with error message if API key invalid)
        if isinstance(ratios_data, dict) and "Error Message" in ratios_data:
            print(f"FMP API returned error: {ratios_data['Error Message']}. Falling back to mock data.")
            return get_fallback_mock_data(ticker_clean)

        # Extract values or use mock values as a fallback if specific fields are missing
        default_mock = get_fallback_mock_data(ticker_clean)
        
        pe_ratio = default_mock["pe_ratio"]
        pb_ratio = default_mock["pb_ratio"]
        if ratios_data and isinstance(ratios_data, list) and len(ratios_data) > 0:
            pe_ratio = ratios_data[0].get("priceEarningsRatio", pe_ratio)
            pb_ratio = ratios_data[0].get("priceToBookRatio", pb_ratio)
            
        debt_to_equity = default_mock["debt_to_equity"]
        roe = default_mock["roe"]
        if metrics_data and isinstance(metrics_data, list) and len(metrics_data) > 0:
            debt_to_equity = metrics_data[0].get("debtToEquityTTM", debt_to_equity)
            roe = metrics_data[0].get("returnOnEquityTTM", roe) * 100.0 # Convert to percentage

        revenue_growth = default_mock["revenue_growth"]
        eps_growth = default_mock["eps_growth"]
        if growth_data and isinstance(growth_data, list) and len(growth_data) > 0:
            revenue_growth = growth_data[0].get("revenueGrowth", revenue_growth)
            eps_growth = growth_data[0].get("epsgrowth", eps_growth)

        return {
            "pe_ratio": float(pe_ratio),
            "pb_ratio": float(pb_ratio),
            "debt_to_equity": float(debt_to_equity),
            "roe": float(roe),
            "revenue_growth": float(revenue_growth),
            "eps_growth": float(eps_growth)
        }
        
    except Exception as e:
        print(f"Error fetching FMP data for {ticker_clean}: {e}. Falling back to mock data.")
        return get_fallback_mock_data(ticker_clean)
