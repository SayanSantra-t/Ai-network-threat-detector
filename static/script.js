let protocolChart = null;
let sourceChart = null;
let currentData = null;
let currentFile = null;
let captureMonitorInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    scanForFiles(); // Auto-scan on load
});

function initializeEventListeners() {
    document.getElementById('startCaptureBtn').addEventListener('click', startAutomaticCapture);
    document.getElementById('scanBtn').addEventListener('click', scanForFiles);
    document.getElementById('loadLatestBtn').addEventListener('click', loadLatestFile);
    document.getElementById('downloadBtn').addEventListener('click', downloadCurrentFile);
    document.getElementById('deleteBtn').addEventListener('click', deleteCurrentFile);
    
    // Table filter buttons
    document.getElementById('showAllBtn').addEventListener('click', () => filterTable('all'));
    document.getElementById('showThreatsBtn').addEventListener('click', () => filterTable('threat'));
    document.getElementById('showSafeBtn').addEventListener('click', () => filterTable('safe'));
}

// Play Gojo sound when loading CSV
function playGojoDomainSound() {
    const audio = document.getElementById('gojoDomainAudio');
    if (audio) {
        audio.currentTime = 0; // Reset to beginning
        audio.play().catch(error => {
            console.log('Audio play failed:', error);
            // Fallback: show visual indication if audio fails
            showAudioFeedback();
        });
    }
}

function showAudioFeedback() {
    // Create visual feedback if audio doesn't play
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(138, 43, 226, 0.9);
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        font-family: 'Orbitron', monospace;
        font-size: 1.2em;
        font-weight: 700;
        z-index: 9999;
        text-align: center;
        border: 2px solid #8b00ff;
        box-shadow: 0 10px 30px rgba(138, 43, 226, 0.5);
        animation: fadeInOut 2s ease-in-out;
    `;
    feedback.innerHTML = '🔮 DOMAIN EXPANDING...';
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#audioFeedbackStyle')) {
        const style = document.createElement('style');
        style.id = 'audioFeedbackStyle';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 2000);
}

function startAutomaticCapture() {
    const startBtn = document.getElementById('startCaptureBtn');
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="loading"></span> Starting...';
    
    // Hide previous results
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('fileSelection').style.display = 'none';
    document.getElementById('autoLoadSection').style.display = 'none';
    
    fetch('/start_auto_capture')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'started') {
                monitorCaptureProgress();
                updateStatusText('Domain expanding... Capturing cursed spirits...');
            } else {
                updateStatusText(data.message || 'Technique already active');
                resetCaptureButton();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            updateStatusText('Domain expansion failed');
            resetCaptureButton();
        });
}

function monitorCaptureProgress() {
    captureMonitorInterval = setInterval(() => {
        fetch('/capture_status')
            .then(response => response.json())
            .then(data => {
                updateStatusText(data.message);
                updateProgress(data.progress);
                
                if (!data.running && data.progress === 100) {
                    // Capture completed successfully
                    clearInterval(captureMonitorInterval);
                    resetCaptureButton();
                    showAutoLoadSection();
                } else if (!data.running) {
                    // Capture stopped with error
                    clearInterval(captureMonitorInterval);
                    resetCaptureButton();
                }
            })
            .catch(error => {
                console.error('Error monitoring progress:', error);
                clearInterval(captureMonitorInterval);
                resetCaptureButton();
            });
    }, 1000);
}

function showAutoLoadSection() {
    document.getElementById('autoLoadSection').style.display = 'block';
    document.getElementById('autoLoadSection').scrollIntoView({behavior: 'smooth'});
    
    // Auto-load latest file after 2 seconds
    setTimeout(() => {
        loadLatestFile();
    }, 2000);
}

function loadLatestFile() {
    fetch('/get_latest_file')
        .then(response => response.json())
        .then(data => {
            if (data.filename) {
                loadFile(data.filename);
                document.getElementById('autoLoadSection').style.display = 'none';
            } else {
                updateStatusText('No files found to load');
            }
        })
        .catch(error => {
            console.error('Error loading latest file:', error);
            updateStatusText('Error loading latest file');
        });
}

function resetCaptureButton() {
    const startBtn = document.getElementById('startCaptureBtn');
    startBtn.disabled = false;
    startBtn.innerHTML = '<span class="btn-energy"></span><span class="btn-text">⚡ ACTIVATE CURSED TECHNIQUE</span>';
}

function updateStatusText(message) {
    document.getElementById('statusText').textContent = message;
}

function updateProgress(progress) {
    document.getElementById('progressFill').style.width = progress + '%';
}

function scanForFiles() {
    updateStatusText('Scanning for CSV files...');
    
    fetch('/scan_files')
        .then(response => response.json())
        .then(data => {
            updateStatusText(data.message);
            if (data.files && data.files.length > 0) {
                displayFileList(data.files);
                document.getElementById('fileSelection').style.display = 'block';
            } else {
                document.getElementById('fileSelection').style.display = 'none';
                document.getElementById('dashboard').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            updateStatusText('Error scanning files');
        });
}

function displayFileList(files) {
    const fileList = document.getElementById('fileList');
    
    let html = '';
    files.forEach(file => {
        html += `
            <div class="file-card" onclick="loadFile('${file.filename}')">
                <div class="file-header">
                    <h4>📄 ${file.filename}</h4>
                    <span class="file-size">${file.size_kb} KB</span>
                </div>
                <div class="file-stats">
                    <span>📅 ${file.modified}</span>
                    <span>📦 ${file.packets} packets</span>
                    <span class="threat-count">⚠️ ${file.threats} threats</span>
                </div>
            </div>
        `;
    });
    
    fileList.innerHTML = html;
}

function loadFile(filename) {
    currentFile = filename;
    updateStatusText(`Loading ${filename}...`);
    
    // Play Gojo sound when loading any CSV file
    playGojoDomainSound();
    
    fetch(`/load_file/${filename}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                updateStatusText(`Error: ${data.error}`);
                return;
            }
            
            currentData = data;
            displayAnalysis(data);
            document.getElementById('dashboard').style.display = 'block';
            updateStatusText(`Loaded: ${filename}`);
            
            // Scroll to dashboard
            document.getElementById('dashboard').scrollIntoView({behavior: 'smooth'});
        })
        .catch(error => {
            console.error('Error:', error);
            updateStatusText(`Error loading ${filename}`);
        });
}

function displayAnalysis(data) {
    // Update header
    document.getElementById('currentFileName').textContent = `🔮 Analysis: ${data.filename}`;
    
    // Update stats
    document.getElementById('totalPackets').textContent = data.total_packets;
    document.getElementById('safePackets').textContent = data.safe_packets;
    document.getElementById('threatsDetected').textContent = data.threats_detected;
    document.getElementById('safetyRate').textContent = data.safety_rate + '%';
    
    // Update charts
    updateProtocolChart(data.protocols);
    updateSourceChart(data.top_sources);
    
    // Update threat analysis
    updateThreatAnalysis(data);
    
    // Update data table
    updateDataTable(data.data);
}

function updateProtocolChart(protocols) {
    const ctx = document.getElementById('protocolChart').getContext('2d');
    
    if (protocolChart) {
        protocolChart.destroy();
    }
    
    const labels = Object.keys(protocols);
    const data = Object.values(protocols);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    protocolChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateSourceChart(topSources) {
    const ctx = document.getElementById('sourceChart').getContext('2d');
    
    if (sourceChart) {
        sourceChart.destroy();
    }
    
    const labels = Object.keys(topSources);
    const data = Object.values(topSources);
    
    sourceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Packet Count',
                data: data,
                backgroundColor: '#36A2EB',
                borderColor: '#1976D2',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateThreatAnalysis(data) {
    const threatInfo = document.getElementById('threatInfo');
    
    if (data.threats_detected === 0) {
        threatInfo.innerHTML = '<div class="no-threats">✅ No threats detected in this capture</div>';
        return;
    }
    
    let html = `
        <div class="threat-summary">
            <p><strong>${data.threats_detected}</strong> potential threats detected out of <strong>${data.total_packets}</strong> total packets.</p>
        </div>
    `;
    
    if (Object.keys(data.threat_protocols).length > 0) {
        html += '<h4>Threat Breakdown by Protocol:</h4><ul>';
        for (const [protocol, count] of Object.entries(data.threat_protocols)) {
            html += `<li><strong>${protocol}:</strong> ${count} threats</li>`;
        }
        html += '</ul>';
    }
    
    threatInfo.innerHTML = html;
}

function updateDataTable(data) {
    const tableContainer = document.getElementById('dataTable');
    
    if (!data || data.length === 0) {
        tableContainer.innerHTML = '<p class="no-data">No data available</p>';
        return;
    }
    
    let html = `
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Time</th>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Protocol</th>
                        <th>Length</th>
                        <th>Status</th>
                        <th>Info</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
    `;
    
    data.forEach((row, index) => {
        const isThreat = row['Threat Classification'] === 'Threat';
        const rowClass = isThreat ? 'threat-row' : 'safe-row';
        const statusIcon = isThreat ? '⚠️' : '✅';
        const info = (row['Info'] || '').substring(0, 50) + (row['Info'] && row['Info'].length > 50 ? '...' : '');
        
        html += `
            <tr class="${rowClass}" data-type="${isThreat ? 'threat' : 'safe'}">
                <td>${row['No.'] || index + 1}</td>
                <td>${row['Time'] || ''}</td>
                <td>${row['Source'] || ''}</td>
                <td>${row['Destination'] || ''}</td>
                <td>${row['Protocol'] || ''}</td>
                <td>${row['Length'] || ''}</td>
                <td>${statusIcon} ${row['Threat Classification'] || 'Safe'}</td>
                <td title="${row['Info'] || ''}">${info}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    tableContainer.innerHTML = html;
}

function filterTable(type) {
    // Update button states
    document.querySelectorAll('.void-controls .void-filter-btn').forEach(btn => btn.classList.remove('active'));
    
    const rows = document.querySelectorAll('#tableBody tr');
    
    if (type === 'all') {
        document.getElementById('showAllBtn').classList.add('active');
        rows.forEach(row => row.style.display = '');
    } else if (type === 'threat') {
        document.getElementById('showThreatsBtn').classList.add('active');
        rows.forEach(row => {
            row.style.display = row.dataset.type === 'threat' ? '' : 'none';
        });
    } else if (type === 'safe') {
        document.getElementById('showSafeBtn').classList.add('active');
        rows.forEach(row => {
            row.style.display = row.dataset.type === 'safe' ? '' : 'none';
        });
    }
}

function downloadCurrentFile() {
    if (currentFile) {
        window.open(`/download/${currentFile}`, '_blank');
    }
}

function deleteCurrentFile() {
    if (!currentFile) return;
    
    if (confirm(`Are you sure you want to delete ${currentFile}?`)) {
        fetch(`/delete/${currentFile}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    alert(data.message);
                    currentFile = null;
                    currentData = null;
                    document.getElementById('dashboard').style.display = 'none';
                    scanForFiles();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting file');
            });
    }
}
