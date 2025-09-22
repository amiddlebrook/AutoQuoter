# Frontend

This directory contains the user interfaces for AutoQuoter.

## Files

- `index.html`: Main consumer interface for quote requests
- `dashboard.html`: Contractor dashboard for managing quotes and leads

## How to Run

1. Start the backend server: `python backend/app.py`
2. Open `index.html` in a web browser for consumer interface
3. Open `dashboard.html` in a web browser for contractor dashboard
4. Both interfaces connect to the backend API at `http://localhost:5000`

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
