#!/usr/bin/env python3
"""
ML Model Training Pipeline for Cyber Incident Classification and Severity Prediction

This script trains:
1. TF-IDF Vectorizer for incident description feature extraction
2. Random Forest Classifier for incident type classification
3. Random Forest Classifier for severity prediction
4. Risk Score Calculator based on incident characteristics

The trained models are serialized to JSON for use in the backend.
"""

import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from datetime import datetime
import os

# ============================================================================
# TRAINING DATA
# ============================================================================

# Sample training data for incident classification
TRAINING_DATA = [
    # Phishing incidents
    {
        "description": "Suspicious email with malicious link asking for credentials. User received email from fake bank domain requesting password reset.",
        "type": "phishing",
        "severity": "medium",
        "affected_systems": ["email", "workstation"],
        "indicators": ["suspicious_email", "credential_request", "fake_domain"]
    },
    {
        "description": "Phishing campaign targeting employees with fake Microsoft Teams login page. Multiple users reported.",
        "type": "phishing",
        "severity": "high",
        "affected_systems": ["email", "network"],
        "indicators": ["phishing_page", "mass_campaign", "credential_theft"]
    },
    {
        "description": "Single phishing email with attachment claiming to be invoice. User did not open.",
        "type": "phishing",
        "severity": "low",
        "affected_systems": ["email"],
        "indicators": ["suspicious_attachment", "invoice_scam"]
    },
    
    # Malware incidents
    {
        "description": "Ransomware detected on file server. Files encrypted with .locked extension. Ransom note found.",
        "type": "malware",
        "severity": "critical",
        "affected_systems": ["file_server", "network"],
        "indicators": ["ransomware", "file_encryption", "ransom_note"]
    },
    {
        "description": "Trojan backdoor found in system. Command and control communication detected.",
        "type": "malware",
        "severity": "critical",
        "affected_systems": ["workstation", "network"],
        "indicators": ["trojan", "backdoor", "c2_communication"]
    },
    {
        "description": "Suspicious executable detected in Downloads folder. Quarantined by antivirus.",
        "type": "malware",
        "severity": "medium",
        "affected_systems": ["workstation"],
        "indicators": ["suspicious_executable", "quarantined"]
    },
    
    # DDoS incidents
    {
        "description": "Web server experiencing 50,000 requests per second from multiple IP ranges. Service degradation observed.",
        "type": "ddos",
        "severity": "high",
        "affected_systems": ["web_server", "network"],
        "indicators": ["high_traffic", "multiple_sources", "service_degradation"]
    },
    {
        "description": "DNS amplification attack detected. Unusual spike in DNS queries from external sources.",
        "type": "ddos",
        "severity": "high",
        "affected_systems": ["dns_server", "network"],
        "indicators": ["dns_amplification", "traffic_spike"]
    },
    {
        "description": "Slowloris attack attempt detected. Slow HTTP requests trying to exhaust connections.",
        "type": "ddos",
        "severity": "medium",
        "affected_systems": ["web_server"],
        "indicators": ["slowloris", "connection_exhaustion"]
    },
    
    # Brute Force incidents
    {
        "description": "Failed SSH login attempts detected. 10,000 attempts from single IP in 1 hour targeting admin account.",
        "type": "brute_force",
        "severity": "high",
        "affected_systems": ["ssh_server", "network"],
        "indicators": ["failed_logins", "credential_attack", "admin_targeting"]
    },
    {
        "description": "RDP brute force attack. Multiple failed login attempts on remote desktop service.",
        "type": "brute_force",
        "severity": "medium",
        "affected_systems": ["rdp_server", "network"],
        "indicators": ["rdp_attack", "failed_authentication"]
    },
    {
        "description": "Web application login brute force. 500 failed attempts in 30 minutes from same IP.",
        "type": "brute_force",
        "severity": "medium",
        "affected_systems": ["web_application"],
        "indicators": ["web_brute_force", "account_targeting"]
    },
    
    # Data Exfiltration incidents
    {
        "description": "Large data transfer detected to external IP. 5GB of data uploaded to unknown cloud storage.",
        "type": "data_exfiltration",
        "severity": "critical",
        "affected_systems": ["database", "network"],
        "indicators": ["large_transfer", "external_destination", "data_loss"]
    },
    {
        "description": "Unauthorized access to customer database. 100,000 records accessed and copied.",
        "type": "data_exfiltration",
        "severity": "critical",
        "affected_systems": ["database", "network"],
        "indicators": ["database_access", "bulk_copy", "pii_exposure"]
    },
    {
        "description": "Employee copying source code to personal USB drive. Detected by DLP system.",
        "type": "data_exfiltration",
        "severity": "high",
        "affected_systems": ["workstation", "dlp_system"],
        "indicators": ["usb_transfer", "source_code", "insider_threat"]
    },
]

# ============================================================================
# MODEL TRAINING
# ============================================================================

class IncidentMLPipeline:
    def __init__(self):
        self.tfidf_vectorizer = None
        self.type_classifier = None
        self.severity_classifier = None
        self.feature_names = None
        self.type_classes = None
        self.severity_classes = None
        
    def prepare_data(self):
        """Prepare training data for model training."""
        descriptions = [item["description"] for item in TRAINING_DATA]
        types = [item["type"] for item in TRAINING_DATA]
        severities = [item["severity"] for item in TRAINING_DATA]
        
        return descriptions, types, severities
    
    def train_tfidf_vectorizer(self, descriptions):
        """Train TF-IDF vectorizer on incident descriptions."""
        print("[*] Training TF-IDF Vectorizer...")
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=100,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.8,
            stop_words='english'
        )
        X = self.tfidf_vectorizer.fit_transform(descriptions)
        self.feature_names = self.tfidf_vectorizer.get_feature_names_out()
        print(f"[+] TF-IDF Vectorizer trained. Features: {len(self.feature_names)}")
        return X
    
    def train_type_classifier(self, X, types):
        """Train Random Forest classifier for incident type classification."""
        print("[*] Training Incident Type Classifier...")
        self.type_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42
        )
        self.type_classifier.fit(X, types)
        self.type_classes = self.type_classifier.classes_
        
        # Evaluate
        predictions = self.type_classifier.predict(X)
        accuracy = accuracy_score(types, predictions)
        print(f"[+] Type Classifier trained. Accuracy: {accuracy:.2%}")
        print(classification_report(types, predictions))
        
    def train_severity_classifier(self, X, severities):
        """Train Random Forest classifier for severity prediction."""
        print("[*] Training Severity Classifier...")
        self.severity_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42
        )
        self.severity_classifier.fit(X, severities)
        self.severity_classes = self.severity_classifier.classes_
        
        # Evaluate
        predictions = self.severity_classifier.predict(X)
        accuracy = accuracy_score(severities, predictions)
        print(f"[+] Severity Classifier trained. Accuracy: {accuracy:.2%}")
        print(classification_report(severities, predictions))
    
    def calculate_risk_score(self, incident_data):
        """
        Calculate risk score (0-100) based on incident characteristics.
        
        Factors:
        - Severity level (40 points)
        - Number of affected systems (20 points)
        - Presence of threat indicators (20 points)
        - System criticality (20 points)
        """
        score = 0
        
        # Severity multiplier
        severity_scores = {
            "low": 10,
            "medium": 40,
            "high": 70,
            "critical": 100
        }
        severity = incident_data.get("severity", "medium").lower()
        score += severity_scores.get(severity, 40) * 0.4
        
        # Affected systems count
        affected_systems = incident_data.get("affected_systems", [])
        system_count = min(len(affected_systems), 5)
        score += (system_count / 5) * 20
        
        # Threat indicators
        indicators = incident_data.get("indicators", [])
        critical_indicators = [
            "ransomware", "backdoor", "c2_communication", "data_loss",
            "pii_exposure", "mass_campaign", "file_encryption", "insider_threat"
        ]
        indicator_count = sum(1 for ind in indicators if ind in critical_indicators)
        score += min(indicator_count, 5) * 4
        
        # System criticality
        critical_systems = ["database", "file_server", "dns_server", "web_server"]
        has_critical = any(sys in critical_systems for sys in affected_systems)
        if has_critical:
            score += 10
        
        return min(max(score, 0), 100)
    
    def train(self):
        """Train all models."""
        descriptions, types, severities = self.prepare_data()
        X = self.train_tfidf_vectorizer(descriptions)
        self.train_type_classifier(X, types)
        self.train_severity_classifier(X, severities)
        print("[+] All models trained successfully!")
    
    def predict(self, description):
        """Make predictions for a new incident description."""
        if not self.tfidf_vectorizer or not self.type_classifier:
            raise ValueError("Models not trained yet. Call train() first.")
        
        X = self.tfidf_vectorizer.transform([description])
        
        incident_type = self.type_classifier.predict(X)[0]
        type_confidence = self.type_classifier.predict_proba(X)[0].max()
        
        severity = self.severity_classifier.predict(X)[0]
        severity_confidence = self.severity_classifier.predict_proba(X)[0].max()
        
        return {
            "incident_type": incident_type,
            "type_confidence": float(type_confidence),
            "severity": severity,
            "severity_confidence": float(severity_confidence)
        }
    
    def serialize_models(self, output_dir="ml/models"):
        """Serialize models to JSON format for backend use."""
        os.makedirs(output_dir, exist_ok=True)
        
        # Serialize TF-IDF features
        tfidf_data = {
            "feature_names": self.feature_names.tolist(),
            "max_features": 100,
            "ngram_range": [1, 2]
        }
        
        # Serialize Random Forest models as feature importance and structure
        type_model_data = {
            "classes": self.type_classes.tolist(),
            "n_estimators": self.type_classifier.n_estimators,
            "feature_importances": self.type_classifier.feature_importances_.tolist()
        }
        
        severity_model_data = {
            "classes": self.severity_classes.tolist(),
            "n_estimators": self.severity_classifier.n_estimators,
            "feature_importances": self.severity_classifier.feature_importances_.tolist()
        }
        
        # Save to JSON
        with open(f"{output_dir}/tfidf_vectorizer.json", "w") as f:
            json.dump(tfidf_data, f, indent=2)
        
        with open(f"{output_dir}/type_classifier.json", "w") as f:
            json.dump(type_model_data, f, indent=2)
        
        with open(f"{output_dir}/severity_classifier.json", "w") as f:
            json.dump(severity_model_data, f, indent=2)
        
        print(f"[+] Models serialized to {output_dir}/")
    
    def export_for_backend(self, output_file="ml/models/incident_ml_config.json"):
        """Export model configuration for backend use."""
        config = {
            "version": "1.0.0",
            "trained_at": datetime.now().isoformat(),
            "incident_types": self.type_classes.tolist(),
            "severity_levels": self.severity_classes.tolist(),
            "tfidf_features": self.feature_names.tolist(),
            "model_metadata": {
                "type_classifier": {
                    "algorithm": "RandomForest",
                    "n_estimators": self.type_classifier.n_estimators,
                    "max_depth": self.type_classifier.max_depth
                },
                "severity_classifier": {
                    "algorithm": "RandomForest",
                    "n_estimators": self.severity_classifier.n_estimators,
                    "max_depth": self.severity_classifier.max_depth
                }
            }
        }
        
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w") as f:
            json.dump(config, f, indent=2)
        
        print(f"[+] Backend configuration exported to {output_file}")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("CYBER INCIDENT ML MODEL TRAINING PIPELINE")
    print("=" * 70)
    
    # Initialize and train pipeline
    pipeline = IncidentMLPipeline()
    pipeline.train()
    
    # Test predictions
    print("\n" + "=" * 70)
    print("TEST PREDICTIONS")
    print("=" * 70)
    
    test_cases = [
        "Suspicious email with malicious attachment asking for password reset",
        "Ransomware detected on file server with files encrypted",
        "Web server experiencing 50,000 requests per second from multiple IPs",
        "Failed SSH login attempts detected from single IP",
        "Large data transfer to external cloud storage detected"
    ]
    
    for test in test_cases:
        prediction = pipeline.predict(test)
        print(f"\nDescription: {test[:60]}...")
        print(f"Type: {prediction['incident_type']} (confidence: {prediction['type_confidence']:.2%})")
        print(f"Severity: {prediction['severity']} (confidence: {prediction['severity_confidence']:.2%})")
    
    # Calculate risk scores for training data
    print("\n" + "=" * 70)
    print("RISK SCORE CALCULATIONS")
    print("=" * 70)
    
    for item in TRAINING_DATA[:5]:
        risk_score = pipeline.calculate_risk_score(item)
        print(f"\nIncident: {item['type'].upper()}")
        print(f"Description: {item['description'][:50]}...")
        print(f"Risk Score: {risk_score:.1f}/100")
    
    # Serialize models
    print("\n" + "=" * 70)
    print("SERIALIZING MODELS")
    print("=" * 70)
    pipeline.serialize_models()
    pipeline.export_for_backend()
    
    print("\n[+] Training pipeline completed successfully!")
