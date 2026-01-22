from flask import Flask, request, render_template

app = Flask(__name__)

def analyze_incident(description, affected_systems, iocs, timeline, logs):
    # Simple keyword-based classification
    desc_lower = description.lower()
    attack_type = "Unknown"
    if "phishing" in desc_lower or "email" in desc_lower:
        attack_type = "Phishing"
    elif "ransomware" in desc_lower or "encrypted" in desc_lower:
        attack_type = "Ransomware"
    elif "ddos" in desc_lower or "flood" in desc_lower:
        attack_type = "DDoS"
    elif "sql injection" in desc_lower or "injection" in desc_lower:
        attack_type = "SQL Injection"
    elif "malware" in desc_lower or "virus" in desc_lower:
        attack_type = "Malware Infection"
    else:
        attack_type = "General Cyber Attack"

    # Severity based on affected systems
    systems_lower = affected_systems.lower()
    severity = "Low"
    if "critical infrastructure" in systems_lower or "national defense" in systems_lower:
        severity = "Critical"
    elif "multiple systems" in systems_lower or "network" in systems_lower:
        severity = "High"
    elif "single system" in systems_lower:
        severity = "Medium"

    # Risk score: simple calculation
    severity_scores = {"Low": 20, "Medium": 50, "High": 80, "Critical": 100}
    risk_score = severity_scores.get(severity, 50)
    if len(iocs.split()) > 5:  # many IOCs increase risk
        risk_score += 10
    risk_score = min(risk_score, 100)

    # Possible impact
    impact = "Potential data breach and operational disruption."
    if severity == "Critical":
        impact += " Risk to national security and critical infrastructure."
    elif severity == "High":
        impact += " Significant operational impact."

    # Immediate actions
    immediate_actions = [
        "Isolate affected systems from the network.",
        "Preserve evidence and logs for forensic analysis.",
        "Notify incident response team and relevant authorities.",
        "Change all compromised credentials.",
        "Monitor for further indicators of compromise."
    ]

    # Preventive measures
    preventive_measures = [
        "Implement multi-factor authentication (MFA).",
        "Conduct regular security awareness training.",
        "Deploy endpoint detection and response (EDR) tools.",
        "Perform regular vulnerability assessments and patching.",
        "Establish incident response plans and conduct drills."
    ]

    return {
        "attack_type": attack_type,
        "severity": severity,
        "risk_score": risk_score,
        "impact": impact,
        "immediate_actions": immediate_actions,
        "preventive_measures": preventive_measures
    }

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        description = request.form['description']
        affected_systems = request.form['affected_systems']
        iocs = request.form['iocs']
        timeline = request.form['timeline']
        logs = request.form['logs']
        analysis = analyze_incident(description, affected_systems, iocs, timeline, logs)
        return render_template('result.html', analysis=analysis)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
