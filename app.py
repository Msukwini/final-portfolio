from flask import Flask, render_template, request, flash, redirect, url_for, jsonify
import os
import sys
from datetime import datetime

app = Flask(__name__)

# Simple secret key for Vercel
app.secret_key = os.environ.get('SECRET_KEY', 'simple-secret-key-for-vercel')

# Portfolio data — STARK.DEV theme
# NOTE: the hero name, tagline and dossier fields below are the "Tony Stark"
# persona copy from the Figma design, kept as-is by request. The functional
# contact links (email / github / linkedin) point to the real owner so the
# site still works for recruiters. Swap the dossier + hero copy for your own
# bio whenever you're ready to de-Stark it.
portfolio_data = {
    "name": "Msukwini",
    "hero": {
        "eyebrow": "ARCHITECT OF INNOVATION — MODULE 00 / BOOT",
        "line1": "TONY",
        "line2": "STARK",
        "tagline": "Building systems that think faster than I do.",
        "status": "All systems nominal. Ready for deployment.",
    },
    "stats": [
        {"label": "PROJECTS DEPLOYED", "value": "47"},
        {"label": "SYS UPTIME", "value": "99.9%"},
        {"label": "COFFEE CONSUMED", "value": "∞"},
    ],
    "skills": [
        {"name": "Python", "level": 92, "color": "#00F0FF"},
        {"name": "React", "level": 88, "color": "#F5C518"},
        {"name": "Rust", "level": 75, "color": "#FF3131"},
        {"name": "K8s", "level": 82, "color": "#00F0FF"},
        {"name": "TypeScript", "level": 90, "color": "#F5C518"},
        {"name": "Golang", "level": 78, "color": "#FF3131"},
    ],
    "projects": [
        {
            "mark": "MARK I",
            "name": "NeuralSync API",
            "desc": "Distributed neural processing engine with real-time synchronization across 50+ microservices. Zero-latency event streaming.",
            "power": 94,
            "tech": ["Rust", "WebAssembly", "gRPC"],
            "color": "#00F0FF",
        },
        {
            "mark": "MARK II",
            "name": "ArcReactor UI",
            "desc": "Next-gen component library for mission-critical dashboards. Built for extreme performance under adversarial load conditions.",
            "power": 87,
            "tech": ["React", "TypeScript", "WebGL"],
            "color": "#F5C518",
        },
        {
            "mark": "MARK III",
            "name": "Jarvis Kernel",
            "desc": "AI-assisted deployment pipeline with predictive failure detection and autonomous rollback. Ships to prod without you.",
            "power": 79,
            "tech": ["Python", "K8s", "TensorFlow"],
            "color": "#FF3131",
        },
    ],
    "dossier": [
        {"key": "> ID:", "value": "Tony Stark"},
        {"key": "> ROLE:", "value": "Systems Architect / Generalist Engineer"},
        {"key": "> CLEARANCE:", "value": "Level 7 (Unrestricted Curiosity)"},
        {"key": "> EDUCATION:", "value": "MIT — Electrical Engineering, 3.9 GPA"},
        {"key": "> LOCATION:", "value": "Malibu, CA — 37.7749° N, 122.4194° W"},
        {"key": "> OBJECTIVE:", "value": "Building robust backends and immersive UIs."},
        {"key": "> THREAT_LVL:", "value": "NOMINAL"},
        {"key": "> ARC_OUTPUT:", "value": "97.3% — All reactors stable"},
    ],
    "telemetry": [
        {"label": "NEURAL_LINK", "status": "ONLINE", "color": "#00F0FF"},
        {"label": "ARC_REACTOR", "status": "97.3% OUTPUT", "color": "#F5C518"},
        {"label": "THREAT_LEVEL", "status": "NOMINAL", "color": "#00F0FF"},
        {"label": "COFFEE_RESERVE", "status": "⚠ CRITICAL", "color": "#FF3131"},
    ],
    "contact": {
        "email": "lwzimsukwini@gmail.com",
        "github": "https://github.com/Msukwini",
        "linkedin": "#",
    },
}

# Simple in-memory storage
messages_store = []


@app.route('/')
def index():
    try:
        return render_template('index.html', data=portfolio_data)
    except Exception as e:
        return f"Error loading page: {str(e)}", 500


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()

        messages_store.append({
            "name": name,
            "email": email,
            "subject": subject,
            "message": message,
            "timestamp": datetime.now().isoformat(),
        })

        # Force the message to appear in logs
        print("FORCE LOG - NEW MESSAGE:", file=sys.stderr)
        print(f"NAME: {name}", file=sys.stderr)
        print(f"EMAIL: {email}", file=sys.stderr)
        print(f"SUBJECT: {subject}", file=sys.stderr)
        print(f"MESSAGE: {message}", file=sys.stderr)
        print("END MESSAGE", file=sys.stderr)

        flash('✅ Transmission received — signal logged successfully.', 'success')
        return redirect(url_for('contact'))

    return render_template('contact.html', data=portfolio_data)


@app.route('/about')
def about():
    try:
        return render_template('about.html', data=portfolio_data)
    except Exception as e:
        return f"Error loading about page: {str(e)}", 500


# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'portfolio',
        'timestamp': datetime.now().isoformat()
    })


# Error handlers — themed pages
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html', data=portfolio_data), 404


@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html', data=portfolio_data), 500


# Vercel needs this
if __name__ == '__main__':
    app.run(debug=True)
else:
    # For Vercel serverless
    application = app
