package com.musiclms.initializer;

import com.musiclms.model.entity.*;
import com.musiclms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstrumentRepository instrumentRepository;
    private final HistorySectionRepository historySectionRepository;
    private final LearningTierRepository tierRepository;
    private final LearningLevelRepository levelRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final BadgeRepository badgeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           InstrumentRepository instrumentRepository,
                           HistorySectionRepository historySectionRepository,
                           LearningTierRepository tierRepository,
                           LearningLevelRepository levelRepository,
                           CourseRepository courseRepository,
                           LessonRepository lessonRepository,
                           ExerciseRepository exerciseRepository,
                           BadgeRepository badgeRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.instrumentRepository = instrumentRepository;
        this.historySectionRepository = historySectionRepository;
        this.tierRepository = tierRepository;
        this.levelRepository = levelRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.exerciseRepository = exerciseRepository;
        this.badgeRepository = badgeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        seedUsers();
        seedBadges();
        seedInstrumentsAndCurriculum();
    }

    private void seedUsers() {
        User admin = new User(
                "admin@musiclms.com",
                "admin",
                "Platform Administrator",
                passwordEncoder.encode("admin123"),
                Role.ROLE_ADMIN
        );
        admin.setTotalXp(1200);
        admin.setCurrentLevel(5);
        admin.setCurrentStreakDays(14);
        userRepository.save(admin);

        User student = new User(
                "student@musiclms.com",
                "student",
                "Alex Rivera (Learner)",
                passwordEncoder.encode("student123"),
                Role.ROLE_STUDENT
        );
        student.setTotalXp(250);
        student.setCurrentLevel(2);
        student.setCurrentStreakDays(4);
        userRepository.save(student);
    }

    private void seedBadges() {
        List<Badge> badges = Arrays.asList(
                new Badge("FIRST_NOTE", "First Touch", "Played your first note or completed your first lesson", "music", "MASTERY", 50),
                new Badge("KEYBOARD_EXPLORER", "Keyboard Explorer", "Completed 3 foundational piano lessons", "compass", "THEORY", 75),
                new Badge("GOLDEN_EAR", "Golden Ear", "Aced an ear training listening challenge", "headphones", "EAR_TRAINING", 100),
                new Badge("STREAK_3_DAYS", "3-Day Cadence", "Practiced 3 days consecutively", "flame", "STREAK", 100),
                new Badge("STREAK_7_DAYS", "Weekly Virtuoso", "Maintained a 7-day practice streak", "zap", "STREAK", 200),
                new Badge("BASICS_GRADUATE", "Basics Master", "Graduated from Tier 1: Basics", "award", "MASTERY", 300),
                new Badge("XP_MASTER_500", "500 Club", "Accumulated over 500 Experience Points", "star", "MASTERY", 150),
                new Badge("FIRST_PRACTICE", "Practice Pioneer", "Completed your first structured conservatory practice routine", "clock", "PRACTICE", 50),
                new Badge("RHYTHM_BEGINNER", "Rhythm Cadence", "Locked into a steady metronome pulse for 5+ minutes", "activity", "PRACTICE", 75),
                new Badge("CONSISTENT_PRACTITIONER", "Consistent Virtuoso", "Completed 5 or more structured practice sessions", "check-circle", "PRACTICE", 150),
                new Badge("TEMPO_MASTER", "Tempo Master", "Completed practice drills across multiple tempo ranges", "gauge", "PRACTICE", 100),
                new Badge("FIRST_ASSESSMENT", "Assessment Pioneer", "Passed your first graded conservatory assessment", "award", "MASTERY", 75),
                new Badge("ASSESSMENT_EXCELLENCE", "Conservatory Honors", "Scored 90% or higher on an assessment", "star", "MASTERY", 125),
                new Badge("PIANO_GRADUATE", "Piano Graduate", "Completed all three levels and earned the Conservatory Graduation Certificate", "crown", "MASTERY", 300),
                new Badge("PERFECT_PERFORMANCE", "Perfect Cadence", "Achieved a flawless 100% score on a graded assessment", "zap", "MASTERY", 200)
        );
        badgeRepository.saveAll(badges);
    }

    private void seedInstrumentsAndCurriculum() {
        // 1. Piano (Primary Instrument)
        Instrument piano = new Instrument(
                "piano",
                "Piano & Keyboard",
                "Keyboard",
                "The acoustic and digital piano: the king of musical instruments, spanning over 7 octaves of polyphonic expressive range.",
                "piano",
                true,
                1
        );
        piano = instrumentRepository.save(piano);

        // 2. Guitar
        Instrument guitar = new Instrument(
                "guitar",
                "Acoustic & Electric Guitar",
                "Strings",
                "Versatile fretted string instrument essential to modern acoustic, folk, rock, and jazz performance.",
                "guitar",
                true,
                2
        );
        guitar = instrumentRepository.save(guitar);

        // 3. Violin
        Instrument violin = new Instrument(
                "violin",
                "Violin",
                "Strings",
                "The premier bowed string instrument, renowned for lyrical melodies and orchestral prominence.",
                "violin",
                true,
                3
        );
        violin = instrumentRepository.save(violin);

        // 4. Drums
        Instrument drums = new Instrument(
                "drums",
                "Drum Kit & Percussion",
                "Percussion",
                "The rhythmic backbone of musical ensembles, developing coordination, tempo precision, and polyrhythms.",
                "drum",
                true,
                4
        );
        drums = instrumentRepository.save(drums);

        // Seed History & Curriculum for each instrument
        seedPianoHistory(piano);
        seedPianoCurriculum(piano);

        seedGuitarCurriculumAndHistory(guitar);
        seedViolinCurriculumAndHistory(violin);
        seedDrumsCurriculumAndHistory(drums);
    }

    private void seedPianoHistory(Instrument piano) {
        HistorySection ch1 = new HistorySection(
                piano, 1,
                "Origins of the Piano",
                "Pre-1700 Antiquity & Renaissance",
                "Before the piano existed, keyboard players struggled for centuries with a critical musical dilemma: they had no way to control how softly or loudly a note sounded using finger touch alone.",
                "Throughout the Renaissance and Baroque eras, keyboard repertoire was dominated by two primary domestic instruments: the clavichord and the harpsichord. The clavichord used small brass blades called tangents to strike strings directly. While it allowed delicate expressive shading and a gentle vibrato (known as Bebung), it was acoustically whisper-quiet and could never fill a recital hall. Conversely, the harpsichord used quill plectra mounted on wooden jacks to pluck strings. While brilliantly loud and projective, the harpsichord was mechanically incapable of dynamic touch: striking a key gently or forcefully produced the exact same volume. Musicians and instrument builders yearned for a revolutionary instrument that could blend the expressive sensitivity of the clavichord with the room-filling volume of the harpsichord.",
                "The piano was born from a centuries-long quest to give keyboard players dynamic control over volume through finger touch.",
                "Early keyboard predecessors: clavichord tangent striking versus harpsichord plectrum plucking.",
                "https://images.unsplash.com/photo-1520523839898-507127053c37?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"c. 500 BCE\", \"event\": \"The Pythagorean Monochord\", \"description\": \"Single string stretched across a movable bridge, establishing mathematical acoustic pitch intervals.\"}, {\"year\": \"c. 1300\", \"event\": \"Invention of the Clavichord\", \"description\": \"Brass tangents struck strings directly; allowed intimate touch vibrato but lacked concert projection.\"}, {\"year\": \"1397\", \"event\": \"Earliest Recorded Harpsichord\", \"description\": \"Padua records document an instrument plucking strings via jacks and quill plectra.\"}, {\"year\": \"1600s\", \"event\": \"Baroque Keyboard Dominance\", \"description\": \"Harpsichords and pipe organs become the twin pillars of European sacred and court music.\"}]",
                "[{\"title\": \"The Dynamic Dilemma\", \"tag\": \"Acoustics\", \"description\": \"Harpsichord quills pluck strings at a constant release velocity, making emotional crescendo and decrescendo mechanically impossible.\"}, {\"title\": \"Bebung Expression\", \"tag\": \"Technique\", \"description\": \"The clavichord was the only earlier keyboard allowing pitch vibrato, though it was barely audible beyond a small chamber.\"}, {\"title\": \"Pianoforte Meaning\", \"tag\": \"Terminology\", \"description\": \"Derives from 'gravicembalo col piano e forte' - a harpsichord capable of producing soft (piano) and loud (forte).\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1520523839898-507127053c37?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Acoustic stringed keyboard heritage.\", \"era\": \"Renaissance\"}, {\"imageUrl\": \"https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Close-up of keyboard action and string resonance.\", \"era\": \"17th Century\"}]",
                "C4", "Centered fundamental pitch produced by hammer strike acoustic resonance.",
                "[{\"id\": 1, \"question\": \"What fundamental physical limitation did the harpsichord have that led to the invention of the piano?\", \"options\": [\"It had fewer than 20 keys\", \"Strings were plucked by quill plectra with fixed release velocity, making dynamic touch control impossible\", \"It could only play in the bass register\", \"It went out of tune every 5 minutes\"], \"correctIndex\": 1, \"explanation\": \"Because harpsichord jacks pluck strings with plectra, every note rings at the exact same loudness regardless of how softly or forcefully a key is struck.\"}]",
                50, 10, true
        );

        HistorySection ch2 = new HistorySection(
                piano, 2,
                "Bartolomeo Cristofori and the Early Piano",
                "c. 1700 Florence, Italy",
                "Around 1700 at the Medici court in Florence, an Italian master harpsichord builder named Bartolomeo Cristofori solved the greatest mechanical challenge in keyboard history.",
                "Employed as the 'Keeper of the Instruments' by Prince Ferdinando de' Medici, Bartolomeo Cristofori of Padua was tasked with maintaining and innovating court instruments. Cristofori realized that to control volume, strings needed to be struck by hammers rather than plucked. However, this presented a daunting mechanical obstacle: if a hammer struck a string and remained resting against it, the string would instantly be muffled. Cristofori's genius was the invention of the escapement mechanism ('scappamento'). The escapement thrusts the hammer toward the string with energy proportional to key velocity, but disengages just before impact, allowing the hammer to rebound freely while the key remains held down. He also invented the backcheck to catch the bouncing hammer. Cristofori's earliest surviving instruments from the 1720s prove the sophistication of his mechanical breakthrough.",
                "Bartolomeo Cristofori invented the escapement mechanism around 1700, enabling true touch-sensitive hammer strikes.",
                "Diagram of Bartolomeo Cristofori's escapement hopper and backcheck action.",
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1688\", \"event\": \"Cristofori Joins the Medici Court\", \"description\": \"Prince Ferdinando de' Medici hires Cristofori to oversee the grand ducal instrument collection in Florence.\"}, {\"year\": \"1700\", \"event\": \"First Inventory Record\", \"description\": \"Medici court inventory describes an 'arpicimbalo che fa il piano e il forte' (harpsichord that makes soft and loud).\"}, {\"year\": \"1711\", \"event\": \"Maffei's Landmark Article\", \"description\": \"Scipione Maffei publishes the first schematic diagram of Cristofori's escapement mechanism in Venice.\"}, {\"year\": \"1720\", \"event\": \"Earliest Surviving Fortepiano\", \"description\": \"Cristofori builds the oldest extant piano, now displayed in New York's Metropolitan Museum of Art.\"}]",
                "[{\"title\": \"The Escapement Mechanism\", \"tag\": \"Engineering\", \"description\": \"The escapement releases the hammer just before striking, allowing the string to vibrate freely after impact.\"}, {\"title\": \"The Backcheck Innovation\", \"tag\": \"Mechanics\", \"description\": \"A small felt-padded wooden wedge that catches the rebounding hammer to prevent it from accidentally double-striking the string.\"}, {\"title\": \"Bilingual Name\", \"tag\": \"Terminology\", \"description\": \"Cristofori named his invention 'gravicembalo col piano e forte' - meaning harpsichord with soft and loud.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Early Italian pianoforte craftsmanship.\", \"era\": \"1700-1725\"}]",
                "E4", "Resonant single-string hammer strike demonstrating Cristofori escapement sustain.",
                "[{\"id\": 1, \"question\": \"What was the critical mechanical invention that allowed Cristofori's hammers to strike strings without muffling them?\", \"options\": [\"Electric pickup sensors\", \"An escapement mechanism that disengages the hammer just before impact\", \"Strings made of copper wire\", \"A hydraulic keybed valve\"], \"correctIndex\": 1, \"explanation\": \"The escapement (scappamento) drops the hammer away from the string immediately after striking, allowing the string to vibrate freely while the key remains held.\"}]",
                50, 10, true
        );

        HistorySection ch3 = new HistorySection(
                piano, 3,
                "Evolution of the Piano",
                "1730 - 1850 Germany & England",
                "From Cristofori's Florentine workshop, the piano migrated northward across Europe, transforming from a delicate chamber curiosity into a thunderous concert instrument.",
                "In Saxony, Gottfried Silbermann studied Maffei's drawings and built Germany's first fortepianos. In 1747, J.S. Bach inspected Silbermann's instruments at the Potsdam palace of King Frederick the Great, praising their touch and refined high register. In Vienna, Johann Andreas Stein perfected the light, responsive 'Viennese action,' allowing rapid finger runs beloved by Wolfgang Amadeus Mozart. Meanwhile in London, John Broadwood & Sons reinforced the wooden frames and introduced heavier hammers, creating a louder, warmer sound favored by Ludwig van Beethoven. As composers demanded greater acoustic power, the all-wood frames began buckling under string tension. The decisive breakthrough came in 1825 when American builder Alpheus Babcock patented the one-piece cast-iron frame in Boston, allowing pianos to withstand over 20 tons of string tension without cracking.",
                "The introduction of the one-piece cast-iron frame in 1825 enabled pianos to withstand massive string tension, increasing volume and sustain.",
                "Cast-iron harp frame and cross-stringing layout of the 19th century.",
                "https://images.unsplash.com/photo-1558584724-0e4d32ca55a4?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1747\", \"event\": \"Bach Tests Silbermann's Piano\", \"description\": \"Johann Sebastian Bach evaluates and approves Silbermann's refined fortepiano in Potsdam.\"}, {\"year\": \"1770s\", \"event\": \"Viennese Action Perfected\", \"description\": \"Johann Andreas Stein creates the light, agile action favored by Mozart and Haydn.\"}, {\"year\": \"1790s\", \"event\": \"English Broadwood Action\", \"description\": \"John Broadwood develops powerful grand pianos capable of supporting Beethoven's explosive dynamics.\"}, {\"year\": \"1825\", \"event\": \"Cast-Iron Frame Patented\", \"description\": \"Alpheus Babcock patents the full cast-iron plate in Boston, transforming structural durability.\"}]",
                "[{\"title\": \"Massive String Tension\", \"tag\": \"Engineering\", \"description\": \"Modern concert grands exert over 20 tons of total tension across their 230+ strings, held rigid by the cast-iron plate.\"}, {\"title\": \"Silbermann's Pedal Handstop\", \"tag\": \"Invention\", \"description\": \"Gottfried Silbermann invented the forerunner of the modern damper sustain pedal in the 1730s.\"}, {\"title\": \"Broadwood for Beethoven\", \"tag\": \"History\", \"description\": \"Thomas Broadwood shipped a 6-octave grand piano from London to Beethoven in Vienna in 1818.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1558584724-0e4d32ca55a4?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Grand piano acoustic body and structural tension.\", \"era\": \"19th Century\"}]",
                "G4", "Rich harmonic overtone series unlocked by high-tension cast-iron string scaling.",
                "[{\"id\": 1, \"question\": \"Why was Alpheus Babcock's 1825 patent for the cast-iron piano frame so revolutionary?\", \"options\": [\"It made pianos light enough to carry\", \"It allowed strings to withstand tens of thousands of pounds of tension without buckling the wooden casing\", \"It made the piano waterproof\", \"It replaced all white keys with ivory\"], \"correctIndex\": 1, \"explanation\": \"Cast-iron frames gave piano builders the structural rigidity needed to string instruments with heavy high-carbon steel under tens of thousands of pounds of tension.\"}]",
                50, 12, true
        );

        HistorySection ch4 = new HistorySection(
                piano, 4,
                "Development of Modern Piano",
                "1850 - 1900 Paris, Boston & New York",
                "By the late 19th century, piano engineering reached its definitive peak through mechanical and acoustic innovations that remain the gold standard today.",
                "In Paris in 1821, Sébastien Érard patented the revolutionary 'double escapement' (repetition action). This ingenious mechanism allows the hammer to reset midway through key travel, empowering pianists to replay a note at lightning speed without letting the key return all the way to the top. In New York, Henry Steinway and his sons introduced 'overstringing' (cross-stringing), fanning the heavy copper-wound bass strings diagonally over the treble strings. This positioned the bass bridge in the vibrant center of the soundboard and significantly improved acoustic fullness. By 1880, the keyboard compass stabilized at 88 keys (A0 to C8), and the three-pedal lyre—Damper (sustain), Una Corda (soft), and Sostenuto—became standard on concert instruments worldwide.",
                "The double escapement action, cross-stringing, and the 88-key standard completed the modern acoustic concert grand piano.",
                "The modern 88-key concert grand keybed and repetition action.",
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1821\", \"event\": \"Double Escapement Patented\", \"description\": \"Sébastien Érard invents repetition action, enabling rapid virtuosic note trills.\"}, {\"year\": \"1859\", \"event\": \"Steinway Overstringing Patent\", \"description\": \"Fanning bass strings diagonally across treble strings unlocks rich soundboard projection.\"}, {\"year\": \"1874\", \"event\": \"Sostenuto Pedal Patented\", \"description\": \"Albert Steinway patents the center sostenuto pedal, allowing selective note sustain.\"}, {\"year\": \"1880s\", \"event\": \"88-Key Standard Established\", \"description\": \"The 88-key compass (52 white keys, 36 black keys from A0 to C8) becomes universal.\"}]",
                "[{\"title\": \"88 Keys Universality\", \"tag\": \"Standardization\", \"description\": \"88 keys encompass 7 octaves plus a minor third (27.5 Hz to 4,186 Hz), perfectly covering the audible pitch range.\"}, {\"title\": \"Double Escapement Agility\", \"tag\": \"Mechanics\", \"description\": \"Pianists can repeat notes at up to 15 strikes per second thanks to Érard's repetition lever.\"}, {\"title\": \"Soundboard Diaphragm\", \"tag\": \"Acoustics\", \"description\": \"The soundboard is crowned solid spruce, functioning as a natural acoustic speaker cone.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Concert hall piano performance.\", \"era\": \"Late 19th Century\"}]",
                "C5", "Upper register singing clarity made possible by modern felt-wrapped hammers.",
                "[{\"id\": 1, \"question\": \"What performance capability did Sébastien Érard's double escapement repetition action unlock for pianists?\", \"options\": [\"Playing two pianos at once with one hand\", \"Rapidly restriking the same note without letting the key rise all the way back up\", \"Automated mechanical playback without a human performer\", \"Changing the key signature with a foot pedal\"], \"correctIndex\": 1, \"explanation\": \"Double escapement holds the hammer ready near the string so pianists can execute lightning-fast repeated notes, trills, and tremolos.\"}]",
                50, 10, true
        );

        HistorySection ch5 = new HistorySection(
                piano, 5,
                "Famous Piano Composers and Musicians",
                "1770 - Present Global",
                "The history of the piano is inseparable from the composers and virtuosos whose musical imagination pushed instrument makers to ever-greater heights.",
                "During the Classical era, Wolfgang Amadeus Mozart demonstrated the instrument's lyrical vocal qualities, while Ludwig van Beethoven's fiery dynamic shifts pushed manufacturers toward sturdier frames. The Romantic era brought Frédéric Chopin, who treated the piano with intimate sensitivity, exploiting subtle damper pedal resonance, expressive rubato, and delicate cantabile phrasing. Franz Liszt revolutionized performance by turning the grand piano sideways so audiences could see his hands and facial expressions, inventing the modern solo piano recital. Later virtuosos like Sergei Rachmaninoff expanded technical demands with vast chordal stretches. In the 20th and 21st centuries, classical titans like Vladimir Horowitz and Martha Argerich alongside jazz legends Art Tatum, Thelonious Monk, Bill Evans, and Herbie Hancock redefined harmonic voicing, improvisation, and rhythmic syncopation.",
                "Pianist-composers like Mozart, Beethoven, Chopin, Liszt, and modern jazz masters continuously expanded the musical possibilities of the piano.",
                "Frédéric Chopin and Franz Liszt at the keyboard.",
                "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1803\", \"event\": \"Beethoven Receives Érard Grand\", \"description\": \"Beethoven pushes dynamic boundaries, inspiring louder and more robust instruments.\"}, {\"year\": \"1839\", \"event\": \"Liszt Invents the Solo Recital\", \"description\": \"Franz Liszt coins the term 'recital' and turns the grand piano profile sideways on stage.\"}, {\"year\": \"1840s\", \"event\": \"Chopin's Romantic Masterpieces\", \"description\": \"Frédéric Chopin establishes the piano as the supreme vehicle for expressive nuance.\"}, {\"year\": \"1950s\", \"event\": \"The Golden Age of Jazz Piano\", \"description\": \"Thelonious Monk and Bill Evans pioneer modal harmony, rich extensions, and modern chord voicing.\"}]",
                "[{\"title\": \"Profile to Audience\", \"tag\": \"Stagecraft\", \"description\": \"Franz Liszt was the first pianist to turn the grand piano sideways on stage, showcasing his hands and projecting sound outwards.\"}, {\"title\": \"Poet of the Piano\", \"tag\": \"Repertoire\", \"description\": \"Chopin wrote almost exclusively for the piano, treating the keys as a flexible singing human voice.\"}, {\"title\": \"Rachmaninoff's Hand Span\", \"tag\": \"Physiology\", \"description\": \"Sergei Rachmaninoff possessed a legendary hand span capable of playing a 13th interval with one hand.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Classical and jazz piano sheet music and composition.\", \"era\": \"19th - 20th Century\"}]",
                "A4", "Standard concert pitch 440 Hz used by orchestras and concert pianists worldwide.",
                "[{\"id\": 1, \"question\": \"Who was the legendary 19th-century virtuoso who originated the modern solo piano recital and turned the piano sideways on stage?\", \"options\": [\"Ludwig van Beethoven\", \"Franz Liszt\", \"Johannes Brahms\", \"Johann Sebastian Bach\"], \"correctIndex\": 1, \"explanation\": \"Franz Liszt coined the term 'recital' in 1840 and positioned the piano in profile on stage so listeners could see his fingers and experience direct acoustic projection.\"}]",
                50, 10, true
        );

        HistorySection ch6 = new HistorySection(
                piano, 6,
                "Piano in Modern Music",
                "20th - 21st Century Digital Era",
                "Far from remaining confined to classical concert halls, the piano became the bedrock of 20th-century popular music and the primary interface for digital music production.",
                "At the dawn of the 20th century, Scott Joplin's syncopated piano rags ignited the Ragtime craze, laying the groundwork for blues and jazz. Pounding boogie-woogie basslines directly birthed Rock and Roll through icons like Little Richard and Jerry Lee Lewis. Pop balladeers like Elton John, Billy Joel, and contemporary artists like Adele proved the timeless emotional resonance of the piano in mainstream songwriting. In 1983, the adoption of the MIDI (Musical Instrument Digital Interface) standard solidified the piano keyboard as the universal controller for synthesizers, samplers, and computers. Today, digital stage pianos with weighted hammer-action keys, physical modeling software, and Web Audio API synthesis in web browsers bring interactive piano education to millions of learners globally.",
                "The piano keyboard is the universal musical interface, bridging classical acoustic heritage, popular music, and modern digital production.",
                "Modern digital stage piano, MIDI keyboard, and music software interface.",
                "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1899\", \"event\": \"Maple Leaf Rag Published\", \"description\": \"Scott Joplin's ragtime piano launches a nationwide American syncopated musical craze.\"}, {\"year\": \"1950s\", \"event\": \"Rock & Roll Piano Explosion\", \"description\": \"Little Richard and Jerry Lee Lewis make the piano a driving lead instrument of early rock.\"}, {\"year\": \"1983\", \"event\": \"MIDI Standard Introduced\", \"description\": \"The piano keyboard becomes the universal digital controller for synthesizers and software DAWs.\"}, {\"year\": \"Present\", \"event\": \"Browser Web Audio Synthesis\", \"description\": \"Tone.js and physical modeling bring interactive polyphonic pianos directly into web browsers.\"}]",
                "[{\"title\": \"Universal MIDI Controller\", \"tag\": \"Music Tech\", \"description\": \"The 88-key piano keyboard layout is the standard input hardware for virtually every music production DAW in existence.\"}, {\"title\": \"Graded Hammer Simulation\", \"tag\": \"Digital Pianos\", \"description\": \"Modern digital pianos use triple sensors and weighted hammers heavier in the bass to accurately replicate acoustic touch.\"}, {\"title\": \"Physical Modeling\", \"tag\": \"Software\", \"description\": \"Modern digital instruments calculate mathematical string vibration equations in real time rather than just replaying static recordings.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Digital audio production workstation with keyboard interface.\", \"era\": \"21st Century\"}]",
                "C4", "Polyphonic digital oscillator synthesis rendered via real-time Web Audio API.",
                "[{\"id\": 1, \"question\": \"What 1983 technical specification established the piano keyboard as the universal controller for synthesizers and digital audio software?\", \"options\": [\"MP3\", \"MIDI (Musical Instrument Digital Interface)\", \"VHF\", \"ASCII\"], \"correctIndex\": 1, \"explanation\": \"The MIDI protocol was established in 1983, standardizing how musical keyboards communicate note pitch, velocity, and timing to electronic instruments and computers.\"}]",
                50, 10, true
        );

        historySectionRepository.saveAll(Arrays.asList(ch1, ch2, ch3, ch4, ch5, ch6));
    }

    private void seedGuitarCurriculumAndHistory(Instrument guitar) {
        // Guitar History
        HistorySection gCh1 = new HistorySection(
                guitar, 1,
                "Origins of Stringed Instruments & The Lute",
                "Ancient World to Middle Ages",
                "The guitar traces its ancestry back over four thousand years to ancient fretted chordophones across Mesopotamia, Egypt, and Central Asia.",
                "Ancient stone carvings from Babylon and Egypt depict bowl-backed instruments with long fretted necks. In the 8th century, Moorish musicians brought the 'Oud' (an Arabic short-necked fretted lute) to the Iberian Peninsula. In medieval Spain, this evolved into the Moorish guitar (guitarra morisca) and the Latin guitar (guitarra latina), which featured curved waists and flat backs.",
                "The guitar evolved from ancient Mesopotamian fretted lutes and the Moorish Oud introduced to Spain.",
                "Ancient bowl lutes and medieval Spanish gitterns.",
                "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"c. 2000 BCE\", \"event\": \"Mesopotamian Fretted Lutes\", \"description\": \"Carvings reveal early necked instruments with fretted strings.\"}, {\"year\": \"711 CE\", \"event\": \"The Oud Enters Andalusia\", \"description\": \"Moorish arrival in Spain introduces advanced lute plucking and fretting techniques.\"}, {\"year\": \"1200s\", \"event\": \"Cantigas de Santa Maria\", \"description\": \"Manuscripts illustrate medieval guitar types in Christian Spain.\"}]",
                "[{\"title\": \"Name Origin\", \"tag\": \"Etymology\", \"description\": \"The word 'guitar' derives from the ancient Greek 'kithara' through the Arabic 'qitara' and Spanish 'guitarra'.\"}, {\"title\": \"Flat Back vs Bowl\", \"tag\": \"Acoustics\", \"description\": \"Unlike the round bowl back of the lute, the guitar developed a flat wooden back with inward curved bouts.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Acoustic string instrument craftsmanship.\", \"era\": \"Ancient to Medieval\"}]",
                "E2", "Low E string fundamental frequency (82.4 Hz) establishing the bottom of standard guitar tuning.",
                "[{\"id\": 1, \"question\": \"Which ancient instrument introduced to Spain during the Moorish period was the primary ancestor of the European lute and guitar?\", \"options\": [\"The Bagpipe\", \"The Oud\", \"The Synthesizer\", \"The Triangle\"], \"correctIndex\": 1, \"explanation\": \"The Arabic Oud introduced to Andalusia in the 8th century provided the direct acoustic, fretting, and plucking template for medieval European string instruments.\"}]",
                50, 10, true
        );

        HistorySection gCh2 = new HistorySection(
                guitar, 2,
                "Renaissance Vihuela & Baroque Guitar",
                "1500 - 1750 Spain & Europe",
                "During the Renaissance, Spain developed two distinct stringed instruments: the courtly vihuela for complex polyphony, and the four-course guitar for popular singing.",
                "The vihuela was tuned like a lute but shaped like a guitar, with six paired gut strings (courses). In the late 16th century, a fifth course was added, creating the 'Baroque guitar.' The Baroque guitar popularized both punteado (intricate fingerstyle counterpoint) and rasgueado (rhythmic strumming patterns). Italian and French courts fell in love with guitar music through masters like Gaspar Sanz and Robert de Visée.",
                "The 5-course Baroque guitar established standard strumming and fingerstyle techniques across European courts.",
                "Renaissance vihuela and ornamental Baroque guitars.",
                "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1536\", \"event\": \"Luis de Milán Publishes El Maestro\", \"description\": \"First printed collection of vihuela tablature in Valencia.\"}, {\"year\": \"1600\", \"event\": \"Rise of the 5-Course Guitar\", \"description\": \"Five-course gut-string instruments dominate popular music across Spain and Italy.\"}, {\"year\": \"1674\", \"event\": \"Gaspar Sanz Guitar Treatise\", \"description\": \"Landmark Spanish manual teaching flamenco rasgueado and classical punteado.\"}]",
                "[{\"title\": \"Paired Courses\", \"tag\": \"Strings\", \"description\": \"Before single strings became standard, guitars used paired strings tuned in unisons or octaves called courses.\"}, {\"title\": \"Rasgueado Strumming\", \"tag\": \"Technique\", \"description\": \"Flicking the fingernails outwards across strings created dramatic rhythmic drive in Spanish folk music.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Acoustic guitar body lines and soundhole.\", \"era\": \"Baroque Era\"}]",
                "A2", "Second string A (110 Hz) in standard guitar tuning.",
                "[{\"id\": 1, \"question\": \"What was the Spanish courtly instrument tuned like a lute but shaped with a flat back and waist like a guitar?\", \"options\": [\"The Vihuela\", \"The Accordion\", \"The Trombone\", \"The Clarinet\"], \"correctIndex\": 0, \"explanation\": \"The vihuela was the aristocratic 6-course instrument of the Spanish Golden Age, played by masters like Luis de Milán.\"}]",
                50, 10, true
        );

        HistorySection gCh3 = new HistorySection(
                guitar, 3,
                "Antonio de Torres & The Modern Classical Guitar",
                "1850 - 1900 Seville, Spain",
                "In the 1850s in Seville, a Spanish carpenter and luthier named Antonio de Torres Jurado reinvented the guitar, establishing the modern classical proportions used to this day.",
                "Prior to Torres, guitars were small, quiet, and narrow. Torres made three revolutionary breakthroughs: 1) He enlarged the soundboard body, giving the instrument greater volume and bass resonance; 2) He standardized the vibrating string scale length at 650 mm (25.6 inches); and 3) He developed symmetric fan bracing—wooden struts radiating like a fan beneath the spruce soundboard to maximize acoustic flexibility. Virtuoso guitarist Francisco Tárrega used Torres guitars to compose masterpieces like Recuerdos de la Alhambra, establishing the guitar as a serious concert hall solo instrument.",
                "Antonio de Torres is the father of the modern classical guitar, standardizing fan bracing and the 650mm string scale.",
                "Antonio de Torres classical guitar and internal fan bracing system.",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1852\", \"event\": \"Torres Sets Up Workshop in Seville\", \"description\": \"Antonio de Torres begins experimenting with enlarged soundboard dimensions.\"}, {\"year\": \"1856\", \"event\": \"La Leona Masterpiece Built\", \"description\": \"Torres builds his legendary guitar 'La Leona', proving soundboard bracing is the true acoustic heart.\"}, {\"year\": \"1880s\", \"event\": \"Francisco Tárrega Pioneers Modern Technique\", \"description\": \"Tárrega codifies classical guitar posture, right-hand rest strokes (apoyando), and repertoire.\"}]",
                "[{\"title\": \"The 650mm Standard\", \"tag\": \"Lutherie\", \"description\": \"Torres established 650mm as the ideal vibrating string length balancing finger reach and acoustic string tension.\"}, {\"title\": \"Fan Bracing\", \"tag\": \"Acoustics\", \"description\": \"Spreading wooden braces in a fan pattern beneath the bridge allows the soundboard to pump air like a drumhead.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Classical nylon-string guitar rosette and body craftsmanship.\", \"era\": \"Late 19th Century\"}]",
                "E4", "High E string (329.6 Hz) melodic singing register of the classical guitar.",
                "[{\"id\": 1, \"question\": \"Which Spanish luthier is celebrated as the father of the modern classical guitar for standardizing body size, fan bracing, and the 650mm scale?\", \"options\": [\"Antonio Stradivari\", \"Antonio de Torres Jurado\", \"Bartolomeo Cristofori\", \"Adolph Rickenbacker\"], \"correctIndex\": 1, \"explanation\": \"Antonio de Torres revolutionized guitar construction in Seville during the 1850s, creating the physical template for all modern classical guitars.\"}]",
                50, 10, true
        );

        HistorySection gCh4 = new HistorySection(
                guitar, 4,
                "The Electric Guitar Revolution",
                "1930 - Present USA & Global",
                "In the 1930s, big band guitarists struggled to be heard over brass horn sections, triggering an electronic revolution that reshaped modern popular culture.",
                "The first commercial electric guitar was the 1931 aluminum lap steel 'Frying Pan' created by George Beauchamp and Adolph Rickenbacker using electromagnetic coil pickups. In 1950, Leo Fender introduced the solid-body 'Esquire' and 'Broadcaster' (renamed Telecaster), followed by the iconic contoured Stratocaster in 1954. Concurrently, Gibson teamed with guitarist Les Paul to create the carved maple-top solid body in 1952. The electric guitar powered Blues (B.B. King, Muddy Waters), Rock 'n' Roll (Chuck Berry, Jimi Hendrix), and Heavy Metal, cementing its place as the definitive cultural symbol of youth, rebellion, and musical freedom.",
                "Solid-body electric guitars with electromagnetic pickups revolutionized volume, sustain, and popular music across the globe.",
                "Iconic solid-body electric guitars: Fender Stratocaster and Gibson Les Paul.",
                "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1931\", \"event\": \"The Rickenbacker 'Frying Pan'\", \"description\": \"First commercially produced electric guitar with electromagnetic horseshoe pickups.\"}, {\"year\": \"1950\", \"event\": \"Leo Fender Launches Telecaster\", \"description\": \"First mass-produced solid-body electric guitar with bolt-on maple neck.\"}, {\"year\": \"1952\", \"event\": \"Gibson Les Paul Introduced\", \"description\": \"Solid mahogany body with carved maple cap and warm humbucking pickups.\"}, {\"year\": \"1967\", \"event\": \"Jimi Hendrix at Monterey\", \"description\": \"Hendrix electrifies the world, using amplifier feedback and sustain as expressive musical paint.\"}]",
                "[{\"title\": \"Electromagnetic Induction\", \"tag\": \"Physics\", \"description\": \"Steel strings vibrating through a permanent magnetic field generate tiny AC electrical currents in copper wire coils.\"}, {\"title\": \"Solid-Body Feedback Elimination\", \"tag\": \"Engineering\", \"description\": \"Removing the hollow resonant acoustic box prevented runaway acoustic feedback at stadium volumes.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Electric guitar pickguard, pickups, and volume controls.\", \"era\": \"Modern Era\"}]",
                "E2", "Electric guitar bridge pickup resonance.",
                "[{\"id\": 1, \"question\": \"What was the primary acoustic problem that led to the development of the solid-body electric guitar in the 1940s and 1950s?\", \"options\": [\"Hollow acoustic guitars produced howling feedback when amplified loud enough to compete with big band horns\", \"Guitars were too heavy\", \"String broke too often\", \"No one knew how to tune six strings\"], \"correctIndex\": 0, \"explanation\": \"Hollow-body guitars vibrated sympathetically with loud amplifier speakers, causing screeching acoustic feedback; solid wood bodies eliminated this issue.\"}]",
                50, 10, true
        );

        historySectionRepository.saveAll(Arrays.asList(gCh1, gCh2, gCh3, gCh4));

        // Seed 4-Tier Learning Structure for Guitar
        LearningTier gTier1 = new LearningTier(guitar, "BASICS", 1, "Guitar anatomy, strings, tuning, holding the pick, first chords and strumming.", 0);
        gTier1 = tierRepository.save(gTier1);

        LearningLevel gLvl1 = new LearningLevel(gTier1, 1, "Level 1: Introduction to Guitar", "Discover guitar parts, open string names E-A-D-G-B-E, and guitar history.", 100);
        gLvl1 = levelRepository.save(gLvl1);

        Course gC1 = new Course(gLvl1, "Foundations of the Guitar", "Anatomy, posture, and string fundamentals.", 1);
        gC1 = courseRepository.save(gC1);

        Lesson gLes1 = new Lesson(gC1, "Guitar Anatomy & The 6 Open Strings",
                "Learn the headstock, frets, bridge, and standard tuning: E - A - D - G - B - E (Eddie Ate Dynamite Good Bye Eddie).",
                "### Anatomy of the Guitar\n\nA guitar consists of three main sections:\n1. **Headstock**: Houses the tuning pegs.\n2. **Neck & Fretboard**: Divided by metal fret wires.\n3. **Body**: The acoustic sound chamber or solid wood body.\n\n### The 6 Open Strings\nFrom lowest pitch (thickest) to highest pitch (thinnest):\n- **String 6 (Thickest)**: E (E2)\n- **String 5**: A (A2)\n- **String 4**: D (D3)\n- **String 3**: G (G3)\n- **String 2**: B (B3)\n- **String 1 (Thinnest)**: E (E4)",
                "THEORY", 10, 50, 1);
        lessonRepository.save(gLes1);

        Lesson gLes2 = new Lesson(gC1, "Holding the Pick & First Strumming",
                "Master relaxed pick grip and smooth downstrokes across open strings.",
                "### Holding the Plectrum (Pick)\n\nHold the pick between the pad of your thumb and the side of your index finger. Keep your wrist loose and relaxed. Strum downward across all six strings.",
                "PRACTICAL", 12, 50, 2);
        lessonRepository.save(gLes2);

        // Skeleton Tiers for Guitar
        LearningTier gTier2 = new LearningTier(guitar, "INTERMEDIATE", 2, "Barre chords, pentatonic scales, fingerpicking, and rhythmic strum patterns.", 450);
        tierRepository.save(gTier2);
        LearningTier gTier3 = new LearningTier(guitar, "PRO", 3, "Modes, soloing, lead techniques, bending, vibrato, and dynamic expression.", 1000);
        tierRepository.save(gTier3);
        LearningTier gTier4 = new LearningTier(guitar, "EXPERT", 4, "Advanced jazz harmony, improvisation, speed mechanics, and performance repertoire.", 2000);
        tierRepository.save(gTier4);
    }

    private void seedViolinCurriculumAndHistory(Instrument violin) {
        HistorySection vCh1 = new HistorySection(
                violin, 1,
                "Renaissance Origins in Northern Italy",
                "1500 - 1600 Cremona & Brescia",
                "The violin emerged in 16th-century northern Italy, evolving from medieval bowed instruments into the most agile voice of the orchestra.",
                "Early bowed instruments like the medieval rebec and the Renaissance viola da braccio (arm viola) laid the structural foundation. In the northern Italian town of Cremona, Andrea Amati crafted the earliest documented four-string violins for the French royal court of Charles IX in the 1560s.",
                "Andrea Amati founded the Cremonese violin-making dynasty in the mid-16th century.",
                "Andrea Amati four-string violin and maple/spruce body.",
                "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1505\", \"event\": \"First Depiction in Ferrara\", \"description\": \"Fresco paintings illustrate early three-string violins.\"}, {\"year\": \"1564\", \"event\": \"Amati Crafts French Royal Instruments\", \"description\": \"Andrea Amati delivers a set of decorated violins to Charles IX of France.\"}]",
                "[{\"title\": \"The Cremona School\", \"tag\": \"Geography\", \"description\": \"Cremona, Italy became the epicenter of violin lutherie for over two centuries.\"}, {\"title\": \"Four Strings in Fifths\", \"tag\": \"Tuning\", \"description\": \"Tuned in perfect fifths: G3 - D4 - A4 - E5.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Acoustic violin scroll and spruce carved top.\", \"era\": \"Renaissance\"}]",
                "A4", "Violin open A string (440 Hz) benchmark orchestral tuning pitch.",
                "[{\"id\": 1, \"question\": \"Which northern Italian city became the world-renowned historic capital of violin making?\", \"options\": [\"Cremona\", \"Naples\", \"Venice\", \"Rome\"], \"correctIndex\": 0, \"explanation\": \"Cremona was home to the legendary Amati, Guarneri, and Stradivari workshops that defined violin lutherie.\"}]",
                50, 10, true
        );

        HistorySection vCh2 = new HistorySection(
                violin, 2,
                "The Golden Age of Cremona: Stradivari & Guarneri",
                "1680 - 1750 Cremona, Italy",
                "The pinnacle of violin making was achieved between 1680 and 1740 through the peerless workshops of Antonio Stradivari and Giuseppe Guarneri 'del Gesù'.",
                "Antonio Stradivari refined the violin's arching, lengthened the body, and utilized alpine spruce tops and flamed maple backs with secret oil varnishes. His instruments, like the 1715 'Il Cremonese' and 1716 'Messiah', are considered acoustic miracles worth tens of millions of dollars.",
                "Instruments by Antonio Stradivari and Guarneri del Gesù remain the acoustic gold standard for concert soloists.",
                "Stradivarius violin with golden-orange varnish and F-holes.",
                "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1700-1720\", \"event\": \"Stradivari's Golden Period\", \"description\": \"Antonio Stradivari produces his most acoustically powerful solo violins.\"}, {\"year\": \"1740s\", \"event\": \"Guarneri del Gesù Innovations\", \"description\": \"Giuseppe Guarneri crafts instruments with dark, penetrating tone favored by Paganini.\"}]",
                "[{\"title\": \"The F-Hole Equation\", \"tag\": \"Acoustics\", \"description\": \"The elongated F-holes allow air to pump efficiently in response to string vibration.\"}, {\"title\": \"The Soundpost Soul\", \"tag\": \"Mechanics\", \"description\": \"Called 'l'anima' (the soul) in Italian, this small spruce dowel inside transfers vibration between top and back plates.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Violin F-holes and bridge alignment.\", \"era\": \"Golden Age\"}]",
                "E5", "Brilliant high E string projection of the concert violin.",
                "[{\"id\": 1, \"question\": \"What is the small wooden dowel inside the violin called that transfers string vibrations to the back plate?\", \"options\": [\"The Soundpost (L'Anima)\", \"The Bridge\", \"The Tailpiece\", \"The Chinrest\"], \"correctIndex\": 0, \"explanation\": \"The soundpost sits inside the body directly beneath the treble foot of the bridge, coupling the top and back plates acoustically.\"}]",
                50, 10, true
        );

        historySectionRepository.saveAll(Arrays.asList(vCh1, vCh2));

        LearningTier vTier1 = new LearningTier(violin, "BASICS", 1, "Violin hold, bow grip, open strings G-D-A-E, and tone production.", 0);
        vTier1 = tierRepository.save(vTier1);

        LearningLevel vLvl1 = new LearningLevel(vTier1, 1, "Level 1: Introduction to Violin", "Violin anatomy, bow hold, and violin history.", 100);
        vLvl1 = levelRepository.save(vLvl1);

        Course vC1 = new Course(vLvl1, "Violin Foundations", "Holding the instrument, bow hold, and open string tone.", 1);
        vC1 = courseRepository.save(vC1);

        Lesson vLes1 = new Lesson(vC1, "Anatomy of the Violin & Bow", "Scroll, pegs, fingerboard, bridge, soundpost, bow horsehair, and frog.", "THEORY", 10, 50, 1);
        lessonRepository.save(vLes1);

        // Skeleton Tiers for Violin
        LearningTier vTier2 = new LearningTier(violin, "INTERMEDIATE", 2, "First position fingering, shifting, and bowing styles.", 450);
        tierRepository.save(vTier2);
        LearningTier vTier3 = new LearningTier(violin, "PRO", 3, "Vibrato, advanced shifting, spiccato, and concert etudes.", 1000);
        tierRepository.save(vTier3);
        LearningTier vTier4 = new LearningTier(violin, "EXPERT", 4, "Virtuoso concertos, double stops, and master recitals.", 2000);
        tierRepository.save(vTier4);
    }

    private void seedDrumsCurriculumAndHistory(Instrument drums) {
        HistorySection dCh1 = new HistorySection(
                drums, 1,
                "Ancient Percussion & Military Field Drums",
                "Antiquity to 19th Century",
                "Drums are mankind's oldest musical instruments after the human voice, originating as spiritual, communal, and military communication tools.",
                "Ancient clay and wooden frame drums with stretched animal hides date back over 7,000 years to ancient China and Mesopotamia. In European military history, snare drums and field brass were used to coordinate troop marches, signaling tactical commands across smoky battlefields.",
                "From ancient ceremonial frame drums to European military field marching snares, percussion provided the heartbeat of civilization.",
                "Ancient frame drums and military field rope-tension snare drums.",
                "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"c. 5000 BCE\", \"event\": \"Neolithic Alligator Drums in China\", \"description\": \"Earliest archaeological drums discovered in Shanxi, China.\"}, {\"year\": \"1300s\", \"event\": \"Swiss Field Snare Drums\", \"description\": \"Swiss mercenary pikemen develop precise rope-tensioned snare rudiments.\"}]",
                "[{\"title\": \"Snare Wires Origin\", \"tag\": \"Mechanics\", \"description\": \"Original snare wires were twisted gut strings stretched across the bottom drumhead to produce a crisp snapping sound.\"}, {\"title\": \"Drum Rudiments\", \"tag\": \"Technique\", \"description\": \"Standardized patterns like the paradiddle and flam were created for military signaling.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Acoustic snare drum and sticks.\", \"era\": \"Antiquity to 19th Century\"}]",
                "C2", "Resonant low acoustic bass drum thump.",
                "[{\"id\": 1, \"question\": \"What was the primary military function of snare drums during 16th to 18th-century European warfare?\", \"options\": [\"To signal commands and keep marching cadence on battlefields\", \"To frighten wildlife\", \"To weigh down tents\", \"To store gunpowder\"], \"correctIndex\": 0, \"explanation\": \"Snare drums broadcast loud rhythmic rudiments across long distances to communicate movements and maintain marching cadence.\"}]",
                50, 10, true
        );

        HistorySection dCh2 = new HistorySection(
                drums, 2,
                "The 1909 Ludwig Bass Drum Pedal & Birth of the Drum Kit",
                "1900 - 1950 Chicago & New Orleans",
                "In 1909, William F. Ludwig revolutionized percussion by inventing the practical bass drum pedal, enabling a single drummer to play multiple percussion instruments at once.",
                "Before 1909, theatre orchestras required multiple percussionists: one for the snare drum, one for the bass drum, and one for cymbals. Ludwig's spring-loaded foot pedal allowed one musician to play the bass drum with their foot while playing snare and cymbals with their hands. In New Orleans, jazz pioneers combined this pedal with Chinese tom-toms and the 'low-boy' (forerunner of the modern hi-hat), giving birth to the modern drum kit (the 'trap set').",
                "The bass drum foot pedal made the modern drum kit possible, allowing one drummer to power an entire ensemble.",
                "Early Ludwig bass drum pedal and the birth of the New Orleans jazz drum kit.",
                "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80",
                "[{\"year\": \"1909\", \"event\": \"Ludwig Patented Bass Drum Pedal\", \"description\": \"William F. Ludwig patents the first reliable floor foot pedal in Chicago.\"}, {\"year\": \"1920s\", \"event\": \"Invention of the Hi-Hat\", \"description\": \"The low-boy pedal evolves into the stand-mounted hi-hat cymbals operated by the left foot.\"}, {\"year\": \"1930s\", \"event\": \"Gene Krupa at Carnegie Hall\", \"description\": \"Gene Krupa makes the drum solo famous with Benny Goodman's Sing, Sing, Sing.\"}]",
                "[{\"title\": \"Trap Set Meaning\", \"tag\": \"Terminology\", \"description\": \"Short for 'contraption set' - the collection of bells, woodblocks, and cymbals mounted on early drum kits.\"}, {\"title\": \"Gene Krupa Standard\", \"tag\": \"Innovation\", \"description\": \"Krupa collaborated with Slingerland to create tunable tom-toms on both top and bottom heads.\"}]",
                "[{\"imageUrl\": \"https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80\", \"caption\": \"Drum kit cymbal and stick impact.\", \"era\": \"Early 20th Century\"}]",
                "G1", "Tight bass drum punch.",
                "[{\"id\": 1, \"question\": \"What invention by William F. Ludwig in 1909 allowed a single drummer to play the bass drum while using both hands for snare and cymbals?\", \"options\": [\"The practical bass drum foot pedal\", \"The electric drum pad\", \"Plastic drumheads\", \"The microphone\"], \"correctIndex\": 0, \"explanation\": \"The Ludwig spring-return bass drum foot pedal freed the drummer's hands, creating the modern one-person drum kit.\"}]",
                50, 10, true
        );

        historySectionRepository.saveAll(Arrays.asList(dCh1, dCh2));

        LearningTier dTier1 = new LearningTier(drums, "BASICS", 1, "Drum kit setup, stick grip (matched vs traditional), timing, and basic rock beats.", 0);
        dTier1 = tierRepository.save(dTier1);

        LearningLevel dLvl1 = new LearningLevel(dTier1, 1, "Level 1: Introduction to Drums & Percussion", "Drum components, drum history, and counting quarter notes.", 100);
        dLvl1 = levelRepository.save(dLvl1);

        Course dC1 = new Course(dLvl1, "Rhythmic Foundations", "The drum set anatomy, grip, and 4/4 time signature.", 1);
        dC1 = courseRepository.save(dC1);

        Lesson dLes1 = new Lesson(dC1, "Anatomy of the Drum Kit", "Bass drum, snare, hi-hat, toms, crash and ride cymbals.", "THEORY", 10, 50, 1);
        lessonRepository.save(dLes1);

        // Skeleton Tiers for Drums
        LearningTier dTier2 = new LearningTier(drums, "INTERMEDIATE", 2, "Eighth-note grooves, 16th-note fills, and limb independence.", 450);
        tierRepository.save(dTier2);
        LearningTier dTier3 = new LearningTier(drums, "PRO", 3, "Polyrhythms, odd meter signatures, ghost notes, and double bass drumming.", 1000);
        tierRepository.save(dTier3);
        LearningTier dTier4 = new LearningTier(drums, "EXPERT", 4, "Advanced syncopation, world rhythms, soloing, and master performance.", 2000);
        tierRepository.save(dTier4);
    }

    private void seedPianoCurriculum(Instrument piano) {
        // TIER 1: BASICS
        LearningTier tierBasics = new LearningTier(piano, "BASICS", 1, "Introduce the instrument, anatomy, keys, notation, and fundamental playing techniques.", 0);
        tierBasics = tierRepository.save(tierBasics);

        // Level 1: Introduction and Familiarization
        LearningLevel t1l1 = new LearningLevel(tierBasics, 1, "Level 1: Introduction and Familiarization", "Learn piano history, piano anatomy, white and black key layout, and musical sound basics.", 100);
        t1l1 = levelRepository.save(t1l1);
        Course c1 = new Course(t1l1, "Getting Started with Piano", "Foundational introduction to the instrument and keyboard layout.", 1);
        c1 = courseRepository.save(c1);

        Lesson l1_1 = new Lesson(c1, "Anatomy of the Piano Keyboard", "Discover the layout of 88 keys, grouping of 2 and 3 black keys, and middle C.",
                "### Understanding the Piano Keyboard\n\nThe piano keyboard is made up of a repeating pattern of **white keys** (naturals) and **black keys** (accidentals).\n\nNotice the pattern of black keys:\n- Groups of **two black keys**\n- Groups of **three black keys**\n\nThis alternating pattern of two and three black keys is your roadmap across the entire instrument. **Middle C (C4)** is always located directly to the left of any group of two black keys near the center of the keyboard.",
                "THEORY", 8, 50, 1);
        l1_1 = lessonRepository.save(l1_1);

        Lesson l1_2 = new Lesson(c1, "The White Keys and Black Keys Pattern", "Master finding any key quickly using the black key landmarks.",
                "### Landmarks on the Keyboard\n\nTo find any note, locate the black key groups:\n- **C** is always the white key to the left of the **two black keys**.\n- **D** is in the middle of the **two black keys**.\n- **E** is directly to the right of the **two black keys**.\n- **F** is to the left of the **three black keys**.\n- **G, A, B** follow consecutively.",
                "PRACTICAL", 10, 50, 2);
        l1_2 = lessonRepository.save(l1_2);

        // Level 2: Fundamental Concepts
        LearningLevel t1l2 = new LearningLevel(tierBasics, 2, "Level 2: Fundamental Concepts", "Musical notes, pitch, Middle C (C4), and introduction to musical notation.", 150);
        t1l2 = levelRepository.save(t1l2);
        Course c2 = new Course(t1l2, "Musical Alphabet & Pitch", "Connect notes, pitch frequency, and letter names A through G.", 1);
        c2 = courseRepository.save(c2);

        Lesson l2_1 = new Lesson(c2, "The Musical Alphabet (A to G)", "Music uses only seven letters: A, B, C, D, E, F, G, repeating in octaves.",
                "### The 7 Musical Letters\n\nUnlike the English alphabet with 26 letters, the musical alphabet has only **7 letters**:\n\n**A - B - C - D - E - F - G**\n\nAfter G, the cycle repeats at a higher pitch with A again! Each repetition is called an **octave**.",
                "THEORY", 10, 50, 1);
        l2_1 = lessonRepository.save(l2_1);

        Lesson l2_2 = new Lesson(c2, "Finding Middle C (C4) & Octaves", "Locate C4 and understand how octaves raise and lower the pitch.",
                "### Middle C (C4)\n\nMiddle C is designated as **C4** in scientific pitch notation because it is the 4th C on a standard 88-key piano. It vibrates at approximately **261.63 Hz**.\n\nPlay C4 on the virtual keyboard to hear its clear, centered tone.",
                "PRACTICAL", 12, 60, 2);
        l2_2 = lessonRepository.save(l2_2);

        // Level 3: Basic Practical Learning
        LearningLevel t1l3 = new LearningLevel(tierBasics, 3, "Level 3: Basic Practical Learning", "Finger numbering, simple practical exercises, ear training, and Tier 1 assessment.", 200);
        t1l3 = levelRepository.save(t1l3);
        Course c3 = new Course(t1l3, "First Steps at the Keys", "Hand position, finger numbering (1 to 5), and note recognition.", 1);
        c3 = courseRepository.save(c3);

        Lesson l3_1 = new Lesson(c3, "Finger Numbering & Hand Posture", "Learn the universal pianist finger numbering system: Thumb is 1, Pinky is 5.",
                "### Finger Numbers\n\nPianists use numbers 1 through 5 for each hand:\n- **1 = Thumb**\n- **2 = Index finger**\n- **3 = Middle finger**\n- **4 = Ring finger**\n- **5 = Pinky finger**\n\nKeep your hands relaxed in a gentle curved shape, as if holding a tennis ball or bubble.",
                "PRACTICAL", 10, 50, 1);
        l3_1 = lessonRepository.save(l3_1);

        Lesson l3_2 = new Lesson(c3, "Ear Training: Listening & Note Recognition", "Train your ear to identify Middle C (C4) versus higher and lower notes.",
                "### Active Listening Practice\n\nListening is half of musicianship! In this lesson, listen to the audio tone and identify which musical note was played.",
                "LISTENING", 15, 75, 2);
        l3_2 = lessonRepository.save(l3_2);

        Lesson l3_3 = new Lesson(c3, "Tier 1: Basics Practical Assessment", "Comprehensive assessment covering key landmarks, note names, and ear identification.",
                "### Tier 1 Assessment\n\nCongratulations on reaching the final assessment of Tier 1: Basics! Answer the questions below and demonstrate your mastery of piano fundamentals.",
                "ASSESSMENT", 15, 100, 3);
        l3_3 = lessonRepository.save(l3_3);

        // Seed Exercises for Basics Lessons
        seedExercisesForBasics(l1_1, l1_2, l2_1, l2_2, l3_1, l3_2, l3_3);

        // TIER 2: INTERMEDIATE
        LearningTier tierIntermediate = new LearningTier(piano, "INTERMEDIATE", 2, "Develop practical skills, finger coordination, scales, intervals, and chord triads.", 450);
        tierIntermediate = tierRepository.save(tierIntermediate);
        seedIntermediateSkeleton(tierIntermediate);

        // TIER 3: PRO
        LearningTier tierPro = new LearningTier(piano, "PRO", 3, "Develop advanced technique, arpeggios, dynamic velocity, and expressive interpretation.", 1000);
        tierPro = tierRepository.save(tierPro);
        seedProSkeleton(tierPro);

        // TIER 4: EXPERT
        LearningTier tierExpert = new LearningTier(piano, "EXPERT", 4, "Mastery level harmony, advanced performance, complex arrangements, and capstone recital.", 2000);
        tierExpert = tierRepository.save(tierExpert);
        seedExpertSkeleton(tierExpert);
    }

    private void seedExercisesForBasics(Lesson l1_1, Lesson l1_2, Lesson l2_1, Lesson l2_2, Lesson l3_1, Lesson l3_2, Lesson l3_3) {
        Exercise e1 = new Exercise(l1_1, "MULTIPLE_CHOICE",
                "Black keys on the piano are grouped into alternating clusters of:",
                "{\"options\": [\"2 and 3\", \"3 and 4\", \"1 and 2\", \"2 and 4\"]}",
                "2 and 3", 25,
                "The alternating groups of 2 and 3 black keys provide the visual landmark to locate any note.", 1);
        exerciseRepository.save(e1);

        Exercise e2 = new Exercise(l1_2, "MULTIPLE_CHOICE",
                "Which white key sits immediately to the left of the group of two black keys?",
                "{\"options\": [\"C\", \"D\", \"E\", \"F\"]}",
                "C", 25,
                "The note C is always situated immediately to the left of any pair of two black keys.", 1);
        exerciseRepository.save(e2);

        Exercise e3 = new Exercise(l2_1, "MULTIPLE_CHOICE",
                "What musical note comes immediately after G in the musical alphabet?",
                "{\"options\": [\"A\", \"H\", \"F\", \"B\"]}",
                "A", 25,
                "The musical alphabet consists of letters A through G and then loops back to A.", 1);
        exerciseRepository.save(e3);

        Exercise e4 = new Exercise(l2_2, "KEYBOARD_PLAY",
                "Play Middle C (C4) on the virtual keyboard.",
                "{\"targetNote\": \"C4\", \"highlight\": true}",
                "C4", 30,
                "Middle C (C4) is the benchmark reference pitch in Western music notation.", 1);
        exerciseRepository.save(e4);

        Exercise e5 = new Exercise(l3_1, "MULTIPLE_CHOICE",
                "In standard piano finger numbering, which finger is designated as number 1?",
                "{\"options\": [\"Thumb\", \"Index finger\", \"Middle finger\", \"Pinky\"]}",
                "Thumb", 25,
                "In keyboard pedagogy, finger 1 is always the thumb, and finger 5 is the pinky.", 1);
        exerciseRepository.save(e5);

        Exercise e6 = new Exercise(l3_2, "INTERVAL_RECOGNITION",
                "Listen to the note played. Identify the pitch:",
                "{\"audioNote\": \"C4\", \"options\": [\"C4\", \"E4\", \"G4\", \"B4\"]}",
                "C4", 35,
                "That was Middle C (C4), vibrating at 261.63 Hz.", 1);
        exerciseRepository.save(e6);

        Exercise e7 = new Exercise(l3_3, "MULTIPLE_CHOICE",
                "How many keys are there on a standard full-size acoustic or digital piano?",
                "{\"options\": [\"88\", \"61\", \"76\", \"92\"]}",
                "88", 30,
                "Standard pianos feature 88 keys (52 white natural keys and 36 black accidental keys).", 1);
        exerciseRepository.save(e7);

        Exercise e8 = new Exercise(l3_3, "NOTE_IDENTIFICATION",
                "Which white key sits between the two black keys?",
                "{\"options\": [\"D\", \"C\", \"E\", \"G\"]}",
                "D", 35,
                "D is nestled right between the two black keys.", 2);
        exerciseRepository.save(e8);

        Exercise e9 = new Exercise(l3_3, "KEYBOARD_PLAY",
                "Play E4 on the keyboard to demonstrate note location.",
                "{\"targetNote\": \"E4\", \"highlight\": true}",
                "E4", 35,
                "E4 is directly to the right of the two black keys.", 3);
        exerciseRepository.save(e9);
    }

    private void seedIntermediateSkeleton(LearningTier tier) {
        LearningLevel l1 = new LearningLevel(tier, 1, "Level 1: Intermediate Theory", "Scales, intervals, key signatures, and rhythm notation.", 150);
        l1 = levelRepository.save(l1);
        Course c1 = new Course(l1, "Scales & Key Signatures", "Major scales (C, G, F) and whole/half step formulas.", 1);
        c1 = courseRepository.save(c1);
        Lesson les1 = new Lesson(c1, "The C Major Scale Formula", "W-W-H-W-W-W-H step intervals that build all major scales.", "THEORY", 15, 60, 1);
        lessonRepository.save(les1);

        LearningLevel l2 = new LearningLevel(tier, 2, "Level 2: Playing Techniques", "Finger independence, two-hand coordination, and triad chords.", 175);
        l2 = levelRepository.save(l2);
        Course c2 = new Course(l2, "Triads & Chord Basics", "Root position major and minor triads (C, F, G, Am).", 1);
        c2 = courseRepository.save(c2);
        Lesson les2 = new Lesson(c2, "Building Major & Minor Triads", "Root, 3rd, and 5th intervals that produce harmony.", "PRACTICAL", 20, 75, 1);
        lessonRepository.save(les2);

        LearningLevel l3 = new LearningLevel(tier, 3, "Level 3: Practical Application", "Playing simple song melodies with left-hand accompaniment.", 200);
        l3 = levelRepository.save(l3);
        Course c3 = new Course(l3, "Hands Together Coordination", "Combining melody and harmony smoothly.", 1);
        c3 = courseRepository.save(c3);
        Lesson les3 = new Lesson(c3, "Ode to Joy - Two Hand Performance", "Perform Beethoven's classic theme with LH bass notes.", "ASSESSMENT", 20, 100, 1);
        lessonRepository.save(les3);
    }

    private void seedProSkeleton(LearningTier tier) {
        LearningLevel l1 = new LearningLevel(tier, 1, "Level 1: Advanced Theory", "Seventh chords, modal scales, harmonic progressions (ii-V-I).", 200);
        l1 = levelRepository.save(l1);
        Course c1 = new Course(l1, "Harmonic Progression Mastery", "Circle of fifths and functional harmony.", 1);
        c1 = courseRepository.save(c1);
        Lesson les1 = new Lesson(c1, "The ii-V-I Progression in Major & Minor", "The cornerstone chord progression of Western harmony.", "THEORY", 20, 80, 1);
        lessonRepository.save(les1);

        LearningLevel l2 = new LearningLevel(tier, 2, "Level 2: Advanced Techniques", "Velocity control, arpeggios, pedaling, and phrasing.", 250);
        l2 = levelRepository.save(l2);
        Course c2 = new Course(l2, "Arpeggio & Velocity Drills", "Hanontype technical fluency and expressive touch.", 1);
        c2 = courseRepository.save(c2);
        Lesson les2 = new Lesson(c2, "Extended Arpeggio Transitions", "Fluid thumb-under cross motions across 3 octaves.", "PRACTICAL", 25, 90, 1);
        lessonRepository.save(les2);

        LearningLevel l3 = new LearningLevel(tier, 3, "Level 3: Performance Development", "Concert etudes and pro-level assessment.", 300);
        l3 = levelRepository.save(l3);
        Course c3 = new Course(l3, "Repertoire Performance", "Interpreting Romantic and Contemporary piano works.", 1);
        c3 = courseRepository.save(c3);
        Lesson les3 = new Lesson(c3, "Pro Repertoire Performance Evaluation", "Comprehensive performance evaluation.", "ASSESSMENT", 30, 150, 1);
        lessonRepository.save(les3);
    }

    private void seedExpertSkeleton(LearningTier tier) {
        LearningLevel l1 = new LearningLevel(tier, 1, "Level 1: Expert Theory & Composition", "Advanced counterpoint, voice leading, and structural analysis.", 300);
        l1 = levelRepository.save(l1);
        Course c1 = new Course(l1, "Polyphonic Analysis & Counterpoint", "Fugues, inventions, and voice independence.", 1);
        c1 = courseRepository.save(c1);
        Lesson les1 = new Lesson(c1, "Bach Inventions: Two-Part Voice Leading", "Analyzing subject, answer, and counter-subject.", "THEORY", 25, 100, 1);
        lessonRepository.save(les1);

        LearningLevel l2 = new LearningLevel(tier, 2, "Level 2: Mastery Repertoire", "Mastering virtuosic sonatas and concertos.", 350);
        l2 = levelRepository.save(l2);
        Course c2 = new Course(l2, "Virtuosic Concert Literature", "Chopin, Liszt, and Rachmaninoff performance practice.", 1);
        c2 = courseRepository.save(c2);
        Lesson les2 = new Lesson(c2, "Concert Sonata Interpretation", "Nuance, rubato, and polyphonic balance.", "PRACTICAL", 30, 120, 1);
        lessonRepository.save(les2);

        LearningLevel l3 = new LearningLevel(tier, 3, "Level 3: Expert Recital & Graduation", "Independent musical project, recording evaluation, and master certification.", 500);
        l3 = levelRepository.save(l3);
        Course c3 = new Course(l3, "Capstone Recital", "Complete autonomous performance portfolio.", 1);
        c3 = courseRepository.save(c3);
        Lesson les3 = new Lesson(c3, "Final Capstone Recital Assessment", "The culminating evaluation of instrument mastery.", "ASSESSMENT", 45, 250, 1);
        lessonRepository.save(les3);
    }
}
