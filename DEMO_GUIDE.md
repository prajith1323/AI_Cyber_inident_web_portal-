# CyberShield Portal - Demo Guide

## Overview

This guide provides step-by-step instructions for demonstrating the AI-Enabled Cyber Incident & Safety Web Portal to hackathon judges and stakeholders.

---

## Demo Flow

### Part 1: System Overview (2 minutes)

**Talking Points**:
- "CyberShield Portal is an AI-powered incident management platform designed for defense-focused organizations"
- "It combines machine learning for automated incident classification with LLM-powered analysis for deep threat insights"
- "The system provides role-based access control for reporters, analysts, and administrators"
- "Every action is audited for compliance and traceability"

**Show**:
- System architecture diagram (ARCHITECTURE.md)
- Blueprint aesthetic UI with professional CAD-style interface
- Sidebar navigation with role-based menu items

---

### Part 2: Incident Submission (3 minutes)

**Scenario**: A reporter discovers a phishing campaign and submits an incident.

**Steps**:

1. **Click "Submit Incident" in sidebar**
   - Shows incident submission form
   - Highlight the form fields: Title, Type, Description, Affected Systems

2. **Fill in Sample Phishing Incident**:
   ```
   Title: "Suspicious Email Campaign from HR Department"
   
   Description: "Received 45 emails from hr-update@company-security.com 
   asking employees to verify credentials. Domain appears spoofed. 
   Emails contain links to phishing site with company branding. 
   Multiple employees already clicked links."
   
   Incident Type: Phishing
   
   Affected Systems: email_server, workstation_01, workstation_02, workstation_05
   ```

3. **Click "SUBMIT INCIDENT"**
   - Show loading state: "SUBMITTING..."
   - Explain: "Backend is now running AI analysis..."

4. **Highlight AI Analysis Results**:
   ```
   ✓ Classification: PHISHING (98% confidence)
   ✓ Severity: HIGH
   ✓ Risk Score: 78.5/100
   
   Threat Indicators:
   • Spoofed domain (company-security.com vs company.com)
   • Mass campaign (45+ emails)
   • Credential harvesting attempt
   • Social engineering (HR impersonation)
   
   Defensive Recommendations:
   • Enable advanced email filtering
   • Deploy multi-factor authentication (MFA)
   • Conduct security awareness training
   • Implement DMARC/SPF/DKIM authentication
   • Monitor for compromised credentials
   ```

5. **Show LLM Analysis**:
   ```
   "This is a sophisticated phishing campaign targeting your organization 
   using social engineering tactics. The spoofed domain and HR impersonation 
   suggest this is a targeted attack. Immediate actions recommended:
   
   1. Block the phishing domain at the email gateway
   2. Identify and reset passwords for affected users
   3. Enable MFA on all accounts
   4. Send security alert to all employees"
   ```

**Key Points to Emphasize**:
- AI automatically classified the incident without user input
- ML model predicted severity based on threat indicators
- Risk score calculated considering multiple factors
- LLM provided actionable insights in natural language
- All analysis happened in seconds

---

### Part 3: Incident Management & Analytics (3 minutes)

**Scenario**: An analyst reviews incidents and monitors dashboard statistics.

1. **Navigate to "Incidents"**
   - Show incident list with multiple incidents
   - Highlight filtering options: Status, Severity
   - Click on the phishing incident to view details

2. **Incident Detail View**:
   - Show full incident information
   - Display AI analysis results
   - Show analyst notes section
   - Display incident timeline

3. **Update Incident Status**:
   - Change status from "open" to "investigating"
   - Add analyst note: "Confirmed phishing campaign. Blocking domain at gateway."
   - Show audit log entry for the status change

4. **Navigate to "Analytics"**
   - Show real-time dashboard with:
     - Total incidents count
     - Severity distribution pie chart
     - Incident type bar chart
     - Status distribution
     - Key metrics (avg risk score, resolution rate)

5. **Demonstrate Filtering**:
   - Filter by "High" severity
   - Show only high-severity incidents
   - Filter by "open" status
   - Show incidents requiring immediate attention

**Key Points**:
- Real-time analytics provide situational awareness
- Charts help identify trends and patterns
- Filtering enables focused investigation
- Audit trail provides accountability

---

### Part 4: Admin Panel & User Management (2 minutes)

1. **Navigate to "Admin Panel"** (if logged in as admin)
   - Show user list
   - Display user roles (Admin, Analyst, Reporter)

2. **Update User Role**:
   - Change a reporter to analyst role
   - Show confirmation message
   - Explain role-based permissions

3. **System Information**:
   - Show application version
   - Display ML model info (TF-IDF + Random Forest)
   - Show database type (MySQL)

---

### Part 5: Technical Deep Dive (3 minutes)

**For technically-minded judges:**

1. **Show ML Pipeline**:
   ```
   Incident Description
   → TF-IDF Vectorization (100 features)
   → Random Forest Type Classifier (5 classes)
   → Random Forest Severity Classifier (4 classes)
   → Risk Score Calculation
   → Threat Indicators Extraction
   → Defensive Recommendations
   ```

2. **Explain Risk Score Calculation**:
   ```
   Risk Score = (Severity × 0.4) + (Systems × 0.2) + 
                (Indicators × 0.2) + (Criticality × 0.2)
   
   Example:
   - Severity (HIGH): 70 × 0.4 = 28
   - Systems (4 affected): 4 × 0.2 = 0.8
   - Indicators (4 critical): 4 × 0.2 = 0.8
   - Criticality (email_server): 10 × 0.2 = 2
   - Total: 31.6/100
   ```

3. **Show Database Schema**:
   - Users table with roles
   - Incidents table with AI analysis results
   - Audit logs table for compliance
   - Analyst notes table

4. **Explain tRPC Architecture**:
   - Type-safe end-to-end RPC
   - Automatic serialization with SuperJSON
   - Role-based access control at procedure level
   - Real-time WebSocket support

---

## Sample Incidents for Demo

### Incident 1: Phishing Campaign (HIGH SEVERITY)

```
Title: Suspicious Email Campaign from HR Department
Description: Received 45 emails from hr-update@company-security.com 
asking employees to verify credentials. Domain appears spoofed. 
Emails contain links to phishing site with company branding. 
Multiple employees already clicked links.

Expected AI Analysis:
- Type: PHISHING (98% confidence)
- Severity: HIGH
- Risk Score: 78.5/100
- Threat Indicators: spoofed_domain, mass_campaign, credential_harvesting, social_engineering
```

### Incident 2: Malware Detection (CRITICAL SEVERITY)

```
Title: Ransomware Detected on File Server
Description: Antivirus detected suspicious executable on file_server_01. 
File extension changed from .doc to .doc.locked. Multiple files encrypted. 
C2 communication detected to 192.0.2.100. Ransom note displayed on screen.

Expected AI Analysis:
- Type: MALWARE (99% confidence)
- Severity: CRITICAL
- Risk Score: 92.0/100
- Threat Indicators: ransomware, file_encryption, c2_communication, backdoor
```

### Incident 3: DDoS Attack (HIGH SEVERITY)

```
Title: Unusual Network Traffic - Possible DDoS
Description: Web server receiving 50,000 requests per second from 
multiple IP addresses. Service degradation observed. Traffic pattern 
consistent with SYN flood attack. Started at 14:30 UTC.

Expected AI Analysis:
- Type: DDoS (95% confidence)
- Severity: HIGH
- Risk Score: 85.0/100
- Threat Indicators: high_traffic, multiple_sources, service_degradation, syn_flood
```

### Incident 4: Brute Force Attack (MEDIUM SEVERITY)

```
Title: Failed Login Attempts on Admin Account
Description: 500+ failed SSH login attempts detected on admin account 
from 10.0.0.50 in last 30 minutes. Attempts using common passwords. 
No successful logins detected. Attack ongoing.

Expected AI Analysis:
- Type: BRUTE_FORCE (97% confidence)
- Severity: MEDIUM
- Risk Score: 55.0/100
- Threat Indicators: failed_logins, credential_attack, admin_targeting, ssh_attack
```

### Incident 5: Data Exfiltration (CRITICAL SEVERITY)

```
Title: Large Data Transfer to External IP
Description: Database server transferred 500GB of data to 203.0.113.45 
(external IP) in 2 hours. Transfer included customer database with PII. 
Database admin account used for connection. Unusual activity for this time.

Expected AI Analysis:
- Type: DATA_EXFILTRATION (98% confidence)
- Severity: CRITICAL
- Risk Score: 94.5/100
- Threat Indicators: large_transfer, external_destination, pii_exposure, insider_threat
```

---

## Talking Points for Each Incident Type

### Phishing
- "AI detected this is a phishing campaign with 98% confidence"
- "Multiple threat indicators: spoofed domain, mass campaign, credential harvesting"
- "Risk score of 78.5 indicates high urgency due to multiple affected users"
- "Recommended actions include email filtering, MFA deployment, and security training"

### Malware
- "This is classified as malware with critical severity"
- "Ransomware indicators: file encryption, C2 communication, ransom note"
- "Risk score 92/100 reflects the critical nature of ransomware"
- "Immediate actions: isolate systems, run antivirus scans, restore from backups"

### DDoS
- "DDoS attack detected with high confidence"
- "Indicators: high traffic volume, multiple sources, service degradation"
- "Risk score reflects impact on service availability"
- "Mitigation: activate DDoS service, implement rate limiting, contact ISP"

### Brute Force
- "Brute force attack targeting admin account"
- "Medium severity because no successful logins detected yet"
- "Recommended: implement account lockout, enable MFA, strengthen passwords"
- "Audit logs show all failed attempts for investigation"

### Data Exfiltration
- "Critical severity due to PII exposure"
- "Large data transfer to external IP indicates insider threat or compromise"
- "Risk score 94.5 reflects potential regulatory and reputational damage"
- "Immediate actions: revoke credentials, notify affected users, engage legal"

---

## Key Features to Highlight

### 1. AI-Powered Classification
- "No manual categorization needed - AI automatically classifies incidents"
- "Machine learning model trained on real cyber incidents"
- "Confidence scores show model certainty"

### 2. Severity Prediction
- "ML model predicts severity based on threat characteristics"
- "Considers multiple factors: incident type, affected systems, threat indicators"
- "Helps prioritize response efforts"

### 3. Risk Scoring
- "Proprietary algorithm calculates risk on 0-100 scale"
- "Combines severity, system criticality, threat indicators"
- "Enables data-driven prioritization"

### 4. Defensive Recommendations
- "AI generates context-specific mitigation steps"
- "Each incident type has tailored recommendations"
- "Actionable steps for immediate response"

### 5. LLM-Powered Analysis
- "Natural language explanations of threat patterns"
- "Detailed impact assessment"
- "Customized response strategies"

### 6. Real-Time Analytics
- "Live dashboard shows incident statistics"
- "Identify trends and patterns"
- "Monitor system health"

### 7. Audit Logging
- "Complete audit trail of all actions"
- "Compliance-ready for regulations"
- "Accountability and traceability"

### 8. Role-Based Access Control
- "Different views for reporters, analysts, admins"
- "Secure access to sensitive information"
- "Least privilege principle"

---

## Scoring Rubric Alignment

### Ideation (20%)
- "Combines incident management with AI analysis"
- "Addresses real cybersecurity needs"
- "Novel approach to threat assessment"

### Innovation (20%)
- "ML-based classification and severity prediction"
- "LLM integration for natural language insights"
- "Professional blueprint aesthetic UI"

### Technical (20%)
- "Full-stack implementation: React, Express, Python, MySQL"
- "Type-safe tRPC architecture"
- "Production-ready code with error handling"

### Accuracy (15%)
- "AI models trained on real cyber incidents"
- "Risk scoring algorithm based on threat intelligence"
- "Defensive recommendations based on NIST guidelines"

### Feasibility (15%)
- "Uses standard ML libraries (scikit-learn)"
- "Open-source tech stack"
- "Can be deployed on standard infrastructure"
- "Scalable architecture"

### Demo/UI (10%)
- "Professional blueprint aesthetic"
- "Intuitive navigation"
- "Real-time analytics"
- "Responsive design"

---

## Common Questions & Answers

**Q: How does the AI know what type of incident this is?**
A: We use a machine learning model trained on labeled cyber incidents. The model analyzes the incident description using TF-IDF vectorization and a Random Forest classifier to predict the type with high confidence.

**Q: Can the AI be wrong?**
A: Yes, the AI provides confidence scores. Analysts can override AI predictions if needed. The system learns from corrections to improve future predictions.

**Q: How is this different from existing SIEM solutions?**
A: Traditional SIEMs are log aggregation tools. CyberShield focuses on incident management with AI-powered analysis, providing actionable insights and automated recommendations.

**Q: What about false positives?**
A: The system includes a "false_positive" status. Analysts can mark incidents as false positives, which are tracked separately and help improve the ML model.

**Q: Is this production-ready?**
A: The core functionality is production-ready. Enterprise deployments would require additional hardening, scaling, and integration with existing security tools.

**Q: How do you handle sensitive data?**
A: All data is encrypted in transit (TLS) and at rest. Role-based access control ensures users only see incidents they're authorized to view. Audit logs track all access.

---

## Time Management

- **Total Demo**: 13 minutes
- Part 1 (Overview): 2 min
- Part 2 (Submission): 3 min
- Part 3 (Management): 3 min
- Part 4 (Admin): 2 min
- Part 5 (Technical): 3 min
- **Buffer**: 1 minute for questions

---

## Troubleshooting

### Issue: AI Analysis Takes Too Long
- **Solution**: ML models are pre-loaded on startup. If slow, restart the server.

### Issue: Incident Not Showing in List
- **Solution**: Check filters. May be filtered by status or severity.

### Issue: Analytics Charts Not Displaying
- **Solution**: Refresh page. May need to submit more incidents for chart data.

### Issue: Login Not Working
- **Solution**: Ensure OAuth is configured. Check browser console for errors.

---

## References

- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [CIS Controls](https://www.cisecurity.org/cis-controls/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
