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
        statusDiv.textContent = 'Requesting microphone...';

        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
        document.getElementById('voice-status').textContent = '❌ Microphone denied';
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function startChat(startBtn, statusDiv) {
    const transcriptDiv = document.getElementById('transcript');

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

        const sessionSettings = {
            type: 'session_settings',
            audio: {
                encoding: 'linear16',
                channels: 1,
                sample_rate: 16000
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
        console.log('📨', msg.type);

        if (msg.type === 'user_message' && msg.message) {
            const text = msg.message.content || msg.message.text || '';
            if (text) {
                // Show that AI heard you
                statusDiv.innerHTML = '🤖 <span style="animation: pulse 1.5s ease-in-out infinite;">AI is thinking...</span>';
                statusDiv.style.color = '#6366F1';

                transcriptDiv.innerHTML = `<div style="margin-bottom:0.5rem;"><strong>You:</strong> ${text}</div>` + transcriptDiv.innerHTML;
                console.log('👤 Visitor said:', text);

                // Save to conversation history (will be sent to YOUR backend)
                conversationHistory.push({
                    role: 'user',
                    text: text,
                    timestamp: new Date().toISOString()
                });
            }
        }

        if (msg.type === 'assistant_message' && msg.message) {
            const text = msg.message.content || msg.message.text || '';
            if (text) {
                // Show AI is responding
                statusDiv.innerHTML = '🔊 <span style="animation: pulse 1.5s ease-in-out infinite;">AI is speaking...</span>';
                statusDiv.style.color = '#8B5CF6';

                transcriptDiv.innerHTML = `<div style="margin-bottom:0.5rem;color:#6366F1;"><strong>AI:</strong> ${text}</div>` + transcriptDiv.innerHTML;
                console.log('🤖 AI said:', text);

                // Save to conversation history
                conversationHistory.push({
                    role: 'assistant',
                    text: text,
                    timestamp: new Date().toISOString()
                });
            }
        }

        if (msg.type === 'audio_output' && msg.data) {
            console.log('🔊 Audio chunk');

            // Show AI is speaking
            statusDiv.innerHTML = '🔊 <span style="animation: pulse 1.5s ease-in-out infinite;">AI is speaking...</span>';
            statusDiv.style.color = '#8B5CF6';

            audioQueue.push(msg.data);

            // Save audio chunk (will be sent to YOUR backend)
            recordedAudioChunks.push({
                role: 'assistant',
                audioData: msg.data,
                timestamp: new Date().toISOString()
            });

            if (!isPlaying) playNextAudio();
        }

        if (msg.type === 'user_interruption') {
            console.log('⏸️ Interruption');
            audioQueue = [];
            isPlaying = false;
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

function startAudioCapture() {
    const source = audioContext.createMediaStreamSource(mediaStream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    const nativeSampleRate = audioContext.sampleRate;
    const targetSampleRate = 16000;
    const resampleRatio = targetSampleRate / nativeSampleRate;

    console.log(`🎤 Resampling: ${nativeSampleRate}Hz → ${targetSampleRate}Hz (ratio: ${resampleRatio.toFixed(3)})`);

    processor.onaudioprocess = (e) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const inputLength = inputData.length;

        const outputLength = Math.floor(inputLength * resampleRatio);
        const resampled = new Float32Array(outputLength);

        for (let i = 0; i < outputLength; i++) {
            const srcIndex = i / resampleRatio;
            const srcIndexFloor = Math.floor(srcIndex);
            const srcIndexCeil = Math.min(srcIndexFloor + 1, inputLength - 1);
            const fraction = srcIndex - srcIndexFloor;

            resampled[i] = inputData[srcIndexFloor] * (1 - fraction) + inputData[srcIndexCeil] * fraction;
        }

        const int16 = new Int16Array(outputLength);
        for (let i = 0; i < outputLength; i++) {
            const s = Math.max(-1, Math.min(1, resampled[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const bytes = new Uint8Array(int16.buffer);
        sendBuffer.push(...bytes);
    };

    console.log('✅ Audio capture started');
}

function startSendLoop() {
    function sendLoop() {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        const now = performance.now();
        const deltaTime = (now - lastFrameTime) / 1000;
        lastFrameTime = now;

        timeSinceLastSend += deltaTime;

        if (timeSinceLastSend >= sendInterval && sendBuffer.length > 0) {
            const dataToSend = new Uint8Array(sendBuffer);
            sendBuffer = [];

            const base64 = btoa(String.fromCharCode(...dataToSend));
            socket.send(JSON.stringify({
                type: 'audio_input',
                data: base64
            }));

            timeSinceLastSend = 0;
        }

        requestAnimationFrame(sendLoop);
    }

    requestAnimationFrame(sendLoop);
}

async function playNextAudio() {
    if (audioQueue.length === 0) {
        isPlaying = false;

        // Reset to listening mode
        const statusDiv = document.getElementById('voice-status');
        const transcriptDiv = document.getElementById('transcript');
        if (statusDiv && transcriptDiv) {
            statusDiv.innerHTML = '🎤 <span style="animation: pulse 1.5s ease-in-out infinite;">Listening - Speak now!</span>';
            statusDiv.style.color = '#10B981';

            // Add visual cue at top of transcript
            const existingCue = transcriptDiv.querySelector('.listening-cue');
            if (existingCue) existingCue.remove();

            const listeningCue = document.createElement('div');
            listeningCue.className = 'listening-cue';
            listeningCue.style.cssText = 'text-align: center; padding: 0.75rem; background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: 0.5rem; font-weight: 600; margin-bottom: 0.5rem; animation: pulse 1.5s ease-in-out infinite;';
            listeningCue.textContent = '🎤 Your turn - Speak now!';
            transcriptDiv.insertBefore(listeningCue, transcriptDiv.firstChild);
        }

        return;
    }

    isPlaying = true;
    const base64Audio = audioQueue.shift();

    try {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.onended = () => {
            URL.revokeObjectURL(url);
            playNextAudio();
        };

        audio.onerror = () => {
            URL.revokeObjectURL(url);
            playNextAudio();
        };

        await audio.play();

    } catch (error) {
        console.error('❌ Playback error:', error);
        playNextAudio();
    }
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
