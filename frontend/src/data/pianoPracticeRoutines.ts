// Structured Conservatory Piano Practice Routines & Metronome Helpers
// MelodyForge + PianoVerse Integration

export type PracticeCategory =
  | 'rhythm-timing'
  | 'finger-independence'
  | 'scale-practice'
  | 'chord-transitions'
  | 'melody-practice';

export interface PracticeExercise {
  id: string;
  title: string;
  instruction: string;
  recommendedBpm: number;
  timeSignature: '4/4' | '3/4';
  mode: 'sequence' | 'chord' | 'metronome-walk';
  targetMidi: number[];
  targetNotes: string[];
  fingeringsRH: string[];
  hint: string;
  beats?: number;
}

export interface PracticeRoutineDefinition {
  id: string;
  title: string;
  category: PracticeCategory;
  categoryLabel: string;
  difficulty: 'Absolute Beginner' | 'Beginner' | 'Early Intermediate' | 'Intermediate';
  estimatedMinutes: number;
  recommendedBpm: number;
  timeSignature: '4/4' | '3/4';
  description: string;
  pedagogicalGoal: string;
  xpReward: number;
  exercises: PracticeExercise[];
}

export interface TempoMarking {
  marking: string;
  bpmRange: string;
  description: string;
}

export const TEMPO_MARKINGS: { min: number; max: number; marking: string; description: string }[] = [
  { min: 40, max: 59, marking: 'Largo', description: 'Broad, very slow, stately' },
  { min: 60, max: 75, marking: 'Adagio', description: 'Slow, graceful, expressive' },
  { min: 76, max: 107, marking: 'Andante', description: 'Walking pace, steady, flowing' },
  { min: 108, max: 119, marking: 'Moderato', description: 'Moderate, poised tempo' },
  { min: 120, max: 155, marking: 'Allegro', description: 'Fast, lively, cheerful' },
  { min: 156, max: 175, marking: 'Vivace', description: 'Brisk, spirited, energetic' },
  { min: 176, max: 208, marking: 'Presto', description: 'Very fast, breathless agility' },
];

/**
 * Returns the Italian tempo marking corresponding to the provided BPM.
 */
export function getTempoMarking(bpm: number): { marking: string; description: string } {
  const found = TEMPO_MARKINGS.find((t) => bpm >= t.min && bpm <= t.max);
  if (found) {
    return { marking: found.marking, description: found.description };
  }
  return bpm < 40
    ? { marking: 'Grave', description: 'Solemn and exceptionally slow' }
    : { marking: 'Prestissimo', description: 'Extremely rapid' };
}

/**
 * Clamps a BPM value strictly within the conservatory metronome range [40, 208].
 */
export function clampBpm(bpm: number): number {
  if (isNaN(bpm)) return 100;
  return Math.max(40, Math.min(208, Math.round(bpm)));
}

/**
 * Computes BPM from an array of tap interval timestamps in milliseconds.
 * Requires at least 2 taps. Clamps between 40 and 208 BPM.
 */
export function calculateTapBpm(intervals: number[]): number {
  if (!intervals || intervals.length < 2) return 100;
  // Calculate delta between consecutive taps
  const deltas: number[] = [];
  for (let i = 1; i < intervals.length; i++) {
    const delta = intervals[i] - intervals[i - 1];
    // Filter out taps that were spaced more than 3s apart (reset threshold) or less than 100ms (debounce)
    if (delta >= 100 && delta <= 3000) {
      deltas.push(delta);
    }
  }
  if (deltas.length === 0) return 100;

  // Use average delta
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const rawBpm = 60000 / avgDelta;
  return clampBpm(rawBpm);
}

export const PRACTICE_CATEGORIES: { id: PracticeCategory; label: string; icon: string; description: string }[] = [
  {
    id: 'rhythm-timing',
    label: 'Rhythm & Timing',
    icon: 'activity',
    description: 'Lock onto an even pulse, master downbeats, and build rock-solid internal timekeeping.',
  },
  {
    id: 'finger-independence',
    label: 'Finger Independence',
    icon: 'hand',
    description: 'Equalize strength across fingers 1–5 and release non-playing fingers without tension.',
  },
  {
    id: 'scale-practice',
    label: 'Scale Practice',
    icon: 'trending-up',
    description: 'Execute smooth thumb tucks and fluid keyboard crossings across full octaves.',
  },
  {
    id: 'chord-transitions',
    label: 'Chord Transitions',
    icon: 'layers',
    description: 'Drop 3-note triads with balanced hand weight and pivot smoothly through diatonic progressions.',
  },
  {
    id: 'melody-practice',
    label: 'Melody Practice',
    icon: 'music',
    description: 'Perform expressive melodies in both common 4/4 and classical 3/4 waltz time.',
  },
];

export const PRACTICE_ROUTINES: PracticeRoutineDefinition[] = [
  // 1. Rhythm and Timing
  {
    id: 'rhythm-timing-walk',
    title: 'Stepping in Time: The Metronome Walk',
    category: 'rhythm-timing',
    categoryLabel: 'Rhythm & Timing',
    difficulty: 'Absolute Beginner',
    estimatedMinutes: 5,
    recommendedBpm: 72,
    timeSignature: '4/4',
    description:
      'Lock onto a steady quarter-note pulse across Middle C, D4, and E4 in 4/4 meter. Feel the high woodblock accent on beat 1 anchor every measure.',
    pedagogicalGoal: 'Eliminate hesitation between beats and synchronize finger drop with the exact acoustic downbeat.',
    xpReward: 50,
    exercises: [
      {
        id: 'rhythm-walk-1',
        title: 'Middle C Downbeat Anchor',
        instruction: 'Strike Middle C (C4) on beat 1 and maintain the steady pulse for 4 beats. Repeat cleanly.',
        recommendedBpm: 72,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 60, 60, 60],
        targetNotes: ['C4', 'C4', 'C4', 'C4'],
        fingeringsRH: ['1', '1', '1', '1'],
        hint: 'Drop finger 1 (thumb) gently as the metronome click strikes. Avoid bouncing stiffly.',
      },
      {
        id: 'rhythm-walk-2',
        title: 'Two-Note Stepping Pulse',
        instruction: 'Step back and forth between C4 and D4 on consecutive quarter-note beats.',
        recommendedBpm: 72,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 62, 60, 62],
        targetNotes: ['C4', 'D4', 'C4', 'D4'],
        fingeringsRH: ['1', '2', '1', '2'],
        hint: 'Release C4 right as finger 2 depresses D4 so the tone is legato without blurring.',
      },
      {
        id: 'rhythm-walk-3',
        title: 'Three-Note Melodic Arch',
        instruction: 'Climb C4 → D4 → E4 on beats 1, 2, 3 and step back down to D4 on beat 4.',
        recommendedBpm: 76,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 62, 64, 62],
        targetNotes: ['C4', 'D4', 'E4', 'D4'],
        fingeringsRH: ['1', '2', '3', '2'],
        hint: 'Feel beat 1 (C4) receive natural musical weight as the measure downbeat.',
      },
      {
        id: 'rhythm-walk-4',
        title: 'Four-Measure Steady Cadence',
        instruction: 'Play C4 → D4 → E4 → D4 → C4 with a sustained 2-beat resolution on the final C4.',
        recommendedBpm: 80,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 62, 64, 62, 60],
        targetNotes: ['C4', 'D4', 'E4', 'D4', 'C4'],
        fingeringsRH: ['1', '2', '3', '2', '1'],
        hint: 'Hold the final C4 for its full duration while the metronome counts out the resolution.',
      },
    ],
  },

  // 2. Finger Independence
  {
    id: 'five-finger-velocity',
    title: 'Five-Finger Velocity & Articulation',
    category: 'finger-independence',
    categoryLabel: 'Finger Independence',
    difficulty: 'Beginner',
    estimatedMinutes: 7,
    recommendedBpm: 76,
    timeSignature: '4/4',
    description:
      'Coordinate fingers 1 through 5 over adjacent white keys C4–G4. Strengthen naturally weaker fingers 4 and 5 while maintaining relaxed wrist alignment.',
    pedagogicalGoal: 'Develop independent neuromuscular control for each finger without raising or tensing non-playing knuckles.',
    xpReward: 65,
    exercises: [
      {
        id: 'five-finger-1',
        title: 'Ascending Five-Finger Ladder',
        instruction: 'Play C4 (1) → D4 (2) → E4 (3) → F4 (4) → G4 (5) with even tone across all fingers.',
        recommendedBpm: 76,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 62, 64, 65, 67],
        targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
        fingeringsRH: ['1', '2', '3', '4', '5'],
        hint: 'Keep fingers 4 (ring) and 5 (pinky) curved on their tips rather than collapsing flat.',
      },
      {
        id: 'five-finger-2',
        title: 'Descending Five-Finger Return',
        instruction: 'Step back down G4 (5) → F4 (4) → E4 (3) → D4 (2) → C4 (1) in unbroken rhythm.',
        recommendedBpm: 76,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [67, 65, 64, 62, 60],
        targetNotes: ['G4', 'F4', 'E4', 'D4', 'C4'],
        fingeringsRH: ['5', '4', '3', '2', '1'],
        hint: 'Do not let finger 4 rush into finger 3; articulate each note with patient clarity.',
      },
      {
        id: 'five-finger-3',
        title: 'Weak Finger Trill Drill (3–4–5 Isolation)',
        instruction: 'Focus on outer hand balance: E4 (3) → F4 (4) → G4 (5) → F4 (4) → E4 (3).',
        recommendedBpm: 80,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [64, 65, 67, 65, 64],
        targetNotes: ['E4', 'F4', 'G4', 'F4', 'E4'],
        fingeringsRH: ['3', '4', '5', '4', '3'],
        hint: 'Isolate finger motion from the bridge knuckle without sympathetic wrist twisting.',
      },
      {
        id: 'five-finger-4',
        title: 'Full Five-Finger Arch Etude',
        instruction: 'Combine ascent and descent: C4 → D4 → E4 → F4 → G4 → F4 → E4 → D4 → C4.',
        recommendedBpm: 84,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 62, 64, 65, 67, 65, 64, 62, 60],
        targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4', 'C4'],
        fingeringsRH: ['1', '2', '3', '4', '5', '4', '3', '2', '1'],
        hint: 'Aim for identical volume on every key so the listener cannot guess which finger played which note.',
      },
    ],
  },

  // 3. Scale Practice
  {
    id: 'thumb-tuck-c-major',
    title: 'Smooth Thumb-Tuck C Major Scale',
    category: 'scale-practice',
    categoryLabel: 'Scale Practice',
    difficulty: 'Early Intermediate',
    estimatedMinutes: 8,
    recommendedBpm: 80,
    timeSignature: '4/4',
    description:
      'Master the essential 1-octave C Major scale with the thumb tuck under finger 3 (E4 to F4). Coordinate steady pulse without elbow twisting or sudden accents.',
    pedagogicalGoal: 'Achieve seamless horizontal mobility along the keyboard using the standard pianist thumb-tuck technique.',
    xpReward: 75,
    exercises: [
      {
        id: 'scale-c-1',
        title: 'Lower Tetrachord Setup',
        instruction: 'Play the first three notes C4 (1) → D4 (2) → E4 (3). Hold E4 momentarily.',
        recommendedBpm: 80,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 62, 64],
        targetNotes: ['C4', 'D4', 'E4'],
        fingeringsRH: ['1', '2', '3'],
        hint: 'While finger 3 plays E4, prepare your thumb by relaxing it under the palm toward F4.',
      },
      {
        id: 'scale-c-2',
        title: 'The Thumb Crossover Pivot',
        instruction: 'Practice the critical transition: E4 (3) → F4 (thumb 1) → G4 (2).',
        recommendedBpm: 80,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [64, 65, 67],
        targetNotes: ['E4', 'F4', 'G4'],
        fingeringsRH: ['3', '1 (tuck)', '2'],
        hint: 'Glide the thumb smoothly under finger 3 onto F4 without popping your elbow outward.',
      },
      {
        id: 'scale-c-3',
        title: 'Upper Pentachord Climb',
        instruction: 'Complete the upper portion: F4 (1) → G4 (2) → A4 (3) → B4 (4) → C5 (5).',
        recommendedBpm: 84,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [65, 67, 69, 71, 72],
        targetNotes: ['F4', 'G4', 'A4', 'B4', 'C5'],
        fingeringsRH: ['1', '2', '3', '4', '5'],
        hint: 'Finger 5 lands cleanly on high C5 with curved arch and relaxed forearm.',
      },
      {
        id: 'scale-c-4',
        title: 'Complete 1-Octave Ascending C Major',
        instruction: 'Play all 8 notes in a single uninterrupted phrase: C4 → D4 → E4 → F4 → G4 → A4 → B4 → C5.',
        recommendedBpm: 84,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 62, 64, 65, 67, 69, 71, 72],
        targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        fingeringsRH: ['1', '2', '3', '1 (tuck)', '2', '3', '4', '5'],
        hint: 'One note per metronome click. Keep tone fluid like beads on a silk string.',
      },
    ],
  },

  // 4. Chord Transitions
  {
    id: 'four-chord-progression',
    title: 'Classic Four-Chord Progression (I – vi – IV – V)',
    category: 'chord-transitions',
    categoryLabel: 'Chord Transitions',
    difficulty: 'Early Intermediate',
    estimatedMinutes: 10,
    recommendedBpm: 68,
    timeSignature: '4/4',
    description:
      'Connect the four most versatile chords in popular and classical music: C Major (I), A Minor (vi), F Major (IV), and G Major (V). Practice simultaneous triad drops.',
    pedagogicalGoal: 'Recognize shared common tones between chords and shift hand shapes with minimal physical displacement.',
    xpReward: 80,
    exercises: [
      {
        id: 'chord-prog-1',
        title: 'C Major Home Triad',
        instruction: 'Drop fingers 1 (C4), 3 (E4), and 5 (G4) simultaneously for a rich C Major triad.',
        recommendedBpm: 68,
        timeSignature: '4/4',
        mode: 'chord',
        targetMidi: [60, 64, 67],
        targetNotes: ['C4', 'E4', 'G4'],
        fingeringsRH: ['1', '3', '5'],
        hint: 'All 3 notes should sound at the exact same millisecond. Lower your wrist gently.',
      },
      {
        id: 'chord-prog-2',
        title: 'A Minor Transition (Common Tones)',
        instruction: 'Shift from C Major to A Minor (A3 + C4 + E4). Notice C and E stay identical!',
        recommendedBpm: 68,
        timeSignature: '4/4',
        mode: 'chord',
        targetMidi: [57, 60, 64],
        targetNotes: ['A3', 'C4', 'E4'],
        fingeringsRH: ['1', '2', '4'],
        hint: 'Anchor on C4 and E4 while pinky/thumb reposition to A3. Minimal movement is best.',
      },
      {
        id: 'chord-prog-3',
        title: 'F Major Subdominant Lift',
        instruction: 'Move smoothly to F Major (F4 + A4 + C5). Listen to the warm upward harmony.',
        recommendedBpm: 68,
        timeSignature: '4/4',
        mode: 'chord',
        targetMidi: [65, 69, 72],
        targetNotes: ['F4', 'A4', 'C5'],
        fingeringsRH: ['1', '3', '5'],
        hint: 'Shape the triad in the air right before striking the keys together.',
      },
      {
        id: 'chord-prog-4',
        title: 'G Major Dominant Tension & Cadence',
        instruction: 'Play G Major (G4 + B4 + D5), building expectation to resolve home to C Major.',
        recommendedBpm: 68,
        timeSignature: '4/4',
        mode: 'chord',
        targetMidi: [67, 71, 74],
        targetNotes: ['G4', 'B4', 'D5'],
        fingeringsRH: ['1', '3', '5'],
        hint: 'Hold the G Major chord for 4 metronome clicks, then release cleanly.',
      },
    ],
  },

  // 5. Melody Practice
  {
    id: 'theme-repertoire-waltz',
    title: 'Theme & Phrase Repertoire (Ode to Joy & Waltz)',
    category: 'melody-practice',
    categoryLabel: 'Melody Practice',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    recommendedBpm: 88,
    timeSignature: '4/4',
    description:
      'Perform Beethoven’s triumphant Ode to Joy in 4/4 common time, then transition into graceful 3/4 waltz rhythm on Petzold’s Classical Waltz theme.',
    pedagogicalGoal: 'Combine phrase shaping, dynamic control, and meter transitions between duple (4/4) and triple (3/4) time.',
    xpReward: 90,
    exercises: [
      {
        id: 'melody-rep-1',
        title: 'Ode to Joy: Opening Motive (4/4)',
        instruction: 'Play the timeless motif: E4 → E4 → F4 → G4 → G4 → F4 → E4 → D4 in 4/4 time.',
        recommendedBpm: 88,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [64, 64, 65, 67, 67, 65, 64, 62],
        targetNotes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'],
        fingeringsRH: ['3', '3', '4', '5', '5', '4', '3', '2'],
        hint: 'Rest your hand over the C4–G4 position. Each repeated note should breathe subtly.',
      },
      {
        id: 'melody-rep-2',
        title: 'Ode to Joy: Cadential Resolution (4/4)',
        instruction: 'Resolve the phrase home: C4 → C4 → D4 → E4 → E4 → D4 → D4.',
        recommendedBpm: 88,
        timeSignature: '4/4',
        mode: 'sequence',
        targetMidi: [60, 60, 62, 64, 64, 62, 62],
        targetNotes: ['C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'],
        fingeringsRH: ['1', '1', '2', '3', '3', '2', '2'],
        hint: 'Notice how the melody resolves inward towards thumb (1) on C4.',
      },
      {
        id: 'melody-rep-3',
        title: 'Classical Waltz Phrase: Triple Meter (3/4)',
        instruction: 'Switch your internal pulse to 3/4 time (ONE-two-three). Play D5 → G4 → A4 → B4 → C5.',
        recommendedBpm: 96,
        timeSignature: '3/4',
        mode: 'sequence',
        targetMidi: [74, 67, 69, 71, 72],
        targetNotes: ['D5', 'G4', 'A4', 'B4', 'C5'],
        fingeringsRH: ['5', '1', '2', '3', '4'],
        hint: 'Give beat 1 (D5) a lilting waltz accent, followed by light, floating steps on beats 2 and 3.',
      },
      {
        id: 'melody-rep-4',
        title: 'Classical Waltz: Cadence & Downbeat Landing (3/4)',
        instruction: 'Conclude the waltz motif: D5 (1 beat) → G4 (2 beats) in graceful triple meter.',
        recommendedBpm: 96,
        timeSignature: '3/4',
        mode: 'sequence',
        targetMidi: [74, 67, 67],
        targetNotes: ['D5', 'G4', 'G4'],
        fingeringsRH: ['5', '1', '1'],
        hint: 'Let the final G4 ring warmly across beats 2 and 3.',
      },
    ],
  },
];
