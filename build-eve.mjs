import { copyFile, mkdir } from 'node:fs/promises';

// Serve the SDK and its audio processors on the studio domain.
const sdk = 'node_modules/@elevenlabs/client';
const resampler = 'node_modules/@alexanderolsen/libsamplerate-js';
const assets = [
    [`${sdk}/dist/lib.iife.js`, 'client.js'],
    [`${sdk}/worklets/rawAudioProcessor.js`, 'rawAudioProcessor.js'],
    [`${sdk}/worklets/audioConcatProcessor.js`, 'audioConcatProcessor.js'],
    [`${sdk}/LICENSE`, 'elevenlabs-license.txt'],
    [`${resampler}/dist/libsamplerate.worklet.js`, 'resampler.js'],
    [`${resampler}/LICENSE.md`, 'resampler-license.txt']
];
await mkdir('eve-audio', { recursive: true });
await Promise.all(assets.map(([source, name]) => copyFile(source, `eve-audio/${name}`)));
