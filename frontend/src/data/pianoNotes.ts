/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Piano notes, scales, chords, and melodies adapted from PianoVerse for MelodyForge LMS
 */

import type { ChordDefinition, MelodyDefinition, PianoKeyData, ScaleDefinition } from '../types/piano.ts';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const ENHARMONIC_MAP: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

// Map middle octave C4..E5 to computer keyboard keys for immediate playability
const BASE_KEYBOARD_MAP: Record<number, string> = {
  60: 'A', // C4
  61: 'W', // C#4
  62: 'S', // D4
  63: 'E', // D#4
  64: 'D', // E4
  65: 'F', // F4
  66: 'T', // F#4
  67: 'G', // G4
  68: 'Y', // G#4
  69: 'H', // A4
  70: 'U', // A#4
  71: 'J', // B4
  72: 'K', // C5
  73: 'O', // C#5
  74: 'L', // D5
  75: 'P', // D#5
  76: ';', // E5
};

export const KEYBOARD_SHORTCUT_TO_OFFSET: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
  o: 13,
  l: 14,
  p: 15,
  ';': 16,
};

function build88Keys(): PianoKeyData[] {
  const keys: PianoKeyData[] = [];
  let whiteCounter = 0;

  // Standard 88-key piano: A0 (MIDI 21) through C8 (MIDI 108)
  for (let midi = 21; midi <= 108; midi++) {
    const pitchClass = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    const isBlack = pitchClass.includes('#');
    const frequency = Number((440 * Math.pow(2, (midi - 69) / 12)).toFixed(2));

    const whiteIndex = isBlack ? whiteCounter - 1 : whiteCounter;
    if (!isBlack) {
      whiteCounter++;
    }

    keys.push({
      midi,
      note: `${pitchClass}${octave}`,
      pitchClass,
      enharmonic: ENHARMONIC_MAP[pitchClass],
      octave,
      isBlack,
      frequency,
      whiteIndex,
      keyboardShortcut: BASE_KEYBOARD_MAP[midi],
    });
  }

  return keys;
}

export const PIANO_88_KEYS: PianoKeyData[] = build88Keys();

export const WHITE_KEY_COUNT = PIANO_88_KEYS.filter((k) => !k.isBlack).length; // 52
export const BLACK_KEY_COUNT = PIANO_88_KEYS.filter((k) => k.isBlack).length; // 36

export function getKeyByMidi(midi: number): PianoKeyData | undefined {
  return PIANO_88_KEYS.find((k) => k.midi === midi);
}

export function getKeyByNoteName(note: string): PianoKeyData | undefined {
  return PIANO_88_KEYS.find((k) => k.note === note);
}

export function formatNoteLabel(key: PianoKeyData): string {
  return key.enharmonic ? `${key.pitchClass}${key.octave} / ${key.enharmonic}${key.octave}` : key.note;
}

export const SCALES: ScaleDefinition[] = [
  {
    id: 'c-major',
    name: 'C Major',
    root: 'C',
    formula: 'W – W – H – W – W – W – H',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    midiSample: [60, 62, 64, 65, 67, 69, 71, 72],
    fingeringsRH: ['1', '2', '3', '1 (tuck)', '2', '3', '4', '5'],
    description:
      'The foundational scale of Western piano music. Played exclusively on white keys starting on Middle C (C4), using a thumb tuck under finger 3 onto F4.',
  },
  {
    id: 'g-major',
    name: 'G Major',
    root: 'G',
    formula: 'W – W – H – W – W – W – H',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    midiSample: [67, 69, 71, 72, 74, 76, 78, 79],
    fingeringsRH: ['1', '2', '3', '1 (tuck)', '2', '3', '4', '5'],
    description:
      'Introduces a single black key—F sharp (F#)—to keep the seventh scale degree a half step below G, preserving the bright major sound.',
  },
  {
    id: 'f-major',
    name: 'F Major',
    root: 'F',
    formula: 'W – W – H – W – W – W – H',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    notes: ['F', 'G', 'A', 'A#', 'C', 'D', 'E'],
    midiSample: [65, 67, 69, 70, 72, 74, 76, 77],
    fingeringsRH: ['1', '2', '3', '4 (Bb)', '1 (tuck)', '2', '3', '4'],
    description:
      'Introduces B flat (Bb, enharmonic with A#). Notice the right-hand fingering turns after finger 4 on Bb so the thumb lands cleanly on C.',
  },
  {
    id: 'a-minor',
    name: 'A Natural Minor',
    root: 'A',
    formula: 'W – H – W – W – H – W – W',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    midiSample: [57, 59, 60, 62, 64, 65, 67, 69],
    fingeringsRH: ['1', '2', '3', '1 (tuck)', '2', '3', '4', '5'],
    description:
      'The relative minor of C Major. It shares all white keys with C Major, yet starting and resting on A creates a reflective, lyrical mood.',
  },
];

export const CHORDS: ChordDefinition[] = [
  {
    id: 'c-major',
    name: 'C Major',
    quality: 'Major',
    root: 'C',
    notes: ['C', 'E', 'G'],
    midiNotes: [60, 64, 67],
    formula: 'Root (C) + Major 3rd (4 half-steps) + Perfect 5th (7 half-steps)',
    mood: 'Open, bright, and resolved — the home triad of C Major.',
  },
  {
    id: 'f-major',
    name: 'F Major',
    quality: 'Major',
    root: 'F',
    notes: ['F', 'A', 'C'],
    midiNotes: [65, 69, 72],
    formula: 'Root (F) + Major 3rd (A) + Perfect 5th (C)',
    mood: 'Warm, lifted, and supportive — the subdominant IV chord in C Major.',
  },
  {
    id: 'g-major',
    name: 'G Major',
    quality: 'Major',
    root: 'G',
    notes: ['G', 'B', 'D'],
    midiNotes: [67, 71, 74],
    formula: 'Root (G) + Major 3rd (B) + Perfect 5th (D)',
    mood: 'Energetic and expectant — the dominant V chord that pulls back home to C.',
  },
  {
    id: 'a-minor',
    name: 'A Minor',
    quality: 'Minor',
    root: 'A',
    notes: ['A', 'C', 'E'],
    midiNotes: [57, 60, 64],
    formula: 'Root (A) + Minor 3rd (3 half-steps) + Perfect 5th (E)',
    mood: 'Reflective and tender — lowering the 3rd by one half-step shifts major to minor.',
  },
  {
    id: 'd-minor',
    name: 'D Minor',
    quality: 'Minor',
    root: 'D',
    notes: ['D', 'F', 'A'],
    midiNotes: [62, 65, 69],
    formula: 'Root (D) + Minor 3rd (F) + Perfect 5th (A)',
    mood: 'Deep and expressive — built entirely on white keys starting from D.',
  },
];

export const MELODIES: MelodyDefinition[] = [
  {
    id: 'five-finger-etude',
    title: 'Five-Finger Warmup Etude',
    composer: 'Piano Conservatory Classroom',
    difficulty: 'Absolute Beginner',
    bpm: 76,
    timeSignature: '4/4',
    description:
      'Rest your right hand gently over C4–G4 (fingers 1–5) and step up and down cleanly without shifting your wrist.',
    steps: [
      { midi: 60, note: 'C4', beats: 1, finger: 1 },
      { midi: 62, note: 'D4', beats: 1, finger: 2 },
      { midi: 64, note: 'E4', beats: 1, finger: 3 },
      { midi: 65, note: 'F4', beats: 1, finger: 4 },
      { midi: 67, note: 'G4', beats: 2, finger: 5 },
      { midi: 65, note: 'F4', beats: 1, finger: 4 },
      { midi: 64, note: 'E4', beats: 1, finger: 3 },
      { midi: 62, note: 'D4', beats: 1, finger: 2 },
      { midi: 60, note: 'C4', beats: 2, finger: 1 },
    ],
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy (Theme)',
    composer: 'Ludwig van Beethoven',
    difficulty: 'Beginner',
    bpm: 92,
    timeSignature: '4/4',
    description:
      'One of the world’s most recognizable melodies, playable entirely in the C Major five-finger position.',
    steps: [
      { midi: 64, note: 'E4', beats: 1, finger: 3 },
      { midi: 64, note: 'E4', beats: 1, finger: 3 },
      { midi: 65, note: 'F4', beats: 1, finger: 4 },
      { midi: 67, note: 'G4', beats: 1, finger: 5 },
      { midi: 67, note: 'G4', beats: 1, finger: 5 },
      { midi: 65, note: 'F4', beats: 1, finger: 4 },
      { midi: 64, note: 'E4', beats: 1, finger: 3 },
      { midi: 62, note: 'D4', beats: 1, finger: 2 },
      { midi: 60, note: 'C4', beats: 1, finger: 1 },
      { midi: 60, note: 'C4', beats: 1, finger: 1 },
      { midi: 62, note: 'D4', beats: 1, finger: 2 },
      { midi: 64, note: 'E4', beats: 1, finger: 3 },
      { midi: 64, note: 'E4', beats: 1.5, finger: 3 },
      { midi: 62, note: 'D4', beats: 0.5, finger: 2 },
      { midi: 62, note: 'D4', beats: 2, finger: 2 },
    ],
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle, Twinkle, Little Star',
    composer: 'Traditional / Mozart Variations',
    difficulty: 'Beginner',
    bpm: 88,
    timeSignature: '4/4',
    description:
      'Practices steady octave-span phrasing and clean finger leaps between C, G, and A in the right hand.',
    steps: [
      { midi: 60, note: 'C4', beats: 1, finger: 1 },
      { midi: 60, note: 'C4', beats: 1, finger: 1 },
      { midi: 67, note: 'G4', beats: 1, finger: 5 },
      { midi: 67, note: 'G4', beats: 1, finger: 5 },
      { midi: 69, note: 'A4', beats: 1, finger: 5 },
      { midi: 69, note: 'A4', beats: 1, finger: 5 },
      { midi: 67, note: 'G4', beats: 2, finger: 4 },
      { midi: 65, note: 'F4', beats: 1, finger: 3 },
      { midi: 65, note: 'F4', beats: 1, finger: 3 },
      { midi: 64, note: 'E4', beats: 1, finger: 2 },
      { midi: 64, note: 'E4', beats: 1, finger: 2 },
      { midi: 62, note: 'D4', beats: 1, finger: 2 },
      { midi: 62, note: 'D4', beats: 1, finger: 2 },
      { midi: 60, note: 'C4', beats: 2, finger: 1 },
    ],
  },
  {
    id: 'minuet-snippet',
    title: 'Classical Waltz Phrase (3/4)',
    composer: 'Christian Petzold / Bach Notebook',
    difficulty: 'Early Intermediate',
    bpm: 96,
    timeSignature: '3/4',
    description:
      'A graceful 3/4 waltz-time motif introducing expressive leaps from D5 down to G4 and stepping back up.',
    steps: [
      { midi: 74, note: 'D5', beats: 1, finger: 5 },
      { midi: 67, note: 'G4', beats: 0.5, finger: 1 },
      { midi: 69, note: 'A4', beats: 0.5, finger: 2 },
      { midi: 71, note: 'B4', beats: 0.5, finger: 3 },
      { midi: 72, note: 'C5', beats: 0.5, finger: 4 },
      { midi: 74, note: 'D5', beats: 1, finger: 5 },
      { midi: 67, note: 'G4', beats: 1, finger: 1 },
      { midi: 67, note: 'G4', beats: 1, finger: 1 },
    ],
  },
];
