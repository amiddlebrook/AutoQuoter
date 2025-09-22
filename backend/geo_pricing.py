import json
import os

class GeoPricingEngine:
    def __init__(self, data_file='pricing_data.json'):
        self.data_file = data_file
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

    def calculate_quote(self, job_type, location, complexity="medium", materials=None):
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

        # Calculate range
        low = total_cost * 0.8
        median = total_cost
        high = total_cost * 1.2

        return {
            "low": round(low, 2),
            "median": round(median, 2),
            "high": round(high, 2)
        }

    def save_data(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.pricing_data, f, indent=4)
