const call = document.getElementById('eve-call');
const status = document.getElementById('eve-status');
const transcript = document.getElementById('eve-transcript');
const messages = document.getElementById('eve-messages');
let session;
let attempt = 0;
let active = false;

function reset(message) {
    ++attempt;
    active = false;
    session = undefined;
    call.disabled = false;
    call.textContent = 'Start voice call';
    status.textContent = message;
}

async function endCall() {
    const current = session;
    reset('Call ended.');
    if (current) {
        call.disabled = true;
        try { await current.endSession(); }
        finally { call.disabled = false; }
    }
}

function showMessage(role, message) {
    const row = document.createElement('p');
    const speaker = document.createElement('strong');
    speaker.textContent = role === 'agent' ? 'Eve' : 'You';
    row.append(speaker, ' — ', message);
    messages.append(row);
    transcript.hidden = false;
    messages.scrollTop = messages.scrollHeight;
}

async function startCall() {
    const current = ++attempt;
    let latestMode = 'listening';
    active = true;
    call.textContent = 'Cancel';
    status.textContent = 'Connecting. Allow microphone access when your browser asks.';
    messages.replaceChildren();
    transcript.hidden = true;
    try {
        const voice = await window.ElevenLabsClient.Conversation.startSession({
            agentId: 'agent_0501kf4tknq1eecr4rs5dgg8v4qw',
            connectionType: 'websocket',
            textOnly: false,
            workletPaths: {
                rawAudioProcessor: '/eve-audio/rawAudioProcessor.js',
                audioConcatProcessor: '/eve-audio/audioConcatProcessor.js'
            },
            libsampleratePath: '/eve-audio/resampler.js',
            onModeChange({ mode }) {
                latestMode = mode;
                if (current === attempt) status.textContent = mode === 'speaking' ? 'Eve is speaking.' : 'Eve is listening.';
            },
            onMessage({ role, message }) {
                if (current === attempt && message) showMessage(role, message);
            },
            onDisconnect({ reason }) {
                if (current === attempt) reset(reason === 'error' ? 'The call disconnected. You can try again.' : 'Call ended.');
            }
        });
        if (current !== attempt) {
            await voice.endSession();
            return;
        }
        session = voice;
        call.textContent = 'End call';
        status.textContent = latestMode === 'speaking' ? 'Eve is speaking.' : 'Eve is listening.';
    } catch (error) {
        if (current !== attempt) return;
        if (error.name === 'NotAllowedError') reset('Microphone access is blocked. Allow it in your browser’s site settings, then try again.');
        else if (error.name === 'NotFoundError') reset('No microphone was found. Connect one and try again.');
        else reset('The call could not connect. Try again or open Eve on ElevenLabs below.');
    }
}

if (!navigator.mediaDevices?.getUserMedia) {
    status.textContent = 'This browser cannot use a microphone here. Open this page in a browser that supports voice calls.';
} else if (!window.ElevenLabsClient?.Conversation) {
    status.textContent = 'The voice player could not load. Refresh the page or open Eve on ElevenLabs below.';
} else {
    call.disabled = false;
    call.addEventListener('click', () => active ? endCall() : startCall());
    window.addEventListener('pagehide', () => { if (active) void endCall(); });
}
