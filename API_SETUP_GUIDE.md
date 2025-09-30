# 🚨 Critical: External API & Service Setup Guide

## ⚠️ Current State: Running on Mock Data

**IMPORTANT DISCOVERY**: Your AutoQuoter application is currently using **static mock data** for all pricing calculations. To make this production-ready, you need to connect to **real external data sources**.

## 📊 Required External Services & APIs

### 1. **Labor & Wage Data APIs** (CRITICAL)
**Current Issue**: Using hardcoded wage indexes in `geo_pricing.py`

**Required Services**:
- **Bureau of Labor Statistics (BLS) API** - Free government data
  - Occupational wage data by metropolitan area
  - Quarterly updates available
  - API Documentation: https://www.bls.gov/developers/

- **Alternative**: **Economic Modeling Specialists Intl (EMSI)** API
  - More detailed occupational data
  - Cost: $5,000-15,000/year for API access

### 2. **Material Cost APIs** (CRITICAL)
**Current Issue**: Static material costs in `geo_pricing.py`

**Required Services**:
- **RSMeans Data API** (Gordian/RSMeans)
  - Construction material costs by location
  - Cost: $2,000-8,000/year
  - Alternative: **Dodge Data & Analytics** material pricing

- **Free Alternative**: **Web scraping** material costs from suppliers
  - Home Depot, Lowe's, contractor supply APIs
  - Requires custom development ($5K-10K)

### 3. **CRM Integrations** (Already Coded)
**Status**: Integration code exists but needs API keys

**Required APIs**:
- **Salesforce API**
  - Cost: Included with Enterprise license ($150/user/month)
  - Setup: OAuth 2.0 authentication

- **HubSpot API**
  - Cost: Free tier available, Pro $800/year
  - Setup: API key authentication

### 4. **Field Service Management**
**Required APIs**:
- **Jobber API**
  - Cost: $29-129/month per user
  - Setup: OAuth 2.0 authentication

- **Alternative**: **ServiceTitan API**
  - Cost: $500-2,000/month base + per user

### 5. **Accounting Integration**
**Required APIs**:
- **QuickBooks Online API**
  - Cost: $30-200/month
  - Setup: OAuth 2.0, requires QuickBooks developer account

## 🏗️ Infrastructure Services Needed

### **Database** (Currently None)
**Required**: PostgreSQL database for production data
- **AWS RDS**: $20-100/month
- **Google Cloud SQL**: $10-50/month
- **DigitalOcean Managed Database**: $15-60/month

### **File Storage** (For certificates, reports)
- **AWS S3**: $0.023/GB/month + requests
- **Google Cloud Storage**: Similar pricing

### **Email Service** (For beta invites, notifications)
- **SendGrid**: $15-90/month
- **Amazon SES**: $0.10/1,000 emails
- **Mailgun**: $5-50/month

### **Monitoring & Analytics**
- **Application Monitoring**:
  - **Sentry**: $26-159/month (error tracking)
  - **DataDog**: $15-50/host/month

- **User Analytics**:
  - **Mixpanel**: $89-2,000/month
  - **Amplitude**: $49-2,000/month

## 🔑 API Keys & Authentication Setup

### Step 1: Government Data APIs (Free)
```bash
# BLS API Setup
1. Register at https://www.bls.gov/developers/
2. Get API registration key
3. Add to environment variables: BLS_API_KEY=your_key
```

### Step 2: CRM APIs
```bash
# Salesforce Setup
1. Create Salesforce Developer account
2. Set up Connected App for OAuth
3. Get Consumer Key and Secret
4. Add to environment: SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET

# HubSpot Setup
1. Create HubSpot developer account
2. Generate API key at https://developers.hubspot.com/
3. Add to environment: HUBSPOT_API_KEY
```

### Step 3: Field Service APIs
```bash
# Jobber Setup
1. Create Jobber developer account
2. Set up OAuth application
3. Get Client ID and Secret
4. Add to environment: JOBBER_CLIENT_ID, JOBBER_CLIENT_SECRET
```

### Step 4: Accounting APIs
```bash
# QuickBooks Setup
1. Create QuickBooks developer account
2. Set up OAuth application
3. Get Client ID and Secret
4. Add to environment: QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET
```

## 💾 Data Pipeline Setup

### Real-Time Data Updates
**Current Issue**: Static pricing data doesn't update

**Required Implementation**:
1. **Daily Data Sync Jobs**
   - BLS wage data updates
   - Material cost updates
   - Labor rate changes

2. **Database Schema**:
   ```sql
   CREATE TABLE pricing_data (
     location VARCHAR(100),
     job_type VARCHAR(50),
     wage_index DECIMAL(5,3),
     material_costs JSONB,
     labor_rates DECIMAL(8,2),
     last_updated TIMESTAMP,
     source VARCHAR(50)
   );
   ```

3. **Automated Scripts**:
   - Python scripts to fetch external data
   - Scheduled with cron or AWS Lambda
   - Error handling and fallback mechanisms

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/autoquoter

# External APIs
BLS_API_KEY=your_bls_key
RSMEANS_API_KEY=your_rsmeans_key

# CRM Integrations
SALESFORCE_CLIENT_ID=your_salesforce_id
SALESFORCE_CLIENT_SECRET=your_salesforce_secret
HUBSPOT_API_KEY=your_hubspot_key

# Field Service
JOBBER_CLIENT_ID=your_jobber_id
JOBBER_CLIENT_SECRET=your_jobber_secret

# Accounting
QUICKBOOKS_CLIENT_ID=your_quickbooks_id
QUICKBOOKS_CLIENT_SECRET=your_quickbooks_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 📋 Implementation Priority

### **Phase 1: Core Data (Week 1-2)**
1. Set up PostgreSQL database
2. Connect BLS API for wage data
3. Connect material cost API (RSMeans)
4. Create daily data sync jobs

### **Phase 2: Business Integrations (Week 3-4)**
1. Set up QuickBooks integration
2. Set up Jobber integration
3. Set up CRM integrations (Salesforce/HubSpot)

### **Phase 3: Infrastructure (Week 5-6)**
1. Set up email service
2. Configure monitoring
3. Set up error tracking

## 💰 Revised Cost Breakdown

### **API & Service Costs (Annual)**
- **BLS API**: Free
- **RSMeans Material Data**: $2,000-8,000
- **CRM APIs**: $1,000-3,000 (depending on tier)
- **Field Service API**: $350-1,500
- **Accounting API**: $360-2,400

### **Infrastructure Costs (Monthly)**
- **Database**: $20-100
- **File Storage**: $5-20
- **Email Service**: $15-50
- **Monitoring**: $30-100

**Total Monthly Cost: $70-270**
**Total Annual Cost: $3,000-15,000** (excluding development)

## ⚠️ Critical Dependencies

**Without these connections, your app will**:
- Show inaccurate pricing (using 2023 mock data)
- Not sync with real contractor tools
- Fail to provide real-time market data
- Not integrate with existing workflows

**This is why proper API setup is CRITICAL for launch.**

Would you like me to help you set up any of these specific integrations or create detailed setup guides for particular services?
