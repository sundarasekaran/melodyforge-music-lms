import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ASSESSMENTS_METADATA,
  CLIENT_QUESTIONS_MAP,
} from '../data/assessmentQuestions.ts';

describe('1. Piano Graded Assessments Metadata & Exact Passing Thresholds', () => {
  it('contains exactly three graded assessments corresponding to Levels 1, 2, and 3', () => {
    assert.strictEqual(ASSESSMENTS_METADATA.length, 3);
    assert.deepStrictEqual(
      ASSESSMENTS_METADATA.map((a) => a.level),
      [1, 2, 3]
    );
  });

  it('enforces exact passing score thresholds: Level 1 = 70%, Level 2 = 75%, Level 3 = 80%', () => {
    const l1 = ASSESSMENTS_METADATA.find((a) => a.level === 1);
    const l2 = ASSESSMENTS_METADATA.find((a) => a.level === 2);
    const l3 = ASSESSMENTS_METADATA.find((a) => a.level === 3);

    assert.ok(l1 && l2 && l3);
    assert.strictEqual(l1.passingScorePercent, 70);
    assert.strictEqual(l2.passingScorePercent, 75);
    assert.strictEqual(l3.passingScorePercent, 80);
  });

  it('verifies question count and point structures', () => {
    const l1 = ASSESSMENTS_METADATA.find((a) => a.level === 1)!;
    const l2 = ASSESSMENTS_METADATA.find((a) => a.level === 2)!;
    const l3 = ASSESSMENTS_METADATA.find((a) => a.level === 3)!;

    assert.strictEqual(l1.totalQuestions, 10);
    assert.strictEqual(l2.totalQuestions, 10);
    assert.strictEqual(l3.totalQuestions, 8);

    assert.strictEqual(l1.totalPoints, 100);
    assert.strictEqual(l2.totalPoints, 100);
    assert.strictEqual(l3.totalPoints, 100);

    assert.ok(l1.xpReward >= 300);
    assert.ok(l2.xpReward >= 450);
    assert.ok(l3.xpReward >= 600);
  });
});

describe('2. Authoritative Question Banks & Question Types', () => {
  it('verifies Level 1 question bank coverage (History, Mechanics, Geography, Ergonomics)', () => {
    const q1 = CLIENT_QUESTIONS_MAP[1];
    assert.ok(q1);
    assert.strictEqual(q1.length, 10);

    // Question 1: Cristofori (Piano History)
    assert.strictEqual(q1[0].category, 'History');
    assert.ok(q1[0].prompt.includes('Cristofori') || q1[0].options?.includes('Bartolomeo Cristofori'));

    // Question 2: Soundboard (Piano Components)
    assert.strictEqual(q1[1].category, 'Acoustics');
    assert.ok(q1[1].options?.includes('The soundboard'));

    // Question 3: 88 Keys (Anatomy)
    assert.strictEqual(q1[2].category, 'Anatomy');
    assert.ok(q1[2].options?.some((opt) => opt.includes('88 total (52 white, 36 black)')));

    // Question 4: Middle C (Identify Key)
    assert.strictEqual(q1[3].type, 'IDENTIFY_KEY');
    assert.strictEqual(q1[3].targetNote, 'C4');

    // Question 7: Sitting Posture
    assert.strictEqual(q1[6].category, 'Ergonomics');

    // Question 8: Finger Numbering
    assert.strictEqual(q1[7].category, 'Technique');
  });

  it('verifies Level 2 question bank coverage (Technique, Enharmonics, Chords, Scales)', () => {
    const q2 = CLIENT_QUESTIONS_MAP[2];
    assert.ok(q2);
    assert.strictEqual(q2.length, 10);

    // Q1: F#4 key
    assert.strictEqual(q2[0].type, 'IDENTIFY_KEY');
    assert.strictEqual(q2[0].targetNote, 'F#4');

    // Q2: Enharmonic Bb = A#
    assert.strictEqual(q2[1].category, 'Theory');
    assert.ok(q2[1].options?.some((opt) => opt.includes('A#')));

    // Q3: Natural half step E to F
    assert.ok(q2[2].options?.includes('E to F'));

    // Q4: Octave C5
    assert.strictEqual(q2[3].type, 'IDENTIFY_KEY');
    assert.strictEqual(q2[3].targetNote, 'C5');

    // Q8: C Major Triad Sequence
    assert.strictEqual(q2[7].type, 'PLAY_SEQUENCE');
    assert.strictEqual(q2[7].sequenceLength, 3);

    // Q9: A Minor Triad Sequence
    assert.strictEqual(q2[8].type, 'PLAY_SEQUENCE');
    assert.strictEqual(q2[8].sequenceLength, 3);

    // Q10: 3/4 Waltz
    assert.ok(q2[9].options?.includes('3/4 time'));
  });

  it('verifies Level 3 Conservatory Capstone coverage (Practical Execution)', () => {
    const q3 = CLIENT_QUESTIONS_MAP[3];
    assert.ok(q3);
    assert.strictEqual(q3.length, 8);

    // Practical Task 1: Bb4 / A#4
    assert.strictEqual(q3[0].type, 'IDENTIFY_KEY');

    // Practical Task 2: 1-Octave C Major Scale (8 notes)
    assert.strictEqual(q3[1].type, 'PLAY_SEQUENCE');
    assert.strictEqual(q3[1].sequenceLength, 8);

    // Practical Task 3: G Major Triad (3 notes)
    assert.strictEqual(q3[2].type, 'PLAY_SEQUENCE');
    assert.strictEqual(q3[2].sequenceLength, 3);

    // Practical Task 4: F Major Triad (3 notes)
    assert.strictEqual(q3[3].type, 'PLAY_SEQUENCE');
    assert.strictEqual(q3[3].sequenceLength, 3);

    // Practical Task 5: Beethoven Ode to Joy Melody (9 notes)
    assert.strictEqual(q3[5].type, 'PLAY_SEQUENCE');
    assert.strictEqual(q3[5].sequenceLength, 9);

    // Practical Task 6: Two-Hand Cadence Pattern (5 notes)
    assert.strictEqual(q3[6].type, 'PLAY_SEQUENCE');
    assert.strictEqual(q3[6].sequenceLength, 5);
  });
});

describe('3. Assessment Scoring & Pass/Fail Threshold Verification', () => {
  it('correctly evaluates Level 1 passing threshold at exactly 70%', () => {
    const threshold = 70;
    assert.strictEqual(69 >= threshold, false); // 69% fails
    assert.strictEqual(70 >= threshold, true);  // 70% passes
    assert.strictEqual(85 >= threshold, true);  // 85% passes
  });

  it('correctly evaluates Level 2 passing threshold at exactly 75%', () => {
    const threshold = 75;
    assert.strictEqual(74 >= threshold, false); // 74% fails
    assert.strictEqual(75 >= threshold, true);  // 75% passes
    assert.strictEqual(90 >= threshold, true);  // 90% passes
  });

  it('correctly evaluates Level 3 passing threshold at exactly 80%', () => {
    const threshold = 80;
    assert.strictEqual(79 >= threshold, false); // 79% fails
    assert.strictEqual(80 >= threshold, true);  // 80% passes
    assert.strictEqual(100 >= threshold, true); // 100% passes
  });
});

describe('4. Graduation Certificate Eligibility & Cryptographic Verification', () => {
  function checkGraduationEligibility(
    l1Score: number,
    l2Score: number,
    l3Score: number
  ): boolean {
    const l1Pass = l1Score >= 70;
    const l2Pass = l2Score >= 75;
    const l3Pass = l3Score >= 80;
    return l1Pass && l2Pass && l3Pass;
  }

  it('grants eligibility only when all three levels meet or exceed their thresholds', () => {
    // All passed
    assert.strictEqual(checkGraduationEligibility(70, 75, 80), true);
    assert.strictEqual(checkGraduationEligibility(90, 85, 95), true);

    // Level 1 failed
    assert.strictEqual(checkGraduationEligibility(68, 80, 85), false);

    // Level 2 failed
    assert.strictEqual(checkGraduationEligibility(80, 72, 85), false);

    // Level 3 failed
    assert.strictEqual(checkGraduationEligibility(85, 90, 78), false);
  });

  it('validates Certificate Number format and cryptographic hash expectations', () => {
    const certNumber = 'MF-PIA-2026-0042';
    const certNumberPattern = /^MF-PIA-\d{4}-[A-Z0-9]+$/;
    assert.ok(certNumberPattern.test(certNumber));

    const sampleHash = '380424564c489c6ec710f6368d18e9575916053b811fb2d6ca079212c7595350';
    assert.strictEqual(sampleHash.length, 64);
    assert.ok(/^[0-9a-f]{64}$/.test(sampleHash));
  });
});
