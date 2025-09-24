import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict, Counter
import pandas as pd
import numpy as np
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Advanced analytics service for business intelligence"""

    def __init__(self, data_file='analytics_data.json'):
        self.data_file = data_file
        self.analytics_data = self.load_data()

    def load_data(self) -> Dict[str, Any]:
        """Load analytics data from file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading analytics data: {e}")
                return self.get_default_structure()
        else:
            return self.get_default_structure()

    def get_default_structure(self) -> Dict[str, Any]:
        """Get default analytics data structure"""
        return {
            'quotes': [],
            'user_sessions': [],
            'api_calls': [],
            'performance_metrics': [],
            'user_feedback': [],
            'conversion_funnel': [],
            'geographic_data': {},
            'time_series_data': {},
            'model_performance': {},
            'business_metrics': {},
            'last_updated': datetime.now().isoformat()
        }

    def save_data(self):
        """Save analytics data to file"""
        try:
            self.analytics_data['last_updated'] = datetime.now().isoformat()
            with open(self.data_file, 'w') as f:
                json.dump(self.analytics_data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving analytics data: {e}")

    def track_quote_request(self, quote_data: Dict[str, Any]):
        """Track a quote request for analytics"""
        quote_entry = {
            'timestamp': datetime.now().isoformat(),
            'job_type': quote_data.get('job_type'),
            'location': quote_data.get('location'),
            'complexity': quote_data.get('complexity', 'medium'),
            'square_feet': quote_data.get('square_feet', 1000),
            'materials': quote_data.get('materials', {}),
            'quote_range': quote_data.get('quote_range', {}),
            'user_agent': quote_data.get('user_agent', 'unknown'),
            'ip_address': quote_data.get('ip_address', 'unknown'),
            'session_id': quote_data.get('session_id', 'unknown')
        }

        self.analytics_data['quotes'].append(quote_entry)
        self.update_time_series_data('quotes', quote_entry)
        self.update_geographic_data(quote_entry)
        self.save_data()

    def track_user_session(self, session_data: Dict[str, Any]):
        """Track user session data"""
        session_entry = {
            'timestamp': datetime.now().isoformat(),
            'session_id': session_data.get('session_id'),
            'user_type': session_data.get('user_type', 'consumer'),
            'pages_visited': session_data.get('pages_visited', []),
            'time_spent': session_data.get('time_spent', 0),
            'actions_taken': session_data.get('actions_taken', []),
            'conversion_status': session_data.get('conversion_status', 'none')
        }

        self.analytics_data['user_sessions'].append(session_entry)
        self.update_conversion_funnel(session_entry)
        self.save_data()

    def track_api_call(self, api_data: Dict[str, Any]):
        """Track API call performance"""
        api_entry = {
            'timestamp': datetime.now().isoformat(),
            'endpoint': api_data.get('endpoint'),
            'method': api_data.get('method'),
            'response_time': api_data.get('response_time', 0),
            'status_code': api_data.get('status_code', 200),
            'user_agent': api_data.get('user_agent', 'unknown'),
            'ip_address': api_data.get('ip_address', 'unknown')
        }

        self.analytics_data['api_calls'].append(api_entry)
        self.update_performance_metrics(api_entry)
        self.save_data()

    def track_model_performance(self, model_data: Dict[str, Any]):
        """Track ML model performance"""
        model_entry = {
            'timestamp': datetime.now().isoformat(),
            'model_name': model_data.get('model_name'),
            'prediction_accuracy': model_data.get('accuracy', 0),
            'confidence_score': model_data.get('confidence', 0),
            'input_features': model_data.get('features', {}),
            'prediction_time': model_data.get('prediction_time', 0)
        }

        self.analytics_data['model_performance'].setdefault(model_data.get('model_name', 'unknown'), [])
        self.analytics_data['model_performance'][model_data.get('model_name')].append(model_entry)
        self.save_data()

    def update_time_series_data(self, data_type: str, entry: Dict[str, Any]):
        """Update time series data for trends"""
        date = datetime.now().strftime('%Y-%m-%d')

        if data_type not in self.analytics_data['time_series_data']:
            self.analytics_data['time_series_data'][data_type] = {}

        if date not in self.analytics_data['time_series_data'][data_type]:
            self.analytics_data['time_series_data'][data_type][date] = {
                'count': 0,
                'total_value': 0,
                'avg_value': 0
            }

        self.analytics_data['time_series_data'][data_type][date]['count'] += 1

        # Calculate value based on data type
        if data_type == 'quotes' and 'quote_range' in entry:
            value = entry['quote_range'].get('median', 0)
            self.analytics_data['time_series_data'][data_type][date]['total_value'] += value
            self.analytics_data['time_series_data'][data_type][date]['avg_value'] = (
                self.analytics_data['time_series_data'][data_type][date]['total_value'] /
                self.analytics_data['time_series_data'][data_type][date]['count']
            )

    def update_geographic_data(self, entry: Dict[str, Any]):
        """Update geographic distribution data"""
        location = entry.get('location', 'unknown')

        if location not in self.analytics_data['geographic_data']:
            self.analytics_data['geographic_data'][location] = {
                'total_quotes': 0,
                'avg_quote_value': 0,
                'job_types': {}
            }

        self.analytics_data['geographic_data'][location]['total_quotes'] += 1

        if 'quote_range' in entry:
            quote_value = entry['quote_range'].get('median', 0)
            total_quotes = self.analytics_data['geographic_data'][location]['total_quotes']
            prev_avg = self.analytics_data['geographic_data'][location].get('avg_quote_value', 0)

            self.analytics_data['geographic_data'][location]['avg_quote_value'] = (
                (prev_avg * (total_quotes - 1) + quote_value) / total_quotes
            )

        # Track job types by location
        job_type = entry.get('job_type', 'unknown')
        if job_type not in self.analytics_data['geographic_data'][location]['job_types']:
            self.analytics_data['geographic_data'][location]['job_types'][job_type] = 0
        self.analytics_data['geographic_data'][location]['job_types'][job_type] += 1

    def update_performance_metrics(self, api_entry: Dict[str, Any]):
        """Update API performance metrics"""
        endpoint = api_entry.get('endpoint', 'unknown')
        response_time = api_entry.get('response_time', 0)

        if endpoint not in self.analytics_data['performance_metrics']:
            self.analytics_data['performance_metrics'][endpoint] = {
                'total_calls': 0,
                'total_response_time': 0,
                'avg_response_time': 0,
                'error_count': 0,
                'success_count': 0
            }

        self.analytics_data['performance_metrics'][endpoint]['total_calls'] += 1
        self.analytics_data['performance_metrics'][endpoint]['total_response_time'] += response_time

        if api_entry.get('status_code', 200) >= 400:
            self.analytics_data['performance_metrics'][endpoint]['error_count'] += 1
        else:
            self.analytics_data['performance_metrics'][endpoint]['success_count'] += 1

        total_calls = self.analytics_data['performance_metrics'][endpoint]['total_calls']
        self.analytics_data['performance_metrics'][endpoint]['avg_response_time'] = (
            self.analytics_data['performance_metrics'][endpoint]['total_response_time'] / total_calls
        )

    def update_conversion_funnel(self, session_entry: Dict[str, Any]):
        """Update conversion funnel data"""
        session_id = session_entry.get('session_id')
        actions = session_entry.get('actions_taken', [])

        # Find existing funnel entry or create new one
        funnel_entry = None
        for entry in self.analytics_data['conversion_funnel']:
            if entry['session_id'] == session_id:
                funnel_entry = entry
                break

        if not funnel_entry:
            funnel_entry = {
                'session_id': session_id,
                'user_type': session_entry.get('user_type', 'consumer'),
                'start_time': session_entry.get('timestamp'),
                'steps_completed': [],
                'conversion_status': 'in_progress'
            }
            self.analytics_data['conversion_funnel'].append(funnel_entry)

        # Update steps completed
        funnel_entry['steps_completed'].extend(actions)

        # Determine conversion status
        if 'quote_generated' in actions:
            funnel_entry['conversion_status'] = 'quote_generated'
        if 'contact_contractor' in actions:
            funnel_entry['conversion_status'] = 'contacted_contractor'
        if 'job_booked' in actions:
            funnel_entry['conversion_status'] = 'job_booked'

    def get_quote_analytics(self) -> Dict[str, Any]:
        """Get comprehensive quote analytics"""
        quotes = self.analytics_data['quotes']

        if not quotes:
            return {'message': 'No quote data available'}

        # Basic metrics
        total_quotes = len(quotes)
        job_types = Counter(q.get('job_type') for q in quotes)
        locations = Counter(q.get('location') for q in quotes)

        # Value metrics
        quote_values = [q.get('quote_range', {}).get('median', 0) for q in quotes]
        avg_quote_value = np.mean(quote_values) if quote_values else 0
        total_quote_value = sum(quote_values)

        # Complexity distribution
        complexity_dist = Counter(q.get('complexity', 'medium') for q in quotes)

        return {
            'total_quotes': total_quotes,
            'average_quote_value': round(avg_quote_value, 2),
            'total_quote_value': round(total_quote_value, 2),
            'job_type_distribution': dict(job_types),
            'location_distribution': dict(locations),
            'complexity_distribution': dict(complexity_dist),
            'top_job_types': job_types.most_common(5),
            'top_locations': locations.most_common(5)
        }

    def get_user_behavior_analytics(self) -> Dict[str, Any]:
        """Get user behavior analytics"""
        sessions = self.analytics_data['user_sessions']

        if not sessions:
            return {'message': 'No session data available'}

        # Session metrics
        total_sessions = len(sessions)
        avg_session_time = np.mean([s.get('time_spent', 0) for s in sessions])

        # User type distribution
        user_types = Counter(s.get('user_type', 'consumer') for s in sessions)

        # Conversion rates
        conversion_statuses = Counter(s.get('conversion_status', 'none') for s in sessions)
        conversion_rate = (conversion_statuses.get('job_booked', 0) + conversion_statuses.get('contacted_contractor', 0)) / total_sessions

        # Popular pages
        all_pages = []
        for session in sessions:
            all_pages.extend(session.get('pages_visited', []))
        page_popularity = Counter(all_pages)

        return {
            'total_sessions': total_sessions,
            'average_session_time': round(avg_session_time, 2),
            'user_type_distribution': dict(user_types),
            'conversion_rate': round(conversion_rate * 100, 2),
            'conversion_statuses': dict(conversion_statuses),
            'popular_pages': page_popularity.most_common(10),
            'bounce_rate': self.calculate_bounce_rate(sessions)
        }

    def calculate_bounce_rate(self, sessions: List[Dict]) -> float:
        """Calculate bounce rate (sessions with only one page view)"""
        bounced_sessions = sum(1 for s in sessions if len(s.get('pages_visited', [])) <= 1)
        return round((bounced_sessions / len(sessions)) * 100, 2) if sessions else 0

    def get_performance_analytics(self) -> Dict[str, Any]:
        """Get API performance analytics"""
        api_calls = self.analytics_data['api_calls']

        if not api_calls:
            return {'message': 'No API performance data available'}

        # Overall metrics
        total_calls = len(api_calls)
        avg_response_time = np.mean([call.get('response_time', 0) for call in api_calls])
        error_rate = sum(1 for call in api_calls if call.get('status_code', 200) >= 400) / total_calls

        # Endpoint performance
        endpoint_metrics = {}
        for call in api_calls:
            endpoint = call.get('endpoint', 'unknown')
            if endpoint not in endpoint_metrics:
                endpoint_metrics[endpoint] = {
                    'total_calls': 0,
                    'avg_response_time': 0,
                    'error_count': 0,
                    'success_count': 0
                }

            endpoint_metrics[endpoint]['total_calls'] += 1
            endpoint_metrics[endpoint]['avg_response_time'] += call.get('response_time', 0)

            if call.get('status_code', 200) >= 400:
                endpoint_metrics[endpoint]['error_count'] += 1
            else:
                endpoint_metrics[endpoint]['success_count'] += 1

        # Calculate averages
        for endpoint in endpoint_metrics:
            total_calls = endpoint_metrics[endpoint]['total_calls']
            endpoint_metrics[endpoint]['avg_response_time'] /= total_calls
            endpoint_metrics[endpoint]['error_rate'] = (
                endpoint_metrics[endpoint]['error_count'] / total_calls * 100
            )

        return {
            'total_api_calls': total_calls,
            'average_response_time': round(avg_response_time, 3),
            'overall_error_rate': round(error_rate * 100, 2),
            'endpoint_metrics': endpoint_metrics
        }

    def get_geographic_insights(self) -> Dict[str, Any]:
        """Get geographic market insights"""
        geo_data = self.analytics_data['geographic_data']

        if not geo_data:
            return {'message': 'No geographic data available'}

        # Market size by location
        market_sizes = {loc: data['total_quotes'] for loc, data in geo_data.items()}

        # Average quote values by location
        avg_values = {loc: data.get('avg_quote_value', 0) for loc, data in geo_data.items()}

        # Job type preferences by location
        job_preferences = {}
        for loc, data in geo_data.items():
            if data.get('job_types'):
                top_job = max(data['job_types'], key=data['job_types'].get)
                job_preferences[loc] = {
                    'top_job_type': top_job,
                    'job_distribution': data['job_types']
                }

        return {
            'market_sizes': market_sizes,
            'average_quote_values': avg_values,
            'job_type_preferences': job_preferences,
            'total_markets': len(geo_data),
            'largest_market': max(market_sizes, key=market_sizes.get) if market_sizes else None
        }

    def get_time_series_trends(self) -> Dict[str, Any]:
        """Get time series trends and insights"""
        time_series = self.analytics_data['time_series_data']

        trends = {}
        for data_type, dates in time_series.items():
            if not dates:
                continue

            # Sort dates
            sorted_dates = sorted(dates.keys())

            # Calculate growth rates
            values = [dates[date]['avg_value'] for date in sorted_dates if dates[date]['avg_value'] > 0]

            if len(values) >= 2:
                growth_rate = ((values[-1] - values[0]) / values[0]) * 100 if values[0] > 0 else 0
            else:
                growth_rate = 0

            trends[data_type] = {
                'dates': sorted_dates,
                'values': values,
                'growth_rate': round(growth_rate, 2),
                'trend_direction': 'up' if growth_rate > 0 else 'down' if growth_rate < 0 else 'stable'
            }

        return trends

    def generate_business_report(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """Generate comprehensive business report"""

        # Filter data by date range if provided
        if start_date and end_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

            # Filter quotes
            filtered_quotes = [
                q for q in self.analytics_data['quotes']
                if start_dt <= datetime.fromisoformat(q['timestamp'].replace('Z', '+00:00')) <= end_dt
            ]

            # Filter sessions
            filtered_sessions = [
                s for s in self.analytics_data['user_sessions']
                if start_dt <= datetime.fromisoformat(s['timestamp'].replace('Z', '+00:00')) <= end_dt
            ]
        else:
            filtered_quotes = self.analytics_data['quotes']
            filtered_sessions = self.analytics_data['user_sessions']

        # Generate report
        report = {
            'report_period': {
                'start_date': start_date or 'all_time',
                'end_date': end_date or 'all_time'
            },
            'quote_analytics': self.get_quote_analytics(),
            'user_behavior': self.get_user_behavior_analytics(),
            'performance_metrics': self.get_performance_analytics(),
            'geographic_insights': self.get_geographic_insights(),
            'time_series_trends': self.get_time_series_trends(),
            'key_insights': self.generate_key_insights(filtered_quotes, filtered_sessions),
            'recommendations': self.generate_recommendations()
        }

        return report

    def generate_key_insights(self, quotes: List[Dict], sessions: List[Dict]) -> List[str]:
        """Generate key business insights"""
        insights = []

        if quotes:
            total_quotes = len(quotes)
            avg_value = np.mean([q.get('quote_range', {}).get('median', 0) for q in quotes])

            insights.append(f"Generated {total_quotes} quotes with average value of ${avg_value:.".2f")

        if sessions:
            conversion_rate = self.get_user_behavior_analytics().get('conversion_rate', 0)
            insights.append(f"User conversion rate: {conversion_rate}%")

        # Geographic insights
        geo_data = self.get_geographic_insights()
        if geo_data.get('largest_market'):
            largest_market = geo_data['largest_market']
            insights.append(f"Largest market: {largest_market} with {geo_data['market_sizes'][largest_market]} quotes")

        # Performance insights
        perf_data = self.get_performance_analytics()
        if perf_data.get('average_response_time'):
            insights.append(f"Average API response time: {perf_data['average_response_time']".3f"}s")

        return insights

    def generate_recommendations(self) -> List[str]:
        """Generate business recommendations"""
        recommendations = []

        # Analyze conversion funnel
        sessions = self.analytics_data['user_sessions']
        if sessions:
            conversion_statuses = Counter(s.get('conversion_status', 'none') for s in sessions)

            if conversion_statuses.get('none', 0) > conversion_statuses.get('quote_generated', 0):
                recommendations.append("Improve quote generation conversion - many users don't complete quotes")

            if conversion_statuses.get('quote_generated', 0) > conversion_statuses.get('contacted_contractor', 0):
                recommendations.append("Optimize contractor contact process - high drop-off after quote generation")

        # Performance recommendations
        perf_data = self.get_performance_analytics()
        if perf_data.get('overall_error_rate', 0) > 5:
            recommendations.append("Reduce API error rate - currently above 5%")

        if perf_data.get('average_response_time', 0) > 1:
            recommendations.append("Optimize API performance - response time above 1 second")

        # Geographic recommendations
        geo_data = self.get_geographic_insights()
        if len(geo_data.get('market_sizes', {})) < 5:
            recommendations.append("Expand geographic reach - limited market coverage")

        return recommendations

    def export_data(self, format_type: str = 'json') -> str:
        """Export analytics data in specified format"""
        if format_type == 'json':
            return json.dumps(self.analytics_data, indent=2, default=str)
        elif format_type == 'csv':
            # Convert to CSV format
            quotes_df = pd.DataFrame(self.analytics_data['quotes'])
            sessions_df = pd.DataFrame(self.analytics_data['user_sessions'])
            api_df = pd.DataFrame(self.analytics_data['api_calls'])

            csv_data = {
                'quotes': quotes_df.to_csv(index=False),
                'sessions': sessions_df.to_csv(index=False),
                'api_calls': api_df.to_csv(index=False)
            }
            return json.dumps(csv_data)
        else:
            raise ValueError(f"Unsupported export format: {format_type}")

    def cleanup_old_data(self, days_to_keep: int = 90):
        """Clean up old analytics data"""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)

        # Clean up quotes
        self.analytics_data['quotes'] = [
            q for q in self.analytics_data['quotes']
            if datetime.fromisoformat(q['timestamp'].replace('Z', '+00:00')) > cutoff_date
        ]

        # Clean up sessions
        self.analytics_data['user_sessions'] = [
            s for s in self.analytics_data['user_sessions']
            if datetime.fromisoformat(s['timestamp'].replace('Z', '+00:00')) > cutoff_date
        ]

        # Clean up API calls
        self.analytics_data['api_calls'] = [
            a for a in self.analytics_data['api_calls']
            if datetime.fromisoformat(a['timestamp'].replace('Z', '+00:00')) > cutoff_date
        ]

        self.save_data()
        logger.info(f"Cleaned up analytics data older than {days_to_keep} days")
