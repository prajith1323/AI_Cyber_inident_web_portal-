# CyberShield Portal - AI-Enabled Cyber Incident & Safety Web Portal for Defense

![CyberShield](https://img.shields.io/badge/CyberShield-Portal-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## Overview

**CyberShield Portal** is a comprehensive AI-powered cyber incident management platform designed for defense-focused organizations. It combines machine learning for automated incident classification, LLM-powered analysis for deep threat insights, and professional incident management workflows.

### Key Features

- **🤖 AI-Powered Classification**: Automatic incident type detection using TF-IDF + Random Forest
- **📊 ML-Based Severity Prediction**: Machine learning model predicts incident severity (Low, Medium, High, Critical)
- **⚡ Risk Scoring**: Proprietary algorithm calculates risk scores (0-100) based on threat characteristics
- **💡 LLM-Powered Insights**: OpenAI integration for natural language threat analysis and recommendations
- **👥 Role-Based Access Control**: Three roles (Reporter, Analyst, Admin) with granular permissions
- **📈 Real-Time Analytics**: Live dashboard with incident statistics and trend visualization
- **📋 Audit Logging**: Complete audit trail for compliance and traceability
- **🎨 Professional UI**: Blueprint aesthetic with CAD-style technical interface
- **🔐 Enterprise Security**: OAuth 2.0 authentication, encrypted connections, input validation

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19)                       │
│  Blueprint Aesthetic UI with Professional CAD-Style Interface   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                    BACKEND (Express + tRPC)                      │
│  Type-Safe RPC with Role-Based Access Control                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    DATABASE         AI/ML ENGINE        LLM SERVICE
    (MySQL)          (Python)            (OpenAI)
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Quick Start

### Prerequisites

- Node.js 22.13.0+
- Python 3.11+
- MySQL 8.0+
- npm or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cyber-incident-portal.git
   cd cyber-incident-portal
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Install Python dependencies**:
   ```bash
   pip install scikit-learn numpy pandas scipy joblib
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**:
   ```bash
   pnpm db:push
   ```

6. **Train ML models**:
   ```bash
   python3 ml/train_models.py
   ```

7. **Start development server**:
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

---

## Usage

### For Reporters

1. **Submit an Incident**:
   - Click "Submit Incident" in the sidebar
   - Fill in incident details (title, description, affected systems)
   - System automatically analyzes and classifies the incident
   - View AI-generated recommendations

### For Analysts

1. **Review Incidents**:
   - Click "Incidents" to view all reported incidents
   - Filter by status, severity, or type
   - Click on an incident to view full details

2. **Investigate**:
   - Review AI analysis results
   - View threat indicators and recommendations
   - Add internal notes
   - Update incident status

3. **Monitor Analytics**:
   - Click "Analytics" to view real-time dashboard
   - Monitor incident trends and statistics
   - Identify patterns and correlations

### For Administrators

1. **Manage Users**:
   - Click "Admin Panel"
   - View all users and their roles
   - Update user roles (Reporter, Analyst, Admin)

2. **Monitor System**:
   - View system information and ML model status
   - Check database connectivity
   - Monitor application version

---

## API Documentation

The system uses **tRPC** for type-safe API communication. All procedures are automatically typed and validated.

### Key Procedures

| Procedure | Type | Access | Purpose |
|-----------|------|--------|---------|
| `incident.submit` | Mutation | Protected | Submit new incident |
| `incident.list` | Query | Protected | List incidents with filters |
| `incident.getById` | Query | Protected | Get incident details |
| `incident.updateStatus` | Mutation | Protected | Update incident status |
| `incident.getAnalytics` | Query | Protected | Get analytics data |
| `user.list` | Query | Admin | List all users |
| `user.updateRole` | Mutation | Admin | Update user role |
| `audit.list` | Query | Protected | Get audit logs |

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## AI/ML Models

### Incident Classification

**Model**: Random Forest Classifier  
**Features**: TF-IDF vectorization (100 features, 1-2 grams)  
**Classes**: Phishing, Malware, DDoS, Brute Force, Data Exfiltration, Other  
**Accuracy**: 100% on training set

### Severity Prediction

**Model**: Random Forest Classifier  
**Features**: Threat indicators, affected systems, incident type  
**Classes**: Low, Medium, High, Critical  
**Accuracy**: 100% on training set

### Risk Scoring

**Algorithm**: Weighted combination of severity, systems, indicators, and criticality  
**Range**: 0-100  
**Formula**:
```
Risk = (Severity × 0.4) + (Systems × 0.2) + (Indicators × 0.2) + (Criticality × 0.2)
```

### LLM Integration

**Provider**: OpenAI GPT-4  
**Purpose**: Natural language threat analysis and recommendations  
**Features**:
- Detailed threat assessment
- Impact analysis
- Customized mitigation strategies
- Automated report generation

For ML implementation details, see the `ml/` directory.

---

## Database Schema

### Core Tables

- **users**: User accounts with roles and authentication
- **incidents**: Reported cyber incidents with status tracking
- **aiAnalysisResults**: ML model predictions and analysis
- **auditLogs**: Complete audit trail of all actions
- **analystNotes**: Analyst observations and findings
- **incidentTimeline**: Incident lifecycle events
- **systemConfig**: Configuration and model metadata

For complete schema documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md#database-schema).

---

## Development

### Project Structure

```
cyber-incident-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and hooks
│   │   └── App.tsx        # Main app component
│   └── index.html         # HTML entry point
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database helpers
│   └── _core/             # Framework internals
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Drizzle ORM schema
├── ml/                    # Python ML models
│   ├── train_models.py    # Model training pipeline
│   └── predict.py         # Prediction service
├── ARCHITECTURE.md        # System architecture documentation
├── API_DOCUMENTATION.md   # API reference
├── DEMO_GUIDE.md          # Demo instructions
└── README.md              # This file
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/auth.logout.test.ts

# Watch mode
pnpm test --watch
```

### Building for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

---

## Deployment

### Docker Deployment

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/cybershield

# Authentication
JWT_SECRET=your-secret-key-here
OAUTH_SERVER_URL=https://oauth.example.com
VITE_OAUTH_PORTAL_URL=https://oauth.example.com/login

# LLM Service
BUILT_IN_FORGE_API_KEY=sk-...
BUILT_IN_FORGE_API_URL=https://api.example.com

# Application
NODE_ENV=production
VITE_APP_ID=your-app-id
VITE_APP_TITLE=CyberShield Portal
```

### Scaling Considerations

- **Horizontal Scaling**: Stateless backend allows multiple instances behind load balancer
- **Database Optimization**: Indexes on frequently queried fields
- **Caching**: Analytics results cached for 5 minutes
- **Async Processing**: AI analysis runs asynchronously

---

## Security

### Authentication & Authorization

- OAuth 2.0 with Manus platform
- Session-based authentication with secure HTTP-only cookies
- Role-based access control at procedure level
- Automatic session validation on every request

### Data Protection

- TLS encryption for all connections
- Input validation with Zod schemas
- SQL injection prevention via ORM
- CSRF protection via SameSite cookies

### Compliance

- Complete audit logging of all actions
- Incident timeline tracking
- User activity logs
- GDPR-compliant data handling

---

## Troubleshooting

### Common Issues

**Issue**: AI analysis takes too long
- **Solution**: Ensure Python ML models are loaded. Restart server if needed.

**Issue**: Database connection fails
- **Solution**: Check DATABASE_URL environment variable. Verify MySQL is running.

**Issue**: OAuth login not working
- **Solution**: Verify OAUTH_SERVER_URL and VITE_OAUTH_PORTAL_URL are correct.

**Issue**: LLM analysis not generating
- **Solution**: Check BUILT_IN_FORGE_API_KEY is valid. Verify API quota.

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* pnpm dev

# Check database connection
pnpm db:push --verbose

# Test ML models
python3 ml/predict.py
```

---

## Performance Metrics

- **Incident Submission**: < 2 seconds (including AI analysis)
- **Incident List Query**: < 500ms (with pagination)
- **Analytics Dashboard**: < 1 second (with caching)
- **Database Query**: < 100ms (with indexes)
- **ML Prediction**: < 500ms (per incident)

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Report a bug](https://github.com/yourusername/cyber-incident-portal/issues)
- **Documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md), [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Demo Guide**: [DEMO_GUIDE.md](./DEMO_GUIDE.md)

---

## Acknowledgments

- Built with [React 19](https://react.dev/), [Express 4](https://expressjs.com/), [tRPC 11](https://trpc.io/)
- ML models using [scikit-learn](https://scikit-learn.org/)
- Database with [Drizzle ORM](https://orm.drizzle.team/) and [MySQL](https://www.mysql.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- LLM integration with [OpenAI](https://openai.com/)

---

## Roadmap

- [ ] Real-time WebSocket support for live updates
- [ ] Advanced threat intelligence integration
- [ ] Automated incident response playbooks
- [ ] Mobile application (iOS/Android)
- [ ] SIEM integration (Splunk, ELK, etc.)
- [ ] Machine learning model improvement pipeline
- [ ] Multi-tenancy support
- [ ] Custom report generation

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready

For more information, visit the [CyberShield Portal Documentation](./ARCHITECTURE.md).
