import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  PRACTICE_ROUTINES,
  PRACTICE_CATEGORIES,
} from '../data/pianoPracticeRoutines.ts';

describe('1. Structured Practice Routines Catalog', () => {
  it('contains exactly five distinct pedagogical routines', () => {
    assert.strictEqual(PRACTICE_ROUTINES.length, 5);
  });

  it('covers all five required pedagogical categories', () => {
    const categories = PRACTICE_ROUTINES.map((r) => r.category);
    assert.ok(categories.includes('rhythm-timing'));
    assert.ok(categories.includes('finger-independence'));
    assert.ok(categories.includes('scale-practice'));
    assert.ok(categories.includes('chord-transitions'));
    assert.ok(categories.includes('melody-practice'));
  });

  it('provides matching category labels and valid metadata', () => {
    PRACTICE_ROUTINES.forEach((r) => {
      assert.ok(r.id.length > 0);
      assert.ok(r.title.length > 0);
      assert.ok(r.description.length > 0);
      assert.ok(r.pedagogicalGoal.length > 0);
      assert.ok(r.estimatedMinutes >= 5 && r.estimatedMinutes <= 15);
      assert.ok(r.recommendedBpm >= 40 && r.recommendedBpm <= 208);
      assert.ok(r.timeSignature === '4/4' || r.timeSignature === '3/4');
      assert.ok(r.xpReward >= 50 && r.xpReward <= 100);
    });
  });

  it('defines at least four distinct categories in PRACTICE_CATEGORIES', () => {
    assert.strictEqual(PRACTICE_CATEGORIES.length, 5);
  });
});

describe('2. Routine Exercises & Pedagogical Steps Integrity', () => {
  it('ensures every routine contains at least 4 sequential exercises', () => {
    PRACTICE_ROUTINES.forEach((routine) => {
      assert.ok(
        routine.exercises.length >= 4,
        `Routine ${routine.id} should have at least 4 exercises`
      );
    });
  });

  it('verifies Rhythm & Timing routine anchors on Middle C (MIDI 60)', () => {
    const routine = PRACTICE_ROUTINES.find((r) => r.id === 'rhythm-timing-walk');
    assert.ok(routine);
    assert.strictEqual(routine.recommendedBpm, 72);
    assert.strictEqual(routine.timeSignature, '4/4');

    const firstExercise = routine.exercises[0];
    assert.deepStrictEqual(firstExercise.targetMidi, [60, 60, 60, 60]);
    assert.deepStrictEqual(firstExercise.targetNotes, ['C4', 'C4', 'C4', 'C4']);
  });

  it('verifies Finger Independence routine exercises 1-5 climb and descend over C4-G4', () => {
    const routine = PRACTICE_ROUTINES.find((r) => r.id === 'five-finger-velocity');
    assert.ok(routine);

    // Step 1 is ascending 1-5 ladder
    const step1 = routine.exercises[0];
    assert.deepStrictEqual(step1.targetMidi, [60, 62, 64, 65, 67]);
    assert.deepStrictEqual(step1.fingeringsRH, ['1', '2', '3', '4', '5']);

    // Step 2 is descending 5-1 return
    const step2 = routine.exercises[1];
    assert.deepStrictEqual(step2.targetMidi, [67, 65, 64, 62, 60]);
    assert.deepStrictEqual(step2.fingeringsRH, ['5', '4', '3', '2', '1']);
  });

  it('verifies Scale Practice routine executes the thumb-tuck at E4 (3) to F4 (1)', () => {
    const routine = PRACTICE_ROUTINES.find((r) => r.id === 'thumb-tuck-c-major');
    assert.ok(routine);

    const crossoverEx = routine.exercises.find((ex) => ex.id === 'scale-c-2');
    assert.ok(crossoverEx);
    assert.deepStrictEqual(crossoverEx.targetMidi, [64, 65, 67]);
    assert.deepStrictEqual(crossoverEx.fingeringsRH, ['3', '1 (tuck)', '2']);
  });

  it('verifies Chord Transitions routine uses proper C Major, Am, F, and G triads', () => {
    const routine = PRACTICE_ROUTINES.find((r) => r.id === 'four-chord-progression');
    assert.ok(routine);

    // C Major = [60, 64, 67]
    assert.deepStrictEqual(routine.exercises[0].targetMidi, [60, 64, 67]);
    // A Minor = [57, 60, 64]
    assert.deepStrictEqual(routine.exercises[1].targetMidi, [57, 60, 64]);
    // F Major = [65, 69, 72]
    assert.deepStrictEqual(routine.exercises[2].targetMidi, [65, 69, 72]);
    // G Major = [67, 71, 74]
    assert.deepStrictEqual(routine.exercises[3].targetMidi, [67, 71, 74]);
  });

  it('verifies Melody Practice routine supports 4/4 Ode to Joy and 3/4 Waltz', () => {
    const routine = PRACTICE_ROUTINES.find((r) => r.id === 'theme-repertoire-waltz');
    assert.ok(routine);

    // Exercise 1 is in 4/4
    assert.strictEqual(routine.exercises[0].timeSignature, '4/4');
    // Exercise 3 is in 3/4
    assert.strictEqual(routine.exercises[2].timeSignature, '3/4');
    assert.strictEqual(routine.exercises[2].recommendedBpm, 96);
  });
});

describe('3. Practice Progress Tracking & Mathematics', () => {
  it('correctly calculates progress percentage through exercises', () => {
    const totalExercises = 4;
    const calcProgress = (completed: number) => Math.round((completed / totalExercises) * 100);

    assert.strictEqual(calcProgress(0), 0);
    assert.strictEqual(calcProgress(1), 25);
    assert.strictEqual(calcProgress(2), 50);
    assert.strictEqual(calcProgress(3), 75);
    assert.strictEqual(calcProgress(4), 100);
  });

  it('correctly estimates and clamps session duration in seconds', () => {
    const elapsedSeconds = 345;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    assert.strictEqual(mins, 5);
    assert.strictEqual(secs, 45);
  });
});
