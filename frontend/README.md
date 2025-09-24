# Frontend

This directory contains the user interfaces for AutoQuoter.

## Files

- `index.html`: Main consumer interface for quote requests
- `dashboard.html`: Contractor dashboard for managing quotes and leads
- `market-trends.html`: Market trends dashboard for regional intelligence and competitive analysis
- `integrations.html`: External integrations management interface
- `analytics.html`: Advanced analytics dashboard with business intelligence and reporting

## How to Run

1. Start the backend server: `python backend/app.py`
2. Open `index.html` in a web browser for consumer interface
3. Open `dashboard.html` in a web browser for contractor dashboard
4. Open `market-trends.html` in a web browser for market trends dashboard
5. Open `integrations.html` in a web browser for external integrations management
6. Open `analytics.html` in a web browser for advanced analytics dashboard
7. All interfaces connect to the backend API at `http://localhost:5000`

## Features

### Consumer Interface
- User-friendly form for service type, location, and complexity
- Displays quote ranges with Fair Market Certificate
- Responsive design for mobile and desktop

### Contractor Dashboard
- Overview of total quotes, active leads, and conversion rates
- Recent activity feed with quote requests
- Upcoming appointments management
- Analytics and lead tracking

### Market Trends Dashboard
- Regional demand heatmap with interactive charts
- Price trend analysis over time
- Competitor analysis and market share visualization
- Real-time market intelligence for contractors

### Integrations Management
- Connect with QuickBooks, Jobber, Salesforce, HubSpot
- OAuth integration setup
- Real-time sync status monitoring
- Centralized integration management

### Advanced Analytics Dashboard
- Comprehensive business intelligence and reporting
- Real-time key metrics and KPIs
- Interactive charts and data visualizations
- Quote analytics, user behavior, and performance metrics
- Geographic market insights and trends
- Automated insights and recommendations
- Data export capabilities
