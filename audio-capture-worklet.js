class PCM16CaptureProcessor extends AudioWorkletProcessor {
    process(inputs) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;

        const channelData = input[0];
        if (!channelData || channelData.length === 0) return true;

        this.port.postMessage(channelData.slice());
        return true;
    }
}

registerProcessor('pcm16-capture-processor', PCM16CaptureProcessor);
