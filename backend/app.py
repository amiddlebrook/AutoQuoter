from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Sample data for geo-pricing (to be replaced with real data)
pricing_data = {
    "HVAC": {
        "repair": {"low": 100, "median": 200, "high": 300},
        "install": {"low": 1000, "median": 2000, "high": 3000}
    },
    "plumbing": {
        "repair": {"low": 50, "median": 100, "high": 150}
    }
}

@app.route('/api/quote', methods=['POST'])
def generate_quote():
    data = request.json
    job_type = data.get('job_type')
    location = data.get('location')
    complexity = data.get('complexity', 'medium')

    if job_type not in pricing_data:
        return jsonify({"error": "Invalid job type"}), 400

    quote = pricing_data[job_type]
    return jsonify({
        "job_type": job_type,
        "location": location,
        "quote_range": quote,
        "fair_market_certificate": True
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
