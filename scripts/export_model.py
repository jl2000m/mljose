"""
Export trained model and artifacts for the web app.
Run from project root: python scripts/export_model.py
Requires: Bases_de_datos_Airbnb.xlsx in project root or public/
Output: model_artifacts/model.joblib, scaler.joblib, label_encoder.json, metrics.json
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL_PATHS = [
    os.path.join(PROJECT_ROOT, "Bases_de_datos_Airbnb.xlsx"),
    os.path.join(PROJECT_ROOT, "public", "Bases_de_datos_Airbnb.xlsx"),
]
OUT_DIR = os.path.join(PROJECT_ROOT, "model_artifacts")


def load_data():
    for p in EXCEL_PATHS:
        if os.path.exists(p):
            return pd.read_excel(p)
    raise FileNotFoundError("Bases_de_datos_Airbnb.xlsx not found in project root or public/")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    df = load_data()
    df_ml = df.copy()
    columns_to_drop = ["name", "latitude", "longitude", "id", "host_id", "last_review"]
    df_ml.drop(columns=[c for c in columns_to_drop if c in df_ml.columns], axis=1, inplace=True)
    df_ml["reviews_per_month"].fillna(0, inplace=True)

    le = LabelEncoder()
    df_ml["room_type_encoded"] = le.fit_transform(df_ml["room_type"].astype(str))
    df_ml = df_ml.drop("room_type", axis=1)

    price_99 = df_ml["price"].quantile(0.99)
    df_ml_clean = df_ml[df_ml["price"] <= price_99].copy()

    X = df_ml_clean.drop("price", axis=1)
    y = df_ml_clean["price"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = {
        "Random Forest": RandomForestRegressor(
            n_estimators=100, max_depth=15, min_samples_split=5, random_state=42
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=100, max_depth=5, random_state=42
        ),
        "Linear Regression": LinearRegression(),
    }

    results = {}
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / (y_test + 1e-8))) * 100
        results[name] = {
            "model": model,
            "predictions": y_pred,
            "r2": float(r2),
            "rmse": float(rmse),
            "mae": float(mae),
            "mape": float(mape),
        }

    best_name = max(results, key=lambda k: results[k]["r2"])
    best_model = results[best_name]["model"]
    best_r2 = results[best_name]["r2"]
    best_rmse = results[best_name]["rmse"]
    best_mae = results[best_name]["mae"]
    best_mape = results[best_name]["mape"]
    y_pred_best = results[best_name]["predictions"]
    residuals = (y_test - y_pred_best).values
    errors_abs = np.abs(residuals)

    if best_r2 >= 0.5 and best_mape < 35:
        reliability = "confiable"
    elif best_r2 >= 0.3 and best_mape < 50:
        reliability = "parcial"
    else:
        reliability = "mejoras"

    joblib.dump(best_model, os.path.join(OUT_DIR, "model.joblib"))
    joblib.dump(scaler, os.path.join(OUT_DIR, "scaler.joblib"))
    label_mapping = {str(k): int(v) for k, v in zip(le.classes_, le.transform(le.classes_))}
    with open(os.path.join(OUT_DIR, "label_encoder.json"), "w", encoding="utf-8") as f:
        json.dump(label_mapping, f, indent=0)

    feature_importance = []
    if hasattr(best_model, "feature_importances_"):
        for feat, imp in zip(X.columns, best_model.feature_importances_):
            feature_importance.append({"variable": feat, "importancia": float(imp)})
        feature_importance.sort(key=lambda x: x["importancia"], reverse=True)

    predictions_vs_real = [
        {"real": float(y_test.iloc[i]), "pred": float(y_pred_best[i])}
        for i in range(min(500, len(y_test)))
    ]
    residuals_data = [
        {"pred": float(y_pred_best[i]), "residual": float(residuals[i])}
        for i in range(min(500, len(residuals)))
    ]
    hist, bin_edges = np.histogram(errors_abs, bins=min(30, len(np.unique(errors_abs)) or 1))
    errors_histogram = [
        {"bin": f"{bin_edges[i]:.0f}-{bin_edges[i+1]:.0f}", "count": int(hist[i])}
        for i in range(len(hist))
    ]

    metrics = {
        "bestModel": best_name,
        "r2": best_r2,
        "rmse": best_rmse,
        "mae": best_mae,
        "mape": best_mape,
        "reliability": reliability,
        "models": [
            {
                "name": name,
                "r2": results[name]["r2"],
                "rmse": results[name]["rmse"],
                "mae": results[name]["mae"],
                "mape": results[name]["mape"],
            }
            for name in results
        ],
        "featureImportance": feature_importance,
        "predictionsVsReal": predictions_vs_real,
        "residuals": residuals_data,
        "errorsHistogram": errors_histogram,
    }

    with open(os.path.join(OUT_DIR, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"Exported best model: {best_name} to {OUT_DIR}")
    print(f"  R2={best_r2:.4f}, RMSE={best_rmse:.2f}, MAE={best_mae:.2f}, MAPE={best_mape:.2f}%")


if __name__ == "__main__":
    main()
