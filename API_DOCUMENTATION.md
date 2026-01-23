# API Documentation - CyberShield Portal

## Overview

The CyberShield Portal uses **tRPC** (TypeScript Remote Procedure Call) for all backend communication. tRPC provides end-to-end type safety, automatic serialization, and a simple procedure-based architecture.

All procedures are accessed through the `/api/trpc` gateway. The API automatically handles authentication, validation, and error handling.

---

## Authentication

### Session Management

All requests include a session cookie (`__Secure-auth`) that contains the user's authentication token. The session is automatically managed by the OAuth flow.

```typescript
// Get current user
const { data: user } = trpc.auth.me.useQuery();

// Logout
const logoutMutation = trpc.auth.logout.useMutation();
```

### Access Control

Procedures are protected using role-based middleware:

```typescript
// Public procedure (no auth required)
publicProcedure

// Protected procedure (auth required)
protectedProcedure

// Admin-only procedure
adminProcedure
```

---

## Incident Management API

### 1. Submit Incident

**Procedure**: `incident.submit`  
**Type**: Mutation (POST)  
**Access**: Protected (Reporter, Analyst, Admin)

**Request**:
```typescript
{
  title: string;              // Incident title (5-200 chars)
  description: string;        // Detailed description (20+ chars)
  incidentType: enum;         // phishing | malware | ddos | brute_force | data_exfiltration | other
  affectedSystems?: string[]; // List of affected system names
  timestamp: Date;            // When incident occurred
}
```

**Response**:
```typescript
{
  id: number;
  message: string;
  analysis: {
    classifiedType: string;
    severity: string;
    riskScore: number;
    threatIndicators: string[];
    recommendations: string[];
    llmAnalysis: string;
  }
}
```

**Example**:
```typescript
const submitMutation = trpc.incident.submit.useMutation();

submitMutation.mutate({
  title: "Suspicious Email Campaign",
  description: "Received 50+ phishing emails from domain similar to company.com...",
  incidentType: "phishing",
  affectedSystems: ["email_server", "workstation_01", "workstation_02"],
  timestamp: new Date(),
});
```

---

### 2. Get Incident by ID

**Procedure**: `incident.getById`  
**Type**: Query (GET)  
**Access**: Protected (Analyst, Admin)

**Request**:
```typescript
{
  id: number;  // Incident ID
}
```

**Response**:
```typescript
{
  id: number;
  reporterId: number;
  title: string;
  description: string;
  incidentType: string;
  severity: string;
  status: string;
  riskScore: number;
  affectedSystems: string[];
  createdAt: Date;
  updatedAt: Date;
  analysis: {
    classificationConfidence: number;
    predictedSeverity: string;
    riskScore: number;
    threatIndicators: string[];
    recommendations: string[];
    llmAnalysis: string;
  };
  notes: Array<{
    id: number;
    content: string;
    isInternal: boolean;
    createdBy: string;
    createdAt: Date;
  }>;
  timeline: Array<{
    eventType: string;
    previousValue: string;
    newValue: string;
    changedBy: string;
    timestamp: Date;
  }>;
}
```

---

### 3. List Incidents

**Procedure**: `incident.list`  
**Type**: Query (GET)  
**Access**: Protected (Analyst, Admin)

**Request**:
```typescript
{
  status?: string;      // Filter by status
  severity?: string;    // Filter by severity
  incidentType?: string; // Filter by type
  limit?: number;       // Max results (default 50)
  offset?: number;      // Pagination offset (default 0)
}
```

**Response**:
```typescript
Array<{
  id: number;
  title: string;
  description: string;
  incidentType: string;
  severity: string;
  status: string;
  riskScore: number;
  createdAt: Date;
  reporterName: string;
}>
```

**Example**:
```typescript
const { data: incidents } = trpc.incident.list.useQuery({
  status: "open",
  severity: "high",
  limit: 20,
});
```

---

### 4. Update Incident Status

**Procedure**: `incident.updateStatus`  
**Type**: Mutation (POST)  
**Access**: Protected (Analyst, Admin)

**Request**:
```typescript
{
  incidentId: number;
  status: enum;  // open | investigating | mitigated | resolved | false_positive
  notes?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  incident: { /* full incident object */ }
}
```

---

### 5. Assign Incident to Analyst

**Procedure**: `incident.assignAnalyst`  
**Type**: Mutation (POST)  
**Access**: Protected (Admin)

**Request**:
```typescript
{
  incidentId: number;
  analystId: number;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 6. Get Analytics Dashboard Data

**Procedure**: `incident.getAnalytics`  
**Type**: Query (GET)  
**Access**: Protected (Analyst, Admin)

**Response**:
```typescript
{
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    investigating: number;
    mitigated: number;
    resolved: number;
    false_positive: number;
  };
  byType: {
    phishing: number;
    malware: number;
    ddos: number;
    brute_force: number;
    data_exfiltration: number;
    other: number;
  };
  avgRiskScore: number;
}
```

---

## User Management API

### 1. List All Users

**Procedure**: `user.list`  
**Type**: Query (GET)  
**Access**: Protected (Admin)

**Response**:
```typescript
Array<{
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  lastSignedIn: Date;
}>
```

---

### 2. Update User Role

**Procedure**: `user.updateRole`  
**Type**: Mutation (POST)  
**Access**: Protected (Admin)

**Request**:
```typescript
{
  userId: number;
  role: enum;  // admin | analyst | reporter
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 3. Get Current User

**Procedure**: `auth.me`  
**Type**: Query (GET)  
**Access**: Public (returns null if not authenticated)

**Response**:
```typescript
{
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
} | null
```

---

## Analyst Notes API

### 1. Add Note to Incident

**Procedure**: `notes.add`  
**Type**: Mutation (POST)  
**Access**: Protected (Analyst, Admin)

**Request**:
```typescript
{
  incidentId: number;
  content: string;      // Note content
  isInternal: boolean;  // Internal notes not visible to reporters
}
```

**Response**:
```typescript
{
  id: number;
  content: string;
  isInternal: boolean;
  createdBy: string;
  createdAt: Date;
}
```

---

### 2. Get Notes for Incident

**Procedure**: `notes.getByIncident`  
**Type**: Query (GET)  
**Access**: Protected (Analyst, Admin)

**Request**:
```typescript
{
  incidentId: number;
}
```

**Response**:
```typescript
Array<{
  id: number;
  content: string;
  isInternal: boolean;
  createdBy: string;
  createdAt: Date;
}>
```

---

## Audit Logging API

### 1. Get Audit Logs

**Procedure**: `audit.list`  
**Type**: Query (GET)  
**Access**: Protected (Analyst, Admin)

**Request**:
```typescript
{
  incidentId?: number;  // Filter by incident
  userId?: number;      // Filter by user
  action?: string;      // Filter by action type
  limit?: number;       // Max results
  offset?: number;      // Pagination
}
```

**Response**:
```typescript
Array<{
  id: number;
  userId: number;
  userName: string;
  incidentId?: number;
  action: string;
  resourceType: string;
  changes: Record<string, any>;
  timestamp: Date;
}>
```

---

## Error Handling

All API errors follow the tRPC error format:

```typescript
{
  code: string;        // UNAUTHORIZED | FORBIDDEN | NOT_FOUND | BAD_REQUEST | INTERNAL_SERVER_ERROR
  message: string;     // Human-readable error message
  data?: {
    zodError?: any;    // Validation errors
  }
}
```

**Example Error Response**:
```json
{
  "code": "UNAUTHORIZED",
  "message": "You must be logged in to access this resource"
}
```

---

## Rate Limiting

- **Incident Submission**: 10 per minute per user
- **Analytics Queries**: 30 per minute per user
- **Admin Operations**: 5 per minute per user

---

## WebSocket Support

The API supports real-time updates via WebSocket for:
- Incident status changes
- New incident notifications
- Analytics updates

```typescript
// Subscribe to incident updates
const subscription = trpc.incident.onUpdate.subscribe(
  { incidentId: 123 },
  {
    onData: (data) => {
      console.log("Incident updated:", data);
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  }
);

// Cleanup
subscription.unsubscribe();
```

---

## Request/Response Examples

### Example 1: Submit Phishing Incident

**Request**:
```bash
curl -X POST https://cybershield.example.com/api/trpc/incident.submit \
  -H "Content-Type: application/json" \
  -H "Cookie: __Secure-auth=..." \
  -d '{
    "title": "Mass Phishing Campaign Detected",
    "description": "Received 150+ emails from noreply@company-security.com with password reset links. Domain is spoofed.",
    "incidentType": "phishing",
    "affectedSystems": ["email_server", "user_workstations"],
    "timestamp": "2026-01-22T23:00:00Z"
  }'
```

**Response**:
```json
{
  "result": {
    "data": {
      "id": 42,
      "message": "Incident submitted and analyzed",
      "analysis": {
        "classifiedType": "phishing",
        "severity": "high",
        "riskScore": 78.5,
        "threatIndicators": ["spoofed_domain", "mass_campaign", "credential_harvesting"],
        "recommendations": [
          "Enable advanced email filtering",
          "Deploy MFA on all accounts",
          "Conduct security awareness training"
        ],
        "llmAnalysis": "This is a sophisticated phishing campaign targeting multiple users..."
      }
    }
  }
}
```

### Example 2: List High-Severity Incidents

**Request**:
```bash
curl -X GET "https://cybershield.example.com/api/trpc/incident.list?severity=high&limit=10" \
  -H "Cookie: __Secure-auth=..."
```

**Response**:
```json
{
  "result": {
    "data": [
      {
        "id": 42,
        "title": "Mass Phishing Campaign Detected",
        "description": "Received 150+ emails...",
        "incidentType": "phishing",
        "severity": "high",
        "status": "investigating",
        "riskScore": 78.5,
        "createdAt": "2026-01-22T23:00:00Z",
        "reporterName": "John Doe"
      }
    ]
  }
}
```

---

## SDK Usage Examples

### React Hook Usage

```typescript
import { trpc } from '@/lib/trpc';

function IncidentForm() {
  const submitMutation = trpc.incident.submit.useMutation({
    onSuccess: (data) => {
      console.log('Incident submitted:', data);
      toast.success('Incident reported successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (formData) => {
    submitMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={submitMutation.isPending}>
        {submitMutation.isPending ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Query with Filters

```typescript
function IncidentList() {
  const [filters, setFilters] = useState({ status: 'open' });
  
  const { data: incidents, isLoading } = trpc.incident.list.useQuery(filters);

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {incidents?.map((incident) => (
            <li key={incident.id}>{incident.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## References

- [tRPC Documentation](https://trpc.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Zod Validation](https://zod.dev/)
