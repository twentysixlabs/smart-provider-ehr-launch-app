# EHR Marketplace Certification Guide

> **Status**: 🚧 Phase 3 - Certification Preparation
> 
> This guide covers the certification process for Epic App Orchard, Cerner Code Console, and Athena Marketplace.

---

## Overview

EHR marketplace certification is required to deploy your SMART on FHIR app in production EHR environments. Each vendor has specific requirements, timelines, and approval processes.

**Estimated Timeline**:
- **Epic**: 6-8 weeks
- **Cerner**: 4-6 weeks
- **Athena**: 6-8 weeks
- **Total**: 3-6 months (can run in parallel)

---

## Epic App Orchard Certification

### Prerequisites

✅ **Technical Requirements**:
- [x] SMART on FHIR integration working in sandbox
- [x] OAuth 2.0 with PKCE implemented
- [x] FHIR R4 compliance
- [x] Performance: Page load < 2 seconds
- [x] Responsive design (mobile/tablet/desktop)
- [x] Error handling and logging
- [ ] httpOnly cookies (security best practice)

✅ **Business Requirements**:
- [ ] Epic App Orchard account
- [ ] Business Associate Agreement (BAA) if handling PHI
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support contact information

### Step 1: Register Your App

**Process**:
1. Create account at https://apporchard.epic.com/
2. Navigate to "My Apps" > "Create New App"
3. Fill out app information:
   - App name
   - Description (what it does)
   - Category (Clinical Documentation, Patient Engagement, etc.)
   - Screenshots
   - Support contact

**Required Information**:
- OAuth Client ID (get from Epic)
- Redirect URI (must be HTTPS in production)
- Scopes requested (be specific, minimize scope creep)
- Launch types supported (EHR launch, patient standalone, etc.)

### Step 2: Sandbox Testing

**Test Scenarios** (Epic requires all):
- [x] EHR launch with patient context
- [x] OAuth authorization flow
- [x] Token exchange
- [x] FHIR API reads (Patient, Observation, Condition, etc.)
- [ ] FHIR API writes (DocumentReference, Observation, etc.)
- [x] Token refresh
- [ ] Error scenarios (invalid token, missing scope, etc.)
- [ ] Performance under load

**Epic Sandbox Environment**:
```
Base URL: https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
Authorization: https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
Token: https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token
```

**Test Patients**:
- Use Epic's test patient database
- Document all test scenarios with screenshots

### Step 3: Security Questionnaire

Epic requires detailed security documentation. Key areas:

**Application Security**:
- [ ] How is PHI encrypted in transit? (TLS 1.3)
- [ ] How is PHI encrypted at rest? (Database encryption)
- [ ] How are secrets managed? (Environment variables, not hardcoded)
- [ ] How are tokens stored? (httpOnly cookies, not localStorage)
- [ ] How is authentication handled? (Better Auth + SMART on FHIR)

**Audit & Logging**:
- [x] All PHI access logged
- [x] User actions tracked
- [x] Logs retained for 7 years (HIPAA requirement)
- [ ] Log aggregation service (Axiom recommended)

**Data Handling**:
- [ ] What data is stored? (Tokens, user sessions, audit logs)
- [ ] Where is data stored? (Geographic location)
- [ ] How long is data retained?
- [ ] How is data deleted? (User deletion process)

**Incident Response**:
- [ ] Breach notification process
- [ ] Security incident escalation
- [ ] Contact for security issues

### Step 4: Performance Testing

**Epic Requirements**:
- Initial page load: < 2 seconds
- Subsequent interactions: < 1 second
- No memory leaks
- No console errors

**Testing Tools**:
```bash
# Lighthouse performance audit
npx lighthouse https://your-app.com --view

# Load testing
npm install -g artillery
artillery quick --count 10 --num 50 https://your-app.com
```

**Performance Checklist**:
- [x] Code splitting implemented
- [x] React Query caching
- [x] Image optimization
- [ ] CDN for static assets
- [ ] Server-side rendering (optional)
- [ ] Service worker for offline (optional)

### Step 5: Submit for Review

**Submission Checklist**:
- [ ] All sandbox tests passing
- [ ] Security questionnaire completed
- [ ] Performance metrics documented
- [ ] Screenshots of app in action
- [ ] Support documentation
- [ ] Privacy policy URL
- [ ] Terms of service URL

**Submit via Epic App Orchard**:
1. Navigate to app dashboard
2. Click "Submit for Review"
3. Provide all required documentation
4. Wait for Epic review team

**Review Timeline**: 6-8 weeks

### Step 6: Address Feedback

Epic will provide feedback. Common issues:

**Technical**:
- Scope creep (requesting unnecessary scopes)
- Performance issues
- Error handling gaps
- UI/UX problems

**Security**:
- Token storage in localStorage (use httpOnly cookies)
- Missing audit logs
- Insufficient encryption

**Business**:
- Missing privacy policy
- Incomplete terms of service
- Support contact issues

### Step 7: Production Approval

Once approved:
- [ ] Epic provides production CLIENT_ID
- [ ] Update production configuration
- [ ] Deploy to production
- [ ] Test in production environment
- [ ] Monitor for issues

---

## Cerner Code Console Certification

### Prerequisites

✅ **Technical Requirements**:
- [x] SMART on FHIR integration working in sandbox
- [x] OAuth 2.0 with PKCE
- [x] FHIR R4 compliance
- [x] Tenant ID handling
- [x] `Prefer: return=representation` header for writes

✅ **Business Requirements**:
- [ ] Cerner developer account
- [ ] Oracle Health partnership agreement (for production)
- [ ] Privacy policy
- [ ] Terms of service

### Step 1: Register Your App

**Process**:
1. Create account at https://code-console.cerner.com/
2. Navigate to "My Applications" > "New Application"
3. Fill out application form

**Required Information**:
- App name and description
- Redirect URIs (HTTPS only)
- FHIR version (R4)
- Scopes requested
- App logo (512x512 PNG)

### Step 2: Sandbox Testing

**Cerner Sandbox**:
```
Base URL: https://fhir-myrecord.cerner.com/r4/{tenant_id}
Well-Known: https://fhir-myrecord.cerner.com/r4/{tenant_id}/.well-known/smart-configuration
```

**Test Scenarios**:
- [x] EHR launch with patient context
- [x] Tenant ID extraction from ISS
- [x] FHIR reads
- [ ] FHIR writes with Prefer header
- [x] Token refresh
- [ ] Multi-tenant scenarios

### Step 3: Validation & Testing

**Cerner Validation**:
- FHIR resource validation is stricter than Epic
- All required fields must be present
- Extensions must be properly formatted
- OperationOutcome errors should be handled

**Testing Checklist**:
- [ ] All FHIR resources validate
- [ ] Write operations return 201 Created
- [ ] Prefer header returns created resource
- [ ] Tenant ID properly handled
- [ ] Error handling for all scenarios

### Step 4: Production Review

**Submission**:
1. Complete Cerner security questionnaire
2. Provide app demo/walkthrough
3. Submit production access request
4. Wait for review (4-6 weeks)

**Cerner-Specific Requirements**:
- Comprehensive error handling
- Detailed audit logging
- Data retention policy
- HIPAA compliance documentation

### Step 5: Production Deployment

Once approved:
- [ ] Cerner provides production endpoints
- [ ] Update configuration with production CLIENT_ID
- [ ] Deploy and test
- [ ] Monitor for tenant-specific issues

---

## Athena Marketplace Certification

### Prerequisites

✅ **Technical Requirements**:
- [x] SMART on FHIR integration
- [x] OAuth 2.0 with PKCE
- [x] Practice ID handling
- [x] Rate limiting (10 req/sec)
- [x] Retry logic for 429 responses

✅ **Business Requirements**:
- [ ] Athena developer relations contact
- [ ] Marketplace partnership agreement
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Practice-level pricing (if applicable)

### Step 1: Developer Access

**Process**:
1. Contact Athena developer relations
2. Request sandbox access
3. Sign partnership agreement
4. Receive sandbox credentials

**Note**: Athena sandbox access is more restricted than Epic/Cerner

### Step 2: Sandbox Testing

**Athena Sandbox**:
```
Base URL: https://api.platform.athenahealth.com/fhir/r4/{practice_id}
```

**Test Scenarios**:
- [x] EHR launch with practice context
- [x] Practice ID extraction
- [x] FHIR reads
- [ ] FHIR writes
- [x] Rate limiting handling
- [ ] Retry on 429 errors

**Rate Limiting**:
- 10 requests/second per practice
- Must honor Retry-After header
- Implement exponential backoff

### Step 3: Marketplace Submission

**Submission Process**:
1. Complete Athena marketplace application
2. Provide app demo
3. Submit security documentation
4. Pricing information (if applicable)

**Athena-Specific Requirements**:
- Practice-level configuration
- Custom practice setup process
- Rate limiting compliance
- Support for Athena proprietary extensions

### Step 4: Production Approval

**Timeline**: 6-8 weeks

Once approved:
- [ ] Production API access granted
- [ ] Practice-specific configuration
- [ ] Deploy and test per practice
- [ ] Monitor rate limits

---

## Universal Certification Checklist

### Security Requirements (All Vendors)

- [ ] **Encryption**
  - [x] TLS 1.3 for all connections
  - [ ] Database encryption at rest
  - [ ] Secrets in environment variables (not code)

- [ ] **Authentication**
  - [x] OAuth 2.0 with PKCE
  - [x] Token refresh implemented
  - [ ] httpOnly cookies for token storage
  - [x] Session timeout (30 minutes recommended)

- [ ] **Audit Logging**
  - [x] All PHI access logged
  - [x] User actions tracked
  - [x] Timestamps and IP addresses
  - [ ] Logs sent to secure logging service (Axiom)
  - [ ] 7-year retention (HIPAA)

- [ ] **Data Handling**
  - [x] Minimal data collection
  - [x] No unnecessary PHI storage
  - [ ] Data deletion process
  - [ ] User data export process

### Performance Requirements (All Vendors)

- [ ] **Speed**
  - [ ] Initial load < 2 seconds
  - [ ] Interactions < 1 second
  - [ ] No blocking operations

- [ ] **Scalability**
  - [ ] Handles 100+ concurrent users
  - [ ] Database connection pooling
  - [ ] CDN for static assets

- [ ] **Monitoring**
  - [ ] Error tracking (Sentry recommended)
  - [ ] Performance monitoring (Vercel Analytics)
  - [ ] Uptime monitoring (UptimeRobot)

### Compliance Requirements (All Vendors)

- [ ] **HIPAA**
  - [x] Technical safeguards (encryption, access controls)
  - [ ] Administrative safeguards (policies, training)
  - [ ] Physical safeguards (secure servers)
  - [ ] BAA with all vendors (cloud, logging, etc.)

- [ ] **Documentation**
  - [ ] Privacy policy (HIPAA Privacy Rule)
  - [ ] Terms of service
  - [ ] Security documentation
  - [ ] Incident response plan
  - [ ] Breach notification process

- [ ] **Training**
  - [ ] HIPAA training for all staff
  - [ ] Security awareness
  - [ ] Incident response drills

---

## Certification Timeline

### Parallel Approach (Recommended)

Start all three certifications simultaneously:

```
Week 1-4:   Register all three vendors, begin sandbox testing
Week 5-8:   Complete sandbox tests, submit for review
Week 9-16:  Address vendor feedback, iterate
Week 17-24: Production approvals, deploy

Total: 6 months
```

### Sequential Approach

Do one vendor at a time:

```
Epic:   Weeks 1-8
Cerner: Weeks 9-14
Athena: Weeks 15-22

Total: 5-6 months
```

---

## Production Deployment Checklist

Once all certifications are complete:

### Pre-Deployment
- [ ] All vendor approvals received
- [ ] Production CLIENT_IDs configured
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Monitoring and alerting set up

### Deployment
- [ ] Deploy to production (Vercel/Cloudflare)
- [ ] Test with production credentials
- [ ] Verify vendor-specific configurations
- [ ] Monitor for errors

### Post-Deployment
- [ ] Monitor audit logs
- [ ] Track error rates
- [ ] Performance monitoring
- [ ] User feedback collection

---

## Ongoing Compliance

### Monthly
- [ ] Review audit logs
- [ ] Check error rates
- [ ] Performance review
- [ ] Security updates

### Quarterly
- [ ] Security assessment
- [ ] HIPAA compliance review
- [ ] Vendor relationship check-in
- [ ] User training refresher

### Annually
- [ ] Full security audit
- [ ] HIPAA risk assessment
- [ ] Privacy policy review
- [ ] Terms of service review
- [ ] Vendor recertification (if required)

---

## Resources

### Epic
- [App Orchard](https://apporchard.epic.com/)
- [FHIR Documentation](https://fhir.epic.com/)
- [Developer Support](https://galaxy.epic.com/)

### Cerner
- [Code Console](https://code-console.cerner.com/)
- [FHIR APIs](https://docs.oracle.com/en/industries/health/millennium-platform-apis/)
- [Developer Support](https://engineering.cerner.com/)

### Athena
- [Developer Portal](https://developer.athenahealth.com/)
- [FHIR Documentation](https://docs.athenahealth.com/api/guides/fhir)
- [Developer Relations](mailto:developer@athenahealth.com)

### Compliance
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)
- [HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/)
- [SMART App Launch](https://build.fhir.org/ig/HL7/smart-app-launch/)
- [FHIR R4 Spec](https://hl7.org/fhir/R4/)

---

**Status**: 📋 Certification Preparation Complete  
**Next**: Begin vendor registrations and sandbox testing  
**Timeline**: 3-6 months to full production certification
