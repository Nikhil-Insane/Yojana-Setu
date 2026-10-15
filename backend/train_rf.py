"""
train_rf.py
Trains Random Forest model on the schemes dataset and saves the pipeline.
"""

# Import json module to serialize training metrics and classification reports to JSON files
import json

# Import Path from pathlib to handle filesystem paths cleanly across Windows and Linux
from pathlib import Path

# Import joblib to persist and serialize the trained scikit-learn model pipeline to disk
import joblib

# Import pandas to load and manipulate tabular dataset DataFrames
import pandas as pd

# Import ColumnTransformer to apply different preprocessing pipelines to categorical vs numerical columns
from sklearn.compose import ColumnTransformer

# Import RandomForestClassifier from ensemble learning library
from sklearn.ensemble import RandomForestClassifier

# Import accuracy_score and classification_report evaluation metrics
from sklearn.metrics import accuracy_score, classification_report

# Import train_test_split to divide dataset into training (80%) and test (20%) partitions
from sklearn.model_selection import train_test_split

# Import Pipeline to chain preprocessing transformers with the final classifier estimator
from sklearn.pipeline import Pipeline

# Import OneHotEncoder to convert categorical string features into binary numeric columns
from sklearn.preprocessing import OneHotEncoder

# Define the train function encapsulating the full machine learning training lifecycle
def train():
    # Resolve relative path to the generated CSV training dataset
    data_path = Path("data/schemes_dataset.csv")

    # Check if the dataset CSV file does not exist on disk
    if not data_path.exists():
        # Import dataset generator function from scraper_dataset script
        from scraper_dataset import generate_and_save_dataset
        # Execute dataset generation to scrape/create the training data
        generate_and_save_dataset()

    # Log dataset loading progress to standard output
    print(f"Loading schemes dataset from {data_path}...")
    # Load the CSV file into a pandas DataFrame
    df = pd.read_csv(data_path)

    # Define list of categorical column names
    categorical_features = ["gender", "category", "business_type", "location_type"]
    # Define list of numerical continuous column names
    numeric_features = ["age", "annual_family_income", "project_cost"]

    # Slice feature matrix X containing all categorical and numeric predictor attributes
    X = df[categorical_features + numeric_features]
    # Extract target label vector y containing the ground-truth optimal scheme codes
    y = df["best_scheme"]

    # Split dataset: 80% for training the trees, 20% held out for unbiased test evaluation
    X_train, X_test, y_train, y_test = train_test_split(
        # Pass feature matrix and target vector
        X, y,
        # Hold out 20% for testing
        test_size=0.20,
        # Fix random seed for reproducible splits
        random_state=42,
        # Stratify by target y to ensure equal class representation in train and test splits
        stratify=y
    )

    # Create preprocessor applying One-Hot Encoding on categorical columns while passing numeric features through
    preprocessor = ColumnTransformer(
        transformers=[
            # Encode categorical features as dense binary dummy indicators; ignore unseen categories
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            # Leave numeric features as raw numbers without modification
            ("num", "passthrough", numeric_features),
        ]
    )

    # Initialize Random Forest Classifier with 120 decision trees
    clf = RandomForestClassifier(
        # Number of decision trees in the ensemble
        n_estimators=120,
        # Maximum tree depth to prevent overfitting while capturing non-linear interactions
        max_depth=16,
        # Minimum samples required to split an internal node
        min_samples_split=4,
        # Seed for reproducible bootstrap sampling and feature selection
        random_state=42,
        # Adjust weights inversely proportional to class frequencies to handle imbalanced minority schemes
        class_weight="balanced",
        # Use all CPU cores for parallel tree training
        n_jobs=-1,
    )

    # Assemble end-to-end Scikit-Learn Pipeline combining preprocessing and Random Forest classifier
    pipeline = Pipeline(steps=[
        # First step: feature preprocessing
        ("preprocessor", preprocessor),
        # Second step: Random Forest classifier
        ("classifier", clf),
    ])

    # Log training status to console
    print("Training Random Forest Classifier on scraped scheme dataset...")
    # Fit the entire pipeline on the training data
    pipeline.fit(X_train, y_train)

    # Calculate training accuracy on training data
    train_acc = accuracy_score(y_train, pipeline.predict(X_train))
    # Calculate generalization test accuracy on holdout test partition
    test_acc = accuracy_score(y_test, pipeline.predict(X_test))

    # Print training accuracy formatted as percentage
    print(f"[SUCCESS] Training Accuracy: {train_acc * 100:.2f}%")
    # Print holdout test accuracy formatted as percentage
    print(f"[SUCCESS] Test Accuracy:     {test_acc * 100:.2f}%")

    # Define target path where trained pipeline will be saved
    model_path = Path("backend/rf_model.joblib")
    # Serialize pipeline object to disk using joblib
    joblib.dump(pipeline, model_path)
    # Confirm model serialization path in terminal
    print(f"[SUCCESS] Model saved to {model_path}")

    # Generate full classification report dictionary including precision, recall, and f1 per class
    report = classification_report(y_test, pipeline.predict(X_test), output_dict=True)
    # Define metrics file path in data directory
    metrics_path = Path("data/rf_metrics.json")
    # Open metrics JSON file for writing
    with open(metrics_path, "w", encoding="utf-8") as f:
        # Write JSON document recording model metrics and class labels
        json.dump({
            # Model algorithm name
            "model": "RandomForestClassifier",
            # Training accuracy score
            "train_accuracy": round(float(train_acc), 4),
            # Test accuracy score
            "test_accuracy": round(float(test_acc), 4),
            # Sorted array of all 16 target scheme codes
            "classes": sorted(list(pipeline.classes_)),
            # Macro average F1-score across all classes
            "macro_f1": round(float(report["macro avg"]["f1-score"]), 4),
        }, f, indent=2)

# Check if script is executed from command line to trigger training directly
if __name__ == "__main__":
    # Call main train function
    train()
