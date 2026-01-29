"""
Vercel Python serverless function: POST /api/predict
Body: { room_type, minimum_nights, number_of_reviews, reviews_per_month, availability_365, calculated_host_listings_count }
Returns: { predicted_price, interval_low, interval_high, mae }
"""

import os
from http.server import BaseHTTPRequestHandler
import json
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model_artifacts")
FEATURE_ORDER = [
    "minimum_nights",
    "number_of_reviews",
    "reviews_per_month",
    "availability_365",
    "calculated_host_listings_count",
    "room_type_encoded",
]


def load_artifacts():
    model_path = os.path.join(MODEL_DIR, "model.joblib")
    scaler_path = os.path.join(MODEL_DIR, "scaler.joblib")
    le_path = os.path.join(MODEL_DIR, "label_encoder.json")
    metrics_path = os.path.join(MODEL_DIR, "metrics.json")
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        return None, None, None, None
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    with open(le_path, "r", encoding="utf-8") as f:
        label_encoder = json.load(f)
    mae = None
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            m = json.load(f)
            mae = m.get("mae", 94)
    return model, scaler, label_encoder, mae or 94


MODEL, SCALER, LABEL_ENCODER, MAE = load_artifacts()


def predict(body):
    if MODEL is None:
        return {"error": "Model not loaded. Run scripts/export_model.py and deploy with model_artifacts."}
    room_type = str(body.get("room_type", "Entire home/apt"))
    room_type_encoded = LABEL_ENCODER.get(room_type, LABEL_ENCODER.get("Entire home/apt", 0))
    features = [
        float(body.get("minimum_nights", 1)),
        float(body.get("number_of_reviews", 0)),
        float(body.get("reviews_per_month", 0)),
        float(body.get("availability_365", 365)),
        float(body.get("calculated_host_listings_count", 1)),
        float(room_type_encoded),
    ]
    X = [features]
    X_scaled = SCALER.transform(X)
    pred = float(MODEL.predict(X_scaled)[0])
    pred = max(0, pred)
    return {
        "predicted_price": round(pred, 2),
        "interval_low": round(max(0, pred - MAE), 2),
        "interval_high": round(pred + MAE, 2),
        "mae": MAE,
    }


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_raw = self.rfile.read(content_length).decode("utf-8") if content_length else "{}"
            body = json.loads(body_raw)
            result = predict(body)
            if "error" in result:
                self.send_response(400)
            else:
                self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
