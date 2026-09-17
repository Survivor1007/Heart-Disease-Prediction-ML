"""Preprocessing pipeline with dynamic imputation, categorical encoding, and feature scaling."""

import numpy as np
import pandas as pd
from typing import List, Optional
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.preprocessing import OneHotEncoder, RobustScaler

from ml.dataset import NUMERICAL_FEATURES, CATEGORICAL_FEATURES, CATEGORICAL_VALUES, FEATURE_COLUMNS


class ClinicalDataSanitizer(BaseEstimator, TransformerMixin):
    """Sanitizes incoming raw dicts / DataFrames, casting types and standardizing missing values."""

    def fit(self, X: pd.DataFrame, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X_clean = X.copy()
        for col in NUMERICAL_FEATURES:
            if col in X_clean.columns:
                X_clean[col] = pd.to_numeric(X_clean[col], errors="coerce")
        for col in CATEGORICAL_FEATURES:
            if col in X_clean.columns:
                X_clean[col] = X_clean[col].astype(object)
                X_clean[col] = X_clean[col].apply(
                    lambda v: None if pd.isna(v) or v == "" or v == "null" or v is None else str(v).lower()
                )
        return X_clean


def build_preprocessor() -> Pipeline:
    """Constructs Scikit-learn ColumnTransformer with KNN imputation, RobustScaler, and OneHotEncoder."""
    
    num_pipeline = Pipeline([
        ("imputer", KNNImputer(n_neighbors=5, weights="distance")),
        ("scaler", RobustScaler()),
    ])

    cat_categories = [CATEGORICAL_VALUES[col] for col in CATEGORICAL_FEATURES]
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(categories=cat_categories, handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )

    full_pipeline = Pipeline([
        ("sanitizer", ClinicalDataSanitizer()),
        ("preprocessor", preprocessor),
    ])

    return full_pipeline


def get_feature_names_out(fitted_pipeline: Pipeline) -> List[str]:
    """Extract human-readable feature names from the fitted preprocessor."""
    preprocessor = fitted_pipeline.named_steps["preprocessor"]
    
    num_cols = list(NUMERICAL_FEATURES)
    cat_cols = []
    cat_encoder = preprocessor.named_transformers_["cat"].named_steps["encoder"]
    
    for feature_name, cats in zip(CATEGORICAL_FEATURES, cat_encoder.categories_):
        for cat in cats:
            cat_cols.append(f"{feature_name}_{cat}")
            
    return num_cols + cat_cols
