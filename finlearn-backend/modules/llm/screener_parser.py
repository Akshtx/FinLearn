from config.gemini import client, GEMINI_MODEL

def parse_screener_query(query):
    """
    Parses a natural language stock screener query into a JSON filter structure
    """
    prompt = f"""
    Convert the following query into JSON filters for Indian stocks:
    Query: "{query}"
    
    Fields: sector, price_lt, price_gt, peRatio_lt, dividendYield_gt, limit.
    Return ONLY JSON.
    """
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "temperature": 0.1
            }
        )
        return response.text
    except Exception as e:
        print(f"Error in screener_parser: {e}")
        return None
