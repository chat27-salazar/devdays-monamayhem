interface Tone {
	frequency: number;
	delay: number;
	duration: number;
	waveform?: OscillatorType;
	volume?: number;
}

export class ArcadeSfx {
	private audioContext: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private enabled = true;

	get isEnabled(): boolean {
		return this.enabled;
	}

	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		if (!this.audioContext || !this.masterGain) {
			return;
		}

		this.masterGain.gain.setTargetAtTime(
			enabled ? 0.15 : 0,
			this.audioContext.currentTime,
			0.01,
		);
	}

	playCoin(): void {
		this.play([
			{ frequency: 988, delay: 0, duration: 0.06, waveform: 'square' },
			{ frequency: 1319, delay: 0.055, duration: 0.09, waveform: 'square' },
		]);
	}

	playPowerUp(): void {
		this.play(
			[523, 659, 784, 1047, 1319].map((frequency, index): Tone => ({
				frequency,
				delay: index * 0.11,
				duration: 0.14,
				waveform: 'square',
			})),
		);
	}

	playStatHit(): void {
		this.play([
			{ frequency: 180, delay: 0, duration: 0.1, waveform: 'square', volume: 0.8 },
			{ frequency: 620, delay: 0.015, duration: 0.055, waveform: 'square', volume: 0.35 },
		]);
	}

	playVictory(): void {
		this.play(
			[523, 659, 784, 1047, 784, 1047, 1319].map((frequency, index): Tone => ({
				frequency,
				delay: index * 0.13,
				duration: 0.19,
				waveform: 'square',
			})),
		);
	}

	private play(tones: Tone[]): void {
		if (!this.enabled) {
			return;
		}

		const context = this.getAudioContext();
		if (!context || !this.masterGain) {
			return;
		}

		if (context.state === 'suspended') {
			void context.resume().catch((error: unknown) => {
				console.error('Could not resume arcade sound effects.', error);
			});
		}

		const now = context.currentTime;
		for (const tone of tones) {
			const start = now + tone.delay;
			const oscillator = context.createOscillator();
			const envelope = context.createGain();
			oscillator.type = tone.waveform ?? 'square';
			oscillator.frequency.setValueAtTime(tone.frequency, start);
			envelope.gain.setValueAtTime(0.0001, start);
			envelope.gain.exponentialRampToValueAtTime(tone.volume ?? 0.65, start + 0.008);
			envelope.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
			oscillator.connect(envelope);
			envelope.connect(this.masterGain);
			oscillator.start(start);
			oscillator.stop(start + tone.duration + 0.01);
		}
	}

	private getAudioContext(): AudioContext | null {
		if (this.audioContext) {
			return this.audioContext;
		}

		if (typeof window.AudioContext === 'undefined') {
			return null;
		}

		this.audioContext = new window.AudioContext();
		this.masterGain = this.audioContext.createGain();
		this.masterGain.gain.value = this.enabled ? 0.15 : 0;
		this.masterGain.connect(this.audioContext.destination);
		return this.audioContext;
	}
}
