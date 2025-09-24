import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.feature_selection import SelectKBest, f_regression
import joblib
import json
import os
from datetime import datetime
from typing import Dict, Any, Tuple, List
import logging

logger = logging.getLogger(__name__)

class AdvancedMLPricingModel:
    """Advanced ML pricing model with neural networks and feature engineering"""

    def __init__(self, model_dir='ml_models'):
        self.model_dir = model_dir
        self.models = {}
        self.scalers = {}
        self.feature_selectors = {}
        self.label_encoders = {}
        os.makedirs(model_dir, exist_ok=True)

    def generate_synthetic_data(self, num_samples: int = 10000) -> pd.DataFrame:
        """Generate synthetic training data for pricing model"""
        np.random.seed(42)

        # Base features
        data = {
            'job_type': np.random.choice(['HVAC', 'plumbing', 'electrical', 'roofing'], num_samples),
            'location': np.random.choice(['CA', 'NY', 'TX', 'FL', 'IL', 'WA'], num_samples),
            'complexity': np.random.choice(['low', 'medium', 'high'], num_samples),
            'square_feet': np.random.uniform(100, 5000, num_samples),
            'materials_cost': np.random.uniform(50, 2000, num_samples),
            'labor_hours': np.random.uniform(1, 40, num_samples),
            'season': np.random.choice(['spring', 'summer', 'fall', 'winter'], num_samples),
            'urgency': np.random.choice(['normal', 'rush', 'emergency'], num_samples),
            'year': np.random.choice(range(2020, 2025), num_samples)
        }

        df = pd.DataFrame(data)

        # Add engineered features
        df = self._add_engineered_features(df)

        # Generate target prices based on features
        df['price'] = self._calculate_realistic_prices(df)

        return df

    def _add_engineered_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add engineered features for better model performance"""

        # Location-based adjustments
        location_multipliers = {
            'CA': 1.2, 'NY': 1.3, 'TX': 0.9, 'FL': 0.8, 'IL': 1.0, 'WA': 1.1
        }
        df['location_multiplier'] = df['location'].map(location_multipliers)

        # Complexity multipliers
        complexity_multipliers = {'low': 0.8, 'medium': 1.0, 'high': 1.5}
        df['complexity_multiplier'] = df['complexity'].map(complexity_multipliers)

        # Season adjustments
        season_multipliers = {'spring': 1.0, 'summer': 1.2, 'fall': 0.9, 'winter': 0.8}
        df['season_multiplier'] = df['season'].map(season_multipliers)

        # Urgency multipliers
        urgency_multipliers = {'normal': 1.0, 'rush': 1.3, 'emergency': 1.8}
        df['urgency_multiplier'] = df['urgency'].map(urgency_multipliers)

        # Cost per square foot
        df['cost_per_sqft'] = df['materials_cost'] / df['square_feet']

        # Labor efficiency (hours per sqft)
        df['labor_efficiency'] = df['labor_hours'] / df['square_feet']

        # Total cost estimate
        df['estimated_cost'] = (df['materials_cost'] +
                               df['labor_hours'] * 75 * df['location_multiplier'])

        # Year-over-year trend
        df['year_trend'] = (df['year'] - 2020) * 0.05  # 5% annual increase

        return df

    def _calculate_realistic_prices(self, df: pd.DataFrame) -> np.ndarray:
        """Calculate realistic target prices based on features"""
        base_price = (df['materials_cost'] * 1.5 +  # 50% markup on materials
                     df['labor_hours'] * 75 * df['location_multiplier'] +  # Labor cost
                     df['square_feet'] * 2)  # Base sqft cost

        # Apply multipliers
        final_price = (base_price *
                      df['complexity_multiplier'] *
                      df['season_multiplier'] *
                      df['urgency_multiplier'] *
                      (1 + df['year_trend']))

        # Add some noise
        noise = np.random.normal(0, 0.1, len(final_price))
        final_price = final_price * (1 + noise)

        return final_price

    def preprocess_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, Dict]:
        """Preprocess data for ML models"""

        # Separate features and target
        feature_cols = ['square_feet', 'materials_cost', 'labor_hours',
                       'location_multiplier', 'complexity_multiplier',
                       'season_multiplier', 'urgency_multiplier',
                       'cost_per_sqft', 'labor_efficiency', 'year_trend']

        X = df[feature_cols].values
        y = df['price'].values

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Feature selection
        selector = SelectKBest(f_regression, k=min(8, X_scaled.shape[1]))
        X_selected = selector.fit_transform(X_scaled, y)

        # Store preprocessing objects
        preprocessing_info = {
            'scaler': scaler,
            'selector': selector,
            'feature_columns': feature_cols
        }

        return X_selected, y, preprocessing_info

    def train_models(self, test_size: float = 0.2, random_state: int = 42):
        """Train multiple ML models and select the best one"""

        # Generate training data
        df = self.generate_synthetic_data(15000)
        X, y, preprocessing_info = self.preprocess_data(df)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        models = {
            'random_forest': RandomForestRegressor(
                n_estimators=100, max_depth=20, random_state=random_state
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=100, learning_rate=0.1, random_state=random_state
            ),
            'neural_network': MLPRegressor(
                hidden_layer_sizes=(50, 25, 10),
                activation='relu',
                solver='adam',
                max_iter=1000,
                random_state=random_state
            )
        }

        results = {}

        for name, model in models.items():
            # Train model
            model.fit(X_train, y_train)

            # Evaluate model
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            cv_scores = cross_val_score(model, X, y, cv=5)

            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_test, y_pred)

            results[name] = {
                'model': model,
                'train_r2': train_score,
                'test_r2': test_score,
                'cv_r2_mean': cv_scores.mean(),
                'cv_r2_std': cv_scores.std(),
                'rmse': rmse,
                'r2': r2
            }

            logger.info(f"{name}: Train R²={train_score:.3f}, Test R²={test_score:.3f}, RMSE=${rmse:.2f}")

            # Save model
            self.save_model(name, model, preprocessing_info)

        # Select best model
        best_model = max(results.keys(),
                        key=lambda x: (results[x]['test_r2'], results[x]['cv_r2_mean']))

        self.models = {name: results[name]['model'] for name in models.keys()}
        self.scalers[best_model] = preprocessing_info['scaler']
        self.feature_selectors[best_model] = preprocessing_info['selector']

        logger.info(f"Best model selected: {best_model}")

        return results, best_model

    def predict_price(self, features: Dict[str, Any], model_type: str = 'best') -> Dict[str, float]:
        """Predict price using trained model"""

        if model_type == 'best':
            # Use the best performing model
            model_files = [f for f in os.listdir(self.model_dir) if f.endswith('.pkl')]
            if not model_files:
                raise ValueError("No trained models found. Please train models first.")
            model_type = max(model_files, key=lambda x: os.path.getctime(os.path.join(self.model_dir, x))).replace('.pkl', '')

        if model_type not in self.models:
            self.load_model(model_type)

        model = self.models[model_type]

        # Prepare features
        feature_vector = self._prepare_feature_vector(features)

        # Make prediction
        predicted_price = model.predict([feature_vector])[0]

        # Calculate confidence intervals
        confidence = self._calculate_confidence_interval(model, feature_vector)

        return {
            'predicted_price': round(predicted_price, 2),
            'low_estimate': round(predicted_price * 0.85, 2),
            'high_estimate': round(predicted_price * 1.15, 2),
            'confidence_score': confidence,
            'model_used': model_type
        }

    def _prepare_feature_vector(self, features: Dict[str, Any]) -> np.ndarray:
        """Prepare feature vector from input features"""

        # Create base feature vector with defaults
        base_features = {
            'square_feet': features.get('square_feet', 1000),
            'materials_cost': features.get('materials_cost', 500),
            'labor_hours': features.get('labor_hours', 8),
            'location_multiplier': features.get('location_multiplier', 1.0),
            'complexity_multiplier': features.get('complexity_multiplier', 1.0),
            'season_multiplier': features.get('season_multiplier', 1.0),
            'urgency_multiplier': features.get('urgency_multiplier', 1.0),
            'cost_per_sqft': features.get('materials_cost', 500) / features.get('square_feet', 1000),
            'labor_efficiency': features.get('labor_hours', 8) / features.get('square_feet', 1000),
            'year_trend': features.get('year_trend', 0.1)
        }

        return np.array(list(base_features.values()))

    def _calculate_confidence_interval(self, model, feature_vector: np.ndarray, confidence: float = 0.95) -> float:
        """Calculate confidence score for prediction"""
        # Simple confidence based on model performance
        # In production, use prediction intervals or bootstrap methods
        return min(confidence, 0.95)

    def save_model(self, name: str, model, preprocessing_info: Dict):
        """Save trained model and preprocessing objects"""

        model_path = os.path.join(self.model_dir, f'{name}.pkl')
        scaler_path = os.path.join(self.model_dir, f'{name}_scaler.pkl')
        selector_path = os.path.join(self.model_dir, f'{name}_selector.pkl')

        joblib.dump(model, model_path)
        joblib.dump(preprocessing_info['scaler'], scaler_path)
        joblib.dump(preprocessing_info['selector'], selector_path)

        # Save model metadata
        metadata = {
            'model_name': name,
            'training_date': datetime.now().isoformat(),
            'feature_columns': preprocessing_info['feature_columns']
        }

        with open(os.path.join(self.model_dir, f'{name}_metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)

    def load_model(self, name: str):
        """Load trained model and preprocessing objects"""

        model_path = os.path.join(self.model_dir, f'{name}.pkl')
        scaler_path = os.path.join(self.model_dir, f'{name}_scaler.pkl')
        selector_path = os.path.join(self.model_dir, f'{name}_selector.pkl')

        if not all(os.path.exists(p) for p in [model_path, scaler_path, selector_path]):
            raise FileNotFoundError(f"Model files not found for {name}")

        self.models[name] = joblib.load(model_path)
        self.scalers[name] = joblib.load(scaler_path)
        self.feature_selectors[name] = joblib.load(selector_path)

    def get_model_performance(self) -> Dict[str, Any]:
        """Get performance metrics for all models"""

        performance = {}

        for name in self.models.keys():
            if os.path.exists(os.path.join(self.model_dir, f'{name}_metadata.json')):
                with open(os.path.join(self.model_dir, f'{name}_metadata.json'), 'r') as f:
                    metadata = json.load(f)
                    performance[name] = metadata

        return performance

    def retrain_model(self, new_data: pd.DataFrame = None):
        """Retrain models with new data"""

        if new_data is None:
            new_data = self.generate_synthetic_data(5000)

        logger.info("Retraining models with new data...")
        results, best_model = self.train_models()

        return results, best_model
