import os
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Pre-load the models to warm up the server
from modules.ml_valuation.model_loader import ModelLoader
try:
    print("Pre-loading machine learning models...")
    loader = ModelLoader()
    if loader.loaded:
        print("ML models loaded and warmed up successfully.")
    else:
        print("Warning: ML models failed to load. Server will run but prediction endpoints will return error.")
except Exception as e:
    print(f"Error during pre-loading models: {e}")

# Import routes
from modules.ml_valuation.routes import ml_blueprint

app = Flask(__name__)
# Enable CORS for all routes (important for frontend communication)
CORS(app)

# Register blueprints
app.register_blueprint(ml_blueprint, url_prefix='/api/ml')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": ModelLoader().loaded
    })

# Error handler for 404
@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "success": False,
        "error": "Endpoint not found."
    }), 404

# Error handler for 500
@app.errorhandler(500)
def server_error(e):
    return jsonify({
        "success": False,
        "error": "Internal server error occurred."
    }), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))
    # In development, listen on 0.0.0.0 so it is accessible within container/local network
    app.run(host='0.0.0.0', port=port, debug=True)
