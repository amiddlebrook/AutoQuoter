import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import json

class MLPricingModel:
    def __init__(self, model_file='pricing_model.pkl'):
        self.model_file = model_file
        self.model = LinearRegression()
        self.load_or_train_model()

    def load_or_train_model(self):
        # For now, train a simple model with mock data
        # In a real application, this would load from a file or database
        self.train_model()

    def train_model(self):
        # Mock historical data: [complexity, location_factor, material_cost] -> price
        X = np.array([
            [1, 1.0, 100], [2, 1.1, 150], [3, 1.2, 200], [1, 0.9, 90],
            [2, 1.0, 140], [3, 1.1, 190], [1, 1.2, 110], [2, 0.8, 130]
        ])
        y = np.array([150, 220, 280, 130, 200, 260, 160, 190])

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model.fit(X_train, y_train)

        # Calculate accuracy
        predictions = self.model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        print(f"Model trained with MSE: {mse}")

    def predict_price(self, complexity, location_factor, material_cost):
        # Normalize inputs
        features = np.array([[complexity, location_factor, material_cost]])
        predicted_price = self.model.predict(features)[0]

        # Calculate range
        low = predicted_price * 0.9
        median = predicted_price
        high = predicted_price * 1.1

        return {
            "low": round(low, 2),
            "median": round(median, 2),
            "high": round(high, 2)
        }

    def get_model_info(self):
        return {
            "model_type": "LinearRegression",
            "features": ["complexity", "location_factor", "material_cost"],
            "coefficients": self.model.coef_.tolist(),
            "intercept": self.model.intercept_
        }
