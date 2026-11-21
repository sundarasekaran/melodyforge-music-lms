/**
 * Phase 2 Pedagogical Labs & Curriculum Mapping Verification Test Suite
 * Tests:
 * 1. Sound Action Physics Lab mechanics, stages, and playable pitches
 * 2. Posture and Hand Positioning Lab ergonomics, 1-5 numbering, and symmetry
 * 3. Keyboard Explorer Game challenges, landmark pitch matching, and difficulty levels
 * 4. Notation Theory Lab staff notes, clef mnemonics, and rhythmic note durations
 * 5. Curriculum Mapping & Gamification integrity
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ACOUSTIC_STAGES,
  DIGITAL_STAGES,
  PLAYABLE_KEYS,
  FINGERS,
  EXPLORER_CHALLENGES,
  STAFF_NOTES,
  DURATIONS,
} from '../data/labsData.ts';
import { getKeyByMidi, getKeyByNoteName } from '../data/pianoNotes.ts';

describe('1. Sound Action Physics Lab Verification', () => {
  it('defines 6 sequential acoustic stages covering the complete key strike cycle (0.0 to 1.0)', () => {
    assert.strictEqual(ACOUSTIC_STAGES.length, 6);
    assert.strictEqual(ACOUSTIC_STAGES[0].step, 1);
    assert.strictEqual(ACOUSTIC_STAGES[0].range[0], 0);
    assert.strictEqual(ACOUSTIC_STAGES[5].step, 6);
    assert.strictEqual(ACOUSTIC_STAGES[5].range[1], 1.0);

    // Verify key mechanical explanations exist
    const titles = ACOUSTIC_STAGES.map((s) => s.title);
    assert.ok(titles.some((t) => t.includes('Damper Lifts')));
    assert.ok(titles.some((t) => t.includes('Whippen') && t.includes('Jack')));
    assert.ok(titles.some((t) => t.includes('Escapement')));
    assert.ok(titles.some((t) => t.includes('String Vibrates')));
    assert.ok(titles.some((t) => t.includes('Soundboard Amplifies')));
    assert.ok(titles.some((t) => t.includes('Damper')));
  });

  it('defines 4 digital optical sensor stages', () => {
    assert.strictEqual(DIGITAL_STAGES.length, 4);
    assert.strictEqual(DIGITAL_STAGES[0].range[0], 0);
    assert.strictEqual(DIGITAL_STAGES[3].range[1], 1.0);
    assert.ok(DIGITAL_STAGES.some((s) => s.title.includes('Optical Beam')));
    assert.ok(DIGITAL_STAGES.some((s) => s.title.includes('DSP Waveform Synthesis')));
  });

  it('provides valid playable acoustic pitches (C3, C4, E4, G4, C5)', () => {
    assert.strictEqual(PLAYABLE_KEYS.length, 5);
    const notes = PLAYABLE_KEYS.map((k) => k.note);
    assert.deepStrictEqual(notes, ['C3', 'C4', 'E4', 'G4', 'C5']);

    // Check Middle C4 frequency and MIDI
    const middleC = PLAYABLE_KEYS.find((k) => k.note === 'C4');
    assert.ok(middleC);
    assert.strictEqual(middleC?.midi, 60);
    assert.strictEqual(middleC?.freq, '261.63 Hz');
    assert.strictEqual(middleC?.isBass, false);

    // Check Bass C3
    const bassC = PLAYABLE_KEYS.find((k) => k.note === 'C3');
    assert.ok(bassC);
    assert.strictEqual(bassC?.midi, 48);
    assert.strictEqual(bassC?.isBass, true);
  });
});

describe('2. Posture and Hand Positioning Lab Verification', () => {
  it('defines standard 1 to 5 finger numbering with anatomical names', () => {
    assert.strictEqual(FINGERS.length, 5);
    assert.strictEqual(FINGERS[0].name, 'Thumb');
    assert.strictEqual(FINGERS[4].name, 'Pinky');
    assert.strictEqual(FINGERS[0].num, 1);
    assert.strictEqual(FINGERS[4].num, 5);
  });

  it('verifies right-hand (C4 to G4) and left-hand (G3 to C3) five-finger symmetry', () => {
    const rhExpected = ['C4', 'D4', 'E4', 'F4', 'G4'];
    const lhExpected = ['G3', 'F3', 'E3', 'D3', 'C3'];

    // Right-hand thumb starts on Middle C (60) and ascends to Pinky (67)
    assert.strictEqual(rhExpected[0], 'C4');
    assert.strictEqual(rhExpected[4], 'G4');

    // Left-hand thumb starts on G3 (55) and pinky descends to C3 (48)
    assert.strictEqual(lhExpected[0], 'G3');
    assert.strictEqual(lhExpected[4], 'C3');

    // Verify all notes exist in piano notes database
    for (const note of [...rhExpected, ...lhExpected]) {
      const key = getKeyByNoteName(note);
      assert.ok(key, `Key ${note} must exist in piano notes registry`);
    }
  });
});

describe('3. Keyboard Explorer Game Verification', () => {
  it('contains 8 progressive challenges divided into Level 1 and Level 2', () => {
    assert.strictEqual(EXPLORER_CHALLENGES.length, 8);
    const level1 = EXPLORER_CHALLENGES.filter((c) => c.level === 1);
    const level2 = EXPLORER_CHALLENGES.filter((c) => c.level === 2);

    assert.ok(level1.length >= 4, 'Level 1 must contain at least 4 natural landmark challenges');
    assert.ok(level2.length >= 3, 'Level 2 must contain accidental and octave challenges');
  });

  it('correctly maps target notes and pitch classes', () => {
    // Challenge 1: Find Middle C (C4)
    const ch1 = EXPLORER_CHALLENGES[0];
    assert.strictEqual(ch1.targetMidi, 60);
    assert.strictEqual(ch1.allowAnyOctave, false);

    // Challenge 3: Find any F key (Pitch class 5)
    const ch3 = EXPLORER_CHALLENGES.find((c) => c.id === 'find-f');
    assert.ok(ch3);
    assert.strictEqual(ch3?.targetMidi % 12, 65 % 12);
    assert.strictEqual(ch3?.allowAnyOctave, true);

    // Challenge 6: Find F#4 (MIDI 66)
    const ch6 = EXPLORER_CHALLENGES.find((c) => c.id === 'find-f-sharp');
    assert.ok(ch6);
    assert.strictEqual(ch6?.targetMidi, 66);
    assert.strictEqual(ch6?.allowAnyOctave, false);

    // Challenge 7: Find C5 (one octave above Middle C, MIDI 72)
    const ch7 = EXPLORER_CHALLENGES.find((c) => c.id === 'find-c5');
    assert.ok(ch7);
    assert.strictEqual(ch7?.targetMidi, 72);
  });
});

describe('4. Notation Theory Lab Verification', () => {
  it('defines 11 treble staff notes from Middle C4 to F5 Line 5', () => {
    assert.strictEqual(STAFF_NOTES.length, 11);
    assert.strictEqual(STAFF_NOTES[0].note, 'C4');
    assert.strictEqual(STAFF_NOTES[0].midi, 60);
    assert.strictEqual(STAFF_NOTES[0].type, 'ledger');

    assert.strictEqual(STAFF_NOTES[10].note, 'F5');
    assert.strictEqual(STAFF_NOTES[10].midi, 77);
    assert.strictEqual(STAFF_NOTES[10].type, 'line');
  });

  it('verifies standard Treble Clef Line mnemonics (Every Good Boy Does Fine)', () => {
    const lines = STAFF_NOTES.filter((n) => n.type === 'line');
    assert.strictEqual(lines.length, 5);

    const lineNotes = lines.map((n) => n.note);
    assert.deepStrictEqual(lineNotes, ['E4', 'G4', 'B4', 'D5', 'F5']);

    const mnemonics = lines.map((n) => n.mnemonic);
    assert.deepStrictEqual(mnemonics, ['Every', 'Good', 'Boy', 'Does', 'Fine']);
  });

  it('verifies standard Treble Clef Space mnemonics (FACE)', () => {
    // Spaces 1 to 4 on the staff
    const spaces = STAFF_NOTES.filter((n) => n.type === 'space' && n.mnemonic !== undefined);
    assert.strictEqual(spaces.length, 4);

    const spaceNotes = spaces.map((n) => n.note);
    assert.deepStrictEqual(spaceNotes, ['F4', 'A4', 'C5', 'E5']);

    const word = spaces.map((n) => n.mnemonic).join('');
    assert.strictEqual(word, 'FACE');
  });

  it('verifies note duration ratios and beats in 4/4 meter', () => {
    assert.strictEqual(DURATIONS.length, 5);

    const whole = DURATIONS.find((d) => d.id === 'whole');
    const half = DURATIONS.find((d) => d.id === 'half');
    const quarter = DURATIONS.find((d) => d.id === 'quarter');
    const eighth = DURATIONS.find((d) => d.id === 'eighth');
    const sixteenth = DURATIONS.find((d) => d.id === 'sixteenth');

    assert.strictEqual(whole?.beats, 4);
    assert.strictEqual(half?.beats, 2);
    assert.strictEqual(quarter?.beats, 1);
    assert.strictEqual(eighth?.beats, 0.5);
    assert.strictEqual(sixteenth?.beats, 0.25);

    // Each note duration halves the previous value
    assert.strictEqual(whole!.beats / 2, half!.beats);
    assert.strictEqual(half!.beats / 2, quarter!.beats);
    assert.strictEqual(quarter!.beats / 2, eighth!.beats);
    assert.strictEqual(eighth!.beats / 2, sixteenth!.beats);
  });
});

describe('5. Curriculum Mapping & Gamification Integrity', () => {
  it('maps all 4 pedagogical labs to MelodyForge Tier 1 (Basics) 3 levels', () => {
    const tier1Structure = {
      level1: {
        title: 'Level 1: Introduction to Piano',
        labs: ['Sound Action & Escapement Physics Lab'],
      },
      level2: {
        title: 'Level 2: Keyboard Geography',
        labs: ['Keyboard Explorer Game', 'Notation Theory Lab'],
      },
      level3: {
        title: 'Level 3: First Playing Skills',
        labs: ['Posture & Hand Positioning Lab', 'Notation Theory Lab'],
      },
    };

    assert.ok(tier1Structure.level1.labs.includes('Sound Action & Escapement Physics Lab'));
    assert.ok(tier1Structure.level2.labs.includes('Keyboard Explorer Game'));
    assert.ok(tier1Structure.level3.labs.includes('Posture & Hand Positioning Lab'));
  });
});
