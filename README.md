# IMDb Movie Review Sentiment Analysis

An end-to-end machine learning application that predicts whether an IMDb-style movie review expresses **positive** or **negative** sentiment. The project brings together model development, NLP preprocessing, a FastAPI inference service, and a React/Vite user interface.

Built as a portfolio project to demonstrate practical data science and machine learning skills: taking a trained NLP model from experimentation to a usable web application.

## Features

- Classifies movie-review text as **positive** or **negative**.
- Returns a confidence score and class probabilities with each prediction.
- Applies consistent NLTK-based preprocessing before inference.
- Loads the trained scikit-learn pipeline once at API startup.
- Provides input validation, health checks, and clear API errors.
- Includes a React + Vite frontend for an interactive prediction experience.
- Keeps model experimentation in a dedicated Jupyter notebook.

## Architecture

```text
React + Vite frontend
        |
        | HTTP POST /predict
        v
FastAPI backend
        |
        | validate and preprocess review text
        v
NLTK preprocessing
        |
        | cleaned text
        v
Saved scikit-learn pipeline (.joblib)
        |
        v
Sentiment, confidence, and probabilities
```

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React, Vite |
| Backend | FastAPI, Uvicorn, Pydantic |
| Machine learning | scikit-learn, joblib |
| NLP | NLTK |
| Experimentation | Jupyter Notebook |
| Text representations | SentenceTransformer / embedding experimentation* |

\*The deployed API currently loads the saved scikit-learn pipeline. See `notebook/sentimental.ipynb` for the model-development workflow and any embedding experiments.

## Project Structure

```text
Sentimental-Analysis-IMDB-ML/
├── backend/
│   ├── main.py                          # FastAPI application and prediction routes
│   ├── preprocessing.py                 # NLTK text preprocessing helpers
│   ├── requirements.txt                 # Python dependencies
│   └── model/
│       └── sentimental_analysis_pipeline.joblib
├── frontend/
│   ├── src/                             # React application source
│   ├── public/                          # Static assets
│   ├── package.json                     # Frontend scripts and dependencies
│   └── vite.config.js                   # Vite configuration
└── notebook/
    └── sentimental.ipynb                # Exploratory analysis and model development
```

## Getting Started

### Prerequisites

- Python 3.10+ recommended
- Node.js 18+ recommended
- npm

### 1. Clone the repository

```bash
git clone https://github.com/WorkingOnIT17/Sentimental-Analysis-IMDB-ML.git
cd Sentimental-Analysis-IMDB-ML
```

### 2. Start the backend

Open a terminal in the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Install dependencies and run the API:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000` by default. FastAPI’s interactive documentation is available at `http://127.0.0.1:8000/docs`.

> On the first preprocessing call, NLTK downloads the resources needed by this project: `punkt`, `punkt_tab`, `stopwords`, `wordnet`, and `omw-1.4`.

### 3. Start the frontend

Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Vite will print the local URL for the app (typically `http://localhost:5173`). The backend CORS configuration allows the standard Vite development origins.

## API Usage

### Health check

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

### Predict sentiment

```http
POST /predict
Content-Type: application/json
```

Request body:

```json
{
  "text": "A thoughtful, well-acted film that kept me engaged from start to finish."
}
```

Example response:

```json
{
  "text": "A thoughtful, well-acted film that kept me engaged from start to finish.",
  "sentiment": "positive",
  "confidence": 0.9876,
  "probabilities": {
    "negative": 0.0124,
    "positive": 0.9876
  }
}
```

The values above illustrate the response shape only; outputs depend on the submitted review and trained model.

You can test the endpoint from a terminal:

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"The plot was slow, predictable, and disappointing.\"}"
```

## Preprocessing and Model Pipeline

Before prediction, review text passes through the following workflow:

1. Tokenize the input using NLTK.
2. Remove English stop words.
3. Lemmatize remaining tokens with WordNet, using verb lemmatization.
4. Join the cleaned tokens into a normalized text string.
5. Send that text to the persisted scikit-learn pipeline for prediction and probability estimation.
6. Map numeric class labels to `negative` and `positive` for the API response.

The model artifact is loaded from `backend/model/sentimental_analysis_pipeline.joblib` when the FastAPI application starts. Keeping preprocessing and inference in the same service helps ensure that production input is treated consistently with the intended prediction workflow.

## Error Handling

- `422 Unprocessable Entity` — missing or invalid request data; review text must contain 1–10,000 characters.
- `400 Bad Request` — text has no meaningful content after preprocessing.
- `503 Service Unavailable` — the model has not finished loading.

## Future Improvements

- Add automated tests for preprocessing, API routes, and frontend interactions.
- Add a reproducible training script and versioned experiment tracking.
- Report evaluation metrics, confusion matrix, and error analysis from the final validation workflow.
- Compare the deployed classical pipeline with SentenceTransformer embedding-based approaches.
- Add Docker support and a deployment workflow.
- Introduce monitoring for prediction volume, latency, and input-data drift.
- Improve explainability with influential-word or feature-attribution views.

## Notes for Recruiters

This project demonstrates an end-to-end DS/ML workflow: NLP preprocessing, model serialization, API design, frontend integration, and practical inference concerns such as validation, confidence reporting, and CORS. For the modeling work, see the [notebook](notebook/sentimental.ipynb); for the production inference layer, see the [FastAPI entry point](backend/main.py).

## License

Add a license file (for example, MIT) if you would like others to reuse this project.
