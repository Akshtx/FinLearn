from config.gemini import client, GEMINI_MODEL

def analyze_stock_search(stock_data, news_items):
    """
    Analyzes a stock and returns a structured AI verdict
    """
    prompt = f"""
    Analyze the Indian stock: {stock_data.get('name')} ({stock_data.get('symbol')})
    Current Price: ₹{stock_data.get('currentPrice')}
    Exchange: {stock_data.get('exchange')}
    Sector: {stock_data.get('sector')}
    PE Ratio: {stock_data.get('peRatio')}
    ROE: {stock_data.get('roe')}%
    Debt-to-Equity: {stock_data.get('debtToEquity')}
    
    News Headlines:
    {chr(10).join(['- ' + n for n in news_items])}
    
    Return a structured JSON with: verdict (BUY/HOLD/SELL), aiRationale, suggestionPortal (buy, hold, sell keys), overall_score (0-10).
    """
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "temperature": 0.5
            }
        )
        return response.text
    except Exception as e:
        print(f"Error in search_copilot: {e}")
        return None
