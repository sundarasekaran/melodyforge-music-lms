/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Piano types adapted from PianoVerse for MelodyForge LMS
 */

export type PianoVoice = 'grand' | 'electric' | 'harpsichord';

export type VirtualPianoMode =
  | 'free'
  | 'guided-notes'
  | 'scale-practice'
  | 'chord-practice'
  | 'melody-practice';

export interface PianoKeyData {
  midi: number;
  note: string; // e.g. "C4", "F#3"
  pitchClass: string; // e.g. "C", "F#"
  enharmonic?: string; // e.g. "Gb"
  octave: number;
  isBlack: boolean;
  frequency: number;
  whiteIndex: number; // 0..51 for white keys, or nearest left white key index for black keys
  keyboardShortcut?: string;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  root: string;
  formula: string;
  intervals: number[]; // semitones from root
  notes: string[]; // pitch classes
  midiSample: number[]; // 1-octave sample starting around C4/G3/F3
  fingeringsRH: string[];
  description: string;
}

export interface ChordDefinition {
  id: string;
  name: string;
  quality: 'Major' | 'Minor';
  root: string;
  notes: string[]; // pitch classes
  midiNotes: number[]; // playable voicing in middle register
  formula: string;
  mood: string;
}

export interface MelodyNoteStep {
  midi: number;
  note: string;
  beats: number;
  lyricOrLabel?: string;
  finger?: number;
}

export interface MelodyDefinition {
  id: string;
  title: string;
  composer: string;
  difficulty: 'Absolute Beginner' | 'Beginner' | 'Early Intermediate';
  bpm: number;
  timeSignature: '4/4' | '3/4';
  description: string;
  steps: MelodyNoteStep[];
}
