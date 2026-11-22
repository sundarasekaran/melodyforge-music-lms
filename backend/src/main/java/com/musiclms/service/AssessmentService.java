package com.musiclms.service;

import com.musiclms.dto.*;
import com.musiclms.model.entity.*;
import com.musiclms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AssessmentService {

    private final AssessmentAttemptRepository attemptRepository;
    private final CertificateRepository certificateRepository;
    private final InstrumentRepository instrumentRepository;
    private final GamificationService gamificationService;

    // Internal Authoritative Assessment Definition
    public static class InternalQuestion {
        private final String id;
        private final int level;
        private final String type; // multiple-choice, true-false, identify-key, play-sequence
        private final String topic;
        private final String prompt;
        private final String instructionHint;
        private final List<String> options;
        private final Integer correctOptionIndex;
        private final Integer targetMidi;
        private final boolean allowAnyOctave;
        private final List<Integer> targetSequence;
        private final String explanation;

        public InternalQuestion(String id, int level, String type, String topic, String prompt,
                                String instructionHint, List<String> options, Integer correctOptionIndex,
                                Integer targetMidi, boolean allowAnyOctave, List<Integer> targetSequence,
                                String explanation) {
            this.id = id;
            this.level = level;
            this.type = type;
            this.topic = topic;
            this.prompt = prompt;
            this.instructionHint = instructionHint;
            this.options = options;
            this.correctOptionIndex = correctOptionIndex;
            this.targetMidi = targetMidi;
            this.allowAnyOctave = allowAnyOctave;
            this.targetSequence = targetSequence;
            this.explanation = explanation;
        }

        public String getId() { return id; }
        public int getLevel() { return level; }
        public String getType() { return type; }
        public String getTopic() { return topic; }
        public String getPrompt() { return prompt; }
        public String getInstructionHint() { return instructionHint; }
        public List<String> getOptions() { return options; }
        public Integer getCorrectOptionIndex() { return correctOptionIndex; }
        public Integer getTargetMidi() { return targetMidi; }
        public boolean isAllowAnyOctave() { return allowAnyOctave; }
        public List<Integer> getTargetSequence() { return targetSequence; }
        public String getExplanation() { return explanation; }
    }

    private final Map<Integer, List<InternalQuestion>> authoritativeQuestions = new HashMap<>();

    public AssessmentService(AssessmentAttemptRepository attemptRepository,
                             CertificateRepository certificateRepository,
                             InstrumentRepository instrumentRepository,
                             GamificationService gamificationService) {
        this.attemptRepository = attemptRepository;
        this.certificateRepository = certificateRepository;
        this.instrumentRepository = instrumentRepository;
        this.gamificationService = gamificationService;
        initializeAuthoritativeQuestions();
    }

    private void initializeAuthoritativeQuestions() {
        // --- LEVEL 1 QUESTIONS (Foundations, Pass Threshold 70%) ---
        List<InternalQuestion> l1 = new ArrayList<>();
        l1.add(new InternalQuestion("l1-1", 1, "multiple-choice", "Piano History",
                "Who invented the earliest hammer-action piano (pianoforte) around the year 1700?",
                null, Arrays.asList("Wolfgang Amadeus Mozart", "Bartolomeo Cristofori", "Frédéric Chopin", "Gottfried Silbermann"),
                1, null, false, null, "Bartolomeo Cristofori created the gravicembalo col piano e forte in Florence around 1700 using an escapement hammer action."));
        l1.add(new InternalQuestion("l1-2", 1, "multiple-choice", "Piano Components",
                "Which wooden component amplifies the vibrations of the strings inside an acoustic piano?",
                null, Arrays.asList("The soundboard", "The damper rail", "The fallboard", "The keyslip"),
                0, null, false, null, "The large spruce soundboard resonates with the vibrating strings to project rich acoustic volume."));
        l1.add(new InternalQuestion("l1-3", 1, "multiple-choice", "Keyboard Structure",
                "How many total keys, white keys, and black keys are on a standard full-size piano?",
                null, Arrays.asList("76 total (46 white, 30 black)", "88 total (52 white, 36 black)", "88 total (50 white, 38 black)", "92 total (54 white, 38 black)"),
                1, null, false, null, "A standard full-size piano has 88 keys: 52 white natural keys and 36 raised black keys."));
        l1.add(new InternalQuestion("l1-4", 1, "identify-key", "Middle C Landmark",
                "Interactive Task: Locate and click Middle C (C4) on the piano keyboard below.",
                "Find the group of two black keys near the center of the keyboard (labeled C4).", null,
                null, 60, false, null, "Middle C (C4) sits immediately to the left of the central two-black-key cluster."));
        l1.add(new InternalQuestion("l1-5", 1, "true-false", "White & Black Keys",
                "True or False: The white key immediately to the left of every group of three black keys is always F.",
                null, Arrays.asList("True", "False"),
                0, null, false, null, "True! Every 2-black-key group points to C on its left, and every 3-black-key group points to F on its left."));
        l1.add(new InternalQuestion("l1-6", 1, "identify-key", "Musical Notes",
                "Interactive Task: Click any G key on the piano keyboard below.",
                "Step up one white key to the right from F (just after the first black key in a 3-black-key group).", null,
                null, 67, true, null, "G sits inside the group of three black keys—directly between the first and second black keys."));
        l1.add(new InternalQuestion("l1-7", 1, "multiple-choice", "Sitting Posture",
                "When seated at the correct bench height, how should your forearms be positioned?",
                null, Arrays.asList("Sloped downward steeply toward your lap", "Roughly parallel to the floor and level with the white keys", "Pressed tightly against your sides", "Held high above shoulder height"),
                1, null, false, null, "Level forearms align wrists and knuckles naturally with the key surface and prevent tension."));
        l1.add(new InternalQuestion("l1-8", 1, "multiple-choice", "Finger Numbering",
                "In standard piano finger numbering, which finger is always numbered \"1\" on both hands?",
                null, Arrays.asList("Index finger", "Middle finger", "Thumb", "Little finger"),
                2, null, false, null, "Both right and left hands use mirror numbering starting with Thumb = 1 through Little finger = 5."));
        l1.add(new InternalQuestion("l1-9", 1, "true-false", "Acoustic vs. Digital",
                "True or False: Digital pianos generate sound through physical felt hammers striking steel strings.",
                null, Arrays.asList("True", "False"),
                1, null, false, null, "False. Acoustic pianos strike steel strings with felt hammers; digital pianos use optical key sensors and digital audio DSP."));
        l1.add(new InternalQuestion("l1-10", 1, "identify-key", "Musical Notes",
                "Interactive Task: Locate and click any E key on the piano keyboard below.",
                "E is the white key immediately to the right of any 2-black-key cluster.", null,
                null, 64, true, null, "C–D–E surround the 2-black-key group, placing E right beside the second black key."));
        authoritativeQuestions.put(1, l1);

        // --- LEVEL 2 QUESTIONS (Intermediate Theory & Technique, Pass Threshold 75%) ---
        List<InternalQuestion> l2 = new ArrayList<>();
        l2.add(new InternalQuestion("l2-1", 2, "identify-key", "Sharps & Flats",
                "Interactive Task: Play F#4 (F sharp in octave 4) on the keyboard.",
                "Locate F4 (left of the central 3-black-key cluster) and move one half step to the right.", null,
                null, 66, false, null, "F#4 is the leftmost black key in the octave-4 group of three black keys."));
        l2.add(new InternalQuestion("l2-2", 2, "multiple-choice", "Enharmonic Equivalents",
                "Which note name shares the exact same piano key as Bb (B flat)?",
                null, Arrays.asList("A# (A sharp)", "C# (C sharp)", "Ab (A flat)", "B# (B sharp)"),
                0, null, false, null, "One half step above A is A#, which is the same black key one half step below B (Bb)."));
        l2.add(new InternalQuestion("l2-3", 2, "multiple-choice", "Intervals & Steps",
                "Which pair of white keys forms a natural half step with no black key between them?",
                null, Arrays.asList("C to D", "F to G", "E to F", "A to B"),
                2, null, false, null, "E–F and B–C are the two natural half-step pairs on the piano keyboard without an intervening black key."));
        l2.add(new InternalQuestion("l2-4", 2, "identify-key", "Octaves",
                "Interactive Task: Click C5 — the C exactly one octave above Middle C (C4).",
                "Find C4, then move eight white keys to the right to the next 2-black-key cluster.", null,
                null, 72, false, null, "C5 sits 12 half steps (one full octave) above Middle C (C4)."));
        l2.add(new InternalQuestion("l2-5", 2, "multiple-choice", "Musical Notation",
                "Which clef is normally placed on the upper staff for right-hand melodies and curls around G4?",
                null, Arrays.asList("Bass Clef", "Treble Clef", "Alto Clef", "Tenor Clef"),
                1, null, false, null, "The Treble (G) Clef spirals around the second line from the bottom (G4) on the upper staff."));
        l2.add(new InternalQuestion("l2-6", 2, "multiple-choice", "Note Durations",
                "In 4/4 time, how many beats does a Half Note receive?",
                null, Arrays.asList("1 beat", "2 beats", "3 beats", "4 beats"),
                1, null, false, null, "A Half Note lasts half of a 4-beat measure—exactly 2 beats."));
        l2.add(new InternalQuestion("l2-7", 2, "multiple-choice", "Major Scale Formula",
                "Which Whole (W) and Half (H) step formula builds every Major scale?",
                null, Arrays.asList("W – H – W – W – H – W – W", "W – W – H – W – W – W – H", "H – W – W – H – W – W – W", "W – W – W – H – W – W – H"),
                1, null, false, null, "Every Major scale follows Whole–Whole–Half–Whole–Whole–Whole–Half."));
        l2.add(new InternalQuestion("l2-8", 2, "play-sequence", "Basic Chords",
                "Practical Task: Play the three notes of the C Major triad in order (C4 → E4 → G4).",
                "Click C4, then E4, then G4 on the keyboard below.", null,
                null, null, false, Arrays.asList(60, 64, 67), "The C Major triad stacks Root C4, Major 3rd E4, and Perfect 5th G4."));
        l2.add(new InternalQuestion("l2-9", 2, "play-sequence", "Minor Chords",
                "Practical Task: Play the three notes of the A Minor triad in order (A3 → C4 → E4).",
                "Start on A3 (just left of B3/C4), then press C4 and E4.", null,
                null, null, false, Arrays.asList(57, 60, 64), "A Minor combines Root A, Minor 3rd C, and Perfect 5th E."));
        l2.add(new InternalQuestion("l2-10", 2, "multiple-choice", "Time Signatures",
                "Which time signature gives a classic three-beat waltz feel (\"1–2–3, 1–2–3\")?",
                null, Arrays.asList("4/4 time", "2/4 time", "3/4 time", "6/8 time"),
                2, null, false, null, "3/4 time places three quarter-note beats inside every measure."));
        authoritativeQuestions.put(2, l2);

        // --- LEVEL 3 QUESTIONS (Conservatory Capstone, Pass Threshold 80%) ---
        List<InternalQuestion> l3 = new ArrayList<>();
        l3.add(new InternalQuestion("l3-1", 3, "identify-key", "Key Location Precision",
                "Practical Task 1: Find and press Bb4 (A#4), the black key belonging to the F Major scale.",
                "Locate B4 (to the right of the octave-4 3-black-key group) and step one half step left.", null,
                null, 70, false, null, "Bb4 (enharmonic with A#4) is the rightmost black key in the octave-4 three-black-key cluster."));
        l3.add(new InternalQuestion("l3-2", 3, "play-sequence", "C Major Scale Execution",
                "Practical Task 2: Perform the complete ascending 1-octave C Major scale (C4 up to C5).",
                "Play C4 → D4 → E4 → F4 → G4 → A4 → B4 → C5.", null,
                null, null, false, Arrays.asList(60, 62, 64, 65, 67, 69, 71, 72), "The complete C Major scale spans all eight white keys from C4 to C5."));
        l3.add(new InternalQuestion("l3-3", 3, "play-sequence", "G Major Chord",
                "Practical Task 3: Play the G Major triad (G4 → B4 → D5).",
                "Click G4, then B4, then D5.", null,
                null, null, false, Arrays.asList(67, 71, 74), "The G Major triad combines Root G4, Major 3rd B4, and Perfect 5th D5."));
        l3.add(new InternalQuestion("l3-4", 3, "play-sequence", "F Major Chord",
                "Practical Task 4: Play the F Major triad (F4 → A4 → C5).",
                "Click F4, then A4, then C5.", null,
                null, null, false, Arrays.asList(65, 69, 72), "The F Major triad stacks F4, A4, and C5."));
        l3.add(new InternalQuestion("l3-5", 3, "multiple-choice", "Rhythm & Meter Identification",
                "A musical measure in 4/4 time already contains one Half Note and one Quarter Note. Which note completes the measure?",
                null, Arrays.asList("One Half Note", "One Quarter Note", "One Whole Note", "One Sixteenth Note"),
                1, null, false, null, "Half note (2 beats) + Quarter note (1 beat) = 3 beats, leaving 1 beat (one Quarter Note) to complete 4/4."));
        l3.add(new InternalQuestion("l3-6", 3, "play-sequence", "Melody Performance",
                "Practical Task 5: Play the opening phrase of Beethoven’s \"Ode to Joy\" (E4 → E4 → F4 → G4 → G4 → F4 → E4 → D4 → C4).",
                "Follow the contour carefully starting on E4.", null,
                null, null, false, Arrays.asList(64, 64, 65, 67, 67, 65, 64, 62, 60), "Smoothly stepping through E–E–F–G–G–F–E–D–C completes Beethoven’s joyful opening motif."));
        l3.add(new InternalQuestion("l3-7", 3, "play-sequence", "Two-Hand Coordination Pattern",
                "Practical Task 6: Play this two-hand alternating cadence: Left-hand C3 → G3, followed by Right-hand C4 → E4 → G4.",
                "Play bass C3 then G3, then step up into middle C4, E4, and G4.", null,
                null, null, false, Arrays.asList(48, 55, 60, 64, 67), "Combining a left-hand open fifth (C3–G3) with a right-hand triad (C4–E4–G4) creates a full resonant piano cadence."));
        l3.add(new InternalQuestion("l3-8", 3, "multiple-choice", "Comprehensive Musicianship",
                "Which combination correctly prepares a pianist for expressive, tension-free performance?",
                null, Arrays.asList("Flat fingers, high shoulders, and playing as fast as possible without counting", "Level forearms, curved fingertips, steady tempo count-in, and relaxed wrists", "Sitting on the back edge of the bench with ankles crossed", "Pressing the sustain pedal continuously from the first note to the last"),
                1, null, false, null, "Balanced posture, curved fingers, relaxed wrists, and steady rhythmic awareness support lifelong musical growth."));
        authoritativeQuestions.put(3, l3);
    }

    public int getPassingThreshold(int level) {
        return switch (level) {
            case 1 -> 70;
            case 2 -> 75;
            case 3 -> 80;
            default -> 70;
        };
    }

    public int getXpReward(int level) {
        return switch (level) {
            case 1 -> 100;
            case 2 -> 150;
            case 3 -> 250;
            default -> 100;
        };
    }

    public String getAssessmentTitle(int level) {
        return switch (level) {
            case 1 -> "Level 1: Piano Foundations & Mechanics";
            case 2 -> "Level 2: Intermediate Theory & Technique";
            case 3 -> "Level 3: Conservatory Capstone & Repertoire";
            default -> "Graded Piano Assessment";
        };
    }

    public String getAssessmentDescription(int level) {
        return switch (level) {
            case 1 -> "Demonstrate mastery of keyboard geography, Cristofori piano history, sitting ergonomics, and landmark note identification.";
            case 2 -> "Validate knowledge of sharps, flats, enharmonics, intervals, staff clefs, note durations, and basic triad execution.";
            case 3 -> "Capstone examination: execute scales, full diatonic chords, Ode to Joy melodic performance, and two-hand cadence patterns.";
            default -> "Formal conservatory assessment.";
        };
    }

    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAssessmentsOverview(User user) {
        List<AssessmentResponse> list = new ArrayList<>();

        boolean l1Passed = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 1);
        boolean l2Passed = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 2);
        boolean l3Passed = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 3);

        for (int lvl = 1; lvl <= 3; lvl++) {
            List<AssessmentAttempt> attempts = attemptRepository.findByUserAndLevelOrderByStartedAtDesc(user, lvl);
            int bestScore = attempts.stream()
                    .mapToInt(a -> a.getScorePercent() != null ? a.getScorePercent() : 0)
                    .max().orElse(0);

            String status;
            if (lvl == 1) {
                status = l1Passed ? "PASSED" : (attempts.isEmpty() ? "AVAILABLE" : "FAILED");
            } else if (lvl == 2) {
                if (!l1Passed) status = "LOCKED";
                else status = l2Passed ? "PASSED" : (attempts.isEmpty() ? "AVAILABLE" : "FAILED");
            } else {
                if (!l2Passed) status = "LOCKED";
                else status = l3Passed ? "PASSED" : (attempts.isEmpty() ? "AVAILABLE" : "FAILED");
            }

            int questionCount = authoritativeQuestions.getOrDefault(lvl, Collections.emptyList()).size();
            list.add(new AssessmentResponse(
                    lvl,
                    "piano-level-" + lvl,
                    getAssessmentTitle(lvl),
                    getAssessmentDescription(lvl),
                    getPassingThreshold(lvl),
                    questionCount,
                    getXpReward(lvl),
                    status,
                    bestScore > 0 ? bestScore : null,
                    attempts.size()
            ));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<AssessmentQuestionDto> getAssessmentQuestions(Integer level) {
        List<InternalQuestion> internals = authoritativeQuestions.get(level);
        if (internals == null) {
            throw new IllegalArgumentException("Unknown assessment level: " + level);
        }

        List<AssessmentQuestionDto> dtos = new ArrayList<>();
        for (InternalQuestion q : internals) {
            AssessmentQuestionDto dto = new AssessmentQuestionDto();
            dto.setId(q.getId());
            dto.setLevel(q.getLevel());
            dto.setType(q.getType());
            dto.setTopic(q.getTopic());
            dto.setPrompt(q.getPrompt());
            dto.setInstructionHint(q.getInstructionHint());
            dto.setOptions(q.getOptions());
            dto.setTargetMidi(q.getTargetMidi());
            dto.setAllowAnyOctave(q.isAllowAnyOctave());
            dto.setSequenceLength(q.getTargetSequence() != null ? q.getTargetSequence().size() : null);
            // Notice: correctOptionIndex and targetSequence are intentionally omitted to prevent client cheating
            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional
    public AssessmentAttempt startAttempt(User user, Integer level) {
        if (level < 1 || level > 3) {
            throw new IllegalArgumentException("Invalid assessment level: " + level);
        }

        // Enforce prerequisites
        if (level == 2 && !attemptRepository.existsByUserAndLevelAndPassedTrue(user, 1)) {
            throw new IllegalStateException("Prerequisite required: Pass Level 1 Assessment before unlocking Level 2");
        }
        if (level == 3 && !attemptRepository.existsByUserAndLevelAndPassedTrue(user, 2)) {
            throw new IllegalStateException("Prerequisite required: Pass Level 2 Assessment before unlocking Level 3");
        }

        Instrument piano = instrumentRepository.findBySlug("piano")
                .orElseGet(() -> instrumentRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("Piano instrument not found")));

        int nextAttemptNumber = attemptRepository.findTopByUserAndLevelOrderByAttemptNumberDesc(user, level)
                .map(a -> a.getAttemptNumber() + 1)
                .orElse(1);

        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.setUser(user);
        attempt.setInstrument(piano);
        attempt.setLevel(level);
        attempt.setAssessmentCode("piano-level-" + level);
        attempt.setAssessmentTitle(getAssessmentTitle(level));
        attempt.setPassingThreshold(getPassingThreshold(level));
        attempt.setMaxScore(authoritativeQuestions.get(level).size());
        attempt.setScore(0);
        attempt.setScorePercent(0);
        attempt.setPassed(false);
        attempt.setAttemptNumber(nextAttemptNumber);
        attempt.setStatus("IN_PROGRESS");
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setXpAwarded(0);

        return attemptRepository.save(attempt);
    }

    @Transactional
    public AssessmentResultResponse submitAttempt(User user, Long attemptId, SubmitAssessmentRequest request) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment attempt not found: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Cannot submit assessment attempt for another student");
        }

        // Prevent duplicate final submissions
        if ("COMPLETED".equalsIgnoreCase(attempt.getStatus())) {
            throw new IllegalStateException("Attempt has already been completed and graded");
        }

        List<InternalQuestion> questions = authoritativeQuestions.get(attempt.getLevel());
        if (questions == null) {
            throw new IllegalStateException("Questions missing for level " + attempt.getLevel());
        }

        Map<String, SubmittedAnswerDto> submittedMap = new HashMap<>();
        if (request.getAnswers() != null) {
            for (SubmittedAnswerDto ans : request.getAnswers()) {
                if (ans.getQuestionId() != null) {
                    submittedMap.put(ans.getQuestionId(), ans);
                }
            }
        }

        int score = 0;
        List<AssessmentResultResponse.QuestionResultDto> results = new ArrayList<>();

        for (InternalQuestion q : questions) {
            SubmittedAnswerDto userAns = submittedMap.get(q.getId());
            boolean isCorrect = false;
            String userDisplay = "No Answer";
            String correctDisplay = "";

            if (userAns != null) {
                if ("multiple-choice".equals(q.getType()) || "true-false".equals(q.getType())) {
                    if (userAns.getSelectedOptionIndex() != null && q.getOptions() != null) {
                        isCorrect = userAns.getSelectedOptionIndex().equals(q.getCorrectOptionIndex());
                        if (userAns.getSelectedOptionIndex() >= 0 && userAns.getSelectedOptionIndex() < q.getOptions().size()) {
                            userDisplay = q.getOptions().get(userAns.getSelectedOptionIndex());
                        }
                    }
                    if (q.getCorrectOptionIndex() != null && q.getOptions() != null && q.getCorrectOptionIndex() < q.getOptions().size()) {
                        correctDisplay = q.getOptions().get(q.getCorrectOptionIndex());
                    }
                } else if ("identify-key".equals(q.getType())) {
                    if (userAns.getSelectedKeyMidi() != null && q.getTargetMidi() != null) {
                        if (q.isAllowAnyOctave()) {
                            isCorrect = (userAns.getSelectedKeyMidi() % 12) == (q.getTargetMidi() % 12);
                        } else {
                            isCorrect = userAns.getSelectedKeyMidi().equals(q.getTargetMidi());
                        }
                        userDisplay = "MIDI " + userAns.getSelectedKeyMidi();
                    }
                    correctDisplay = q.isAllowAnyOctave() ? "Any octave matching MIDI " + q.getTargetMidi() : "MIDI " + q.getTargetMidi();
                } else if ("play-sequence".equals(q.getType())) {
                    if (userAns.getPlayedSequence() != null && q.getTargetSequence() != null) {
                        isCorrect = userAns.getPlayedSequence().equals(q.getTargetSequence());
                        userDisplay = userAns.getPlayedSequence().toString();
                    }
                    correctDisplay = q.getTargetSequence() != null ? q.getTargetSequence().toString() : "";
                }
            }

            if (isCorrect) score++;
            results.add(new AssessmentResultResponse.QuestionResultDto(
                    q.getId(), isCorrect, userDisplay, correctDisplay, q.getExplanation()
            ));
        }

        int maxScore = questions.size();
        int scorePercent = Math.round(((float) score / maxScore) * 100);
        boolean passed = scorePercent >= attempt.getPassingThreshold();

        boolean alreadyPassedBefore = attemptRepository.existsByUserAndLevelAndPassedTrue(user, attempt.getLevel());

        attempt.setScore(score);
        attempt.setMaxScore(maxScore);
        attempt.setScorePercent(scorePercent);
        attempt.setPassed(passed);
        attempt.setStatus("COMPLETED");
        attempt.setCompletedAt(LocalDateTime.now());

        int xpAwarded = 0;
        if (passed && !alreadyPassedBefore) {
            xpAwarded = getXpReward(attempt.getLevel());
            attempt.setXpAwarded(xpAwarded);
            gamificationService.awardXp(user, xpAwarded);
            gamificationService.evaluateAchievements(user);
        }

        attemptRepository.save(attempt);

        boolean graduationEligible = checkGraduationEligibility(user);

        AssessmentResultResponse response = new AssessmentResultResponse();
        response.setAttemptId(attempt.getId());
        response.setLevel(attempt.getLevel());
        response.setScore(score);
        response.setMaxScore(maxScore);
        response.setScorePercent(scorePercent);
        response.setPassingThreshold(attempt.getPassingThreshold());
        response.setPassed(passed);
        response.setXpAwarded(xpAwarded);
        response.setGraduationEligible(graduationEligible);
        response.setQuestionResults(results);

        return response;
    }

    @Transactional(readOnly = true)
    public boolean checkGraduationEligibility(User user) {
        boolean l1 = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 1);
        boolean l2 = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 2);
        boolean l3 = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 3);
        return l1 && l2 && l3;
    }

    @Transactional(readOnly = true)
    public GraduationStatusResponse getGraduationStatus(User user) {
        boolean l1 = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 1);
        boolean l2 = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 2);
        boolean l3 = attemptRepository.existsByUserAndLevelAndPassedTrue(user, 3);

        Integer l1Best = attemptRepository.findTopByUserAndLevelAndPassedTrueOrderByScorePercentDesc(user, 1)
                .map(AssessmentAttempt::getScorePercent).orElse(null);
        Integer l2Best = attemptRepository.findTopByUserAndLevelAndPassedTrueOrderByScorePercentDesc(user, 2)
                .map(AssessmentAttempt::getScorePercent).orElse(null);
        Integer l3Best = attemptRepository.findTopByUserAndLevelAndPassedTrueOrderByScorePercentDesc(user, 3)
                .map(AssessmentAttempt::getScorePercent).orElse(null);

        Optional<Certificate> existingCert = certificateRepository.findByUserAndInstrumentSlug(user, "piano");

        GraduationStatusResponse res = new GraduationStatusResponse();
        res.setLevel1Passed(l1);
        res.setLevel2Passed(l2);
        res.setLevel3Passed(l3);
        res.setLevel1BestScore(l1Best);
        res.setLevel2BestScore(l2Best);
        res.setLevel3BestScore(l3Best);
        res.setEligibleForGraduation(l1 && l2 && l3);
        res.setCertificateConferred(existingCert.isPresent());
        res.setCertificateNumber(existingCert.map(Certificate::getCertificateNumber).orElse(null));

        return res;
    }

    @Transactional
    public CertificateResponse claimCertificate(User user, ClaimCertificateRequest request) {
        if (!checkGraduationEligibility(user)) {
            throw new IllegalStateException("Ineligible for graduation: Must pass Level 1 (>=70%), Level 2 (>=75%), and Level 3 (>=80%) first");
        }

        Instrument piano = instrumentRepository.findBySlug("piano")
                .orElseGet(() -> instrumentRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("Piano instrument not found")));

        // Return existing certificate if already conferred (idempotent)
        Optional<Certificate> existing = certificateRepository.findByUserAndInstrumentSlug(user, "piano");
        if (existing.isPresent()) {
            return mapCertificateToResponse(existing.get());
        }

        Integer l3Score = attemptRepository.findTopByUserAndLevelAndPassedTrueOrderByScorePercentDesc(user, 3)
                .map(AssessmentAttempt::getScorePercent).orElse(80);

        String recipient = (request.getRecipientName() != null && !request.getRecipientName().isBlank())
                ? request.getRecipientName().trim()
                : user.getDisplayName();

        String certNum = "MF-CERT-PIANO-" + System.currentTimeMillis() % 1000000;
        String hashPayload = certNum + ":" + user.getId() + ":" + l3Score + ":MelodyForgeConservatory";
        String verificationHash = generateSha256(hashPayload);

        Certificate cert = new Certificate();
        cert.setUser(user);
        cert.setInstrument(piano);
        cert.setCertificateNumber(certNum);
        cert.setRecipientName(recipient);
        cert.setFinalScorePercent(l3Score);
        cert.setConferredAt(LocalDateTime.now());
        cert.setVerificationHash(verificationHash);
        cert.setStatus("ACTIVE");

        Certificate saved = certificateRepository.save(cert);

        // Award Piano Graduate achievement & bonus XP
        gamificationService.awardXp(user, 300);
        gamificationService.evaluateAchievements(user);

        return mapCertificateToResponse(saved);
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificate(User user) {
        Certificate cert = certificateRepository.findByUserAndInstrumentSlug(user, "piano")
                .orElseThrow(() -> new IllegalArgumentException("No certificate found for user"));
        return mapCertificateToResponse(cert);
    }

    @Transactional(readOnly = true)
    public CertificateResponse verifyCertificate(String certificateNumber) {
        Certificate cert = certificateRepository.findByCertificateNumber(certificateNumber)
                .orElseThrow(() -> new IllegalArgumentException("Invalid certificate number: " + certificateNumber));

        // Authoritative Server-Side Re-computation of SHA-256 hash
        String expectedPayload = cert.getCertificateNumber() + ":" + cert.getUser().getId() + ":" + cert.getFinalScorePercent() + ":MelodyForgeConservatory";
        String recomputedHash = generateSha256(expectedPayload);
        boolean hashMatches = recomputedHash.equalsIgnoreCase(cert.getVerificationHash());

        CertificateResponse res = mapCertificateToResponse(cert);
        res.setIsVerified(hashMatches);
        if (!hashMatches) {
            res.setStatus("REVOKED_OR_TAMPERED");
        }
        return res;
    }

    @Transactional(readOnly = true)
    public List<AssessmentAttempt> getUserAttemptHistory(User user) {
        return attemptRepository.findByUserOrderByStartedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public AdminAssessmentStatsResponse getAdminStats() {
        long totalAttempts = attemptRepository.count();
        long l1Attempts = attemptRepository.countByLevel(1);
        long l2Attempts = attemptRepository.countByLevel(2);
        long l3Attempts = attemptRepository.countByLevel(3);

        long l1Passed = attemptRepository.countByLevelAndPassedTrue(1);
        long l2Passed = attemptRepository.countByLevelAndPassedTrue(2);
        long l3Passed = attemptRepository.countByLevelAndPassedTrue(3);

        long certs = certificateRepository.count();

        return new AdminAssessmentStatsResponse(
                totalAttempts, l1Attempts, l2Attempts, l3Attempts,
                l1Passed, l2Passed, l3Passed, certs
        );
    }

    private CertificateResponse mapCertificateToResponse(Certificate cert) {
        CertificateResponse res = new CertificateResponse();
        res.setId(cert.getId());
        res.setCertificateNumber(cert.getCertificateNumber());
        res.setTitle(cert.getTitle());
        res.setRecipientName(cert.getRecipientName());
        res.setInstrumentName(cert.getInstrument().getName());
        res.setCurriculumTitle(cert.getCurriculumTitle());
        res.setFinalScorePercent(cert.getFinalScorePercent());
        res.setConferredAt(cert.getConferredAt());
        res.setVerificationHash(cert.getVerificationHash());
        res.setStatus(cert.getStatus());
        return res;
    }

    private String generateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : encoded) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString().substring(0, 32);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
