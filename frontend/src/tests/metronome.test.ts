import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  clampBpm,
  calculateTapBpm,
  getTempoMarking,
  TEMPO_MARKINGS,
  PRACTICE_ROUTINES,
  PRACTICE_CATEGORIES,
} from '../data/pianoPracticeRoutines.ts';

describe('1. Conservatory Metronome Math & Boundaries', () => {
  it('strictly clamps BPM to minimum 40', () => {
    assert.strictEqual(clampBpm(20), 40);
    assert.strictEqual(clampBpm(0), 40);
    assert.strictEqual(clampBpm(-10), 40);
    assert.strictEqual(clampBpm(39), 40);
  });

  it('strictly clamps BPM to maximum 208', () => {
    assert.strictEqual(clampBpm(209), 208);
    assert.strictEqual(clampBpm(300), 208);
    assert.strictEqual(clampBpm(999), 208);
  });

  it('preserves valid BPM values within [40, 208]', () => {
    assert.strictEqual(clampBpm(60), 60);
    assert.strictEqual(clampBpm(76), 76);
    assert.strictEqual(clampBpm(120), 120);
    assert.strictEqual(clampBpm(208), 208);
    assert.strictEqual(clampBpm(40), 40);
  });

  it('handles NaN gracefully by returning default 100 BPM', () => {
    assert.strictEqual(clampBpm(NaN), 100);
  });

  it('rounds decimal BPM values to the nearest integer', () => {
    assert.strictEqual(clampBpm(84.4), 84);
    assert.strictEqual(clampBpm(84.7), 85);
  });
});

describe('2. Tap-Tempo Calculation Engine', () => {
  it('correctly calculates 60 BPM from 1000ms intervals', () => {
    const taps = [1000, 2000, 3000, 4000]; // 1000ms apart
    const bpm = calculateTapBpm(taps);
    assert.strictEqual(bpm, 60);
  });

  it('correctly calculates 120 BPM from 500ms intervals', () => {
    const taps = [1000, 1500, 2000, 2500]; // 500ms apart
    const bpm = calculateTapBpm(taps);
    assert.strictEqual(bpm, 120);
  });

  it('correctly calculates 100 BPM from 600ms intervals', () => {
    const taps = [1000, 1600, 2200, 2800]; // 600ms apart
    const bpm = calculateTapBpm(taps);
    assert.strictEqual(bpm, 100);
  });

  it('returns default 100 BPM if less than 2 valid taps provided', () => {
    assert.strictEqual(calculateTapBpm([]), 100);
    assert.strictEqual(calculateTapBpm([1000]), 100);
  });

  it('filters out stale taps spaced greater than 2.5 seconds apart', () => {
    // First two taps separated by 4 seconds (stale), then two taps 500ms apart
    const taps = [1000, 5000, 5500];
    const bpm = calculateTapBpm(taps);
    assert.strictEqual(bpm, 120);
  });

  it('clamps calculated tap BPM to maximum 208 if tapped excessively fast', () => {
    // 200ms apart = 300 BPM -> clamped to 208
    const taps = [1000, 1200, 1400, 1600];
    const bpm = calculateTapBpm(taps);
    assert.strictEqual(bpm, 208);
  });

  it('clamps calculated tap BPM to minimum 40 if tapped excessively slow', () => {
    // 2000ms apart = 30 BPM -> clamped to 40
    const taps = [1000, 3000, 5000];
    const bpm = calculateTapBpm(taps);
    assert.strictEqual(bpm, 40);
  });
});

describe('3. Italian Tempo Markings', () => {
  it('correctly maps Largo (40-59 BPM)', () => {
    const info = getTempoMarking(50);
    assert.strictEqual(info.marking, 'Largo');
  });

  it('correctly maps Adagio (60-75 BPM)', () => {
    const info = getTempoMarking(68);
    assert.strictEqual(info.marking, 'Adagio');
  });

  it('correctly maps Andante (76-107 BPM)', () => {
    const info = getTempoMarking(84);
    assert.strictEqual(info.marking, 'Andante');
  });

  it('correctly maps Moderato (108-119 BPM)', () => {
    const info = getTempoMarking(112);
    assert.strictEqual(info.marking, 'Moderato');
  });

  it('correctly maps Allegro (120-155 BPM)', () => {
    const info = getTempoMarking(132);
    assert.strictEqual(info.marking, 'Allegro');
  });

  it('correctly maps Vivace (156-175 BPM)', () => {
    const info = getTempoMarking(160);
    assert.strictEqual(info.marking, 'Vivace');
  });

  it('correctly maps Presto (176-208 BPM)', () => {
    const info = getTempoMarking(184);
    assert.strictEqual(info.marking, 'Presto');
  });

  it('covers all standard conservatory ranges without gaps', () => {
    for (let bpm = 40; bpm <= 208; bpm += 10) {
      const info = getTempoMarking(bpm);
      assert.ok(info.marking.length > 0);
      assert.ok(info.description.length > 0);
    }
  });
});

describe('4. Time Signatures & Metronome Pulse Logic', () => {
  const getBeatsPerMeasure = (sig: '4/4' | '3/4'): number => (sig === '4/4' ? 4 : 3);

  it('defines 4 beats per measure for 4/4 time signature', () => {
    assert.strictEqual(getBeatsPerMeasure('4/4'), 4);
  });

  it('defines 3 beats per measure for 3/4 time signature', () => {
    assert.strictEqual(getBeatsPerMeasure('3/4'), 3);
  });

  it('correctly advances beat and measure counters without drift', () => {
    const beatsPerMeasure = 4;
    let beat = 1;
    let measure = 1;

    for (let i = 0; i < 16; i++) {
      if (beat === beatsPerMeasure) {
        beat = 1;
        measure++;
      } else {
        beat++;
      }
    }

    assert.strictEqual(measure, 5);
    assert.strictEqual(beat, 1);
  });
});
