// Hume AI EVI Integration - Sends conversation data to backend for admin tracking
const HUME_API_KEY = 'zsASFWTIShA5swhpfrxkYj9AYOPEEyhYxZFhtgMsWpHzjgDF';
const HUME_CONFIG_ID = 'fbc5cf5c-5965-4f98-abc2-97a77896d600';

// Backend endpoint where conversation data will be sent (YOU can track visitors)
const BACKEND_ENDPOINT = '/api/save-conversation'; // Update this to your actual backend URL

const humeAiContainer = document.getElementById('hume-ai-container');
let socket = null;
let audioContext = null;
let audioQueue = [];
let isPlaying = false;
let mediaStream = null;
let processor = null;
let sendBuffer = [];
let sendInterval = 0.1;
let timeSinceLastSend = 0;
let lastFrameTime = performance.now();

// Recording storage (sent to backend, not downloadable by visitor)
let conversationHistory = [];
let recordedAudioChunks = [];
let sessionStartTime = null;
let sessionId = null;

function initializeHumeUI() {
    humeAiContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="url(#voice-gradient)" opacity="0.2"/>
                    <circle cx="20" cy="20" r="12" fill="url(#voice-gradient)" opacity="0.4"/>
                    <circle cx="20" cy="20" r="6" fill="url(#voice-gradient)"/>
                    <defs>
                        <linearGradient id="voice-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#6366F1"/>
                            <stop offset="1" stop-color="#8B5CF6"/>
                        </linearGradient>
                    </defs>
                </svg>
                <h3 style="margin-top: 1.5rem; font-size: 1.5rem; font-weight: 700;">AI Voice Assistant</h3>
                <p style="margin-top: 0.5rem; color: var(--color-text-secondary);">Click below to start talking</p>
            </div>
            <button id="start-voice-btn" style="
                padding: 1.25rem 2.5rem;
                background: linear-gradient(135deg, #6366F1, #8B5CF6);
                color: white;
                border: none;
                border-radius: 3rem;
                font-weight: 600;
                font-size: 1.1rem;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Start Voice Chat
            </button>
            <div id="voice-status" style="margin-top: 1.5rem; font-size: 0.95rem; color: var(--color-text-muted);"></div>
            <div id="transcript" style="margin-top: 1rem; padding: 1rem; background: rgba(99, 102, 241, 0.05); border-radius: 0.5rem; min-width: 400px; max-width: 500px; font-size: 0.9rem; display: none; max-height: 200px; overflow-y: auto;"></div>
        </div>
    `;

    document.getElementById('start-voice-btn').addEventListener('click', toggleVoiceChat);
}

async function toggleVoiceChat() {
    const startBtn = document.getElementById('start-voice-btn');

    if (socket && socket.readyState === WebSocket.OPEN) {
        stopChat();
        return;
    }

    try {
        const statusDiv = document.getElementById('voice-status');

        // Mobile Safari/Chrome requirement: Create/Resume AudioContext within a user interaction
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Let browser decide sample rate
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('✅ AudioContext resumed');
        }

        statusDiv.textContent = 'Requesting microphone...';

        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        statusDiv.textContent = 'Connecting...';
        startBtn.disabled = true;

        // Initialize recording
        conversationHistory = [];
        recordedAudioChunks = [];
        sessionStartTime = new Date();
        sessionId = generateSessionId();

        await startChat(startBtn, statusDiv);

    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('voice-status').textContent = '❌ Microphone access failed. Check permissions.';
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function startChat(startBtn, statusDiv) {
    const transcriptDiv = document.getElementById('transcript');

    // AudioContext is already initialized in toggleVoiceChat for mobile compatibility
    audioQueue = [];
    isPlaying = false;
    sendBuffer = [];
    timeSinceLastSend = 0;
    lastFrameTime = performance.now();

    console.log('🎤 Audio context sample rate:', audioContext.sampleRate);

    const wsUrl = `wss://api.hume.ai/v0/evi/chat?api_key=${HUME_API_KEY}&config_id=${HUME_CONFIG_ID}`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('✅ Connected');

        // ... (settings remain the same) ...
        const sessionSettings = {
            type: 'session_settings',
            audio: {
                encoding: 'linear16',
                channels: 1,
                sample_rate: 16000
            },
            context: {
                text: `You are the advanced AI Sales Representative for "Lockdown Studios". Your name is "Aura".

OBJECTIVE:
Your main goal is to introduce and advertise the "AI Avatar" solution to potential business clients. You must persuade them of the immense value, efficiency, and cost-savings this technology offers.

KEY BENEFITS TO HIGHLIGHT (Focus on these):
1. 24/7 Availability & Instant Response: Imagine a support agent that never sleeps, never takes a break, and answers every customer instantly, at any time of day. Eliminate wait times completely. Your customers get answers immediately, boosting satisfaction and retention.

2. Massive Cost Savings (ROI): Reduce your overhead significantly. Instead of hiring, training, and managing a large support team, one AI Avatar can handle thousands of conversations simultaneously. It's a fraction of the cost of a human employee, with zero downtime.

3. Consistency & Brand Safety: Always on-brand, always accurate. I don't have "bad days". I deliver your perfect sales pitch or support answer every single time.

4. Scalability: Whether you have 10 visitors or 10,000, I handle them all effortlessly. You never need to worry about scaling up support during peak times.

GUIDELINES:
- NO PRICING: Do not mention specific prices. If asked, say: "We offer tailored packages to fit your specific needs. I can arrange for a human specialist to give you a custom quote."
- BE PERSUASIVE: Use engaging, professional, and confident language.
- CLOSE THE DEAL (Soft Close): Encourage them to consider how much time and money they could save. Ask things like: "How much time does your team currently spend answering repetitive questions?".

PERSONALITY: Professional, efficient, futuristic, and friendly. You are a shining example of the product you are selling.`
            }
        };
        socket.send(JSON.stringify(sessionSettings));
        console.log('📤 Sent session_settings');

        statusDiv.innerHTML = '🎤 <span style="animation: pulse 1.5s ease-in-out infinite;">Listening - Speak now!</span>';
        statusDiv.style.color = '#10B981';
        statusDiv.style.fontWeight = '600';
        transcriptDiv.style.display = 'block';
        transcriptDiv.innerHTML = '<div style="text-align: center; padding: 1rem; background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: 0.5rem; font-weight: 600; animation: pulse 1.5s ease-in-out infinite;">🎤 SPEAK NOW - I\'m listening!</div>';

        // Add pulse animation
        if (!document.getElementById('pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }

        startBtn.innerHTML = '<svg width="24" height="24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg> Stop';
        startBtn.disabled = false;
        startBtn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';

        startAudioCapture();
        startSendLoop();
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === 'user_message' && msg.message) {
            const text = msg.message.content || msg.message.text || '';
            if (text) {
                statusDiv.innerHTML = '🤖 <span style="animation: pulse 1.5s ease-in-out infinite;">AI is thinking...</span>';
                statusDiv.style.color = '#6366F1';
                transcriptDiv.innerHTML = `<div style="margin-bottom:0.5rem;"><strong>You:</strong> ${text}</div>` + transcriptDiv.innerHTML;
                console.log('👤 Visitor said:', text);
                conversationHistory.push({ role: 'user', text: text, timestamp: new Date().toISOString() });
            }
        }

        if (msg.type === 'assistant_message' && msg.message) {
            const text = msg.message.content || msg.message.text || '';
            if (text) {
                statusDiv.innerHTML = '🔊 <span style="animation: pulse 1.5s ease-in-out infinite;">AI is speaking...</span>';
                statusDiv.style.color = '#8B5CF6';
                transcriptDiv.innerHTML = `<div style="margin-bottom:0.5rem;color:#6366F1;"><strong>AI:</strong> ${text}</div>` + transcriptDiv.innerHTML;
                console.log('🤖 AI said:', text);
                conversationHistory.push({ role: 'assistant', text: text, timestamp: new Date().toISOString() });
            }
        }

        if (msg.type === 'audio_output' && msg.data) {
            // Decouple audio processing to prevent blocking the socket handling
            processAudioChunk(msg.data);

            // Save audio chunk metadata (without the massive base64 literal to save memory in logs)
            recordedAudioChunks.push({
                role: 'assistant',
                timestamp: new Date().toISOString(),
                // data: msg.data // Uncomment if you REALLY need to save audio blobs to backend
            });
        }

        if (msg.type === 'user_interruption') {
            console.log('⏸️ Interruption');
            stopAudioPlayback();
        }
    };

    socket.onerror = (error) => {
        console.error('❌ Error:', error);
        statusDiv.textContent = '❌ Connection error';
    };

    socket.onclose = () => {
        console.log('🔌 Disconnected');
        stopChat();
    };
}

async function processAudioChunk(base64Data) {
    try {
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode audio data using Web Audio API
        // CRITICAL FIX: slice(0) to ensure a clean ArrayBuffer copy is passed to decodeAudioData
        // This prevents "detached ArrayBuffer" errors or issues with views
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
        audioQueue.push(audioBuffer);

        if (!isPlaying) {
            playNextAudio();
        }
    } catch (e) {
        console.error("Error decoding audio chunk:", e);
    }
}

// Keep track of the currently playing source to stop it immediately on interruption
let currentSource = null;

function stopAudioPlayback() {
    isPlaying = false;
    audioQueue = []; // Clear queue
    if (currentSource) {
        try {
            currentSource.stop();
        } catch (e) {
            // Ignore if already stopped
        }
        currentSource = null;
    }
}

function playNextAudio() {
    if (audioQueue.length === 0) {
        isPlaying = false;

        // Reset UI if we are done speaking
        const statusDiv = document.getElementById('voice-status');
        const transcriptDiv = document.getElementById('transcript');
        if (statusDiv && transcriptDiv) {
            statusDiv.innerHTML = '🎤 <span style="animation: pulse 1.5s ease-in-out infinite;">Listening - Speak now!</span>';
            statusDiv.style.color = '#10B981';
        }
        return;
    }

    isPlaying = true;
    const buffer = audioQueue.shift();

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    source.onended = () => {
        currentSource = null;
        playNextAudio();
    };

    currentSource = source;
    source.start(0);
}

function stopChat() {
    if (socket) {
        socket.close();
        socket = null;
    }
    if (processor) {
        processor.disconnect();
        processor = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    audioQueue = [];
    sendBuffer = [];
    isPlaying = false;

    const startBtn = document.getElementById('start-voice-btn');
    const statusDiv = document.getElementById('voice-status');
    const transcriptDiv = document.getElementById('transcript');

    startBtn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Start Voice Chat';
    startBtn.disabled = false;
    startBtn.style.background = 'linear-gradient(135deg, #6366F1, #8B5CF6)';
    statusDiv.textContent = 'Disconnected';
    statusDiv.style.color = 'var(--color-text-muted)';

    // Send conversation data to YOUR backend (not downloadable by visitor)
    if (conversationHistory.length > 0) {
        sendConversationToBackend();
    }
}

async function sendConversationToBackend() {
    const conversationData = {
        sessionId: sessionId,
        sessionStart: sessionStartTime.toISOString(),
        sessionEnd: new Date().toISOString(),
        durationSeconds: Math.round((new Date() - sessionStartTime) / 1000),
        transcript: conversationHistory,
        audioChunks: recordedAudioChunks,
        visitorInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct'
        }
    };

    try {
        const response = await fetch(BACKEND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(conversationData)
        });

        if (response.ok) {
            console.log('✅ Conversation data sent to backend');
        } else {
            console.error('❌ Failed to send conversation data:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Error sending conversation data:', error);
        // Fallback: save to localStorage for later retry
        try {
            const savedConversations = JSON.parse(localStorage.getItem('pendingConversations') || '[]');
            savedConversations.push(conversationData);
            localStorage.setItem('pendingConversations', JSON.stringify(savedConversations));
            console.log('💾 Conversation saved locally for later sync');
        } catch (e) {
            console.error('❌ Failed to save locally:', e);
        }
    }
}

if (humeAiContainer) {
    initializeHumeUI();
}
