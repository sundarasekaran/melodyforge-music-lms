// Web Audio API & Multi-Harmonic Acoustic Synthesis Engine
// Fully compatible with iOS Safari (WebKit), Android Chrome, and Desktop browsers.
// Features 5-Harmonic Grand Piano, Electric Piano, Harpsichord, Sustain Pedal, Metronome Clicks, and MediaRecorder.

export type PianoVoice = 'grand' | 'electric' | 'harpsichord';

export interface NoteInfo {
  note: string;       // e.g. "C4"
  midi: number;       // e.g. 60
  freq: number;       // e.g. 261.63
  isBlack: boolean;
  keyboardKey?: string;
  name: string;       // e.g. "C"
  octave: number;     // e.g. 4
}

interface ActiveVoiceNode {
  oscillators: OscillatorNode[];
  voiceGain: GainNode;
  filter: BiquadFilterNode;
  midi: number;
  note: string;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Voice tracking by MIDI number (and note key) for polyphony & zero stuck notes
  private activeVoices: Map<number, ActiveVoiceNode> = new Map();
  private sustainedNotes: Set<number> = new Set();
  private heldKeys: Set<number> = new Set();

  // Engine settings
  private volume: number = 0.82;
  private muted: boolean = false;
  private sustain: boolean = false;
  private voice: PianoVoice = 'grand';
  private listeners: Set<() => void> = new Set();
  private globalListenersAttached: boolean = false;

  constructor() {
    this.attachGlobalIOSUnlock();
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.warn('AudioEngine listener error:', e);
      }
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public isReady(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  private attachGlobalIOSUnlock() {
    if (typeof window === 'undefined' || this.globalListenersAttached) return;
    this.globalListenersAttached = true;

    const unlockHandler = () => {
      this.unlockSync();
    };

    // Capture phase guarantees execution inside the user-gesture call stack on iOS WebKit
    window.addEventListener('touchstart', unlockHandler, { capture: true, passive: true });
    window.addEventListener('touchend', unlockHandler, { capture: true, passive: true });
    window.addEventListener('pointerdown', unlockHandler, { capture: true, passive: true });
    window.addEventListener('mousedown', unlockHandler, { capture: true, passive: true });
    window.addEventListener('keydown', unlockHandler, { capture: true, passive: true });

    // Background pause cleanup: immediately terminate ringing voices when app is backgrounded
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopAllNotes(true);
        }
      });
      window.addEventListener('pagehide', () => {
        this.stopAllNotes(true);
      });
    }
  }

  private initContextSync(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    // iOS 17+ AudioSession API: enables playback even when iPhone physical mute switch is engaged
    try {
      const nav = navigator as unknown as { audioSession?: { type: string } };
      if (nav.audioSession && nav.audioSession.type !== 'playback') {
        nav.audioSession.type = 'playback';
      }
    } catch {
      // Ignore on browsers without navigator.audioSession
    }

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API is not supported on this browser.');
        return null;
      }

      this.ctx = new AudioCtx();

      // Dynamics Compressor to eliminate clipping when multiple polyphonic notes sound
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.22, this.ctx.currentTime);

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);

      // Connect: Compressor -> Master Gain -> Destination
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Create stream destination for MediaRecorder (captures all piano voices & practice)
      if (typeof this.ctx.createMediaStreamDestination === 'function') {
        try {
          this.recordingDestination = this.ctx.createMediaStreamDestination();
          this.masterGain.connect(this.recordingDestination);
        } catch (e) {
          console.warn('MediaStreamAudioDestinationNode unsupported on this device', e);
        }
      }

      this.ctx.addEventListener('statechange', () => {
        this.notify();
      });
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Synchronously creates/resumes AudioContext and plays a silent 1-sample buffer
   * inside the user-gesture call stack to engage audio hardware on iOS Safari.
   */
  public unlockSync(): AudioContext | null {
    const ctx = this.initContextSync();
    if (!ctx) return null;

    if (ctx.state !== 'running') {
      ctx.resume().then(() => this.notify()).catch(() => {});
    }

    if (!this.isUnlocked) {
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        this.isUnlocked = true;
      } catch {
        // Will retry on next gesture
      }
    }

    return ctx;
  }

  /**
   * Unlock Web Audio hardware specifically for iOS Safari and mobile browsers.
   */
  public async unlockAudio(): Promise<boolean> {
    const ctx = this.unlockSync();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }
    this.notify();
    return true;
  }

  public async ensureContext(): Promise<AudioContext | null> {
    const ctx = this.unlockSync();
    if (!ctx) return null;
    if (ctx.state !== 'running') {
      try {
        await ctx.resume();
      } catch {}
    }
    this.notify();
    return ctx;
  }

  // --- VOLUME & VOICE CONTROLS ---

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
    this.notify();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(val: boolean) {
    this.muted = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
    this.notify();
  }

  public getVoice(): PianoVoice {
    return this.voice;
  }

  public setVoice(v: PianoVoice) {
    this.voice = v;
    this.notify();
  }

  public getSustain(): boolean {
    return this.sustain;
  }

  public setSustain(s: boolean) {
    this.sustain = s;
    if (!s) {
      // Damper pedal released: kill all notes that were sustained but are no longer physically held
      Array.from(this.sustainedNotes).forEach((midi) => {
        if (!this.heldKeys.has(midi)) {
          this.sustainedNotes.delete(midi);
          this.releaseVoice(midi);
        }
      });
    }
    this.notify();
  }

  // --- PITCH & FREQUENCY UTILITIES ---

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

  public midiToNote(midi: number): string {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const pitch = names[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${pitch}${octave}`;
  }

  public midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  public noteToFreq(note: string): number {
    return this.midiToFreq(this.noteToMidi(note));
  }

  private resolveMidiAndNote(noteOrMidi: string | number): { midi: number; note: string } {
    if (typeof noteOrMidi === 'number') {
      return { midi: noteOrMidi, note: this.midiToNote(noteOrMidi) };
    }
    return { midi: this.noteToMidi(noteOrMidi), note: noteOrMidi };
  }

  // --- POLYPHONIC NOTE PLAYBACK & SYNTHESIS ---

  /**
   * Start sounding a note with realistic acoustic piano harmonics, electric piano, or harpsichord.
   * Accepts note string ("C4") or MIDI number (60).
   */
  public startNote(noteOrMidi: string | number, velocity = 0.85, overrideVoice?: PianoVoice) {
    const ctx = this.unlockSync();
    if (!ctx || !this.compressor) return;

    const { midi, note } = this.resolveMidiAndNote(noteOrMidi);
    const freq = this.midiToFreq(midi);
    const activeVoiceType = overrideVoice ?? this.voice;

    this.heldKeys.add(midi);
    this.sustainedNotes.delete(midi);

    // Release any voice already sounding on this pitch to avoid oscillator piling
    if (this.activeVoices.has(midi)) {
      this.releaseVoice(midi, true);
    }

    const now = ctx.currentTime;
    const voiceGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const oscillators: OscillatorNode[] = [];

    const registerScale = Math.max(0.55, Math.min(1.1, 1.0 - (midi - 60) * 0.008));
    const decayTime = activeVoiceType === 'harpsichord' ? 1.1 : Math.max(1.2, 3.8 - (midi - 21) * 0.028);

    if (activeVoiceType === 'grand') {
      // --- ACOUSTIC GRAND PIANO: 5-Harmonic Additive Synthesis ---
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(11000, freq * 8.5), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(320, freq * 2.1), now + 0.85);
      filter.Q.setValueAtTime(0.9, now);

      const harmonics: { mult: number; type: OscillatorType; amp: number; detune?: number }[] = [
        { mult: 1, type: 'triangle', amp: 0.62 },
        { mult: 1, type: 'sine', amp: 0.34, detune: 1.5 }, // Slight beating detune
        { mult: 2, type: 'sine', amp: 0.24 },             // Octave overtone
        { mult: 3, type: 'triangle', amp: 0.11 },
        { mult: 4, type: 'sine', amp: 0.05 },
      ];

      harmonics.forEach((h) => {
        const osc = ctx.createOscillator();
        const partGain = ctx.createGain();
        osc.type = h.type;
        osc.frequency.setValueAtTime(freq * h.mult, now);
        if (h.detune) osc.detune.setValueAtTime(h.detune, now);
        partGain.gain.setValueAtTime(h.amp, now);
        osc.connect(partGain);
        partGain.connect(filter);
        osc.start(now);
        oscillators.push(osc);
      });

      const peak = Math.max(0.05, 0.42 * velocity * registerScale);
      voiceGain.gain.setValueAtTime(0.001, now);
      voiceGain.gain.linearRampToValueAtTime(peak, now + 0.008); // Sharp hammer strike attack
      voiceGain.gain.exponentialRampToValueAtTime(peak * 0.45, now + 0.18);
      voiceGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    } else if (activeVoiceType === 'electric') {
      // --- ELECTRIC PIANO: FM Tine Bell Synthesis ---
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(7500, freq * 5.2), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(280, freq * 1.6), now + 0.7);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);
      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.28, now);
      bellGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc1.connect(filter);
      osc2.connect(bellGain);
      bellGain.connect(filter);

      osc1.start(now);
      osc2.start(now);
      oscillators.push(osc1, osc2);

      const peak = Math.max(0.05, 0.40 * velocity * registerScale);
      voiceGain.gain.setValueAtTime(0.001, now);
      voiceGain.gain.linearRampToValueAtTime(peak, now + 0.008);
      voiceGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime * 0.95);
    } else {
      // --- HARPSICHORD: Crisp Sawtooth Plectrum Pluck ---
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(12000, freq * 11), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(600, freq * 3.5), now + 0.55);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0.32, now);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.18, now);

      osc1.connect(g1);
      osc2.connect(g2);
      g1.connect(filter);
      g2.connect(filter);

      osc1.start(now);
      osc2.start(now);
      oscillators.push(osc1, osc2);

      const peak = Math.max(0.05, 0.44 * velocity * registerScale);
      voiceGain.gain.setValueAtTime(0.001, now);
      voiceGain.gain.linearRampToValueAtTime(peak, now + 0.005);
      voiceGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    }

    // Connect voice: Filter -> Voice Gain -> Master Compressor
    filter.connect(voiceGain);
    voiceGain.connect(this.compressor);

    this.activeVoices.set(midi, {
      oscillators,
      voiceGain,
      filter,
      midi,
      note,
    });
  }

  /**
   * Stop sounding a note. If sustain pedal is engaged, keeps note alive until pedal release.
   */
  public stopNote(noteOrMidi: string | number) {
    const { midi } = this.resolveMidiAndNote(noteOrMidi);
    this.heldKeys.delete(midi);

    if (this.sustain) {
      this.sustainedNotes.add(midi);
      return;
    }

    this.releaseVoice(midi);
  }

  public releaseNote(noteOrMidi: string | number) {
    this.stopNote(noteOrMidi);
  }

  /**
   * Immediately stops all active and sustained voices (e.g. on navigation, pause, or backgrounding).
   */
  public stopAllNotes(immediate = false) {
    this.heldKeys.clear();
    this.sustainedNotes.clear();
    Array.from(this.activeVoices.keys()).forEach((midi) => {
      this.releaseVoice(midi, immediate);
    });
  }

  private releaseVoice(midi: number, immediate = false) {
    const voice = this.activeVoices.get(midi);
    if (!voice || !this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      voice.voiceGain.gain.cancelScheduledValues(now);
      voice.voiceGain.gain.setValueAtTime(voice.voiceGain.gain.value, now);
      const fadeDuration = immediate ? 0.03 : 0.22;
      voice.voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeDuration);

      voice.oscillators.forEach((osc) => {
        try {
          osc.stop(now + fadeDuration + 0.05);
        } catch {}
      });
    } catch {}

    this.activeVoices.delete(midi);
  }

  /**
   * Play a note for a set duration (convenience for ear training, lessons, and song players).
   * Supports seconds (e.g. 0.8) or milliseconds (e.g. 500).
   */
  public playNote(noteOrMidi: string | number, durationSecondsOrMs = 0.8, velocity = 0.8): Promise<void> {
    const durationMs = durationSecondsOrMs > 15 ? durationSecondsOrMs : durationSecondsOrMs * 1000;
    return new Promise((resolve) => {
      this.startNote(noteOrMidi, velocity);
      setTimeout(() => {
        this.stopNote(noteOrMidi);
        resolve();
      }, durationMs);
    });
  }

  public playQuickNote(noteOrMidi: string | number, durationMs = 400, velocity = 0.8) {
    this.startNote(noteOrMidi, velocity);
    setTimeout(() => {
      this.stopNote(noteOrMidi);
    }, durationMs);
  }

  /**
   * Play multiple notes simultaneously (chord or interval).
   */
  public async playChord(notesOrMidis: (string | number)[], durationSeconds = 1.2, velocity = 0.75): Promise<void> {
    notesOrMidis.forEach((n) => this.startNote(n, velocity));
    await new Promise((r) => setTimeout(r, durationSeconds * 1000));
    notesOrMidis.forEach((n) => this.stopNote(n));
  }

  /**
   * Play an ordered melodic sequence (e.g. C-D-E-F-G).
   */
  public async playSequence(notesOrMidis: (string | number)[], intervalMs = 400): Promise<void> {
    for (const n of notesOrMidis) {
      await this.playNote(n, (intervalMs / 1000) * 0.85);
      await new Promise((r) => setTimeout(r, intervalMs * 0.15));
    }
  }

  // --- METRONOME CLICK SYNTHESIZER ---

  /**
   * Retrieves the underlying Web Audio Context current timeline in seconds.
   */
  public getAudioContextTime(): number {
    const ctx = this.unlockSync();
    return ctx ? ctx.currentTime : 0;
  }

  /**
   * Schedules a metronome click at an exact Web Audio timeline timestamp.
   * Eliminates timing drift by utilizing sample-accurate native audio scheduling.
   *
   * @param time Exact AudioContext.currentTime timestamp in seconds
   * @param accent Whether this click represents beat 1 (downbeat)
   * @param volume Metronome volume scalar between 0.0 and 1.0
   */
  public scheduleMetronomeClick(time: number, accent = false, volume = 1.0): void {
    const ctx = this.unlockSync();
    if (!ctx || !this.compressor) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (clampedVolume === 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High wooden accent on beat 1: 1800 Hz / Regular beat: 1200 Hz
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(accent ? 1800 : 1200, time);

    const peak = (accent ? 0.45 : 0.28) * clampedVolume;
    gain.gain.setValueAtTime(Math.max(0.0001, peak), time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  /**
   * Metronome click sound with high-pitch wooden accent on beat 1.
   * Plays immediately at ctx.currentTime for backward compatibility.
   */
  public playMetronomeClick(accent = false, volume = 1.0): void {
    const ctx = this.unlockSync();
    const now = ctx ? ctx.currentTime : 0;
    this.scheduleMetronomeClick(now, accent, volume);
  }

  // --- AUDIO RECORDING ENGINE (MediaRecorder with iOS MP4 & Android/Desktop WebM) ---

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
    const ctx = this.unlockSync();
    if (!ctx || !this.recordingDestination) return false;

    if (typeof MediaRecorder === 'undefined') {
      console.warn('MediaRecorder is not available on this device/browser.');
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
