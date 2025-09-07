# Ai-network-threat-detector
with a cool gojo themed interface we have a cool threat detector for personal networks focusing on protection

DOMAIN EXPANSION: INFINITE VOID
Overview
This project is an AI-powered network threat detection system designed to capture, analyze, and classify network traffic data. It uses real-time packet capture combined with machine learning (Isolation Forest) to detect potential threats within TCP, UDP, HTTP/S, DNS, ARP, ICMP, and other protocols.

The system features a web interface themed after Gojo Satoru's Domain Expansion from Jujutsu Kaisen, providing an immersive experience with live analytics, charts, and detailed packet views.

Components
ainet.py: Captures network packets on a specified network interface for 40 seconds, extracts various protocol data, performs AI-based threat classification, and saves results to CSV files.

app.py: Flask web application that runs the capture automatically, provides a Gojo-themed dashboard for monitoring capture progress, browsing and analyzing captured CSV files with interactive charts and tables.

How to Use
Prerequisites
Python 3.8 or higher

Wireshark installed with TShark component (required by pyshark)

Administrator/root privileges to capture network packets

Setup
Clone or copy the project files.

Install required Python packages:


pip install -r requirements.txt

Ensure Wireshark and tshark are installed and accessible in your system's PATH.

Place a Gojo image named gojo1.jpg into the static/ folder for the theme.

Running the Project
Start the web app:


python app.py

Open a browser and go to: http://127.0.0.1:5000

Click "⚡ ACTIVATE CURSED TECHNIQUE" to start network capture and threat detection.

After capture completes (around 40 seconds), results load automatically.

Browse analyzed data: view threat stats, interactive charts, and detailed packet information.

You can download captured data CSV files or delete old captures.

Notes
The capture interface is set to "Wi-Fi" by default in ainet.py. Adjust if necessary for your network.

The Flask app automatically runs ainet.py capture and processes the results.

No traffic data leaves your machine; analysis is local.

Designed for educational and local network monitoring purposes.

File Structure
text
project/
├── ainet.py
├── app.py
├── requirements.txt
├── templates/index.html
├── static/
│   ├── style.css
│   ├── script.js
│   └── gojo1.jpg
├── network_traffic_*.csv
└── README.txt
Enjoy monitoring your network with the power of Gojo Satoru's Domain Expansion!
