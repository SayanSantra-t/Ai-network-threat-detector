import pyshark
import csv
import time
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder

# Define network interface for Windows
INTERFACE = "Wi-Fi"

def capture_packets():
    """Captures TCP, UDP, HTTPS, ARP, ICMP, DNS traffic, and saves it in CSV format."""
    filename = f"network_traffic_{int(time.time())}.csv"

    with open(filename, 'w', newline='', encoding='utf-8', errors='replace') as file:
        writer = csv.writer(file)
        writer.writerow(["No.", "Time", "Source", "Destination", "Protocol", "Length", "Info", "Threat Classification"])  

        # Capture packets for **40 seconds**, supporting more protocols
        capture = pyshark.LiveCapture(interface=INTERFACE, display_filter="tcp or udp or tls or arp or icmp or dns")
        capture.sniff(timeout=40, packet_count=100)

        packet_data = []
        for index, packet in enumerate(capture):
            timestamp = packet.sniff_time.strftime('%H:%M:%S.%f')

            # Extract IP or IPv6 addresses
            if hasattr(packet, 'ip'):
                src_ip = packet.ip.src
                dst_ip = packet.ip.dst
            elif hasattr(packet, 'ipv6'):  # Handle IPv6 traffic
                src_ip = packet.ipv6.src
                dst_ip = packet.ipv6.dst
            else:
                src_ip, dst_ip = "Unknown", "Unknown"

            # Detect **Multiple Protocol Types**
            if hasattr(packet, 'tcp'):
                protocol = "TCP"
            elif hasattr(packet, 'udp'):
                protocol = "UDP"
            elif hasattr(packet, 'tls'):
                protocol = "TLS/HTTPS"
            elif hasattr(packet, 'http'):
                protocol = "HTTP"
            elif hasattr(packet, 'arp'):
                protocol = "ARP"
            elif hasattr(packet, 'icmp'):
                protocol = "ICMP"
            elif hasattr(packet, 'dns'):
                protocol = "DNS"
            else:
                protocol = "Other"

            length = packet.length

            # **Extract readable packet content**
            try:
                if hasattr(packet, 'http'):
                    info = f"HTTP {packet.http.get('request_method', '')}: {packet.http.get('request_full_uri', 'N/A')}"  
                elif hasattr(packet, 'tls'):
                    info = f"TLS Session with {dst_ip}"  
                elif hasattr(packet, 'udp'):
                    info = f"UDP Data: {packet.udp.payload}"  
                elif hasattr(packet, 'dns'):
                    info = f"DNS Query: {packet.dns.qry_name}"  
                elif hasattr(packet, 'tcp') and hasattr(packet.tcp, 'payload'):
                    info = bytes.fromhex(packet.tcp.payload.replace(':', '')).decode(errors='replace')  
                else:
                    info = "Encrypted or Unreadable Data"
            except Exception as e:
                info = f"Error: {str(e)}"

            packet_data.append([index + 1, timestamp, src_ip, dst_ip, protocol, length, info])

        # Convert to DataFrame for AI-based threat analysis
        df = pd.DataFrame(packet_data, columns=["No.", "Time", "Source", "Destination", "Protocol", "Length", "Info"])
        df = classify_threats(df)  

        # Save final processed data
        df.to_csv(filename, index=False)
        print(f"Saved packets to {filename}")

def classify_threats(df):
    """AI-based threat detection using Isolation Forest."""
    features = ["Source", "Destination", "Protocol", "Length"]

    # Backup original values before encoding
    original_values = df[["Source", "Destination", "Protocol"]].copy()

    # Encode categorical features
    encoder = LabelEncoder()
    for col in ["Source", "Destination", "Protocol"]:
        df[col] = encoder.fit_transform(df[col])

    # Train anomaly detection model
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(df[features])

    # Predict threats
    df["Threat Classification"] = model.predict(df[features])
    df["Threat Classification"] = df["Threat Classification"].apply(lambda x: "Threat" if x == -1 else "Safe")

    # Restore original values after AI detection
    df[["Source", "Destination", "Protocol"]] = original_values

    return df

# 🔄 Run capture & AI-based threat analysis
capture_packets()