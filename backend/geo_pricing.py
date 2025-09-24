import json
import os
from pricing_model import MLPricingModel
from advanced_pricing import AdvancedMLPricingModel

class GeoPricingEngine:
    def __init__(self, data_file='pricing_data.json'):
        self.data_file = data_file
        self.ml_model = MLPricingModel()
        self.advanced_ml_model = AdvancedMLPricingModel()
        self.load_data()

    def load_data(self):
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r') as f:
                self.pricing_data = json.load(f)
        else:
            self.pricing_data = self.get_default_data()

    def get_default_data(self):
        return {
            "wage_indexes": {
                "CA": 1.2,
                "NY": 1.3,
                "TX": 0.9,
                "FL": 0.8
            },
            "material_costs": {
                "copper": {"CA": 5.0, "NY": 5.5, "TX": 4.5, "FL": 4.0},
                "steel": {"CA": 2.0, "NY": 2.2, "TX": 1.8, "FL": 1.7}
            },
            "labor_rates": {
                "HVAC": {"CA": 150, "NY": 160, "TX": 120, "FL": 110},
                "plumbing": {"CA": 100, "NY": 110, "TX": 80, "FL": 70}
            }
        }

    def calculate_quote(self, job_type, location, complexity="medium", materials=None, square_feet=1000, use_advanced_ml=True):
        if location not in self.pricing_data["wage_indexes"]:
            location = "default"

        wage_index = self.pricing_data["wage_indexes"].get(location, 1.0)
        labor_rate = self.pricing_data["labor_rates"][job_type].get(location, 100)

        base_cost = labor_rate * 2  # Example: 2 hours of labor

        if complexity == "high":
            base_cost *= 1.5
        elif complexity == "low":
            base_cost *= 0.8

        material_cost = 0
        if materials:
            for material, amount in materials.items():
                cost = self.pricing_data["material_costs"].get(material, {}).get(location, 1.0)
                material_cost += cost * amount

        total_cost = base_cost + material_cost

        if use_advanced_ml:
            # Use advanced ML model for enhanced prediction
            features = {
                'square_feet': square_feet,
                'materials_cost': material_cost,
                'labor_hours': base_cost / labor_rate,
                'location_multiplier': wage_index,
                'complexity_multiplier': 1 if complexity == "medium" else (1.5 if complexity == "high" else 0.8),
                'season_multiplier': 1.0,  # Default
                'urgency_multiplier': 1.0,  # Default
                'year_trend': 0.1  # Default
            }

            try:
                advanced_prediction = self.advanced_ml_model.predict_price(features)
                return {
                    "low": advanced_prediction['low_estimate'],
                    "median": advanced_prediction['predicted_price'],
                    "high": advanced_prediction['high_estimate'],
                    "ml_enhanced": True,
                    "confidence_score": advanced_prediction['confidence_score'],
                    "model_used": advanced_prediction['model_used']
                }
            except Exception as e:
                print(f"Advanced ML prediction failed: {e}, falling back to basic model")

        # Fallback to basic ML model
        complexity_factor = 1 if complexity == "medium" else (1.5 if complexity == "high" else 0.8)
        location_factor = wage_index
        ml_prediction = self.ml_model.predict_price(complexity_factor, location_factor, material_cost)

        # Combine traditional calculation with ML prediction
        final_low = (total_cost * 0.8 + ml_prediction["low"]) / 2
        final_median = (total_cost + ml_prediction["median"]) / 2
        final_high = (total_cost * 1.2 + ml_prediction["high"]) / 2

        return {
            "low": round(final_low, 2),
            "median": round(final_median, 2),
            "high": round(final_high, 2),
            "ml_enhanced": True
        }

    def save_data(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.pricing_data, f, indent=4)
