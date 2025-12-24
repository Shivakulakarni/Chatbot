// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Global State
let socket = null;
let authToken = null;
let currentUser = null;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingTimer = null;
let sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// DOM Elements
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authButton = document.getElementById('authButton');
const toggleAuth = document.getElementById('toggleAuth');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const emailGroup = emailInput?.parentElement;
const phoneGroup = phoneInput?.parentElement;
const authMessage = document.getElementById('authMessage');
const conversationDisplay = document.getElementById('conversationDisplay');
const recordBtn = document.getElementById('recordBtn');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTime = document.getElementById('recordingTime');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const languageSelect = document.getElementById('language');
const memoryDisplay = document.getElementById('memoryDisplay');
const schemesDisplay = document.getElementById('schemesDisplay');
const applicationsDisplay = document.getElementById('applicationsDisplay');
const clearMemoryBtn = document.getElementById('clearMemoryBtn');
const viewAllSchemes = document.getElementById('viewAllSchemes');
const refreshApps = document.getElementById('refreshApps');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        validateAndLoadUser();
    }

    // Event Listeners
    authForm.addEventListener('submit', handleAuth);
    toggleAuth.addEventListener('click', toggleAuthMode);
    recordBtn.addEventListener('click', toggleRecording);
    sendBtn.addEventListener('click', sendTextMessage);
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendTextMessage();
    });
    logoutBtn.addEventListener('click', handleLogout);
    clearMemoryBtn.addEventListener('click', clearMemory);
    viewAllSchemes.addEventListener('click', loadAllSchemes);
    refreshApps.addEventListener('click', loadApplications);
});

// Authentication Functions
let isLoginMode = false; // Start in registration mode

async function validateAndLoadUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showApp();
            initializeSocket();
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
        }
    } catch (error) {
        console.error('Validation error:', error);
        localStorage.removeItem('authToken');
        authToken = null;
    }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        authTitle.textContent = 'Welcome Back';
        authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        toggleAuth.innerHTML = '<i class="fas fa-user-plus"></i> Register';
        nameInput.placeholder = 'Email Address';
        nameInput.type = 'email';
        if (emailGroup) emailGroup.style.display = 'none';
        if (phoneGroup) phoneGroup.style.display = 'none';
    } else {
        authTitle.textContent = 'Create Account';
        authButton.innerHTML = '<i class="fas fa-user-plus"></i> Register';
        toggleAuth.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        nameInput.placeholder = 'Full Name';
        nameInput.type = 'text';
        if (emailGroup) emailGroup.style.display = 'block';
        if (phoneGroup) phoneGroup.style.display = 'block';
    }
}

async function handleAuth(e) {
    e.preventDefault();
    
    const nameOrEmail = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!nameOrEmail || !password) {
        showAuthMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isLoginMode) {
        if (!email || !phone) {
            showAuthMessage('Please fill in all fields for registration', 'error');
            return;
        }
        
        // Validate phone number for registration
        if (!/^[6-9]\d{9}$/.test(phone)) {
            showAuthMessage('Please enter a valid 10-digit Indian phone number', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }
    }
    
    try {
        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
        const body = isLoginMode 
            ? { email: nameOrEmail, password }
            : { name: nameOrEmail, email, phone, password };
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            
            showAuthMessage(data.message || 'Success!', 'success');
            
            setTimeout(() => {
                showApp();
                initializeSocket();
            }, 1000);
        } else {
            showAuthMessage(data.error || 'Authentication failed', 'error');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showAuthMessage('Network error. Please try again.', 'error');
    }
}

function showApp() {
    authSection.style.display = 'none';
    appSection.style.display = 'grid';
    userName.textContent = currentUser?.name || currentUser?.username || 'User';
    
    // Load initial data
    loadApplications();
    
    showToast('Welcome back! Start speaking or typing your query.', 'success');
}

function handleLogout() {
    if (socket) {
        socket.disconnect();
    }
    
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    
    authSection.style.display = 'flex';
    appSection.style.display = 'none';
    
    // Clear conversation
    conversationDisplay.innerHTML = getWelcomeMessage();
    
    showToast('Logged out successfully', 'info');
}

// Socket.IO Functions
function initializeSocket() {
    socket = io(SOCKET_URL, {
        auth: { token: authToken }
    });
    
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        
        // Initialize session
        socket.emit('initSession', {
            sessionId: sessionId,
            userId: currentUser?._id || currentUser?.id,
            language: languageSelect.value
        });
        
        addSystemMessage('Connected to server');
    });
    
    socket.on('sessionInitialized', (data) => {
        console.log('Session initialized:', data.sessionId);
        sessionId = data.sessionId;
    });
    
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
        addSystemMessage('Disconnected from server');
    });
    
    socket.on('agentMessage', (data) => {
        console.log('Agent message:', data);
        hideLoading();
        addAssistantMessage(data.text, data.translation);
        
        // Update memory if provided
        if (data.memory) {
            updateMemoryDisplay(data.memory);
        }
        
        // Update schemes if provided
        if (data.schemes && data.schemes.length > 0) {
            updateSchemesDisplay(data.schemes);
        }
    });
    
    socket.on('agentThinking', (data) => {
        console.log('Agent thinking:', data);
        addSystemMessage(`🤔 ${data.status}`);
    });
    
    socket.on('memoryCleared', () => {
        memoryDisplay.innerHTML = '<div class="memory-item"><i class="fas fa-info-circle"></i><p>Memory cleared</p></div>';
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        hideLoading();
        showToast(error.message || 'An error occurred', 'error');
    });
}

// Voice Recording Functions
async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await sendVoiceMessage(audioBlob);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        recordBtn.classList.add('stop');
        recordBtn.innerHTML = '<span class="icon"><i class="fas fa-stop"></i></span><span class="text">Stop Recording</span>';
        recordingIndicator.style.display = 'inline-flex';
        
        // Start timer
        recordingStartTime = Date.now();
        recordingTimer = setInterval(updateRecordingTime, 100);
        
        showToast('Recording started - speak now', 'info');
    } catch (error) {
        console.error('Recording error:', error);
        showToast('Microphone access denied', 'error');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    isRecording = false;
    
    // Update UI
    recordBtn.classList.remove('stop');
    recordBtn.innerHTML = '<span class="icon"><i class="fas fa-microphone"></i></span><span class="text">Press to Speak</span>';
    recordingIndicator.style.display = 'none';
    
    // Stop timer
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
}

function updateRecordingTime() {
    const elapsed = Date.now() - recordingStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    recordingTime.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function sendVoiceMessage(audioBlob) {
    showLoading();
    addUserMessage('🎤 Voice message sent');
    
    try {
        // In production, send to backend for STT processing
        // For now, simulate with text
        const simulatedText = 'मला कल्याण योजनांबद्दल माहिती हवी आहे';
        
        socket.emit('userMessage', {
            text: simulatedText,
            language: languageSelect.value,
            isVoice: true
        });
        
        showToast('Voice message sent for processing', 'success');
    } catch (error) {
        console.error('Voice send error:', error);
        showToast('Failed to send voice message', 'error');
        hideLoading();
    }
}

// Text Messaging Functions
function sendTextMessage() {
    const text = textInput.value.trim();
    
    if (!text) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    if (!socket || !socket.connected) {
        showToast('Not connected to server. Reconnecting...', 'error');
        initializeSocket();
        return;
    }
    
    addUserMessage(text);
    showLoading();
    
    socket.emit('userMessage', {
        text: text,
        language: languageSelect.value,
        isVoice: false
    });
    
    textInput.value = '';
}

// Message Display Functions
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.textContent = text;
    
    conversationDisplay.appendChild(messageDiv);
    scrollToBottom();
}

function addAssistantMessage(text, translation) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const mainText = document.createElement('div');
    mainText.textContent = text;
    messageDiv.appendChild(mainText);
    
    if (translation && translation !== text) {
        const translationDiv = document.createElement('div');
        translationDiv.className = 'translation';
        translationDiv.textContent = `Translation: ${translation}`;
        messageDiv.appendChild(translationDiv);
    }
    
    conversationDisplay.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    
    conversationDisplay.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
}

function getWelcomeMessage() {
    return `
        <div class="welcome-message">
            <i class="fas fa-robot"></i>
            <h3>नमस्कार! Welcome to Welfare Agent</h3>
            <p>I'm here to help you discover and apply for government welfare schemes in your native language.</p>
            <div class="features-grid">
                <div class="feature-item">
                    <i class="fas fa-microphone"></i>
                    <span>Voice Input</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-brain"></i>
                    <span>AI Assistant</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Eligibility Check</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-file-alt"></i>
                    <span>Auto Apply</span>
                </div>
            </div>
        </div>
    `;
}

// Memory Functions
function updateMemoryDisplay(memory) {
    if (!memory || Object.keys(memory).length === 0) {
        memoryDisplay.innerHTML = '<div class="memory-item"><i class="fas fa-info-circle"></i><p>No conversation context yet</p></div>';
        return;
    }
    
    let html = '';
    
    for (const [key, value] of Object.entries(memory)) {
        html += `
            <div class="memory-item">
                <i class="fas fa-tag"></i>
                <div>
                    <strong>${formatKey(key)}:</strong>
                    <p>${formatValue(value)}</p>
                </div>
            </div>
        `;
    }
    
    memoryDisplay.innerHTML = html;
}

function clearMemory() {
    if (confirm('Are you sure you want to clear conversation memory?')) {
        socket.emit('clearMemory');
        memoryDisplay.innerHTML = '<div class="memory-item"><i class="fas fa-info-circle"></i><p>Memory cleared</p></div>';
        showToast('Conversation memory cleared', 'success');
    }
}

// Schemes Functions
function updateSchemesDisplay(schemes) {
    if (!schemes || schemes.length === 0) {
        schemesDisplay.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No eligible schemes found</p></div>';
        return;
    }
    
    let html = '';
    
    schemes.forEach(scheme => {
        // Extract scheme details
        const schemeName = scheme.name || scheme.schemeName || 'Unknown Scheme';
        const description = scheme.description || scheme.benefits || 'Government welfare scheme';
        const category = scheme.category || '';
        const score = scheme.eligibilityScore || scheme.score || 100;
        
        // Get category icon
        const categoryIcon = getCategoryIcon(category);
        
        html += `
            <div class="scheme-card">
                <div class="scheme-header">
                    ${categoryIcon ? `<i class="fas ${categoryIcon} scheme-icon"></i>` : ''}
                    <div class="scheme-title-section">
                        <h4>${schemeName}</h4>
                        ${category ? `<span class="scheme-category">${category}</span>` : ''}
                    </div>
                </div>
                <p class="scheme-description">${description}</p>
                <div class="scheme-footer">
                    <div class="score">
                        <i class="fas fa-check-circle"></i>
                        ${score}% Match
                    </div>
                    ${scheme.benefits ? `<span class="scheme-benefit"><i class="fas fa-gift"></i> ${scheme.benefits}</span>` : ''}
                </div>
            </div>
        `;
    });
    
    schemesDisplay.innerHTML = html;
}

function getCategoryIcon(category) {
    const icons = {
        'Agriculture': 'fa-tractor',
        'Healthcare': 'fa-heartbeat',
        'Housing': 'fa-home',
        'Energy': 'fa-bolt',
        'Education': 'fa-graduation-cap',
        'Employment': 'fa-briefcase',
        'Social Welfare': 'fa-users',
        'Financial': 'fa-money-bill'
    };
    return icons[category] || 'fa-file-alt';
}

async function loadAllSchemes() {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/schemes`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateSchemesDisplay(data.data || data.schemes || []);
            showToast(`Loaded ${data.count || data.data?.length || 0} schemes`, 'success');
        } else {
            showToast('Failed to load schemes', 'error');
        }
    } catch (error) {
        console.error('Load schemes error:', error);
        showToast('Network error', 'error');
    } finally {
        hideLoading();
    }
}

// Applications Functions
async function loadApplications() {
    try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateApplicationsDisplay(data.data || data.applications || []);
        }
    } catch (error) {
        console.error('Load applications error:', error);
        showToast('Could not load applications', 'error');
    }
}

function updateApplicationsDisplay(applications) {
    if (!applications || applications.length === 0) {
        applicationsDisplay.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No applications yet</p></div>';
        return;
    }
    
    let html = '';
    
    applications.forEach(app => {
        const statusClass = app.status.toLowerCase().replace('_', '-');
        const statusIcon = getStatusIcon(app.status);
        const date = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : 'Draft';
        
        html += `
            <div class="application-card status-${statusClass}">
                <div class="app-header">
                    <h4>${app.schemeName}</h4>
                    <span class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${formatStatus(app.status)}
                    </span>
                </div>
                <div class="app-details">
                    <p><i class="fas fa-calendar"></i> ${date}</p>
                    ${app.applicationId ? `<p><i class="fas fa-hashtag"></i> ${app.applicationId}</p>` : ''}
                </div>
                ${app.remarks ? `<p class="app-remarks">${app.remarks}</p>` : ''}
            </div>
        `;
    });
    
    applicationsDisplay.innerHTML = html;
}

function getStatusIcon(status) {
    const icons = {
        'draft': 'fa-file',
        'submitted': 'fa-paper-plane',
        'under_review': 'fa-search',
        'approved': 'fa-check-circle',
        'rejected': 'fa-times-circle',
        'documents_required': 'fa-upload'
    };
    return icons[status] || 'fa-file';
}

function formatStatus(status) {
    return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// UI Helper Functions
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showAuthMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
    
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 5000);
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Utility Functions
function formatKey(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatValue(value) {
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}

// Error Handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Prevent form submission on Enter (except in textarea)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'text') {
        e.preventDefault();
    }
});

console.log('🚀 Welfare Agent Frontend Initialized');
