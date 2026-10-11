# FinLearn AI — Runner Scripts Directory

This directory provides convenient, single-command shell scripts to build, train, run, and serve the FinLearn AI application and machine learning framework.

---

## 🛠️ Available Scripts

| Script | Purpose | Command |
|---|---|---|
| [`run_all.sh`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/scripts/run_all.sh) | **Complete Full-Stack**: Starts the Flask REST API on port 5001 and the React Vite Frontend on port 3000 concurrently. Cleanly terminates both on `Ctrl+C`. | `bash scripts/run_all.sh`<br>or `npm start` |
| [`run_frontend.sh`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/scripts/run_frontend.sh) | **Frontend Only**: Checks node/npm, installs modules if missing, and starts the Vite development server at `http://localhost:3000`. | `bash scripts/run_frontend.sh`<br>or `npm run dev` |
| [`run_backend.sh`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/scripts/run_backend.sh) | **Backend Only**: Sets up Python environment, verifies dependencies, and starts the Flask API at `http://localhost:5001`. | `bash scripts/run_backend.sh`<br>or `npm run backend` |
| [`run_training.sh`](file:///Users/akshathsugandhi/Desktop/finlearn-ai-main/scripts/run_training.sh) | **Train Models**: Executes the complete research pipeline on the 2,001 Indian equities dataset, fits all 3 models, and regenerates all tables, charts, and metrics. | `bash scripts/run_training.sh`<br>or `npm run train` |

---

## 🔒 Permissions
Ensure the scripts have executable permissions:
```bash
chmod +x scripts/*.sh
```
