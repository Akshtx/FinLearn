import os
from google import genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

# Initialize client. The Client will auto-detect GEMINI_API_KEY from env if not passed,
# but we explicitly pass it for robustness.
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = genai.Client()
