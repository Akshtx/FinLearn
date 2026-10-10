from config.gemini import client, GEMINI_MODEL

def compare_stocks_head_to_head(stocks_list):
    """
    Compares multiple stocks side-by-side
    """
    stocks_summary = "\n".join([f"- {s.get('symbol')}: PE {s.get('peRatio')}, ROE {s.get('roe')}%, D/E {s.get('debtToEquity')}" for s in stocks_list])
    prompt = f"""
    Compare these stocks head to head:
    {stocks_summary}
    
    Identify the relative winner and list pros/cons for each. Return JSON.
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
        print(f"Error in compare_engine: {e}")
        return None
