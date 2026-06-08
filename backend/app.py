import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime
import numpy as np
import cv2
from model import BrainTumorModel

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
jwt = JWTManager(app)

client = MongoClient(os.environ.get("MONGO_URI"))
db = client["braintumor"]
users = db["users"]
scans = db["scans"]

model = BrainTumorModel(weights_path="weights.weights.h5")

# ── SIGNUP ──
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    users.insert_one({"name": name, "email": email, "password": hashed_password})
    return jsonify({"message": "Account created successfully!"}), 201

# ── LOGIN ──
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Incorrect password"}), 401

    token = create_access_token(identity=email)
    return jsonify({
        "token": token,
        "name": user["name"],
        "email": user["email"]
    }), 200

# ── PREDICT ──
@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    email = get_jwt_identity()

    patient_name = request.form.get("patient_name")
    patient_age = request.form.get("patient_age")
    patient_gender = request.form.get("patient_gender")

    file = request.files["image"]
    filename = file.filename
    img_array = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    prediction, _ = model.predict(image)

    tumor_detected = bool(prediction > 0.5)
    probability = float(prediction)
    confidence = round(probability * 100 if tumor_detected else (1 - probability) * 100, 1)

    scans.insert_one({
        "email": email,
        "patient_name": patient_name,
        "patient_age": patient_age,
        "patient_gender": patient_gender,
        "filename": filename,
        "tumor_detected": tumor_detected,
        "probability": probability,
        "confidence": confidence,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    return jsonify({
        "probability": probability,
        "tumor_detected": tumor_detected,
        "confidence": confidence,
        "patient_name": patient_name,
        "patient_age": patient_age,
        "patient_gender": patient_gender
    })

# ── STATS ──
@app.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    email = get_jwt_identity()
    user_scans = list(scans.find({"email": email}, {"_id": 0}))

    total = len(user_scans)
    tumor_count = sum(1 for s in user_scans if s["tumor_detected"])
    no_tumor_count = total - tumor_count

    daily = {}
    for scan in user_scans:
        day = scan["date"][:10]
        daily[day] = daily.get(day, 0) + 1

    daily_data = [{"date": k, "scans": v} for k, v in sorted(daily.items())]

    return jsonify({
        "total": total,
        "tumor_count": tumor_count,
        "no_tumor_count": no_tumor_count,
        "daily_data": daily_data
    }), 200

# ── HISTORY ──
@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    email = get_jwt_identity()
    user_scans = list(scans.find({"email": email}, {"_id": 0}))
    return jsonify(user_scans), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)