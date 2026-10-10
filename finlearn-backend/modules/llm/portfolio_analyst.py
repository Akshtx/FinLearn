from config.gemini import client, GEMINI_MODEL

def analyze_portfolio(holdings):
    """
    Analyzes a user portfolio and provides growth suggestions
    """
    holdings_summary = "\n".join([f"- {h.get('symbol')}: {h.get('quantity')} shares @ ₹{h.get('buyPrice')}" for h in holdings])
    prompt = f"""
    Analyze the stock portfolio:
    {holdings_summary}
    
    Evaluate diversification, risk level, and suggest modifications (add/reduce). Return JSON.
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
        print(f"Error in portfolio_analyst: {e}")
        return None
