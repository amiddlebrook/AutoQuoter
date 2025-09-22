from flask import Flask, request, jsonify
from flask_cors import CORS
from geo_pricing import GeoPricingEngine

app = Flask(__name__)
CORS(app)

# Initialize the pricing engine
pricing_engine = GeoPricingEngine()

@app.route('/api/quote', methods=['POST'])
def generate_quote():
    data = request.json
    job_type = data.get('job_type')
    location = data.get('location')
    complexity = data.get('complexity', 'medium')
    materials = data.get('materials', {})

    quote_range = pricing_engine.calculate_quote(job_type, location, complexity, materials)

    return jsonify({
        "job_type": job_type,
        "location": location,
        "quote_range": quote_range,
        "fair_market_certificate": True
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
