# FinLearn AI

FinLearn AI is a React and Flask application for exploring Indian equity data and
classifying stocks as **Undervalued**, **Fairly Valued**, or **Overvalued**. It
combines an interactive frontend, Gemini-powered explanations, stock data views,
and a machine-learning valuation API backed by trained scikit-learn and XGBoost
pipelines.

> **Important:** This project is for education and research. Its classifications
> are not investment advice, and the market data and model outputs should be
> independently verified.

## Current project snapshot

| Item | Current value |
|---|---:|
| Raw records in the trained dataset | 2,000 |
| Usable unique stocks | 1,997 |
| Training / holdout split | 1,597 / 400 |
| Input indicators | 8 |
| Classes | 3 |
| Best model | XGBoost |
| XGBoost holdout accuracy | 91.00% |
| XGBoost balanced accuracy | 90.83% |
| XGBoost weighted F1 | 0.9104 |
| XGBoost 5-fold CV mean | 91.14% |
| Last recorded training run | 2026-10-11 |

The figures above are read from [`models/model_stats.json`](models/model_stats.json).
Regenerate the artifacts with `npm run train` after changing the training data or
pipeline.

## Features

- Search and inspect Indian stocks through the frontend.
- View valuation, fundamentals, charts, and model-backed classifications.
- Submit custom financial indicators to the ML prediction endpoint.
- Compare XGBoost, Random Forest, and AdaBoost results.
- Generate Gemini explanations when a Gemini API key is configured.
- Use local fallback data for supported demo stocks when external services are
  unavailable.

## Architecture

```text
React 19 + TypeScript + Vite
        |
        | /api (development proxy)
        v
Flask REST API + Flask-CORS
        |
        v
Trained ML pipelines in models/
```

### Input indicators

The prediction pipeline expects these eight fields:

`PE_Ratio`, `Price_to_Book`, `PEG`, `ROE_pct`, `ROA_12M_pct`,
`Profit_Growth_pct`, `Debt_to_Equity`, and `ROCE_pct`.

The model artifacts and label thresholds are documented in
[`models/feature_schema.json`](models/feature_schema.json).

## Repository layout

```text
.
├── data/                 # Raw and processed datasets
├── finlearn-backend/     # Flask API, routes, configuration, and model store
├── models/               # Runtime model artifacts used by the API
├── notebooks/            # Research notebooks and milestone material
├── outputs/              # Generated tables and charts
├── scripts/              # Frontend, backend, training, and full-stack runners
├── src/                  # React application
├── QUICKSTART.md         # Short command and file navigation guide
└── package.json          # Frontend scripts and dependencies
```

The API loads runtime models from `models/`. The duplicate files under
`finlearn-backend/models_store/` are retained with the backend research assets.

## Local development

### Prerequisites

- Node.js 18 or newer
- Python 3.10 or newer
- npm
- Python packages listed in [`finlearn-backend/requirements.txt`](finlearn-backend/requirements.txt)

### Install

```bash
npm install
python3 -m venv finlearn-backend/venv
source finlearn-backend/venv/bin/activate
pip install -r finlearn-backend/requirements.txt
```

### Configure environment variables

Create `.env.local` in the repository root for frontend build-time variables:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
FMP_API_KEY=your_fmp_api_key
VITE_API_BASE_URL=http://localhost:5001
```

For the backend, create `finlearn-backend/.env` when needed:

```dotenv
PORT=5001
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

Never commit either environment file or expose private API keys in the frontend
for a public deployment. Prefer a server-side proxy for production secrets.

### Run the full stack

```bash
npm start
```

This starts:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5001/health`
- ML page: `http://localhost:3000/#/ml-model`

The Vite development server proxies `/api` requests to port `5001`.

### Run components separately

```bash
npm run dev       # frontend only
npm run backend   # Flask API only
npm run train     # retrain models and regenerate outputs
npm run build     # production frontend build
```

Equivalent shell runners are available in [`scripts/`](scripts/).

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API and model-load health |
| GET | `/api/ml/valuation/<ticker>` | Valuation for a ticker |
| POST | `/api/ml/valuation/predict` | Predict from eight indicators |
| POST | `/api/ml/valuation/batch` | Batch predictions |
| GET | `/api/ml/valuation/stats` | Model metrics and metadata |
| GET | `/api/ml/reports/plot/<file>` | Generated report images |

## Model evaluation

| Model | Holdout accuracy | Balanced accuracy | Weighted F1 | 5-fold CV mean |
|---|---:|---:|---:|---:|
| Random Forest | 88.00% | 87.71% | 0.8806 | 89.83% |
| XGBoost | **91.00%** | **90.83%** | **0.9104** | **91.14%** |
| AdaBoost | 79.75% | 77.85% | 0.7948 | 80.82% |

Detailed reports are available in [`outputs/tables/`](outputs/tables/) and
[`outputs/charts/`](outputs/charts/).

## Deployment

The application has two services that must be deployed together:

1. **Frontend:** build with `npm run build` and serve the generated `dist/`
   directory with Vercel, Netlify, or another static host.
2. **Backend:** run the Flask API with a Python host such as Render, Railway,
   Fly.io, or a container platform. The service must expose `/health` and keep
   the `models/` artifacts available.

This repository includes [`netlify.toml`](netlify.toml) and
[`render.yaml`](render.yaml) for a Netlify + Render deployment. Set
`VITE_API_BASE_URL` on Netlify to the public Render backend URL, for example
`https://finlearn-api.onrender.com` (without a trailing slash). The Vite
development proxy is only used locally.

Before going live, configure CORS to allow only the deployed frontend origin
and store Gemini/FMP credentials as host-managed secrets.

To complete a deployment, provide:

- The hosting provider you want to use (Vercel + Render is a simple option).
- The GitHub repository and branch to deploy.
- The frontend and backend public URLs, if either service already exists.
- Production environment variable names and values through the provider's secret
  manager; do **not** paste API keys into chat.
- The custom domain, if one is required.

Once those details are available, the deployment URLs can be verified through
the frontend and the backend `/health` endpoint.

## Data and research references

- [`data/`](data/) contains the raw and processed datasets.
- [`notebooks/`](notebooks/) contains the training and analysis notebooks.
- [`models/README.md`](models/README.md) describes the model artifacts.
- [`outputs/README.md`](outputs/README.md) describes generated outputs.

## Citation

```bibtex
@misc{finlearn_ai_2026,
  author = {Sugandhi, Akshath and Contributors},
  title = {FinLearn AI: Machine Learning for Indian Equity Valuation},
  year = {2026},
  publisher = {GitHub},
  howpublished = {\url{https://github.com/Akshtx/FinLearn}}
}
```
