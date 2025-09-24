import requests
import json
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class IntegrationService(ABC):
    """Base class for all external integrations"""

    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })

    @abstractmethod
    def authenticate(self) -> bool:
        """Authenticate with the external service"""
        pass

    @abstractmethod
    def sync_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync data with the external service"""
        pass

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request to external service"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            raise

class QuickBooksIntegration(IntegrationService):
    """QuickBooks integration for financial data"""

    def __init__(self, api_key: str, company_id: str):
        base_url = "https://quickbooks.api.intuit.com"
        super().__init__(api_key, base_url)
        self.company_id = company_id

    def authenticate(self) -> bool:
        """Authenticate with QuickBooks"""
        try:
            endpoint = f"/v3/company/{self.company_id}/companyinfo/{self.company_id}"
            response = self.make_request('GET', endpoint)
            return 'CompanyInfo' in response
        except Exception as e:
            logger.error(f"QuickBooks authentication failed: {e}")
            return False

    def sync_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync invoice and customer data"""
        try:
            # Sync customers
            customers = self.get_customers()
            # Sync invoices
            invoices = self.get_invoices()
            # Sync items
            items = self.get_items()

            return {
                'customers': customers,
                'invoices': invoices,
                'items': items,
                'last_sync': time.time()
            }
        except Exception as e:
            logger.error(f"QuickBooks sync failed: {e}")
            raise

    def get_customers(self) -> list:
        """Get customer list from QuickBooks"""
        endpoint = f"/v3/company/{self.company_id}/customers"
        return self.make_request('GET', endpoint).get('Customers', [])

    def get_invoices(self) -> list:
        """Get invoice list from QuickBooks"""
        endpoint = f"/v3/company/{self.company_id}/invoices"
        return self.make_request('GET', endpoint).get('Invoices', [])

    def get_items(self) -> list:
        """Get item list from QuickBooks"""
        endpoint = f"/v3/company/{self.company_id}/items"
        return self.make_request('GET', endpoint).get('Items', [])

class JobberIntegration(IntegrationService):
    """Jobber integration for field service management"""

    def __init__(self, api_key: str):
        base_url = "https://api.getjobber.com/api"
        super().__init__(api_key, base_url)

    def authenticate(self) -> bool:
        """Authenticate with Jobber"""
        try:
            response = self.make_request('GET', '/oauth/me')
            return 'user' in response
        except Exception as e:
            logger.error(f"Jobber authentication failed: {e}")
            return False

    def sync_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync job and client data"""
        try:
            # Sync clients
            clients = self.get_clients()
            # Sync jobs
            jobs = self.get_jobs()
            # Sync quotes
            quotes = self.get_quotes()

            return {
                'clients': clients,
                'jobs': jobs,
                'quotes': quotes,
                'last_sync': time.time()
            }
        except Exception as e:
            logger.error(f"Jobber sync failed: {e}")
            raise

    def get_clients(self) -> list:
        """Get client list from Jobber"""
        return self.make_request('GET', '/clients').get('clients', [])

    def get_jobs(self) -> list:
        """Get job list from Jobber"""
        return self.make_request('GET', '/jobs').get('jobs', [])

    def get_quotes(self) -> list:
        """Get quote list from Jobber"""
        return self.make_request('GET', '/quotes').get('quotes', [])

class CRMIntegration(IntegrationService):
    """Generic CRM integration (Salesforce, HubSpot, etc.)"""

    def __init__(self, api_key: str, base_url: str, crm_type: str):
        super().__init__(api_key, base_url)
        self.crm_type = crm_type

    def authenticate(self) -> bool:
        """Authenticate with CRM"""
        try:
            if self.crm_type == 'salesforce':
                response = self.make_request('GET', '/services/data/v58.0')
                return 'identity' in response
            elif self.crm_type == 'hubspot':
                response = self.make_request('GET', '/contacts/v1/lists/all/contacts/all')
                return 'contacts' in response
            return True
        except Exception as e:
            logger.error(f"CRM authentication failed: {e}")
            return False

    def sync_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync contact and opportunity data"""
        try:
            if self.crm_type == 'salesforce':
                contacts = self.get_salesforce_contacts()
                opportunities = self.get_salesforce_opportunities()
            elif self.crm_type == 'hubspot':
                contacts = self.get_hubspot_contacts()
                opportunities = self.get_hubspot_deals()
            else:
                contacts = []
                opportunities = []

            return {
                'contacts': contacts,
                'opportunities': opportunities,
                'last_sync': time.time()
            }
        except Exception as e:
            logger.error(f"CRM sync failed: {e}")
            raise

    def get_salesforce_contacts(self) -> list:
        """Get contacts from Salesforce"""
        return self.make_request('GET', '/services/data/v58.0/query/?q=SELECT+Id,Name,Email+FROM+Contact').get('records', [])

    def get_salesforce_opportunities(self) -> list:
        """Get opportunities from Salesforce"""
        return self.make_request('GET', '/services/data/v58.0/query/?q=SELECT+Id,Name,Amount+FROM+Opportunity').get('records', [])

    def get_hubspot_contacts(self) -> list:
        """Get contacts from HubSpot"""
        return self.make_request('GET', '/contacts/v1/lists/all/contacts/all').get('contacts', [])

    def get_hubspot_deals(self) -> list:
        """Get deals from HubSpot"""
        return self.make_request('GET', '/deals/v1/deal/paged').get('deals', [])

class IntegrationManager:
    """Manages all external integrations"""

    def __init__(self):
        self.integrations = {}
        self.load_integrations()

    def load_integrations(self):
        """Load integration configurations"""
        # In production, these would come from database/environment
        pass

    def add_integration(self, name: str, integration: IntegrationService):
        """Add a new integration"""
        self.integrations[name] = integration

    def sync_all(self) -> Dict[str, Any]:
        """Sync all integrations"""
        results = {}
        for name, integration in self.integrations.items():
            try:
                if integration.authenticate():
                    results[name] = integration.sync_data({})
                else:
                    results[name] = {'error': 'Authentication failed'}
            except Exception as e:
                results[name] = {'error': str(e)}

        return results

    def get_integration(self, name: str) -> Optional[IntegrationService]:
        """Get specific integration"""
        return self.integrations.get(name)
