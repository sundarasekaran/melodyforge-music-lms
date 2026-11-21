/**
 * Phase 1 Verification Test Suite
 * Validates Audio Engine, Pitch Mathematics, 88-Key Geometry, Scales, Chords, and Melodies.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { audioEngine } from '../audio/AudioEngine.ts';
import {
  PIANO_88_KEYS,
  WHITE_KEY_COUNT,
  BLACK_KEY_COUNT,
  SCALES,
  CHORDS,
  MELODIES,
  getKeyByMidi,
  getKeyByNoteName,
} from '../data/pianoNotes.ts';

describe('1. AudioEngine & Pitch Mathematics Verification', () => {
  it('correctly maps note names to MIDI numbers', () => {
    assert.strictEqual(audioEngine.noteToMidi('A0'), 21);
    assert.strictEqual(audioEngine.noteToMidi('C1'), 24);
    assert.strictEqual(audioEngine.noteToMidi('C4'), 60); // Middle C
    assert.strictEqual(audioEngine.noteToMidi('A4'), 69); // Concert Pitch 440 Hz
    assert.strictEqual(audioEngine.noteToMidi('C8'), 108); // Highest key
    assert.strictEqual(audioEngine.noteToMidi('F#4'), 66);
    assert.strictEqual(audioEngine.noteToMidi('Bb4'), 70);
  });

  it('correctly maps MIDI numbers back to standard note names', () => {
    assert.strictEqual(audioEngine.midiToNote(21), 'A0');
    assert.strictEqual(audioEngine.midiToNote(60), 'C4');
    assert.strictEqual(audioEngine.midiToNote(69), 'A4');
    assert.strictEqual(audioEngine.midiToNote(108), 'C8');
  });

  it('correctly computes standard equal-temperament frequencies (A4 = 440 Hz)', () => {
    assert.strictEqual(Math.round(audioEngine.midiToFreq(69) * 100) / 100, 440.0);
    // Middle C (C4) = 261.63 Hz
    assert.strictEqual(Math.round(audioEngine.midiToFreq(60) * 100) / 100, 261.63);
    // A0 lowest key = 27.5 Hz
    assert.strictEqual(Math.round(audioEngine.midiToFreq(21) * 100) / 100, 27.5);
    // C8 highest key = 4186.01 Hz
    assert.strictEqual(Math.round(audioEngine.midiToFreq(108) * 100) / 100, 4186.01);
  });

  it('supports voice timbre switching (Grand, Electric, Harpsichord)', () => {
    audioEngine.setVoice('grand');
    assert.strictEqual(audioEngine.getVoice(), 'grand');

    audioEngine.setVoice('electric');
    assert.strictEqual(audioEngine.getVoice(), 'electric');

    audioEngine.setVoice('harpsichord');
    assert.strictEqual(audioEngine.getVoice(), 'harpsichord');

    audioEngine.setVoice('grand');
    assert.strictEqual(audioEngine.getVoice(), 'grand');
  });

  it('supports sustain pedal toggling', () => {
    assert.strictEqual(audioEngine.getSustain(), false);
    audioEngine.setSustain(true);
    assert.strictEqual(audioEngine.getSustain(), true);
    audioEngine.setSustain(false);
    assert.strictEqual(audioEngine.getSustain(), false);
  });

  it('supports master volume adjustment with boundary clamping [0, 1]', () => {
    audioEngine.setVolume(0.5);
    assert.strictEqual(audioEngine.getVolume(), 0.5);

    audioEngine.setVolume(1.5);
    assert.strictEqual(audioEngine.getVolume(), 1.0);

    audioEngine.setVolume(-0.2);
    assert.strictEqual(audioEngine.getVolume(), 0.0);

    audioEngine.setVolume(0.82);
  });

  it('supports mute toggling', () => {
    assert.strictEqual(audioEngine.isMuted(), false);
    audioEngine.setMuted(true);
    assert.strictEqual(audioEngine.isMuted(), true);
    audioEngine.setMuted(false);
    assert.strictEqual(audioEngine.isMuted(), false);
  });
});

describe('2. Piano 88-Key Geometry Verification', () => {
  it('contains exactly 88 keys spanning A0 (21) to C8 (108)', () => {
    assert.strictEqual(PIANO_88_KEYS.length, 88);
    assert.strictEqual(PIANO_88_KEYS[0].midi, 21);
    assert.strictEqual(PIANO_88_KEYS[0].note, 'A0');
    assert.strictEqual(PIANO_88_KEYS[87].midi, 108);
    assert.strictEqual(PIANO_88_KEYS[87].note, 'C8');
  });

  it('has exactly 52 white keys and 36 black keys', () => {
    assert.strictEqual(WHITE_KEY_COUNT, 52);
    assert.strictEqual(BLACK_KEY_COUNT, 36);
  });

  it('provides unique, sequential MIDI values with valid frequencies', () => {
    for (let i = 0; i < PIANO_88_KEYS.length; i++) {
      const key = PIANO_88_KEYS[i];
      assert.strictEqual(key.midi, 21 + i);
      assert.ok(key.frequency > 20 && key.frequency < 4200);
      assert.strictEqual(getKeyByMidi(key.midi)?.note, key.note);
      assert.strictEqual(getKeyByNoteName(key.note)?.midi, key.midi);
    }
  });

  it('correctly maps Middle C (C4) at index 39 (MIDI 60)', () => {
    const middleC = getKeyByMidi(60);
    assert.ok(middleC);
    assert.strictEqual(middleC!.note, 'C4');
    assert.strictEqual(middleC!.pitchClass, 'C');
    assert.strictEqual(middleC!.isBlack, false);
    assert.strictEqual(middleC!.frequency, 261.63);
  });
});

describe('3. Scales, Chords & Melodies Verification', () => {
  it('verifies 4 core scale definitions and right-hand fingerings', () => {
    assert.strictEqual(SCALES.length, 4);
    const cMajor = SCALES.find((s) => s.id === 'c-major')!;
    assert.ok(cMajor);
    assert.deepStrictEqual(cMajor.notes, ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    assert.deepStrictEqual(cMajor.midiSample, [60, 62, 64, 65, 67, 69, 71, 72]);
    assert.strictEqual(cMajor.fingeringsRH[3], '1 (tuck)'); // Thumb tuck
  });

  it('verifies 5 triad chords (Major and Minor)', () => {
    assert.strictEqual(CHORDS.length, 5);
    const cMajorChord = CHORDS.find((c) => c.id === 'c-major')!;
    assert.deepStrictEqual(cMajorChord.midiNotes, [60, 64, 67]);
    assert.strictEqual(cMajorChord.quality, 'Major');

    const aMinorChord = CHORDS.find((c) => c.id === 'a-minor')!;
    assert.deepStrictEqual(aMinorChord.midiNotes, [57, 60, 64]);
    assert.strictEqual(aMinorChord.quality, 'Minor');
  });

  it('verifies 4 interactive song melodies with note steps and fingerings', () => {
    assert.strictEqual(MELODIES.length, 4);
    const odeToJoy = MELODIES.find((m) => m.id === 'ode-to-joy')!;
    assert.ok(odeToJoy);
    assert.strictEqual(odeToJoy.composer, 'Ludwig van Beethoven');
    assert.strictEqual(odeToJoy.steps.length, 15);
    assert.strictEqual(odeToJoy.steps[0].note, 'E4');
    assert.strictEqual(odeToJoy.steps[0].finger, 3);
  });
});
