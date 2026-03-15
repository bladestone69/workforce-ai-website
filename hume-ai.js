// Hume AI EVI Integration - Sends conversation data to backend for admin tracking
const HUME_API_KEY = 'zsASFWTIShA5swhpfrxkYj9AYOPEEyhYxZFhtgMsWpHzjgDF';
const HUME_CONFIG_ID = 'fbc5cf5c-5965-4f98-abc2-97a77896d600';
const wsUrl = `wss://api.hume.ai/v0/evi/chat?api_key=${encodeURIComponent(HUME_API_KEY)}&config_id=${encodeURIComponent(HUME_CONFIG_ID)}`;

// Backend endpoint where conversation data will be sent (YOU can track visitors)
const BACKEND_ENDPOINT = '/api/save-conversation'; // Update this to your actual backend URL
const AUDIO_WORKLET_PATH = 'audio-capture-worklet.js';
const MAX_STORED_AUDIO_CHUNKS = 20;
const MAX_CONVERSATION_PAYLOAD_BYTES = 900000;

const humeAiContainer = document.getElementById('hume-ai-container');
let socket = null;
let audioContext = null;
let audioQueue = [];
let isPlaying = false;
let mediaStream = null;
let processor = null;
let captureNode = null;
let inputSource = null;
let audioWorkletReady = false;
let currentSource = null;
let sendBuffer = [];
let sendInterval = 0.1;
let timeSinceLastSend = 0;
let lastFrameTime = performance.now();

// Recording storage (sent to backend, not downloadable by visitor)
let conversationHistory = [];
let recordedAudioChunks = [];
let sessionStartTime = null;
let sessionId = null;
let conversationSent = false;
let droppedAudioChunkCount = 0;
let droppedAudioBase64Chars = 0;
let isStopping = false;

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
            <div id="voice-status" style="margin-top: 1.5rem; font-size: 0.95rem; color: var(--color-text-muted); text-align: center; max-width: 420px; line-height: 1.6;"></div>
            <div id="transcript" style="margin-top: 1rem; padding: 1rem; background: rgba(99, 102, 241, 0.05); border-radius: 0.5rem; min-width: 400px; max-width: 500px; font-size: 0.9rem; display: none; max-height: 200px; overflow-y: auto;"></div>
        </div>
    `;

    document.getElementById('start-voice-btn').addEventListener('click', toggleVoiceChat);
}

async function toggleVoiceChat() {
    const startBtn = document.getElementById('start-voice-btn');
    const statusDiv = document.getElementById('voice-status');

    if (socket && socket.readyState === WebSocket.OPEN) {
        stopChat();
        return;
    }

    // 1. Create AudioContext immediately (Sync) to capture user gesture
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
        statusDiv.style.color = 'var(--color-text-muted)';
        statusDiv.textContent = 'Checking microphone access...';

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw Object.assign(new Error('NO_API'), { name: 'NO_API' });
        }

        // Pre-flight: check current mic permission state if browser supports it
        if (navigator.permissions) {
            try {
                const permResult = await navigator.permissions.query({ name: 'microphone' });
                if (permResult.state === 'denied') {
                    throw Object.assign(new Error('DENIED'), { name: 'DENIED' });
                }
            } catch (permErr) {
                if (permErr.name === 'DENIED') throw permErr;
                // permissions.query not supported — continue anyway
            }
        }

        statusDiv.textContent = 'Requesting microphone... (click Allow if prompted by your browser)';

        // 2. Request Mic Permission
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // 3. Resume AudioContext now that we have permission & flow is active
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        console.log('✅ AudioContext active. State:', audioContext.state);

        statusDiv.textContent = 'Connecting to AI...';
        startBtn.disabled = true;

        // Initialize recording
        conversationHistory = [];
        recordedAudioChunks = [];
        conversationSent = false;
        droppedAudioChunkCount = 0;
        droppedAudioBase64Chars = 0;
        isStopping = false;
        sessionStartTime = new Date();
        sessionId = generateSessionId();

        await startChat(startBtn, statusDiv);

    } catch (error) {
        console.error('❌ Mic/Permission Error:', error);
        startBtn.disabled = false;

        let msg = '';
        if (error.name === 'DENIED' || error.name === 'NotAllowedError') {
            msg = `🎤 <strong>Microphone access was blocked.</strong><br><br>
                   <strong>To fix in Chrome / Edge:</strong><br>
                   Click the 🔒 lock icon in your address bar → set <em>Microphone</em> to <strong>Allow</strong> → refresh the page.`;
        } else if (error.name === 'NO_API') {
            msg = `🎤 Microphone not supported in this browser.<br>Please try <strong>Chrome</strong> or <strong>Edge</strong>.`;
        } else if (error.name === 'NotFoundError') {
            msg = `🎤 No microphone found.<br>Please plug in a mic or headset and try again.`;
        } else {
            msg = `❌ ${error.message || 'Could not access microphone. Check browser permissions and try again.'}`;
        }

        statusDiv.style.color = '#EF4444';
        statusDiv.innerHTML = msg;
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ... (rest of file) ...



async function startChat(startBtn, statusDiv) {
    const transcriptDiv = document.getElementById('transcript');

    // AudioContext is already initialized in toggleVoiceChat
    audioQueue = [];
    isPlaying = false;
    sendBuffer = [];
    timeSinceLastSend = 0;
    lastFrameTime = performance.now();

    console.log('🎤 Audio context sample rate:', audioContext.sampleRate);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('✅ Connected to Hume API');

        // ... (rest of onopen) ...


        const sessionSettings = {
            type: 'session_settings',
            audio: {
                encoding: 'linear16',
                channels: 1,
                sample_rate: 16000
            }
        };
        console.log('📤 Sending session_settings:', JSON.stringify(sessionSettings, null, 2));
        socket.send(JSON.stringify(sessionSettings));

        statusDiv.innerHTML = 'Mic on <span style="animation: pulse 1.5s ease-in-out infinite;">Listening - Speak now!</span>';
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

        startAudioCapture()
            .then(() => {
                startSendLoop();
            })
            .catch((captureError) => {
                console.error('❌ Failed to start audio capture:', captureError);
                statusDiv.textContent = '❌ Audio capture failed';
                stopChat();
            });
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log('📨 Received message type:', msg.type);
        console.log('Explanation:', msg); // Log full message for debugging

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
            if (recordedAudioChunks.length < MAX_STORED_AUDIO_CHUNKS) {
                recordedAudioChunks.push({
                    role: 'assistant',
                    audioData: msg.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                droppedAudioChunkCount += 1;
                droppedAudioBase64Chars += msg.data.length;
            }

            if (!isPlaying) playNextAudio();
        }

        if (msg.type === 'user_interruption') {
            console.log('Interruption');
            audioQueue = [];
            if (currentSource) {
                try {
                    currentSource.stop();
                } catch (e) {
                    // Ignore if source already ended.
                }
                currentSource = null;
            }
            isPlaying = false;
        }

        if (msg.type === 'tool_call') {
            console.log('🛠️ Tool call:', msg);
            handleToolCall(msg);
        }
    };

    socket.onerror = (error) => {
        console.error('❌ Error:', error);
        statusDiv.textContent = '❌ Connection error';
    };

    socket.onclose = () => {
        console.log('🔌 Disconnected');
        stopChat({ fromSocketClose: true });
    };
}

async function startAudioCapture() {
    inputSource = audioContext.createMediaStreamSource(mediaStream);
    const nativeSampleRate = audioContext.sampleRate;
    const targetSampleRate = 16000;
    const resampleRatio = targetSampleRate / nativeSampleRate;

    console.log(`🎤 Resampling: ${nativeSampleRate}Hz → ${targetSampleRate}Hz (ratio: ${resampleRatio.toFixed(3)})`);

    let logCounter = 0;
    const processInputData = (inputData) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        if (!inputData || inputData.length === 0) return;

        // DEBUG: Log input level occasionally to verify mic is working
        logCounter++;
        if (logCounter % 50 === 0) { // Every ~2-3 seconds
            const maxLevel = inputData.reduce((max, val) => Math.max(max, Math.abs(val)), 0);
            console.log(`🎤 Mic Level: ${maxLevel.toFixed(4)} ${maxLevel < 0.001 ? '(SILENCE?)' : ''}`);
        }

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

    if (audioContext.audioWorklet && typeof AudioWorkletNode !== 'undefined') {
        try {
            if (!audioWorkletReady) {
                await audioContext.audioWorklet.addModule(AUDIO_WORKLET_PATH);
                audioWorkletReady = true;
            }

            captureNode = new AudioWorkletNode(audioContext, 'pcm16-capture-processor');
            captureNode.port.onmessage = (event) => {
                processInputData(event.data);
            };

            inputSource.connect(captureNode);
            captureNode.connect(audioContext.destination);
            console.log('✅ Audio capture started (AudioWorklet)');
            return;
        } catch (workletError) {
            console.warn('⚠️ AudioWorklet unavailable, using ScriptProcessor fallback:', workletError);
        }
    }

    processor = audioContext.createScriptProcessor(4096, 1, 1);
    inputSource.connect(processor);
    processor.connect(audioContext.destination);
    processor.onaudioprocess = (e) => {
        processInputData(e.inputBuffer.getChannelData(0));
    };

    console.log('✅ Audio capture started (ScriptProcessor fallback)');
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

        // Reset UI if we are done speaking
        const statusDiv = document.getElementById('voice-status');
        const transcriptDiv = document.getElementById('transcript');
        if (statusDiv && transcriptDiv) {
            statusDiv.innerHTML = 'Mic on <span style="animation: pulse 1.5s ease-in-out infinite;">Listening - Speak now!</span>';
            statusDiv.style.color = '#10B981';
        }
        return;
    }

    isPlaying = true;
    const base64Audio = audioQueue.shift();

    try {
        // Hume returns audio_output.data as base64 WAV, so decode WAV directly.
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const wavBuffer = bytes.buffer.slice(0);
        const audioBuffer = await audioContext.decodeAudioData(wavBuffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = () => {
            if (currentSource === source) {
                currentSource = null;
            }
            isPlaying = false;
            playNextAudio();
        };

        currentSource = source;
        source.start(0);
        console.log(`Playing WAV buffer at ${audioBuffer.sampleRate}Hz`);

    } catch (error) {
        console.error('Playback error:', error);
        isPlaying = false;
        playNextAudio();
    }
}

function stopChat(options = {}) {
    const { fromSocketClose = false } = options;
    if (isStopping) return;

    isStopping = true;

    if (socket) {
        if (!fromSocketClose) {
            try {
                socket.close();
            } catch (e) {
                console.warn('Socket close failed:', e);
            }
        }
        socket = null;
    }
    if (captureNode) {
        captureNode.port.onmessage = null;
        captureNode.disconnect();
        captureNode = null;
    }
    if (processor) {
        processor.onaudioprocess = null;
        processor.disconnect();
        processor = null;
    }
    if (inputSource) {
        inputSource.disconnect();
        inputSource = null;
    }
    if (currentSource) {
        try {
            currentSource.stop();
        } catch (e) {
            // Ignore if already stopped.
        }
        currentSource.disconnect();
        currentSource = null;
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

    if (startBtn) {
        startBtn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Start Voice Chat';
        startBtn.disabled = false;
        startBtn.style.background = 'linear-gradient(135deg, #6366F1, #8B5CF6)';
    }
    if (statusDiv) {
        statusDiv.textContent = 'Disconnected';
        statusDiv.style.color = 'var(--color-text-muted)';
    }

    // Send conversation data to YOUR backend (not downloadable by visitor)
    if (!conversationSent && conversationHistory.length > 0) {
        conversationSent = true;
        sendConversationToBackend();
    }

    isStopping = false;
}

async function sendConversationToBackend() {
    if (!sessionStartTime) return;

    const conversationData = {
        sessionId: sessionId,
        sessionStart: sessionStartTime.toISOString(),
        sessionEnd: new Date().toISOString(),
        durationSeconds: Math.round((new Date() - sessionStartTime) / 1000),
        transcript: conversationHistory,
        audioChunks: recordedAudioChunks,
        audioSummary: {
            storedChunks: recordedAudioChunks.length,
            droppedChunks: droppedAudioChunkCount,
            droppedBase64Chars: droppedAudioBase64Chars
        },
        visitorInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct'
        }
    };

    let serializedConversation = JSON.stringify(conversationData);
    const initialPayloadSize = new TextEncoder().encode(serializedConversation).length;

    if (initialPayloadSize > MAX_CONVERSATION_PAYLOAD_BYTES) {
        console.warn(`⚠️ Conversation payload too large (${initialPayloadSize} bytes). Sending transcript without audio chunks.`);
        conversationData.audioChunks = [];
        conversationData.audioSummary = {
            ...conversationData.audioSummary,
            droppedForPayloadLimit: true,
            originalPayloadBytes: initialPayloadSize
        };
        serializedConversation = JSON.stringify(conversationData);
    }

    try {
        const response = await fetch(BACKEND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: serializedConversation
        });

        if (response.ok) {
            console.log('✅ Conversation data sent to backend');
        } else {
            const errorText = await response.text().catch(() => '');
            console.error('❌ Failed to send conversation data:', response.status, response.statusText, errorText);
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


async function handleToolCall(toolCallMsg) {
    const { tool_call_id, name, parameters } = toolCallMsg;
    console.log(`🛠️ Handling tool: ${name}`, parameters);

    let result = "Tool executed successfully.";
    let success = true;

    try {
        const params = JSON.parse(parameters);

        // Send data to OUR backend
        const response = await fetch('/api/save-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tool: name,
                ...params,
                sessionId: sessionId
            })
        });

        const respData = await response.json();

        if (respData.success) {
            result = `Successfully processed ${name}. saved to ${respData.filename}`;
            // Optional: Show UI feedback
            const statusDiv = document.getElementById('voice-status');
            if (statusDiv) {
                const originalText = statusDiv.innerHTML;
                statusDiv.innerHTML = `✅ Saved ${name === 'create_lead' ? 'Lead' : 'Message'}!`;
                setTimeout(() => statusDiv.innerHTML = originalText, 3000);
            }
        } else {
            success = false;
            result = `Failed to process ${name}: ${respData.error}`;
        }

    } catch (e) {
        console.error('Tool execution error:', e);
        success = false;
        result = `Error executing tool: ${e.message}`;
    }

    // Send response back to Hume
    if (socket && socket.readyState === WebSocket.OPEN) {
        const toolResponse = {
            type: 'tool_response',
            tool_call_id: tool_call_id,
            content: result
        };
        socket.send(JSON.stringify(toolResponse));
        console.log('📤 Sent tool_response:', toolResponse);
    }
}


if (humeAiContainer) {
    initializeHumeUI();
}

