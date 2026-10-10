<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1MBenHExYwX2mFVsRHyx9x_47pxfT4wYf

## Run Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)

### 2. Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` in the root folder and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

### 3. Backend Setup (Flask ML Service)
1. Navigate to the backend directory:
   ```bash
   cd finlearn-backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend:
   ```bash
   python server.py
   ```
   Backend will run on `http://localhost:5001`.

