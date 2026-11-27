import type { Lesson } from '../types';

/**
 * Authoritative Client-Side Curriculum Catalog.
 * Ensures instant, flicker-free lesson rendering and graceful offline/fallback operation
 * even if the backend is cold-starting or session tokens are renewing.
 */
export const FALLBACK_LESSONS: Record<number, Lesson> = {
  // ==========================================
  // PIANO TIER 1: BASICS
  // ==========================================

  // Level 1: Introduction and Familiarization
  1: {
    id: 1,
    title: 'Anatomy of the Piano Keyboard',
    description: 'Discover the layout of 88 keys, grouping of 2 and 3 black keys, and middle C.',
    theoryContent: `### Understanding the Piano Keyboard

The piano keyboard is made up of a repeating pattern of **white keys** (naturals) and **black keys** (accidentals).

Notice the pattern of black keys:
- Groups of **two black keys**
- Groups of **three black keys**

This alternating pattern of two and three black keys is your roadmap across the entire instrument. **Middle C (C4)** is always located directly to the left of any group of two black keys near the center of the keyboard.

### Key Dimensions & Geometry
- **88 Total Keys**: Spanning from A0 (27.5 Hz) to C8 (4,186 Hz).
- **52 White Natural Keys**: Crafted from solid pine or spruce with composite acrylic tops.
- **36 Black Accidental Keys**: Elevated by approximately 12 mm to facilitate smooth finger transitions.`,
    lessonType: 'THEORY',
    durationMinutes: 8,
    xpReward: 50,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 1,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'Black keys on the piano are grouped into alternating clusters of:',
        questionData: JSON.stringify({ options: ['2 and 3', '3 and 4', '1 and 2', '2 and 4'] }),
        expectedAnswer: '2 and 3',
        points: 25,
        explanation: 'The alternating groups of 2 and 3 black keys provide the visual landmark to locate any note.',
        orderIndex: 1,
      },
    ],
  },

  2: {
    id: 2,
    title: 'The White Keys and Black Keys Pattern',
    description: 'Master finding any key quickly using the black key landmarks.',
    theoryContent: `### Landmarks on the Keyboard

To find any note without counting from the bottom of the keyboard, use the black key groups as landmarks:

- **C** is always the white key directly to the left of the **two black keys**.
- **D** is nestled directly in the middle of the **two black keys**.
- **E** is situated directly to the right of the **two black keys**.
- **F** is located immediately to the left of the **three black keys**.
- **G, A, B** follow consecutively inside and around the three black keys.

### Practical Tip
Always visualize the two-black-key house: C is the front porch, D is inside the house, and E is the back porch!`,
    lessonType: 'PRACTICAL',
    durationMinutes: 10,
    xpReward: 50,
    orderIndex: 2,
    isPublished: true,
    exercises: [
      {
        id: 2,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'Which white key sits immediately to the left of the group of two black keys?',
        questionData: JSON.stringify({ options: ['C', 'D', 'E', 'F'] }),
        expectedAnswer: 'C',
        points: 25,
        explanation: 'The note C is always situated immediately to the left of any pair of two black keys.',
        orderIndex: 1,
      },
    ],
  },

  // Level 2: Fundamental Concepts
  3: {
    id: 3,
    title: 'The Musical Alphabet (A to G)',
    description: 'Music uses only seven letters: A, B, C, D, E, F, G, repeating in octaves.',
    theoryContent: `### The 7 Musical Letters

Unlike the English alphabet with 26 letters, Western music notation uses only **seven letters**:

**A – B – C – D – E – F – G**

After **G**, the alphabet does not continue to H; it resets back to **A** at a higher pitch frequency!

### The Octave Cycle
- When you travel upward from any note (such as C) to the next note with the exact same letter name (the next C higher), you have traversed an **octave** (from the Latin *octavus*, meaning eighth).
- In standard equal temperament, an octave represents an exact **2:1 frequency ratio**. If C4 vibrates at 261.63 Hz, C5 vibrates at exactly 523.25 Hz!

### Reverse Alphabet (Descending)
When playing downward (to the left on the keyboard), the alphabet moves in reverse:
**G – F – E – D – C – B – A – G ...**`,
    lessonType: 'THEORY',
    durationMinutes: 10,
    xpReward: 50,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 3,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What musical note comes immediately after G in the musical alphabet?',
        questionData: JSON.stringify({ options: ['A', 'H', 'F', 'B'] }),
        expectedAnswer: 'A',
        points: 25,
        explanation: 'The musical alphabet consists of letters A through G and then loops back to A.',
        orderIndex: 1,
      },
    ],
  },

  4: {
    id: 4,
    title: 'Finding Middle C (C4) & Octaves',
    description: 'Locate C4 and understand how octaves raise and lower the pitch.',
    theoryContent: `### Middle C (C4)

**Middle C** is designated as **C4** in Scientific Pitch Notation (SPN) because it is the 4th C from the bottom of a standard 88-key piano keyboard (which begins on A0).

- **Acoustic Frequency**: Vibrates at approximately **261.63 Hz**.
- **Keyboard Geography**: Located near the center of the keybed, directly in front of the instrument brand insignia.
- **Notation Landmark**: Positioned on the ledger line centered between the Treble (G) Clef and Bass (F) Clef on the Grand Staff.

### Octave Registers on the Piano
- **C1 to B1**: Deep Contrabass register.
- **C2 to B2**: Bass register (left hand foundation).
- **C3 to B3**: Tenor register.
- **C4 to B4**: Central Middle octave (starting position for beginner studies).
- **C5 to B5**: Treble singing register.
- **C6 to C8**: High sparkling soprano and bell register.`,
    lessonType: 'PRACTICAL',
    durationMinutes: 12,
    xpReward: 60,
    orderIndex: 2,
    isPublished: true,
    exercises: [
      {
        id: 4,
        exerciseType: 'KEYBOARD_PLAY',
        prompt: 'Play Middle C (C4) on the virtual keyboard.',
        questionData: JSON.stringify({ targetNote: 'C4', highlight: true }),
        expectedAnswer: 'C4',
        points: 30,
        explanation: 'Middle C (C4) is the benchmark reference pitch in Western music notation.',
        orderIndex: 1,
      },
    ],
  },

  // Level 3: Basic Practical Learning
  5: {
    id: 5,
    title: 'Finger Numbering & Hand Posture',
    description: 'Learn the universal pianist finger numbering system: Thumb is 1, Pinky is 5.',
    theoryContent: `### Universal Finger Numbering

Pianists worldwide use standard numbers **1 through 5** for both hands:

- **1 = Thumb**
- **2 = Index Finger**
- **3 = Middle Finger**
- **4 = Ring Finger**
- **5 = Pinky (Little) Finger**

Both hands are symmetrical: your left thumb and right thumb are both **1**, while both pinkies are **5**.

### Correct Hand Biomechanics
1. **Curved Fingers**: Curve your fingers naturally as if resting your palm gently on a tennis ball or round bubble.
2. **Cushion Contact**: Strike the white keys using the fleshy pads of your fingertips, never flat finger pads or fingernails.
3. **Flexible Wrists**: Maintain your wrists level with the keyboard. Keep elbows relaxed at approximately 90 degrees.
4. **Bench Height**: Your forearms should be parallel to the floor when your hands rest comfortably on the keys.`,
    lessonType: 'PRACTICAL',
    durationMinutes: 10,
    xpReward: 50,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 5,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'In standard piano finger numbering, which finger is designated as number 1?',
        questionData: JSON.stringify({ options: ['Thumb', 'Index finger', 'Middle finger', 'Pinky'] }),
        expectedAnswer: 'Thumb',
        points: 25,
        explanation: 'In keyboard pedagogy, finger 1 is always the thumb, and finger 5 is the pinky.',
        orderIndex: 1,
      },
    ],
  },

  6: {
    id: 6,
    title: 'Ear Training: Listening & Note Recognition',
    description: 'Train your ear to identify Middle C (C4) versus higher and lower notes.',
    theoryContent: `### Active Musical Listening

Listening is half of musicianship! Ear training develops **audiation**—the ability to hear, understand, and predict musical sounds internally in your mind.

### Pitch Perception Principles
- **Higher Pitches**: Generated by shorter, thinner strings vibrating at higher frequencies. They sound brighter and higher on the keyboard (to the right).
- **Lower Pitches**: Generated by longer, copper-wound strings vibrating slowly. They sound deep and resonant (to the left).
- **Reference Pitch (C4)**: Middle C (261.63 Hz) provides an anchor tone to compare all adjacent melodic intervals.

### Practice Drill
Press the reference tone audio button, close your eyes, and identify which pitch class sounds!`,
    lessonType: 'LISTENING',
    durationMinutes: 15,
    xpReward: 75,
    orderIndex: 2,
    isPublished: true,
    exercises: [
      {
        id: 6,
        exerciseType: 'INTERVAL_RECOGNITION',
        prompt: 'Listen to the reference note played. Identify the pitch:',
        questionData: JSON.stringify({ audioNote: 'C4', options: ['C4', 'E4', 'G4', 'B4'] }),
        expectedAnswer: 'C4',
        points: 35,
        explanation: 'That was Middle C (C4), vibrating at 261.63 Hz.',
        orderIndex: 1,
      },
    ],
  },

  7: {
    id: 7,
    title: 'Tier 1: Basics Practical Assessment',
    description: 'Comprehensive assessment covering key landmarks, note names, and ear identification.',
    theoryContent: `### Tier 1 Capstone Knowledge Check

Congratulations on reaching the culminating milestone of **Tier 1: Basics**!

This assessment evaluates the three foundational pillars of piano performance:
1. **Instrument Mechanics & Geography**: Full keyboard layout, 88 keys, and black key clusters.
2. **Alphabet & Pitch Landmarks**: Locating Middle C (C4) and neighboring white natural keys.
3. **Practical Keyboard Execution**: Performing correct pitches on demand.

Achieve a passing score to earn your conservatory XP bonus and unlock **Tier 2: Intermediate**!`,
    lessonType: 'ASSESSMENT',
    durationMinutes: 15,
    xpReward: 100,
    orderIndex: 3,
    isPublished: true,
    exercises: [
      {
        id: 7,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'How many keys are there on a standard full-size acoustic or digital piano?',
        questionData: JSON.stringify({ options: ['88', '61', '76', '92'] }),
        expectedAnswer: '88',
        points: 30,
        explanation: 'Standard pianos feature 88 keys (52 white natural keys and 36 black accidental keys).',
        orderIndex: 1,
      },
      {
        id: 8,
        exerciseType: 'NOTE_IDENTIFICATION',
        prompt: 'Which white key sits between the two black keys?',
        questionData: JSON.stringify({ options: ['D', 'C', 'E', 'G'] }),
        expectedAnswer: 'D',
        points: 35,
        explanation: 'D is nestled right between the two black keys.',
        orderIndex: 2,
      },
      {
        id: 9,
        exerciseType: 'KEYBOARD_PLAY',
        prompt: 'Play E4 on the keyboard to demonstrate note location.',
        questionData: JSON.stringify({ targetNote: 'E4', highlight: true }),
        expectedAnswer: 'E4',
        points: 35,
        explanation: 'E4 is directly to the right of the two black keys.',
        orderIndex: 3,
      },
    ],
  },

  // ==========================================
  // PIANO TIER 2: INTERMEDIATE
  // ==========================================

  8: {
    id: 8,
    title: 'The C Major Scale Formula',
    description: 'W-W-H-W-W-W-H step intervals that build all major scales.',
    theoryContent: `### The Universal Major Scale Formula

Every major scale in Western music is constructed using a specific sequence of **Whole steps (W)** and **Half steps (H)**:

$$\\text{Major Scale Formula: } \\mathbf{W - W - H - W - W - W - H}$$

- **Half Step (H)**: The shortest distance between two keys on the keyboard (e.g., E to F, or B to C, with zero keys in between).
- **Whole Step (W)**: Equal to two half steps (e.g., C to D, because C# sits in between).

### The C Major Scale (No Sharps, No Flats)
Starting on C and applying the formula uses exclusively white natural keys:
$$\\mathbf{C} \\xrightarrow{W} \\mathbf{D} \\xrightarrow{W} \\mathbf{E} \\xrightarrow{H} \\mathbf{F} \\xrightarrow{W} \\mathbf{G} \\xrightarrow{W} \\mathbf{A} \\xrightarrow{W} \\mathbf{B} \\xrightarrow{H} \\mathbf{C}$$

### Standard Right-Hand Fingering
- Ascending: **1 – 2 – 3** (thumb-tuck underneath) $\\rightarrow$ **1 – 2 – 3 – 4 – 5**
- Descending: **5 – 4 – 3 – 2 – 1** (finger 3 crosses over) $\\rightarrow$ **3 – 2 – 1**`,
    lessonType: 'THEORY',
    durationMinutes: 15,
    xpReward: 60,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 10,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What is the step interval formula that builds all major scales?',
        questionData: JSON.stringify({ options: ['W-W-H-W-W-W-H', 'W-H-W-W-H-W-W', 'H-W-W-H-W-W-W', 'W-W-W-H-W-W-H'] }),
        expectedAnswer: 'W-W-H-W-W-W-H',
        points: 30,
        explanation: 'Whole-Whole-Half-Whole-Whole-Whole-Half is the foundational interval structure of major tonality.',
        orderIndex: 1,
      },
    ],
  },

  9: {
    id: 9,
    title: 'Building Major & Minor Triads',
    description: 'Root, 3rd, and 5th intervals that produce harmony.',
    theoryContent: `### What is a Triad?

A **triad** is a three-note chord built by stacking intervals of thirds on top of a foundational **Root note**:

$$\\text{Triad Anatomy: } \\mathbf{\\text{Root}} + \\mathbf{\\text{Third}} + \\mathbf{\\text{Fifth}}$$

### Major vs. Minor Triads
1. **Major Triad (Bright, Triumphant)**:
   - Root to 3rd = **Major 3rd** (4 half steps / 2 whole steps).
   - 3rd to 5th = **Minor 3rd** (3 half steps).
   - *Example C Major*: **C – E – G**
2. **Minor Triad (Pensive, Somber)**:
   - Root to 3rd = **Minor 3rd** (3 half steps).
   - 3rd to 5th = **Major 3rd** (4 half steps).
   - *Example A Minor*: **A – C – E**

### Standard Triad Fingering
For the right hand in root position, always use fingers **1 – 3 – 5** (Thumb on Root, Middle on 3rd, Pinky on 5th).`,
    lessonType: 'PRACTICAL',
    durationMinutes: 20,
    xpReward: 75,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 11,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'Which three notes form the C Major root position triad?',
        questionData: JSON.stringify({ options: ['C – E – G', 'C – D – E', 'C – F – A', 'C – Eb – G'] }),
        expectedAnswer: 'C – E – G',
        points: 35,
        explanation: 'C Major consists of the Root (C), Major Third (E, 4 semitones), and Perfect Fifth (G, 7 semitones).',
        orderIndex: 1,
      },
    ],
  },

  10: {
    id: 10,
    title: 'Ode to Joy - Two Hand Performance',
    description: 'Perform Beethoven\'s classic theme with LH bass notes.',
    theoryContent: `### Two-Hand Coordination: Beethoven\'s "Ode to Joy"

Combining melody in the right hand with harmonic bass notes in the left hand is the primary milestone of intermediate piano pedagogy.

### Right Hand (Melody - Treble Clef):
$$E4 - E4 - F4 - G4 \\mid G4 - F4 - E4 - D4 \\mid C4 - C4 - D4 - E4 \\mid E4\\text{.} - D4 - D4$$
- Finger pattern: **3 – 3 – 4 – 5 | 5 – 4 – 3 – 2 | 1 – 1 – 2 – 3 | 3. – 2 – 2**

### Left Hand (Bass Roots - Bass Clef):
- Measure 1: **C3** (Finger 5)
- Measure 2: **G2** (Finger 1 or 5)
- Measure 3: **C3** (Finger 5)
- Measure 4: **G2** (Finger 1)

### Practice Rule
Practice each hand alone with a steady metronome at 60 BPM before synchronizing hands together.`,
    lessonType: 'ASSESSMENT',
    durationMinutes: 20,
    xpReward: 100,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 12,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'In Beethoven\'s Ode to Joy opening phrase in C Major, which note does the melody begin on?',
        questionData: JSON.stringify({ options: ['E4', 'C4', 'G4', 'F4'] }),
        expectedAnswer: 'E4',
        points: 40,
        explanation: 'Ode to Joy begins on E4 (the 3rd scale degree), played with finger 3 in standard 5-finger position.',
        orderIndex: 1,
      },
    ],
  },

  // ==========================================
  // PIANO TIER 3: PRO
  // ==========================================

  11: {
    id: 11,
    title: 'The ii-V-I Progression in Major & Minor',
    description: 'The cornerstone chord progression of Western harmony.',
    theoryContent: `### The ii – V – I Harmonic Cadence

The **ii – V – I** chord progression is the most fundamental harmonic movement in Classical, Romantic, and Jazz piano repertoire.

### In the Key of C Major:
1. **ii Chord (Dm7)**: Supertonic minor seventh (D – F – A – C). Functions as the subdominant preparation.
2. **V Chord (G7)**: Dominant seventh (G – B – D – F). Contains the restless tritone (B to F) that demands resolution.
3. **I Chord (Cmaj7)**: Tonic major seventh (C – E – G – B). Resolves all harmonic tension cleanly.

### Voice Leading Efficiency
Avoid jumping root positions across the keyboard. Keep common tones and move adjacent voices by step!`,
    lessonType: 'THEORY',
    durationMinutes: 20,
    xpReward: 80,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 13,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'In the key of C Major, what is the ii chord in a ii-V-I progression?',
        questionData: JSON.stringify({ options: ['Dm (D Minor)', 'Em (E Minor)', 'G Major', 'Am (A Minor)'] }),
        expectedAnswer: 'Dm (D Minor)',
        points: 40,
        explanation: 'The supertonic (second scale degree) in C Major is D, building a D Minor (Dm) triad.',
        orderIndex: 1,
      },
    ],
  },

  12: {
    id: 12,
    title: 'Extended Arpeggio Transitions',
    description: 'Fluid thumb-under cross motions across 3 octaves.',
    theoryContent: `### Mastering Multi-Octave Arpeggios

An **arpeggio** (broken chord) sweeps chord tones across several octaves of the piano.

### Thumb-Under Technique
- When your right hand ascends (C – E – G $\\rightarrow$ C), your thumb must tuck fluidly underneath finger 3 or 4 *before* it needs to strike the next root note.
- Never twist your wrist violently; initiate motion from the forearm and elbow.
- Keep your wrist supple and relaxed to maintain an even, legato tone across the register shift.`,
    lessonType: 'PRACTICAL',
    durationMinutes: 25,
    xpReward: 90,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 14,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What physical biomechanical movement allows seamless transition between arpeggio octaves?',
        questionData: JSON.stringify({ options: ['Thumb tuck underneath fingers 3/4', 'Stiffening the wrist', 'Hitting keys with knuckles', 'Jumping both hands off the keys'] }),
        expectedAnswer: 'Thumb tuck underneath fingers 3/4',
        points: 45,
        explanation: 'Tucking the thumb under fingers 3 or 4 allows continuous unbroken legato across multiple octaves.',
        orderIndex: 1,
      },
    ],
  },

  13: {
    id: 13,
    title: 'Pro Repertoire Performance Evaluation',
    description: 'Comprehensive performance evaluation.',
    theoryContent: `### Professional Repertoire Performance Standards

At the Pro conservatory tier, musical performance transcends mere note accuracy:
1. **Dynamic Shading (pp to ff)**: Precise finger weight control over hammer release velocity.
2. **Expressive Rubato**: Subtle tempo flexibility that breathes with phrasing without distorting underlying meter.
3. **Pedal Articulation**: Syncopated (overlapping) damper pedaling that clears acoustic overtones cleanly between chord changes.`,
    lessonType: 'ASSESSMENT',
    durationMinutes: 30,
    xpReward: 150,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 15,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What is syncopated (overlapping) damper pedaling?',
        questionData: JSON.stringify({ options: ['Clearing and depressing the pedal immediately after striking the new chord', 'Holding the pedal down for the entire song', 'Pounding the pedal in time with the metronome', 'Never using the sustain pedal'] }),
        expectedAnswer: 'Clearing and depressing the pedal immediately after striking the new chord',
        points: 50,
        explanation: 'Syncopated pedaling clears the damper pedal right as new notes sound, blending harmony without acoustic blur.',
        orderIndex: 1,
      },
    ],
  },

  // ==========================================
  // PIANO TIER 4: EXPERT
  // ==========================================

  14: {
    id: 14,
    title: 'Bach Inventions: Two-Part Voice Leading',
    description: 'Analyzing subject, answer, and counter-subject.',
    theoryContent: `### J.S. Bach\'s Contrapuntal Mastery

Johann Sebastian Bach composed his 15 Two-Part Inventions (BWV 772–786) to teach keyboard players how to play polyphonically with clear, singing tone.

### Contrapuntal Principles
- **Subject**: The core melodic motif stated in one voice.
- **Answer**: The subject imitated in the opposite voice, typically at the fifth or octave.
- **Independence of Voices**: Each hand must maintain its own independent phrasing, dynamics, and articulation simultaneously.`,
    lessonType: 'THEORY',
    durationMinutes: 25,
    xpReward: 100,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 16,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'In polyphonic Baroque counterpoint, what is a "Subject"?',
        questionData: JSON.stringify({ options: ['The primary thematic melodic motif of the piece', 'The title of the sheet music book', 'The bass pedal foot mechanism', 'The tempo marking'] }),
        expectedAnswer: 'The primary thematic melodic motif of the piece',
        points: 50,
        explanation: 'The Subject is the primary musical idea upon which an entire fugue or invention is woven.',
        orderIndex: 1,
      },
    ],
  },

  15: {
    id: 15,
    title: 'Concert Sonata Interpretation',
    description: 'Nuance, rubato, and polyphonic balance.',
    theoryContent: `### Classical & Romantic Concert Sonata Form

Mastering sonata-allegro form is the benchmark of the concert pianist:
- **Exposition**: Introduces Primary Theme (Tonic) and Secondary Theme (Dominant/Relative Major).
- **Development**: Modulates through unexpected tonal centers, fragmenting motivic cells.
- **Recapitulation**: Restores equilibrium, bringing all thematic material back into the tonic key.`,
    lessonType: 'PRACTICAL',
    durationMinutes: 30,
    xpReward: 120,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 17,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What are the three core structural sections of Sonata-Allegro form?',
        questionData: JSON.stringify({ options: ['Exposition, Development, Recapitulation', 'Verse, Chorus, Bridge', 'Prelude, Fugue, Postlude', 'Adagio, Allegro, Presto'] }),
        expectedAnswer: 'Exposition, Development, Recapitulation',
        points: 50,
        explanation: 'Sonata form develops across Exposition, Development, and Recapitulation.',
        orderIndex: 1,
      },
    ],
  },

  16: {
    id: 16,
    title: 'Final Capstone Recital Assessment',
    description: 'The culminating evaluation of instrument mastery.',
    theoryContent: `### Conservatory Capstone Recital Assessment

The ultimate examination of your MelodyForge journey. Demonstrates comprehensive mastery across all four tiers:
- Acoustics and physics of the instrument
- Fluency in scales, chord inversions, and harmonic progressions
- Multi-octave arpeggio speed and finger independence
- Polyphonic contrapuntal voice projection`,
    lessonType: 'ASSESSMENT',
    durationMinutes: 45,
    xpReward: 250,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 18,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What defines a complete conservatory concert grand performance portfolio?',
        questionData: JSON.stringify({ options: ['Acoustic mastery, harmonic fluency, and technical interpretative poise', 'Playing loudly at all times', 'Memorizing only one song', 'Using software auto-tune'] }),
        expectedAnswer: 'Acoustic mastery, harmonic fluency, and technical interpretative poise',
        points: 100,
        explanation: 'True conservatory artistry balances acoustic tone, harmonic insight, and expressive interpretation.',
        orderIndex: 1,
      },
    ],
  },

  // ==========================================
  // GUITAR LESSONS
  // ==========================================
  17: {
    id: 17,
    title: 'Guitar Anatomy & The 6 Open Strings',
    description: 'Learn the headstock, frets, bridge, and standard tuning: E - A - D - G - B - E (Eddie Ate Dynamite Good Bye Eddie).',
    theoryContent: `### Anatomy of the Guitar

A guitar consists of three main anatomical sections:
1. **Headstock**: Houses the mechanical tuning pegs.
2. **Neck & Fretboard**: Inlaid with metal fret wires determining semitone pitch intervals.
3. **Body**: The acoustic hollow sound chamber or solid wood electric body with bridge and pickups.

### The 6 Open Strings
From lowest pitch (thickest, String 6) to highest pitch (thinnest, String 1):
- **String 6 (Thickest)**: **E** (E2, 82.4 Hz)
- **String 5**: **A** (A2, 110.0 Hz)
- **String 4**: **D** (D3, 146.8 Hz)
- **String 3**: **G** (G3, 196.0 Hz)
- **String 2**: **B** (B3, 246.9 Hz)
- **String 1 (Thinnest)**: **E** (E4, 329.6 Hz)

*Mnemonic: "Eddie Ate Dynamite Good Bye Eddie"*`,
    lessonType: 'THEORY',
    durationMinutes: 10,
    xpReward: 50,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 19,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What are the note names of standard 6-string guitar tuning from lowest to highest?',
        questionData: JSON.stringify({ options: ['E – A – D – G – B – E', 'E – B – G – D – A – E', 'D – A – D – G – A – D', 'C – G – D – A – E – B'] }),
        expectedAnswer: 'E – A – D – G – B – E',
        points: 25,
        explanation: 'Standard guitar tuning is E2 - A2 - D3 - G3 - B3 - E4.',
        orderIndex: 1,
      },
    ],
  },

  18: {
    id: 18,
    title: 'Holding the Pick & First Strumming',
    description: 'Master relaxed pick grip and smooth downstrokes across open strings.',
    theoryContent: `### Holding the Plectrum (Pick)

Hold the pick gently between the fleshy pad of your thumb and the side of your curled index finger. Point the tip perpendicular to the strings.

### The Downstroke Technique
- Keep your wrist completely relaxed, using gentle forearm rotation rather than rigid arm pounding.
- Strum downward across all six strings in one fluid, rhythmic motion.`,
    lessonType: 'PRACTICAL',
    durationMinutes: 12,
    xpReward: 50,
    orderIndex: 2,
    isPublished: true,
    exercises: [
      {
        id: 20,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'How should the plectrum (guitar pick) be held?',
        questionData: JSON.stringify({ options: ['Between the pad of the thumb and the side of the index finger', 'Between all five fingertips', 'Clenched tightly in a closed fist', 'Between index and middle finger'] }),
        expectedAnswer: 'Between the pad of the thumb and the side of the index finger',
        points: 25,
        explanation: 'Holding the pick between thumb pad and index finger side delivers optimum control and wrist relaxation.',
        orderIndex: 1,
      },
    ],
  },

  // ==========================================
  // VIOLIN LESSON
  // ==========================================
  19: {
    id: 19,
    title: 'Anatomy of the Violin & Bow',
    description: 'Scroll, pegs, fingerboard, bridge, soundpost, bow horsehair, and frog.',
    theoryContent: `### Anatomy of the Violin

The violin is one of the most acoustically refined wooden instruments in existence:
- **Scroll & Pegbox**: Decorative carved spiral housing the friction pegs.
- **Fingerboard**: Smooth ebony strip without frets; pitch relies entirely on muscle memory and ear guidance.
- **Bridge & Soundpost**: The arched maple bridge transmits string vibrations into the spruce top plate; the internal soundpost (*l'anima*) couples vibration to the back plate.

### Standard Violin Tuning
Tuned in perfect fifths: **G3 – D4 – A4 – E5**.`,
    lessonType: 'THEORY',
    durationMinutes: 10,
    xpReward: 50,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 21,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'What are the four strings of the violin tuned to in standard tuning?',
        questionData: JSON.stringify({ options: ['G – D – A – E', 'C – G – D – A', 'E – A – D – G', 'D – A – E – B'] }),
        expectedAnswer: 'G – D – A – E',
        points: 25,
        explanation: 'The violin is tuned in perfect fifths: G3, D4, A4 (440 Hz), and E5.',
        orderIndex: 1,
      },
    ],
  },

  // ==========================================
  // DRUMS LESSON
  // ==========================================
  20: {
    id: 20,
    title: 'Anatomy of the Drum Kit',
    description: 'Bass drum, snare, hi-hat, toms, crash and ride cymbals.',
    theoryContent: `### The Modern Drum Kit (Trap Set)

A standard 5-piece acoustic drum kit combines drums and cymbals:
1. **Bass Drum (Kick)**: Operated by right foot pedal, delivering low frequency punch on beats 1 and 3.
2. **Snare Drum**: Centered between knees, equipped with bottom coiled wires producing sharp backbeats on 2 and 4.
3. **Hi-Hat Cymbals**: Two paired cymbals controlled by left foot pedal for timekeeping (chick) and stick patterns.
4. **Tom-Toms**: High, mid, and floor toms used for melodic fills.
5. **Cymbals**: Ride cymbal for steady swing/rock patterns, and Crash cymbal for explosive accents.`,
    lessonType: 'THEORY',
    durationMinutes: 10,
    xpReward: 50,
    orderIndex: 1,
    isPublished: true,
    exercises: [
      {
        id: 22,
        exerciseType: 'MULTIPLE_CHOICE',
        prompt: 'Which drum provides the sharp acoustic "backbeat" typically heard on beats 2 and 4?',
        questionData: JSON.stringify({ options: ['The Snare Drum', 'The Floor Tom', 'The Bass Drum', 'The Cowbell'] }),
        expectedAnswer: 'The Snare Drum',
        points: 25,
        explanation: 'The snare drum, equipped with wire snares beneath the bottom head, powers the backbeat on 2 and 4.',
        orderIndex: 1,
      },
    ],
  },
};

/**
 * Helper to retrieve a fallback lesson by ID.
 */
export const getFallbackLesson = (id: number): Lesson | undefined => {
  return FALLBACK_LESSONS[id];
};

/**
 * Secondary helper to retrieve a fallback lesson by title search if an ID differs.
 */
export const getFallbackLessonByTitle = (title: string): Lesson | undefined => {
  const normalized = title.toLowerCase().trim();
  return Object.values(FALLBACK_LESSONS).find((l) =>
    l.title.toLowerCase().trim() === normalized ||
    normalized.includes(l.title.toLowerCase().trim()) ||
    l.title.toLowerCase().trim().includes(normalized)
  );
};
