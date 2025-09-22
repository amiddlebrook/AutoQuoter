from flask import Flask, request, jsonify
from flask_cors import CORS
from geo_pricing import GeoPricingEngine
import random

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

@app.route('/api/dashboard/stats')
def get_dashboard_stats():
    # Mock data - in real app, this would come from database
    return jsonify({
        "total_quotes": random.randint(10, 20),
        "active_leads": random.randint(5, 15),
        "conversion_rate": random.randint(50, 80)
    })

@app.route('/api/dashboard/activity')
def get_recent_activity():
    return jsonify([
        {
            "type": "quote_request",
            "service": "HVAC Installation",
            "location": "Los Angeles, CA",
            "quote_range": {"low": 1800, "high": 2200},
            "status": "pending"
        },
        {
            "type": "lead_conversion",
            "service": "Plumbing Repair",
            "location": "New York, NY",
            "final_price": 150,
            "status": "completed"
        }
    ])

@app.route('/api/market-trends')
def get_market_trends():
    # Mock market trend data
    return jsonify({
        "regional_demand": {
            "CA": {"HVAC": 85, "plumbing": 72, "electrical": 78},
            "NY": {"HVAC": 92, "plumbing": 88, "electrical": 76},
            "TX": {"HVAC": 68, "plumbing": 65, "electrical": 71}
        },
        "price_trends": {
            "HVAC": [1800, 1850, 1900, 1950, 2000, 2050],
            "plumbing": [120, 125, 130, 135, 140, 145],
            "electrical": [300, 310, 320, 330, 340, 350]
        },
        "competitor_analysis": {
            "average_quotes": {"HVAC": 2200, "plumbing": 180, "electrical": 400},
            "market_share": {"AutoQuoter": 45, "Competitor A": 30, "Competitor B": 25}
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
