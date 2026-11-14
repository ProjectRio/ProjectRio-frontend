'use client';

// Opt-in room sounds (§10e): a tick under five seconds and a distinct
// "outbid" tone. WebAudio oscillators — no assets to load.

let context: AudioContext | null = null;

function ctx(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!context) {
		const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!Ctor) return null;
		context = new Ctor();
	}
	if (context.state === 'suspended') void context.resume();
	return context;
}

function tone(frequency: number, duration: number, type: OscillatorType = 'square', gain = 0.05, when = 0) {
	const audio = ctx();
	if (!audio) return;
	const oscillator = audio.createOscillator();
	const volume = audio.createGain();
	oscillator.type = type;
	oscillator.frequency.value = frequency;
	volume.gain.value = gain;
	volume.gain.setValueAtTime(gain, audio.currentTime + when);
	volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + when + duration);
	oscillator.connect(volume).connect(audio.destination);
	oscillator.start(audio.currentTime + when);
	oscillator.stop(audio.currentTime + when + duration);
}

export function playTick() {
	tone(1200, 0.05, 'square', 0.03);
}

export function playOutbid() {
	tone(440, 0.12, 'sawtooth', 0.06);
	tone(330, 0.18, 'sawtooth', 0.06, 0.12);
}

export function playSold() {
	tone(660, 0.1, 'square', 0.05);
	tone(880, 0.16, 'square', 0.05, 0.1);
}

export function playYourTurn() {
	tone(523, 0.1, 'triangle', 0.06);
	tone(659, 0.1, 'triangle', 0.06, 0.1);
	tone(784, 0.2, 'triangle', 0.06, 0.2);
}
