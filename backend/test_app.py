import unittest
from app import app
import json

class TestAutoQuoter(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_endpoint(self):
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')

    def test_quote_endpoint(self):
        payload = {
            'job_type': 'HVAC',
            'location': 'CA',
            'complexity': 'medium',
            'materials': {'copper': 10}
        }
        response = self.app.post('/api/quote',
                                data=json.dumps(payload),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('quote_range', data)
        self.assertIn('ml_enhanced', data)

    def test_market_trends_endpoint(self):
        response = self.app.get('/api/market-trends')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('regional_demand', data)
        self.assertIn('price_trends', data)

    def test_dashboard_stats_endpoint(self):
        response = self.app.get('/api/dashboard/stats')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('total_quotes', data)
        self.assertIn('active_leads', data)

if __name__ == '__main__':
    unittest.main()
