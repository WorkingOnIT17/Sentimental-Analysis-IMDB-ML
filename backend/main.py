from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from preprocessing import preprocess_review

MODEL_PATH = Path(__file__).parent / "model" / "sentimental_analysis_pipeline.joblib"
LABELS = {0: "negative", 1: "positive"}

pipeline = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model file not found at {MODEL_PATH}")
    pipeline = joblib.load(MODEL_PATH)
    yield


app = FastAPI(
    title="Sentiment Analysis API",
    description="Movie review sentiment classifier powered by a scikit-learn pipeline.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = None


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)


class PredictResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float
    probabilities: dict[str, float]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet.")

    cleaned_text = preprocess_review(payload.text.strip())
    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="Text is empty after preprocessing. Please enter meaningful review text.",
        )

    prediction = int(pipeline.predict([cleaned_text])[0])
    probabilities = pipeline.predict_proba([cleaned_text])[0]

    prob_map = {
        LABELS[int(label)]: round(float(prob), 4)
        for label, prob in zip(pipeline.classes_, probabilities)
    }
    sentiment = LABELS[prediction]

    return PredictResponse(
        text=payload.text.strip(),
        sentiment=sentiment,
        confidence=prob_map[sentiment],
        probabilities=prob_map,
    )
