#!/usr/bin/env python3
"""
ML Prediction Service for Cyber Incident Analysis

This module provides functions to:
1. Classify incident types using trained TF-IDF + Random Forest
2. Predict severity levels
3. Calculate risk scores
4. Generate threat indicators
5. Provide defensive recommendations

Can be called from Node.js backend via Python subprocess or API.
"""

import json
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from train_models import IncidentMLPipeline

# ============================================================================
# GLOBAL PIPELINE INSTANCE
# ============================================================================

_pipeline = None
_model_config = None

def load_models():
    """Load trained models from disk."""
    global _pipeline, _model_config
    
    if _pipeline is not None:
        return _pipeline
    
    try:
        # Load model configuration
        config_path = Path(__file__).parent / "models" / "incident_ml_config.json"
        if config_path.exists():
            with open(config_path, "r") as f:
                _model_config = json.load(f)
        
        # Initialize and train pipeline (models are trained from scratch)
        _pipeline = IncidentMLPipeline()
        _pipeline.train()
        
        return _pipeline
    except Exception as e:
        print(f"Error loading models: {e}", file=sys.stderr)
        raise

# ============================================================================
# THREAT INDICATORS & RECOMMENDATIONS
# ============================================================================

THREAT_INDICATORS_MAP = {
    "phishing": [
        "suspicious_email",
        "credential_request",
        "fake_domain",
        "malicious_link",
        "social_engineering"
    ],
    "malware": [
        "suspicious_executable",
        "file_encryption",
        "ransomware",
        "trojan",
        "backdoor",
        "c2_communication",
        "quarantined"
    ],
    "ddos": [
        "high_traffic",
        "multiple_sources",
        "service_degradation",
        "dns_amplification",
        "connection_exhaustion"
    ],
    "brute_force": [
        "failed_logins",
        "credential_attack",
        "admin_targeting",
        "rdp_attack",
        "failed_authentication",
        "web_brute_force"
    ],
    "data_exfiltration": [
        "large_transfer",
        "external_destination",
        "data_loss",
        "database_access",
        "bulk_copy",
        "pii_exposure",
        "insider_threat",
        "usb_transfer"
    ]
}

DEFENSIVE_RECOMMENDATIONS = {
    "phishing": [
        "Enable multi-factor authentication (MFA) on all email accounts",
        "Deploy advanced email filtering and URL scanning",
        "Conduct security awareness training for all users",
        "Implement DMARC, SPF, and DKIM email authentication",
        "Block suspicious email domains at the gateway",
        "Monitor for credential compromise in dark web"
    ],
    "malware": [
        "Isolate affected systems from network immediately",
        "Update and run full antivirus/malware scans on all systems",
        "Review and revoke compromised credentials",
        "Patch all systems and applications to latest versions",
        "Implement application whitelisting to prevent unauthorized executables",
        "Enable behavioral monitoring and endpoint detection response (EDR)",
        "Restore from clean backups after threat is eliminated"
    ],
    "ddos": [
        "Activate DDoS mitigation service or WAF rules",
        "Increase bandwidth capacity if possible",
        "Implement rate limiting on affected services",
        "Block malicious IP ranges at firewall/ISP level",
        "Enable geo-blocking if applicable",
        "Distribute traffic across multiple data centers",
        "Contact ISP for upstream filtering assistance"
    ],
    "brute_force": [
        "Implement account lockout policy after failed attempts",
        "Enable multi-factor authentication (MFA)",
        "Change passwords for targeted accounts immediately",
        "Review and strengthen password policies",
        "Disable remote access services if not needed",
        "Implement IP-based access controls",
        "Monitor for successful logins from unusual locations",
        "Consider using SSH keys instead of passwords"
    ],
    "data_exfiltration": [
        "Revoke access for compromised user accounts",
        "Review data access logs for unauthorized access",
        "Notify affected data subjects as required by regulations",
        "Implement Data Loss Prevention (DLP) controls",
        "Segment network to restrict data access",
        "Enable encryption for sensitive data at rest and in transit",
        "Monitor outbound network traffic for suspicious transfers",
        "Review and enforce least privilege access policies"
    ]
}

# ============================================================================
# PREDICTION FUNCTIONS
# ============================================================================

def analyze_incident(description, affected_systems=None, indicators=None):
    """
    Analyze a cyber incident and provide comprehensive predictions.
    
    Args:
        description (str): Incident description
        affected_systems (list): List of affected systems
        indicators (list): Known threat indicators
    
    Returns:
        dict: Analysis results including classification, severity, risk score, and recommendations
    """
    pipeline = load_models()
    
    # Get predictions
    predictions = pipeline.predict(description)
    
    incident_type = predictions["incident_type"]
    type_confidence = predictions["type_confidence"]
    severity = predictions["severity"]
    severity_confidence = predictions["severity_confidence"]
    
    # Calculate risk score
    incident_data = {
        "severity": severity,
        "affected_systems": affected_systems or [],
        "indicators": indicators or []
    }
    risk_score = pipeline.calculate_risk_score(incident_data)
    
    # Get threat indicators for this type
    threat_indicators = THREAT_INDICATORS_MAP.get(incident_type, [])
    
    # Get defensive recommendations
    recommendations = DEFENSIVE_RECOMMENDATIONS.get(incident_type, [])
    
    return {
        "incident_type": incident_type,
        "type_confidence": float(type_confidence),
        "severity": severity,
        "severity_confidence": float(severity_confidence),
        "risk_score": float(risk_score),
        "threat_indicators": threat_indicators,
        "recommendations": recommendations
    }

def batch_analyze_incidents(incidents_list):
    """
    Analyze multiple incidents in batch.
    
    Args:
        incidents_list (list): List of incident dictionaries with 'description' key
    
    Returns:
        list: Analysis results for each incident
    """
    results = []
    for incident in incidents_list:
        result = analyze_incident(
            incident.get("description", ""),
            incident.get("affected_systems"),
            incident.get("indicators")
        )
        results.append(result)
    return results

# ============================================================================
# JSON I/O FOR NODE.JS INTEGRATION
# ============================================================================

def predict_from_json(json_input):
    """
    Process JSON input and return JSON output.
    
    Input format:
    {
        "action": "analyze" | "batch_analyze",
        "incident": {
            "description": "...",
            "affected_systems": [...],
            "indicators": [...]
        }
    }
    """
    try:
        data = json.loads(json_input)
        action = data.get("action", "analyze")
        
        if action == "analyze":
            incident = data.get("incident", {})
            result = analyze_incident(
                incident.get("description", ""),
                incident.get("affected_systems"),
                incident.get("indicators")
            )
            return json.dumps({"success": True, "result": result})
        
        elif action == "batch_analyze":
            incidents = data.get("incidents", [])
            results = batch_analyze_incidents(incidents)
            return json.dumps({"success": True, "results": results})
        
        else:
            return json.dumps({"success": False, "error": f"Unknown action: {action}"})
    
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

# ============================================================================
# COMMAND LINE INTERFACE
# ============================================================================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <json_input>")
        print("Example: python predict.py '{\"action\": \"analyze\", \"incident\": {\"description\": \"...\"}}' ")
        sys.exit(1)
    
    json_input = sys.argv[1]
    result = predict_from_json(json_input)
    print(result)
