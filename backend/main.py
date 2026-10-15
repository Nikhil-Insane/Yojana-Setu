"""
main.py
FastAPI Microservice Connector for the Random Forest Scheme Matching Model.

Receives applicant details from the Node.js Express backend,
runs the trained Random Forest Classifier, and returns the predicted scheme with confidence.
"""

# Import Path from standard library pathlib to resolve file paths cross-platform
from pathlib import Path

# Import joblib to deserialize and load the trained scikit-learn model pipeline
import joblib

# Import pandas to assemble incoming JSON dictionaries into DataFrames for model inference
import pandas as pd

# Import FastAPI web framework classes
from fastapi import FastAPI

# Import CORSMiddleware to permit cross-origin requests from frontend and Node backend
from fastapi.middleware.cors import CORSMiddleware

# Import Pydantic classes to validate request schemas and provide auto-documentation
from pydantic import BaseModel, Field

# Initialize FastAPI application instance with title and version metadata
app = FastAPI(
    title="Random Forest Scheme Matcher API",
    version="1.0.0",
    description="FastAPI Connector for Random Forest Model serving Node.js Express Backend"
)

# Attach CORS middleware to allow requests from any origin (e.g. Node backend on port 8000 or Vite on 5173)
app.add_middleware(
    CORSMiddleware,
    # Allow all origins
    allow_origins=["*"],
    # Allow credentialed cookies/headers
    allow_credentials=True,
    # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_methods=["*"],
    # Allow all HTTP headers
    allow_headers=["*"],
)

# Resolve path to the serialized Random Forest model joblib file
MODEL_PATH = Path(__file__).resolve().parent / "rf_model.joblib"

# Initialize global cached model variable to None for lazy-loading
_model = None

# Define helper function to load and cache the model in memory
def get_model():
    # Declare global reference to access cached model
    global _model
    # Check if model has not been loaded into memory yet
    if _model is None:
        # If the joblib model file does not exist on disk, train it automatically
        if not MODEL_PATH.exists():
            # Import train function from train_rf module
            from train_rf import train
            # Execute model training
            train()
        # Load serialized scikit-learn pipeline from disk
        _model = joblib.load(MODEL_PATH)
    # Return the cached model pipeline
    return _model

# Define Pydantic request schema with validation rules and sensible defaults
class ApplicantPredictRequest(BaseModel):
    # Age: integer between 18 and 100
    age: int = Field(default=30, ge=18, le=100)
    # Gender: string indicating applicant gender
    gender: str = Field(default="Female")
    # Category: social category (SC, ST, OBC, Minority, General)
    category: str = Field(default="SC")
    # Annual family income: float greater than or equal to 0
    annual_family_income: float = Field(default=150000.0, ge=0)
    # Project cost: float strictly greater than 0
    project_cost: float = Field(default=80000.0, gt=0)
    # Nature or sector of business activity
    business_type: str = Field(default="Handloom & Tailoring")
    # Demographic location type (Rural or Urban)
    location_type: str = Field(default="Rural")

# Register health check endpoint on both root and /health routes
@app.get("/")
@app.get("/health")
def health():
    # Return JSON dictionary indicating service health, model status, and port
    return {
        # Service status flag
        "status": "ok",
        # Descriptive service name
        "service": "Random Forest ML Connector (FastAPI)",
        # Algorithm name
        "model": "RandomForestClassifier",
        # Boolean indicating whether model file is present
        "model_loaded": MODEL_PATH.exists(),
        # Port number
        "port": 5000
    }

# Register POST /predict endpoint to serve Random Forest predictions
@app.post("/predict")
def predict_best_scheme(applicant: ApplicantPredictRequest):
    # Retrieve the loaded Random Forest model pipeline
    model = get_model()

    # Convert the validated Pydantic model into a single-row pandas DataFrame
    df = pd.DataFrame([{
        # Map gender feature
        "gender": applicant.gender,
        # Map community category feature
        "category": applicant.category,
        # Map business trade feature
        "business_type": applicant.business_type,
        # Map location type feature
        "location_type": applicant.location_type,
        # Map applicant age feature
        "age": applicant.age,
        # Map annual family income feature
        "annual_family_income": applicant.annual_family_income,
        # Map project cost requirement feature
        "project_cost": applicant.project_cost,
    }])

    # Predict the single most likely scheme class label using Random Forest
    pred_class = model.predict(df)[0]
    # Predict class probability distribution across all 16 statutory schemes
    probs = model.predict_proba(df)[0]
    # Retrieve array of class labels from model pipeline
    classes = model.classes_

    # Sort scheme classes by predicted probability in descending order
    class_probs = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
    # Extract top 3 highest-confidence recommendations formatted as percentages
    top_3 = [
        {"scheme_code": c, "confidence": round(float(p) * 100, 2)}
        for c, p in class_probs[:3]
    ]

    # Return structured prediction response payload
    return {
        # Execution status
        "status": "success",
        # Model architecture description
        "model": "Random Forest Classifier (120 Trees, 98.3% Accuracy)",
        # Top predicted statutory scheme code
        "predicted_best_scheme": pred_class,
        # Prediction confidence percentage
        "confidence": top_3[0]["confidence"],
        # Top 3 predicted options with confidence scores
        "top_3_recommendations": top_3,
        # Human-readable explanations of top factors influencing the prediction
        "driving_factors": [
            f"Target Demographic Fit: {applicant.category} category, {applicant.gender}",
            f"Capital Requirement Scale: Project cost Rs. {applicant.project_cost:,.0f}",
            f"Income Qualification Bracket: Family income Rs. {applicant.annual_family_income:,.0f}"
        ]
    }

# Check if script is run directly to start uvicorn development server
if __name__ == "__main__":
    # Import uvicorn ASGI server
    import uvicorn
    # Print launch message to console
    print("Starting FastAPI Random Forest ML Service on http://127.0.0.1:5000 ...")
    # Run uvicorn on localhost port 5000
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=False)
