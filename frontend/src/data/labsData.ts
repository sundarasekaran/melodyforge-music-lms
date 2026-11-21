/**
 * Phase 2 Pedagogical Labs Data Layer & Models
 * Holds definitions for:
 * 1. Sound Action Physics Lab (Acoustic Stages, Digital Stages, Playable String Pitches, Video Guides)
 * 2. Posture & Hand Positioning Lab (Finger Anatomy, 1-5 Numbering, RH/LH Pitch Symmetry, Alignment States)
 * 3. Keyboard Explorer Game (Landmark Challenges, Pitch Classes, Level Tiers)
 * 4. Notation Theory Lab (Treble Staff Notes, Mnemonics, Note Durations in 4/4)
 */

// 1. Sound Action Physics Lab Data
export const YOUTUBE_VIDEOS = [
  {
    id: '7M30tiSz_2U',
    title: 'How Piano Works — Hammer & Damper Animation',
    focus: '3D cutaway showing key lever, damper lifting, whippen, escapement, and string vibration.',
  },
  {
    id: 'bk-K0JYpYbg',
    title: 'Inside the Grand Piano Action!',
    focus: 'Real close-up camera view of hammers striking steel strings and dampers muting resonance.',
  },
  {
    id: 'vFXBIFyG4tU',
    title: 'Grand Piano: How It Works',
    focus: 'Full mechanical walkthrough from pressed ivory key to cast-iron frame and spruce soundboard.',
  },
  {
    id: 'ckLzGwJ06AI',
    title: 'Anatomy of the Piano Action',
    focus: 'Step-by-step technician breakdown of the repetition lever, jack, knuckle, and backcheck.',
  },
] as const;

export const ACOUSTIC_STAGES = [
  {
    step: 1,
    range: [0, 0.16] as const,
    title: 'Key Depresses & Damper Lifts',
    detail:
      'Pressing the ivory key lever pivots the rear damper lever, lifting the red wool-felt damper cleanly off the top of the string.',
  },
  {
    step: 2,
    range: [0.16, 0.34] as const,
    title: 'Whippen & Jack Launch Hammer',
    detail:
      'The whippen and jack push upward on the hammer knuckle, accelerating the compressed felt hammer swiftly toward the steel string.',
  },
  {
    step: 3,
    range: [0.34, 0.48] as const,
    title: 'Hammer Strikes & Rebounds (Escapement)',
    detail:
      'At impact, the escapement trips so the hammer bounces back to the backcheck—never choking the vibrating string.',
  },
  {
    step: 4,
    range: [0.48, 0.68] as const,
    title: 'String Vibrates at Pitch Frequency',
    detail:
      'The struck string oscillates in a standing wave (e.g., 261.63 Hz for Middle C4) while the damper stays raised above it.',
  },
  {
    step: 5,
    range: [0.68, 0.86] as const,
    title: 'Spruce Soundboard Amplifies Tone',
    detail:
      'Vibrations cross the hardwood bridge into the Sitka spruce soundboard, radiating warm acoustic sound waves.',
  },
  {
    step: 6,
    range: [0.86, 1.0] as const,
    title: 'Key Release Drops Damper to Silence',
    detail:
      'Releasing the key (unless Sustain Pedal is held) drops the felt damper back onto the string, damping the vibration.',
  },
];

export const DIGITAL_STAGES = [
  {
    step: 1,
    range: [0, 0.25] as const,
    title: 'Weighted Key Crosses Optical Beam',
    detail:
      'The graded hammer-action key depresses past dual optical velocity sensors beneath the keybed.',
  },
  {
    step: 2,
    range: [0.25, 0.5] as const,
    title: 'Microsecond Velocity Timing',
    detail:
      'Sensors time the travel between upper and lower beams to calculate exact strike force and tonal brightness.',
  },
  {
    step: 3,
    range: [0.5, 0.78] as const,
    title: 'DSP Waveform Synthesis',
    detail:
      'Digital signal processing shapes multi-harmonic piano waveforms and damper resonance without physical strings.',
  },
  {
    step: 4,
    range: [0.78, 1.0] as const,
    title: 'Stereo Acoustic Output',
    detail:
      'Clean stereo audio radiates through built-in speakers or headphones until key release triggers smooth decay.',
  },
];

export const PLAYABLE_KEYS = [
  { midi: 48, note: 'C3', label: 'C3 Bass', freq: '130.81 Hz', stringDesc: 'Thick copper-wound bass string', waveAmp: 14, isBass: true },
  { midi: 60, note: 'C4', label: 'C4 Middle C', freq: '261.63 Hz', stringDesc: 'Triple-strung medium steel strings', waveAmp: 10, isBass: false },
  { midi: 64, note: 'E4', label: 'E4', freq: '329.63 Hz', stringDesc: 'Mid-register steel strings', waveAmp: 8.5, isBass: false },
  { midi: 67, note: 'G4', label: 'G4', freq: '392.00 Hz', stringDesc: 'Bright mid-treble strings', waveAmp: 7.5, isBass: false },
  { midi: 72, note: 'C5', label: 'C5 Treble', freq: '523.25 Hz', stringDesc: 'Short, high-tension treble strings', waveAmp: 6, isBass: false },
];

// 2. Posture & Hand Positioning Lab Data
export const FINGERS = [
  { num: 1, name: 'Thumb', rhNote: 'C4', rhMidi: 60, lhNote: 'G3', lhMidi: 55 },
  { num: 2, name: 'Index', rhNote: 'D4', rhMidi: 62, lhNote: 'F3', lhMidi: 53 },
  { num: 3, name: 'Middle', rhNote: 'E4', rhMidi: 64, lhNote: 'E3', lhMidi: 52 },
  { num: 4, name: 'Ring', rhNote: 'F4', rhMidi: 65, lhNote: 'D3', lhMidi: 50 },
  { num: 5, name: 'Pinky', rhNote: 'G4', rhMidi: 67, lhNote: 'C3', lhMidi: 48 },
];

// 3. Keyboard Explorer Game Data
export interface ExplorerChallenge {
  id: string;
  level: 1 | 2;
  prompt: string;
  hint: string;
  targetMidi: number;
  targetNote: string;
  allowAnyOctave: boolean;
}

export const EXPLORER_CHALLENGES: ExplorerChallenge[] = [
  {
    id: 'find-middle-c',
    level: 1,
    prompt: 'Find Middle C (C4) on the keyboard.',
    hint: 'Locate the group of 2 black keys near the center. Middle C is the white key immediately to its left.',
    targetMidi: 60,
    targetNote: 'C4',
    allowAnyOctave: false,
  },
  {
    id: 'find-d4',
    level: 1,
    prompt: 'Find D4 — centered between the two black keys.',
    hint: 'The note D sits directly in the center of any group of 2 black keys.',
    targetMidi: 62,
    targetNote: 'D4',
    allowAnyOctave: false,
  },
  {
    id: 'find-f',
    level: 1,
    prompt: 'Find any F key on the keyboard.',
    hint: 'Look for a cluster of 3 black keys. F is always the white key immediately to the left of the 3 black keys.',
    targetMidi: 65,
    targetNote: 'F',
    allowAnyOctave: true,
  },
  {
    id: 'find-g',
    level: 1,
    prompt: 'Find any G key on the keyboard.',
    hint: 'G sits directly inside the 3-black-key group, between the first and second black keys.',
    targetMidi: 67,
    targetNote: 'G',
    allowAnyOctave: true,
  },
  {
    id: 'find-b4',
    level: 1,
    prompt: 'Find B4 — to the right of the three black keys.',
    hint: 'B is the white key situated immediately to the right of the 3 black keys.',
    targetMidi: 71,
    targetNote: 'B4',
    allowAnyOctave: false,
  },
  {
    id: 'find-f-sharp',
    level: 2,
    prompt: 'Find F#4 (F sharp / Gb4) in octave 4.',
    hint: 'Start on F4 (left of the central 3-black-key group) and press the black key one half-step to the right.',
    targetMidi: 66,
    targetNote: 'F#4',
    allowAnyOctave: false,
  },
  {
    id: 'find-c5',
    level: 2,
    prompt: 'Find C5 — one octave above Middle C.',
    hint: 'Move eight white keys to the right of C4 to the next pair of 2 black keys.',
    targetMidi: 72,
    targetNote: 'C5',
    allowAnyOctave: false,
  },
  {
    id: 'find-eb4',
    level: 2,
    prompt: 'Find Eb4 (E-flat / D#4) in octave 4.',
    hint: 'Eb is the second black key in the 2-black-key group right next to E4.',
    targetMidi: 63,
    targetNote: 'Eb4',
    allowAnyOctave: false,
  },
];

// 4. Notation Theory Lab Data
export interface StaffNoteItem {
  label: string;
  clef: string;
  note: string;
  midi: number;
  y: number;
  mnemonic?: string;
  type: 'line' | 'space' | 'ledger';
}

export const STAFF_NOTES: StaffNoteItem[] = [
  { label: 'C4 (Middle C)', clef: 'Treble · Ledger Line Below', note: 'C4', midi: 60, y: 122, type: 'ledger' },
  { label: 'D4', clef: 'Treble · Below Line 1', note: 'D4', midi: 62, y: 112, type: 'space' },
  { label: 'E4', clef: 'Treble · Line 1 (Every)', note: 'E4', midi: 64, y: 102, mnemonic: 'Every', type: 'line' },
  { label: 'F4', clef: 'Treble · Space 1 (F)', note: 'F4', midi: 65, y: 92, mnemonic: 'F', type: 'space' },
  { label: 'G4', clef: 'Treble · Line 2 (Good / Treble Clef Anchor)', note: 'G4', midi: 67, y: 82, mnemonic: 'Good', type: 'line' },
  { label: 'A4', clef: 'Treble · Space 2 (A · Concert Pitch 440 Hz)', note: 'A4', midi: 69, y: 72, mnemonic: 'A', type: 'space' },
  { label: 'B4', clef: 'Treble · Line 3 (Boy)', note: 'B4', midi: 71, y: 62, mnemonic: 'Boy', type: 'line' },
  { label: 'C5', clef: 'Treble · Space 3 (C)', note: 'C5', midi: 72, y: 52, mnemonic: 'C', type: 'space' },
  { label: 'D5', clef: 'Treble · Line 4 (Does)', note: 'D5', midi: 74, y: 42, mnemonic: 'Does', type: 'line' },
  { label: 'E5', clef: 'Treble · Space 4 (E)', note: 'E5', midi: 76, y: 32, mnemonic: 'E', type: 'space' },
  { label: 'F5', clef: 'Treble · Line 5 (Fine)', note: 'F5', midi: 77, y: 22, mnemonic: 'Fine', type: 'line' },
];

export const DURATIONS = [
  { id: 'whole', name: 'Whole Note', symbol: '𝅝', beats: 4, ratio: '4 Beats (100% of 4/4 measure)', pulses: 1, durationMs: 1600 },
  { id: 'half', name: 'Half Note', symbol: '𝅗𝅥', beats: 2, ratio: '2 Beats (50% of measure)', pulses: 2, durationMs: 800 },
  { id: 'quarter', name: 'Quarter Note', symbol: '𝅘𝅥', beats: 1, ratio: '1 Beat (25% of measure)', pulses: 4, durationMs: 400 },
  { id: 'eighth', name: 'Eighth Note', symbol: '𝅘𝅥𝅮', beats: 0.5, ratio: '1/2 Beat (12.5% of measure)', pulses: 8, durationMs: 200 },
  { id: 'sixteenth', name: 'Sixteenth Note', symbol: '𝅘𝅥𝅯', beats: 0.25, ratio: '1/4 Beat (6.25% of measure)', pulses: 16, durationMs: 100 },
];
