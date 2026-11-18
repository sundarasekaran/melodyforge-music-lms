// Web Audio API & Multi-Harmonic Acoustic Synthesis Engine
// Fully compatible with iOS Safari (WebKit), Android Chrome, and Desktop browsers

export interface NoteInfo {
  note: string;       // e.g. "C4"
  midi: number;       // e.g. 60
  freq: number;       // e.g. 261.63
  isBlack: boolean;
  keyboardKey?: string;
  name: string;       // e.g. "C"
  octave: number;     // e.g. 4
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;
  private masterGain: GainNode | null = null;
  private activeVoices: Map<string, { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }> = new Map();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API is not supported on this browser.');
        return;
      }
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create stream destination for recording pure audio
      if (typeof this.ctx.createMediaStreamDestination === 'function') {
        try {
          this.recordingDestination = this.ctx.createMediaStreamDestination();
          this.masterGain.connect(this.recordingDestination);
        } catch (e) {
          console.warn('MediaStreamAudioDestinationNode unsupported on this device', e);
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Unlock Web Audio hardware specifically for iOS Safari and mobile browsers.
   * On iOS, AudioContext starts suspended and must be unlocked inside a direct user gesture.
   */
  public async unlockAudio(): Promise<boolean> {
    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Play a 1-sample silent buffer to force iOS WebKit audio hardware to engage
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);

      this.isUnlocked = true;
      return true;
    } catch (e) {
      console.warn('Audio unlock warning:', e);
      return false;
    }
  }

  // Convert note string (e.g. "C4", "F#3") to MIDI number
  public noteToMidi(note: string): number {
    const noteMap: Record<string, number> = {
      C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
      'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
    };
    const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 60;
    const name = match[1];
    const octave = parseInt(match[2], 10);
    return 12 * (octave + 1) + (noteMap[name] ?? 0);
  }

  // Convert MIDI number to Frequency (Hz)
  public midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Convert note string to Frequency
  public noteToFreq(note: string): number {
    return this.midiToFreq(this.noteToMidi(note));
  }

  // Play a note (press down) with realistic acoustic piano harmonics & envelope
  public startNote(note: string, velocity = 0.85) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Release any existing voice on this pitch
    this.stopNote(note);

    const freq = this.noteToFreq(note);
    const now = this.ctx.currentTime;

    // Acoustic Piano Dual Harmonic Synthesis:
    // Fundamental (triangle wave for body warmth) + 2nd Harmonic (sine wave for brightness & acoustic chime)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now); // Octave overtone

    // Low-pass filter to simulate wooden piano soundboard damping
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.5, 300), now + 1.2);

    // Voice Gain Envelope (ADSR tailored for piano hammer strike)
    const voiceGain = this.ctx.createGain();
    const peakGain = Math.max(0.1, Math.min(1.0, velocity)) * 0.45;
    
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(peakGain, now + 0.008); // Sharp percussive hammer strike
    voiceGain.gain.exponentialRampToValueAtTime(peakGain * 0.4, now + 0.35); // Initial decay

    // Audio routing
    osc1.connect(voiceGain);
    osc2.connect(voiceGain);
    voiceGain.connect(filter);
    filter.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);

    this.activeVoices.set(note, { osc1, osc2, gain: voiceGain });
  }

  // Release a note (lift finger from key)
  public stopNote(note: string) {
    if (!this.ctx) return;
    const voice = this.activeVoices.get(note);
    if (!voice) return;

    const now = this.ctx.currentTime;
    try {
      // Felt damper drops on string (exponential release)
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      voice.osc1.stop(now + 0.3);
      voice.osc2.stop(now + 0.3);
    } catch {}

    this.activeVoices.delete(note);
  }

  // Play a note for a set duration (for ear training & lesson demos)
  public playNote(note: string, durationSeconds = 0.8, velocity = 0.8): Promise<void> {
    return new Promise((resolve) => {
      this.startNote(note, velocity);
      setTimeout(() => {
        this.stopNote(note);
        resolve();
      }, durationSeconds * 1000);
    });
  }

  // Play an interval or chord (multiple notes simultaneously)
  public async playChord(notes: string[], durationSeconds = 1.2, velocity = 0.75): Promise<void> {
    notes.forEach((n) => this.startNote(n, velocity));
    await new Promise((r) => setTimeout(r, durationSeconds * 1000));
    notes.forEach((n) => this.stopNote(n));
  }

  // Play a melodic sequence (e.g. C-D-E-F-G)
  public async playSequence(notes: string[], intervalMs = 400): Promise<void> {
    for (const note of notes) {
      await this.playNote(note, (intervalMs / 1000) * 0.85);
      await new Promise((r) => setTimeout(r, intervalMs * 0.15));
    }
  }

  // --- AUDIO RECORDING CAPABILITIES WITH IOS MP4 & ANDROID/DESKTOP WEBM SUPPORT ---
  private getSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
      return '';
    }
    const candidates = [
      'audio/mp4',
      'audio/aac',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  }

  public startRecording(): boolean {
    this.initContext();
    if (!this.recordingDestination) return false;

    if (typeof MediaRecorder === 'undefined') {
      console.warn('MediaRecorder is not available on this browser/environment.');
      return false;
    }

    try {
      this.recordedChunks = [];
      const stream = this.recordingDestination.stream;
      const mime = this.getSupportedMimeType();
      
      this.mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (e) {
      console.error('Failed to start MediaRecorder on this device', e);
      return false;
    }
  }

  public stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recorder'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || this.getSupportedMimeType() || 'audio/mp4';
        const audioBlob = new Blob(this.recordedChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve(audioUrl);
      };

      this.mediaRecorder.stop();
    });
  }
}

export const audioEngine = new AudioEngine();
