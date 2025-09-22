from flask import Flask
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Security configuration
def configure_security(app):
    # Enable HTTPS and security headers
    csp = {
        'default-src': ['\'self\''],
        'script-src': ['\'self\'', 'https://cdn.jsdelivr.net'],
        'style-src': ['\'self\'', 'https://fonts.googleapis.com'],
        'img-src': ['\'self\'', 'data:'],
        'font-src': ['\'self\'', 'https://fonts.gstatic.com']
    }

    talisman = Talisman(
        app,
        content_security_policy=csp,
        force_https=True,
        session_cookie_secure=True,
        session_cookie_http_only=True
    )

    # Rate limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )

    # GDPR/CCPA compliance settings
    app.config['GDPR_ENABLED'] = True
    app.config['CCPA_ENABLED'] = True

    return talisman, limiter

# Data handling policies
def handle_personal_data(data):
    # Implement data minimization
    # Log data access for GDPR
    # Provide data portability
    # Handle data deletion requests
    return data

def anonymize_data(data):
    # Remove or hash personal identifiers
    return data
