name: "Base PRP Template"
description: |

## Purpose of this Template

This document provides a standardized Product Requirement Prompt (PRP) template for implementing new features or making significant changes to any codebase. PRPs serve as comprehensive specifications that provide AI coding assistants with sufficient context to implement a feature correctly.

## How to Use This Template

1. Copy this template to create a new PRP
2. Replace the placeholders with your specific implementation details
3. Include sufficient context for each section, referencing existing code paths
4. Be explicit about implementation patterns to follow
5. Include examples where helpful
6. Reference any external documentation, resources, or code patterns
7. Fill out all sections, using "N/A" only when a section truly doesn't apply

---

## Goal

[Concise statement of what this PRP aims to achieve]

## Why

- [Business justification explaining why this change is needed]
- [Who will benefit from this implementation]
- [The value this feature brings to the project]
- [How it integrates with or enhances existing functionality]

## What

[Detailed explanation of the feature or change to be implemented, including:]

- [Core functionality]
- [Key components]
- [User/system interactions]
- [Scope boundaries]

## Endpoints/APIs to Implement

[If applicable, list the API endpoints or interfaces to be created/modified:]

Example:
<Name> – [METHOD] /path – one-line purpose

- Params (typed)
- Success response shape
- Failure response shape

Example:
**[Endpoint Name]**

- [HTTP Method] [Path]
- [Brief description]
- [Key parameters]
- [Response format]

Example:
**[Endpoint Name]**

- [HTTP Method] [Path]
- [Brief description]
- [Key parameters]
- [Response format]

## Current Directory Structure

```
[Provide a tree-like representation of the current relevant directory structure]
├── [directory]
│   ├── [file]
│   └── [subdirectory]
│       ├── [file]
│       └── [file]
```

## Proposed Directory Structure

```
[Provide a tree-like representation of the proposed directory structure with new files]
├── [directory]
│   ├── [existing file]
│   ├── [new file]
│   └── [subdirectory]
│       ├── [existing file]
│       ├── [new file] Specify file content when appropriate
│       └── [new file] Specify file content when appropriate
```

## Files to Reference

- [File path 1] (read_only) [Brief description of how this file should be used as reference]
- [File path 2] (read_only) [Brief description of its relevance]
- [Documentation URL] (read_only) [Brief description of documentation]
- [Example file path] (read_only) [Explanation of the pattern to follow]

## Files to Implement (concept)

### [Component Category 1]

1. `[file_path]` - [Brief description]

```[language]
[Sample code or structure illustrating the implementation concept]
```

2. `[file_path]` - [Brief description]

```[language]
[Sample code or structure illustrating the implementation concept]
```

### [Component Category 2]

1. `[file_path]` - [Brief description]

```[language]
[Sample code or structure illustrating the implementation concept]
```

## Architecture Diagrams

[Visual representations help clarify complex systems. Use Mermaid diagrams for easy maintenance.]

### System Architecture

```mermaid
[Component interaction diagram showing:
- Frontend components
- Backend services
- External integrations
- Data flow between components]
```

### Sequence Diagram (for complex workflows)

```mermaid
[Request/response flow showing:
- User actions
- API calls
- Database operations
- External service calls]
```

### Data Model

```mermaid
[Entity relationship diagram showing:
- Database tables/collections
- Relationships and cardinality
- Key fields]
```

### UI Wireframes (if applicable)

[Mockups, Figma links, or ASCII sketches of:

- Key user interfaces
- User flows
- Mobile vs desktop views]

## Implementation Notes

### [Topic 1]

- [Detailed implementation guidance]
- [Technical considerations]
- [Design patterns to follow]
- [Edge cases to handle]

### [Topic 2]

- [Detailed implementation guidance]
- [Technical considerations]
- [Design patterns to follow]
- [Edge cases to handle]

## Edge Cases & Error Handling

### Expected Edge Cases

| Scenario            | Expected Behavior                   | User Experience                            | Implementation                  |
| ------------------- | ----------------------------------- | ------------------------------------------ | ------------------------------- |
| [Network timeout]   | [Retry with exponential backoff]    | [Loading spinner + error toast]            | [Axios retry logic]             |
| [Invalid file type] | [Reject upload immediately]         | [Clear error message with supported types] | [Frontend + backend validation] |
| [Concurrent edits]  | [Last write wins with notification] | [Show conflict warning]                    | [Optimistic locking]            |

### Error States & User Messages

| Error Code | User-Facing Message                | Technical Details          | User Action Required  |
| ---------- | ---------------------------------- | -------------------------- | --------------------- |
| [400]      | ["Invalid data format"]            | [Validation error details] | [Fix input and retry] |
| [413]      | ["File too large (max 50MB)"]      | [Payload exceeds limit]    | [Reduce file size]    |
| [429]      | ["Too many requests, please wait"] | [Rate limit exceeded]      | [Wait and retry]      |

### Graceful Degradation

- **Must Work (Critical Path)**: [Core features that must function]
- **Can Degrade (Enhanced Features)**: [Nice-to-have features that can fail gracefully]
- **Fallback Strategies**: [What happens when dependencies fail]

## Observability & Monitoring

[Our stack: Axiom (logs/traces), PostHog (analytics/events)]

### Axiom Logging & Queries

**What to Log**:

- [API endpoint calls with duration]
- [Error events with stack traces]
- [User actions with context (userId, workspaceId)]
- [Performance-critical operations]

**Key Axiom Queries**:

```
[Query name]: [APL query for monitoring this feature]
[Example: "API Latency P95": `['http.request'] | where path == '/api/knowledge/upload' | summarize percentiles(duration, 95) by bin(_time, 5m)`]
```

**Performance Metrics**:

- API latency: p50 <100ms, p95 <500ms, p99 <1s
- [Feature-specific metrics]

### PostHog Events & Analytics

**Events to Track**:
| Event Name | When Triggered | Properties | Purpose |
|------------|----------------|------------|---------|
| [knowledge_base_created] | [User creates knowledge base] | [workspaceId, userId, name] | [Track feature adoption] |
| [document_uploaded] | [File upload completes] | [fileType, fileSize, duration] | [Monitor upload success rate] |

**Feature Flags** (if applicable):

- [Flag name]: [Purpose and rollout strategy]
- [Example: `knowledge_management_v2`]: Enable new search UI for 10% → 50% → 100%

**User Behavior Metrics**:

- [Conversion rate for this feature]
- [Time to complete key workflows]
- [Error rate per user action]

### Slack Alerts

**Alert Conditions**:
| Alert Name | Trigger | Severity | Channel | Response Time |
|------------|---------|----------|---------|---------------|
| [High error rate] | [>5% errors in 5min] | [Critical] | [#alerts-prod] | [Immediate] |
| [Slow API] | [P95 >2s for 10min] | [Warning] | [#alerts-prod] | [Next business day] |

**Alert Template**:

```
🚨 [Feature Name] Alert
Metric: [Metric name]
Current Value: [Value]
Threshold: [Threshold]
Runbook: [Link to incident response doc]
```

## Deployment Strategy

[Our stack: Vercel auto-deploy (dev → staging → production), PostHog feature flags]

### Feature Flag Configuration

**Flag Setup** (PostHog):

```typescript
// Flag name: [feature_name_v1]
// Description: [What this flag controls]
// Rollout strategy:
{
  enabled: true,
  rolloutPercentage: 10, // Start at 10%
  filters: {
    // Optional: Target specific users/workspaces
    workspaceId: ['workspace-123'] // Beta testers
  }
}
```

**Gradual Rollout Plan**:

1. **10% Rollout** (Day 1): Internal team + beta customers
   - Monitor: Error rates, performance, user feedback
   - Success criteria: <1% error rate, positive feedback
2. **50% Rollout** (Day 2-3): Half of users
   - Monitor: Same metrics at scale
   - Success criteria: Metrics stable, no critical bugs
3. **100% Rollout** (Day 4+): All users
   - Monitor: Continue monitoring for 1 week

### Deployment Checklist

**Pre-Deploy**:

- [ ] Code merged to `main` branch (triggers Vercel deploy)
- [ ] Feature flag created in PostHog (default: OFF)
- [ ] Staging deployment tested (automatic)
- [ ] Production deploy completed (automatic)

**Post-Deploy**:

- [ ] Enable feature flag for internal team (1%)
- [ ] Monitor Axiom for errors (15 minutes)
- [ ] Check PostHog for event tracking
- [ ] Verify Slack alerts are configured

### Rollback Procedure

**When to Rollback**:

- Error rate >5% for this feature
- Critical bug affecting user data
- Performance degradation (P95 >2x baseline)
- User-reported blocker issues

**Rollback Steps**:

1. **Immediate**: Disable feature flag in PostHog (takes effect instantly)
2. **If flag disable insufficient**: Git revert + redeploy
   ```bash
   git revert [commit-hash]
   git push origin main
   # Vercel auto-deploys to staging → production
   ```
3. **Database migrations** (if applicable): Convex handles forward-only migrations
   - If rollback needed: Deploy fix forward, don't revert schema
4. **Communication**: Post in #engineering Slack about rollback

## Security & Compliance Checkpoint

[Required for healthcare/HIPAA features]

### PHI Handling Checklist

**Does this feature handle PHI (Protected Health Information)?**

- [ ] Yes → Complete security review (required)
- [ ] No → Standard review sufficient

**If YES, ensure**:

- [ ] All PHI is encrypted at rest (Convex handles this)
- [ ] All PHI is encrypted in transit (TLS 1.3)
- [ ] PHI is never logged to Axiom (mask sensitive data)
- [ ] Access is workspace-scoped (multi-tenant isolation)
- [ ] Audit logging is in place (who accessed what PHI, when)

### Security Review Triggers

**Requires Security Review if**:

- [ ] Handles PHI (patient data, medical records)
- [ ] New authentication/authorization logic
- [ ] External API integrations (third-party services)
- [ ] File uploads (potential for malicious files)
- [ ] User-generated content (XSS risk)

**Security Checklist**:

- [ ] Input validation (frontend + backend)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF protection (Next.js handles this)
- [ ] Rate limiting (prevent abuse)

### Compliance Considerations

**HIPAA Requirements**:

- [ ] Business Associate Agreement (BAA) in place for third-party services
- [ ] Audit trail for PHI access (log all reads/writes)
- [ ] Secure data deletion process (when user requests)
- [ ] Incident response plan documented

**Data Retention**:

- [How long is data stored?]
- [Deletion policy when user cancels?]
- [Backup retention period?]

## Validation Gates

- [Specific criteria that must be met for implementation to be considered complete]
- [Testing requirements]
- [Performance metrics]
- [Compatibility requirements]
- [Explicit test commands to run]
- [Expected outcomes]

## Definition of Done

[Realistic for startup: Required vs Aspirational]

### ✅ Required (Blocking)

**Code Complete**:

- [ ] Code merged to `main` branch
- [ ] AI code review passed + human review approved
- [ ] No linting errors (`bun run lint`)
- [ ] No TypeScript errors (`bun run type-check`)

**Testing** (Pragmatic):

- [ ] **Critical path tested**: Core user workflow works end-to-end
- [ ] **Manual QA**: Feature tested on staging by engineer
- [ ] **Playwright E2E**: If user-facing, add 1-2 key scenarios
- [ ] Unit tests: For complex logic only (not 100% coverage required)

**Production Ready**:

- [ ] Feature flag configured in PostHog
- [ ] Axiom queries created for monitoring
- [ ] PostHog events tracking key actions
- [ ] Rollback procedure documented

**Security** (If PHI involved):

- [ ] Security checklist completed
- [ ] PHI masking verified in logs
- [ ] Workspace isolation tested

### 🎯 Aspirational (Nice to Have)

**Documentation**:

- [ ] Notion doc updated with feature overview
- [ ] In-app help text added (if user-facing)
- [ ] API docs updated (if new endpoints)

**Testing Coverage**:

- [ ] 70%+ test coverage (aim for, not blocking)
- [ ] Integration tests for complex workflows

**Performance**:

- [ ] Load testing (for high-traffic features)
- [ ] Performance benchmarks documented

## Implementation Checkpoints/Testing

### 1. [Checkpoint Name]

- [Steps to implement this checkpoint]
- [Testing approach]
- [Expected results]
- [Command to verify: `example test command`]

### 2. [Checkpoint Name]

- [Steps to implement this checkpoint]
- [Testing approach]
- [Expected results]
- [Command to verify: `example test command`]

## Demo & Release Communication

[Fill the gap: Demo prep + release notes]

### Demo Preparation

**Demo Script** (for stakeholders/customers):

1. [Step 1]: [Action + Expected Result]
2. [Step 2]: [Action + Expected Result]
3. [Step 3]: [Key value proposition to highlight]

**Demo Data Requirements**:

- [Test accounts needed]
- [Sample data to prepare]
- [Edge cases to showcase]

**Demo Recording** (optional):

- [ ] Record Loom video of feature
- [ ] Add to product demo library
- [ ] Share in Slack #product-updates

### In-App Help Updates

**Help Text to Add**:
| UI Element | Help Text | Tooltip/Modal |
|------------|-----------|---------------|
| [Button/Feature] | ["Brief explanation"] | [Optional longer explanation] |

**Onboarding Updates** (if applicable):

- [ ] Add to new user onboarding flow
- [ ] Update product tour
- [ ] Create feature announcement banner

### Release Notes

**Notion Template** (or in-app):

```markdown
## [Feature Name] - [Date]

### What's New

[User-friendly description of the feature]

### Why It Matters

[Value proposition - what problem does this solve?]

### How to Use It

1. [Step-by-step instructions]
2. [Include screenshots if helpful]

### Learn More

- [Link to help docs]
- [Link to demo video]
```

**Communication Channels**:

- [ ] Post in #product-updates Slack
- [ ] Update Notion release notes page
- [ ] Send email to beta customers (if major feature)
- [ ] Update in-app changelog (if we have one)

## Dependency Matrix

[Make dependencies explicit to avoid blockers]

### Upstream Dependencies (Blockers)

| Dependency             | Owner        | Status        | ETA      | Blocker For   | Risk Level | Mitigation              |
| ---------------------- | ------------ | ------------- | -------- | ------------- | ---------- | ----------------------- |
| [Auth Service Updates] | [Team A]     | [In Progress] | [Week 2] | [Login Flow]  | [High]     | [Use mock auth in dev]  |
| [API Endpoint]         | [Engineer 2] | [Not Started] | [Week 1] | [Frontend UI] | [Medium]   | [Create stub responses] |

### Downstream Dependencies (Who Depends on Us)

| Team/System   | What They Need  | Delivery Date   | Communication Plan      |
| ------------- | --------------- | --------------- | ----------------------- |
| [Mobile Team] | [API endpoints] | [End of Week 1] | [Daily standup updates] |
| [Feature X]   | [New component] | [Week 2]        | [Slack #engineering]    |

### External Dependencies

| Service/API  | Purpose      | SLA      | Fallback Strategy     | BAA Required |
| ------------ | ------------ | -------- | --------------------- | ------------ |
| [OpenAI API] | [Embeddings] | [99.9%]  | [Cache + retry logic] | [Yes]        |
| [Stripe API] | [Payments]   | [99.99%] | [Queue + retry]       | [No]         |

## Technical Debt & Future Work

[Be honest about trade-offs and what's deferred]

### Known Compromises (Ship Now, Fix Later)

**Shortcuts Taken**:

- [Trade-off 1]: [Why taken] → [Fix by: Date/Phase]
- [Example: "Using in-memory cache instead of Redis"]: [Keep it simple for MVP] → [Add Redis in Phase 2]

**Refactoring Needed**:

- [Code smell 1]: [Impact] → [Refactor priority: Low/Medium/High]
- [Example: "Duplicated logic in 3 files"]: [Harder to maintain] → [High: Refactor in 2 weeks]

**Scalability Limits**:

- [Current capacity]: [Number of users/requests]
- [Breaking point]: [When will this not scale?]
- [Plan]: [How to address before we hit the limit]

### Future Enhancements (Out of Scope for This PRP)

**Phase 2 Features** (Intentionally Deferred):

- [Feature 1]: [Why deferred] → [Target: Q2 2025]
- [Example: "Advanced search filters"]: [MVP has basic search] → [Add after user feedback]

**Nice-to-Haves** (Didn't Make the Cut):

- [Feature 1]: [Why not included]
- [Example: "Dark mode"]: [Low priority, focus on core value first]

**Optimization Opportunities**:

- [Performance optimization 1]: [Current: 2s, Target: 500ms] → [When: After load testing]
- [Example: "Lazy load images"]: [Current: Load all, Target: On-demand] → [Phase 2]

### Tech Debt Tracking (Informal)

[Capture for future reference, even if not formally tracked]

**Add to "Tech Debt" Notion Board**:

- [ ] [Debt item 1]: [Impact + Effort estimate]
- [ ] [Debt item 2]: [Link to code location]

**Revisit Timeline**:

- [ ] Review after 1 month in production
- [ ] Prioritize based on user impact + engineering pain

## Post-Launch Plan

[Startup-style iteration: Ship → Monitor → Learn → Iterate]

### Week 1 Post-Launch

**Monitoring Checklist**:

- [ ] Day 1: Monitor Axiom for errors every 2 hours
- [ ] Day 2-3: Check PostHog events and user behavior
- [ ] Day 4-7: Review Slack feedback in #customer-feedback
- [ ] End of week: Analyze usage patterns and error trends

**Quick Wins to Look For**:

- [User pain points that can be fixed quickly]
- [Confusing UI elements based on support tickets]
- [Performance bottlenecks identified in Axiom]

**User Feedback Collection**:

- [ ] Send survey to beta users (if major feature)
- [ ] Monitor in-app feedback widget (if we have one)
- [ ] Schedule 2-3 user interviews
- [ ] Review Slack #customer-feedback channel

### Month 1 Iterations

**Bug Fixes** (Priority):

- [Critical bugs]: Fix within 24 hours
- [High-priority bugs]: Fix within 1 week
- [Low-priority bugs]: Backlog for future sprints

**Quick Improvements** (Based on Feedback):

- [Improvement 1]: [Why] → [Effort: 1-2 hours]
- [Improvement 2]: [Why] → [Effort: Half day]

**Performance Optimizations** (If Needed):

- [Optimization 1]: [Current metric] → [Target metric]
- [Data-driven]: Based on Axiom performance queries

### Long-Term Roadmap

**Quarter 1** (Next 3 months):

- [Major enhancement 1]: [Description]
- [Integration 1]: [Third-party service]

**Quarter 2** (Months 4-6):

- [Phase 2 features]: [From "Future Enhancements" section]

**Tech Debt Paydown**:

- [Refactoring sprint]: [Dedicated time to clean up]
- [Performance optimization week]: [Focus on speed]

## Other Considerations

- [Security concerns]
- [Performance implications]
- [Scalability factors]
- [Backward compatibility]
- [Future extensibility]
- [Mobile app considerations (4th engineer)]
- [Potential risks or limitations]

---

## Template Usage Examples

### For Server Endpoints

- Goal: "Implement REST API endpoints for user authentication"
- Files to Reference: "src/auth/existing_auth_service.js for auth logic patterns"
- Validation Gates: "All endpoints must include proper error handling with appropriate HTTP status codes"

### For UI Components

- Goal: "Create a reusable dropdown component with support for search and multi-select"
- Files to Reference: "src/components/Button.jsx for styling conventions"
- Implementation Notes: "Component must be accessible and keyboard navigable"

### For Database Schema Changes

- Goal: "Add support for storing user preferences"
- Files to Reference: "database/migrations/20230101_create_users.sql for migration patterns"
- Validation Gates: "Migration must be reversible with a corresponding down migration"

### For Refactoring

- Goal: "Refactor authentication service to use dependency injection"
- Files to Reference: "src/services/payment_service.js for DI pattern examples"
- Other Considerations: "Must maintain backward compatibility with existing service interfaces"
