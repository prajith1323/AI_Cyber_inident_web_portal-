# AI-Enabled Cyber Incident & Safety Web Portal for Defense

## System Architecture

### Overview

The CyberShield Portal is a comprehensive cyber incident management platform that combines AI-powered analysis with a professional technical interface. The system is designed for defense-focused organizations to report, analyze, and respond to cyber threats in real-time.

The architecture follows a three-tier model: **Frontend (React + Tailwind)**, **Backend (Express + tRPC)**, and **AI/ML Engine (Python + scikit-learn)**, with a **MySQL database** for persistent storage and **audit logging** for compliance.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React 19 + Tailwind CSS 4 + Blueprint Aesthetic UI       │  │
│  │  ├─ Dashboard (Real-time Analytics)                       │  │
│  │  ├─ Incident Submission Form                              │  │
│  │  ├─ Incident Management Interface                         │  │
│  │  ├─ Admin Panel (User Management)                         │  │
│  │  └─ Role-Based Navigation                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ tRPC + WebSocket
┌──────────────────────────┴──────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Express 4 + tRPC 11 (Type-Safe RPC)                       │  │
│  │  ├─ /api/trpc/incident.* (Incident Management)            │  │
│  │  ├─ /api/trpc/user.* (User Management)                    │  │
│  │  ├─ /api/trpc/audit.* (Audit Logging)                     │  │
│  │  ├─ /api/trpc/notes.* (Analyst Notes)                     │  │
│  │  └─ /api/oauth/callback (Manus OAuth)                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   DATABASE   │  │  AI/ML ENGINE│  │  LLM SERVICE │
│   (MySQL)    │  │  (Python)    │  │  (OpenAI)    │
│              │  │              │  │              │
│ ├─ Users     │  │ ├─ TF-IDF    │  │ ├─ Analysis  │
│ ├─ Incidents │  │ ├─ RF Model  │  │ ├─ Reports  │
│ ├─ Analysis  │  │ ├─ Risk Score│  │ └─ Insights │
│ ├─ Audit Logs│  │ └─ Recommend │  └──────────────┘
│ └─ Notes     │  │              │
└──────────────┘  └──────────────┘
```

---

## Core Components

### 1. Frontend (Client Layer)

**Technology Stack**: React 19, Tailwind CSS 4, TypeScript, Recharts

**Key Features**:
- **Professional Blueprint Aesthetic**: Deep royal blue background with precise grid pattern and CAD-style technical elements
- **Role-Based Interface**: Different views for Reporter, Analyst, and Admin roles
- **Real-Time Dashboard**: Live incident statistics and severity distribution charts
- **Responsive Design**: Mobile-first approach with sidebar navigation

**Pages**:
- `Dashboard.tsx`: Main dashboard with sidebar navigation and incident overview
- `IncidentSubmission.tsx`: Form for reporting new incidents with AI analysis integration
- `IncidentList.tsx`: Filterable list of incidents with status and severity indicators
- `Analytics.tsx`: Real-time analytics with Recharts visualizations
- `AdminPanel.tsx`: User management and system configuration interface

### 2. Backend (API Layer)

**Technology Stack**: Express 4, tRPC 11, Node.js, TypeScript

**Architecture Pattern**: Procedure-based RPC (Remote Procedure Call) with automatic type inference

**Key Routers**:

| Router | Procedures | Access Level |
|--------|-----------|--------------|
| `incident` | submit, getById, list, updateStatus, assignAnalyst, getAnalytics | Protected (Role-based) |
| `user` | list, updateRole, me | Admin/Analyst |
| `audit` | list | Analyst/Admin |
| `notes` | add, getByIncident | Analyst/Admin |
| `auth` | me, logout | Public |

**Data Flow**:
1. Client calls tRPC procedure (e.g., `trpc.incident.submit.useMutation()`)
2. Request routed to `/api/trpc/incident.submit` endpoint
3. Backend validates input with Zod schemas
4. Procedure executes with role-based access control
5. Response serialized with SuperJSON (preserves Date, Map, Set types)
6. Client receives typed response with automatic error handling

### 3. AI/ML Engine

**Technology Stack**: Python 3, scikit-learn, NumPy, Pandas

**Pipeline Architecture**:

```
Incident Description
        │
        ▼
    TF-IDF Vectorizer
    (100 features, bigrams)
        │
        ▼
    Feature Vector (100-dim)
        │
    ┌───┴───┐
    │       │
    ▼       ▼
Type RF  Severity RF
Classifier Classifier
    │       │
    ▼       ▼
Type + Severity
Confidence Scores
    │
    ▼
Risk Score Calculator
(0-100 scale)
    │
    ▼
Threat Indicators &
Recommendations
```

**Models**:
- **TF-IDF Vectorizer**: Extracts textual features from incident descriptions (100 features, 1-2 grams)
- **Random Forest Type Classifier**: Predicts incident type (5 classes: Phishing, Malware, DDoS, Brute Force, Data Exfiltration)
- **Random Forest Severity Classifier**: Predicts severity level (4 classes: Low, Medium, High, Critical)
- **Risk Score Calculator**: Combines severity, affected systems, threat indicators, and system criticality

**Training Data**: 15 annotated cyber incident examples covering all incident types and severity levels

**Model Performance**: 100% accuracy on training set (validation on production incidents)

### 4. Database Schema

**Primary Tables**:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts with role-based access | id, openId, name, email, role (admin/analyst/reporter) |
| `incidents` | Reported cyber incidents | id, reporterId, title, description, incidentType, severity, status, riskScore, timestamp |
| `aiAnalysisResults` | ML model predictions and analysis | incidentId, classificationConfidence, predictedSeverity, riskScore, threatIndicators, recommendations, llmAnalysis |
| `auditLogs` | Complete audit trail of all actions | userId, incidentId, action, resourceType, changes, timestamp |
| `analystNotes` | Analyst observations and findings | incidentId, analystId, content, isInternal |
| `incidentTimeline` | Incident lifecycle events | incidentId, eventType, previousValue, newValue, changedBy |
| `systemConfig` | Configuration and ML model metadata | key, value, description |

---

## Data Flow: Incident Submission to Analysis

### Step 1: Incident Submission
```
Reporter fills form:
├─ Title
├─ Description
├─ Incident Type (optional - AI will classify)
├─ Affected Systems
└─ Timestamp
        │
        ▼
Form validation (Zod)
        │
        ▼
Create incident record (status: "open")
        │
        ▼
Log audit event ("incident_created")
        │
        ▼
Trigger async AI analysis
```

### Step 2: AI Analysis Pipeline
```
Incident description
        │
        ▼
Call Python ML service:
├─ TF-IDF vectorization
├─ Type classification (Random Forest)
├─ Severity prediction (Random Forest)
├─ Risk score calculation
├─ Threat indicator extraction
└─ Recommendation generation
        │
        ▼
Call LLM (OpenAI):
├─ Analyze threat patterns
├─ Provide detailed insights
└─ Generate mitigation steps
        │
        ▼
Store analysis results in DB
        │
        ▼
Update incident severity & risk score
```

### Step 3: Analyst Review & Action
```
Analyst views incident:
├─ AI predictions (type, severity, risk score)
├─ Threat indicators
├─ Defensive recommendations
├─ LLM analysis
└─ Analyst notes
        │
        ▼
Analyst can:
├─ Confirm/override AI predictions
├─ Assign to team member
├─ Update incident status
├─ Add internal notes
└─ Track timeline
        │
        ▼
Audit log records all changes
```

---

## Role-Based Access Control (RBAC)

### Role Definitions

| Role | Permissions | Use Case |
|------|-----------|----------|
| **Reporter** | Submit incidents, view own incidents, view recommendations | Security team members reporting threats |
| **Analyst** | View all incidents, update status, assign incidents, add notes, view analytics, access audit logs | Security analysts investigating threats |
| **Admin** | All analyst permissions + user management, system configuration | Security team leads |

### Access Control Implementation

```typescript
// Protected procedures enforce role checks
const analystProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "analyst" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

// Frontend conditionally renders based on role
{isAnalyst && <IncidentList />}
{isAdmin && <AdminPanel />}
```

---

## Security & Compliance

### Authentication
- **OAuth 2.0** via Manus platform
- Session-based authentication with secure HTTP-only cookies
- Automatic session validation on every request

### Data Protection
- **Role-based access control** at procedure level
- **Audit logging** of all user actions and data modifications
- **Encrypted database** connection (TLS)
- **Input validation** with Zod schemas on all endpoints

### Compliance Features
- **Complete audit trail**: Every incident change tracked with timestamp, user ID, and change details
- **Internal vs. external notes**: Sensitive analyst observations marked as internal
- **Incident timeline**: Full lifecycle tracking from creation to resolution
- **User activity logs**: All administrative actions recorded

---

## Incident Classification System

### Incident Types

| Type | Indicators | Risk Factors |
|------|-----------|-------------|
| **Phishing** | Suspicious email, credential request, fake domain | Mass campaign, admin targeting |
| **Malware** | Suspicious executable, file encryption, ransomware, backdoor | C2 communication, file encryption |
| **DDoS** | High traffic, multiple sources, service degradation | DNS amplification, connection exhaustion |
| **Brute Force** | Failed logins, credential attack, admin targeting | RDP/SSH attacks, web application attacks |
| **Data Exfiltration** | Large transfer, external destination, database access | PII exposure, insider threat, bulk copy |

### Severity Levels

| Level | Criteria | Response Time |
|-------|----------|---------------|
| **Critical** | Ransomware, backdoor, large data loss, admin compromise | Immediate (< 1 hour) |
| **High** | Active DDoS, ongoing brute force, confirmed malware | Urgent (< 4 hours) |
| **Medium** | Phishing campaign, suspicious activity, potential compromise | Standard (< 1 day) |
| **Low** | Isolated phishing attempt, failed attack, false positive | Routine (< 1 week) |

### Risk Score Calculation

```
Risk Score = (Severity × 0.4) + (Systems × 0.2) + (Indicators × 0.2) + (Criticality × 0.2)

Where:
- Severity: Low=10, Medium=40, High=70, Critical=100
- Systems: Count of affected systems (max 5)
- Indicators: Count of critical threat indicators (max 5)
- Criticality: +10 if database/file_server/dns_server/web_server affected
```

---

## Defensive Recommendations Engine

The system provides context-specific mitigation steps for each incident type:

### Phishing Mitigation
- Enable multi-factor authentication (MFA)
- Deploy advanced email filtering
- Conduct security awareness training
- Implement DMARC/SPF/DKIM authentication
- Monitor for credential compromise

### Malware Mitigation
- Isolate affected systems immediately
- Run full antivirus/malware scans
- Revoke compromised credentials
- Patch all systems to latest versions
- Implement application whitelisting
- Enable endpoint detection response (EDR)
- Restore from clean backups

### DDoS Mitigation
- Activate DDoS mitigation service
- Increase bandwidth capacity
- Implement rate limiting
- Block malicious IP ranges
- Enable geo-blocking if applicable
- Distribute traffic across data centers
- Contact ISP for upstream filtering

### Brute Force Mitigation
- Implement account lockout policy
- Enable MFA on all accounts
- Change passwords for targeted accounts
- Strengthen password policies
- Disable unnecessary remote access
- Implement IP-based access controls
- Monitor for successful logins from unusual locations

### Data Exfiltration Mitigation
- Revoke compromised user access
- Review data access logs
- Notify affected data subjects
- Implement Data Loss Prevention (DLP)
- Segment network to restrict access
- Enable encryption for sensitive data
- Monitor outbound network traffic
- Enforce least privilege access

---

## LLM Integration

The system integrates OpenAI's GPT models to provide natural language analysis:

### LLM Capabilities
1. **Incident Analysis**: Detailed threat assessment and impact analysis
2. **Mitigation Planning**: Customized response strategies
3. **Threat Intelligence**: Pattern recognition and correlation
4. **Report Generation**: Automated incident reports for stakeholders

### LLM Prompts

```typescript
// System prompt for incident analysis
"You are a cybersecurity expert. Analyze the incident and provide detailed insights 
about the threat, potential impact, and recommended response actions. Be concise but thorough."

// User prompt
`Incident Type: ${type}
Severity: ${severity}
Risk Score: ${riskScore}/100
Description: ${description}

Provide a brief analysis of this incident including potential impact and 
recommended immediate actions.`
```

---

## Deployment Architecture

### Environment Variables
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Session signing secret
- `OAUTH_SERVER_URL`: Manus OAuth provider
- `BUILT_IN_FORGE_API_KEY`: LLM service credentials
- `NODE_ENV`: Production/Development mode

### Build & Deployment
1. **Frontend**: Vite builds React app to static assets
2. **Backend**: esbuild bundles Express server with all dependencies
3. **Database**: Drizzle migrations applied on startup
4. **ML Models**: Python models loaded on backend initialization

---

## Performance Considerations

### Optimization Strategies
- **Database Indexing**: Indexes on frequently queried fields (status, severity, createdAt)
- **Query Optimization**: Pagination for incident lists (limit 50 by default)
- **Caching**: Incident analytics cached for 5 minutes
- **Async Processing**: AI analysis runs asynchronously to avoid blocking incident submission
- **Connection Pooling**: MySQL connection pool with max 10 connections

### Scalability
- **Horizontal Scaling**: Stateless backend allows multiple instances behind load balancer
- **Database Sharding**: Incidents can be sharded by organization or date range
- **ML Model Serving**: Python service can be containerized and scaled independently
- **CDN**: Static assets served from edge locations

---

## Monitoring & Logging

### Log Files
- `devserver.log`: Server startup and runtime events
- `browserConsole.log`: Client-side errors and warnings
- `networkRequests.log`: HTTP requests with status and duration
- `sessionReplay.log`: User interaction events for debugging

### Metrics to Track
- Incident submission rate
- AI analysis accuracy
- Average response time
- User engagement by role
- System uptime and availability

---

## Future Enhancements

1. **Real-Time Collaboration**: WebSocket support for live incident updates
2. **Advanced Analytics**: Machine learning for incident correlation and prediction
3. **Integration APIs**: Connectors for SIEM, EDR, and threat intelligence platforms
4. **Mobile App**: Native iOS/Android applications for on-the-go incident management
5. **Automated Response**: Playbooks for automated incident response actions
6. **Threat Intelligence**: Integration with external threat feeds and databases

---

## References

- [Express.js Documentation](https://expressjs.com/)
- [tRPC Documentation](https://trpc.io/)
- [scikit-learn Machine Learning](https://scikit-learn.org/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [OpenAI API](https://platform.openai.com/docs/)
