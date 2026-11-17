import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Lesson, Exercise } from '../../types';
import { VirtualPiano } from '../VirtualPiano/VirtualPiano';
import { audioEngine } from '../../audio/AudioEngine';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Volume2,
  BookOpen,
  Award,
  ChevronRight,
  ChevronLeft,
  Clock,
  ListChecks,
  Compass,
} from 'lucide-react';

interface LessonViewerProps {
  lessonId: number;
  onBack: () => void;
  onLessonCompleted: () => void;
  onNavigateLesson?: (lessonId: number) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonId,
  onBack,
  onLessonCompleted,
  onNavigateLesson,
}) => {
  const { user, awardLocalXp, refreshUser } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Exercise states
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [evaluationResults, setEvaluationResults] = useState<Record<number, { correct: boolean; explanation: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const data = await api.getLesson(lessonId);
        setLesson(data.lesson);
        setCompleted(data.completed);
        setExercises(data.lesson.exercises || []);
        setCurrentExerciseIndex(0);
        setUserAnswers({});
        setEvaluationResults({});
      } catch (e) {
        console.error('Failed to load lesson', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const currentExercise = exercises[currentExerciseIndex];

  // Parse exercise question data
  const questionMeta = currentExercise?.questionData
    ? JSON.parse(currentExercise.questionData)
    : {};

  // Audio trigger
  const playExerciseAudio = async () => {
    if (questionMeta.audioNote) {
      await audioEngine.playNote(questionMeta.audioNote, 1.2);
    }
  };

  // Keyboard note play trigger
  const handleVirtualPianoNote = (note: string) => {
    if (currentExercise && currentExercise.exerciseType === 'KEYBOARD_PLAY') {
      submitExerciseAnswer(currentExercise.id, note);
    }
  };

  // Submit answer
  const submitExerciseAnswer = async (exerciseId: number, answer: string) => {
    if (evaluationResults[exerciseId]) return;
    setUserAnswers((prev) => ({ ...prev, [exerciseId]: answer }));

    try {
      const res = await api.evaluateExercise(exerciseId, answer);
      setEvaluationResults((prev) => ({
        ...prev,
        [exerciseId]: {
          correct: res.correct,
          explanation: res.explanation,
        },
      }));

      if (res.correct) {
        awardLocalXp(res.pointsAwarded || 25);
      }
    } catch (e) {
      console.warn('Exercise evaluation offline fallback', e);
      const isCorrect = answer.toLowerCase().trim() === currentExercise.expectedAnswer.toLowerCase().trim();
      setEvaluationResults((prev) => ({
        ...prev,
        [exerciseId]: {
          correct: isCorrect,
          explanation: currentExercise.explanation,
        },
      }));
    }
  };

  // Complete lesson
  const handleCompleteLesson = async () => {
    setIsSubmitting(true);
    try {
      const result = await api.completeLesson(lessonId, 100);
      setCompleted(true);
      setXpEarned(result.xpAwarded || lesson?.xpReward || 50);
      setShowCelebration(true);
      awardLocalXp(result.xpAwarded || lesson?.xpReward || 50);
      refreshUser();
      onLessonCompleted();
    } catch (e) {
      console.error('Error completing lesson', e);
      setCompleted(true);
      setShowCelebration(true);
      onLessonCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Objectives checklist based on lesson title
  const getObjectives = (title: string): string[] => {
    if (title.includes('Anatomy')) {
      return [
        'Understand the physical 88-key piano keyboard layout',
        'Recognize alternating clusters of 2 and 3 black keys',
        'Locate Middle C (C4) using visual black key landmarks',
      ];
    }
    if (title.includes('Alphabet') || title.includes('Notes')) {
      return [
        'Learn the 7 letters of the musical alphabet (A through G)',
        'Understand how octaves repeat in cycles',
        'Associate letter names with keyboard keys',
      ];
    }
    if (title.includes('Middle C') || title.includes('Finding')) {
      return [
        'Identify C4 vibrating at 261.63 Hz',
        'Locate Middle C relative to treble and bass staff',
        'Perform C4 on the virtual keyboard',
      ];
    }
    if (title.includes('Finger') || title.includes('Numbering')) {
      return [
        'Master the 1-to-5 pianist finger numbering system',
        'Establish relaxed, curved hand posture',
        'Play the 5-finger pattern from C4 to G4',
      ];
    }
    return [
      'Master core theoretical fundamentals for this lesson',
      'Demonstrate practical recognition on the keyboard',
      'Pass the interactive exercise knowledge check',
    ];
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading lesson materials...</span>
        </div>
      </div>
    );
  }

  const objectives = getObjectives(lesson.title);
  const exerciseProgress = exercises.length > 0 ? (Object.keys(evaluationResults).length / exercises.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Learning Roadmap</span>
        </button>

        <div className="flex items-center gap-3">
          <Badge variant="indigo" size="sm">
            {lesson.lessonType}
          </Badge>
          <Badge variant="gold" size="sm">
            +{lesson.xpReward} XP
          </Badge>
          {completed && (
            <Badge variant="emerald" size="sm" dot>
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Educational Content & Interactive Exercises */}
        <div className="lg:col-span-8 space-y-6">
          {/* Theory & Instruction Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="pb-5 border-b border-slate-800 mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                Tier 1: Basics • Step {lesson.orderIndex}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                {lesson.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Learning Objectives Box */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                <ListChecks size={16} className="text-indigo-400" />
                Lesson Learning Objectives
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Theory Prose */}
            <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
              {lesson.theoryContent.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-lg sm:text-xl font-bold text-indigo-300 mt-6 mb-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>

            {/* Embedded Keyboard for Practical and Listening Lessons */}
            {(lesson.lessonType === 'PRACTICAL' || lesson.lessonType === 'LISTENING' || lesson.lessonType === 'ASSESSMENT') && (
              <div className="my-8 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    Interactive Keyboard Workspace
                  </h3>
                  <span className="text-[11px] text-slate-400">Play keys to test live audio & staff response</span>
                </div>
                <VirtualPiano
                  highlightedNote={questionMeta.targetNote || (lesson.title.includes('C4') ? 'C4' : null)}
                  onNotePlayed={handleVirtualPianoNote}
                />
              </div>
            )}

            {/* Interactive Exercises Stepper */}
            {exercises.length > 0 && (
              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle size={18} className="text-amber-400" />
                      Knowledge Check Exercises ({exercises.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Answer the prompts to verify your understanding and earn exercise XP
                    </p>
                  </div>
                  <Badge variant="indigo" size="sm">
                    {currentExerciseIndex + 1} of {exercises.length}
                  </Badge>
                </div>

                {currentExercise && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-4">
                    <p className="text-sm font-bold text-slate-100 mb-4">
                      {currentExercise.prompt}
                    </p>

                    {/* Audio demonstration button */}
                    {questionMeta.audioNote && (
                      <button
                        onClick={playExerciseAudio}
                        className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/30 mb-4 transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                        <span>Play Reference Audio Tone</span>
                      </button>
                    )}

                    {/* Multiple Choice Options */}
                    {questionMeta.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {questionMeta.options.map((opt: string) => {
                          const isSelected = userAnswers[currentExercise.id] === opt;
                          const evalRes = evaluationResults[currentExercise.id];

                          let btnStyle = 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800';
                          if (evalRes) {
                            if (opt === currentExercise.expectedAnswer) {
                              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10';
                            } else if (isSelected && !evalRes.correct) {
                              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                            }
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => submitExerciseAnswer(currentExercise.id, opt)}
                              disabled={!!evalRes}
                              className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {evalRes && opt === currentExercise.expectedAnswer && (
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Keyboard play cue */}
                    {currentExercise.exerciseType === 'KEYBOARD_PLAY' && (
                      <div className="text-xs text-amber-300 bg-amber-400/10 p-3.5 rounded-xl border border-amber-400/20 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400 shrink-0" />
                        <span>Play the required note on the virtual keyboard above to submit!</span>
                      </div>
                    )}

                    {/* Evaluation Feedback */}
                    {evaluationResults[currentExercise.id] && (
                      <div
                        className={`mt-4 p-3.5 rounded-xl text-xs ${
                          evaluationResults[currentExercise.id].correct
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-600/40'
                        }`}
                      >
                        <p className="font-bold">
                          {evaluationResults[currentExercise.id].correct ? '✓ Correct Answer!' : '✗ Not quite.'}
                        </p>
                        <p className="mt-1 opacity-90">{evaluationResults[currentExercise.id].explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stepper Navigation */}
                {exercises.length > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentExerciseIndex === 0}
                      onClick={() => setCurrentExerciseIndex((i) => Math.max(0, i - 1))}
                      icon={<ChevronLeft size={16} />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentExerciseIndex === exercises.length - 1}
                      onClick={() => setCurrentExerciseIndex((i) => Math.min(exercises.length - 1, i + 1))}
                      icon={<ChevronRight size={16} />}
                      iconPosition="right"
                    >
                      Next Exercise
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Lesson Sidebar & Navigation Outline */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Action Card: Complete Lesson */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Lesson Status
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {completed ? 'Lesson Completed' : 'In Progress'}
              </h4>
            </div>

            <ProgressBar
              value={completed ? 100 : exerciseProgress}
              label="Lesson Progress"
              showPercent
              color={completed ? 'emerald' : 'gold'}
            />

            <Button
              variant={completed ? 'secondary' : 'amber'}
              size="lg"
              className="w-full font-bold"
              disabled={isSubmitting || completed}
              loading={isSubmitting}
              icon={<CheckCircle2 size={18} />}
              onClick={handleCompleteLesson}
            >
              {completed ? 'Completed' : 'Mark as Complete (+XP)'}
            </Button>
          </div>

          {/* Lesson Metadata Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 text-xs">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Module Details
            </h4>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Duration:</span>
              <span className="font-semibold">{lesson.durationMinutes} minutes</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Reward:</span>
              <span className="font-bold text-amber-400">+{lesson.xpReward} XP</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Lesson Type:</span>
              <span className="font-semibold text-indigo-400 uppercase">{lesson.lessonType}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Interactive Tasks:</span>
              <span className="font-semibold">{exercises.length} Exercises</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level-Up / Completion Celebration Modal */}
      {showCelebration && (
        <Modal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            onBack();
          }}
          title="Lesson Mastered! 🎉"
          maxWidth="sm"
          footer={
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => {
                setShowCelebration(false);
                onBack();
              }}
            >
              Continue Learning Roadmap →
            </Button>
          }
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/20">
              ⭐
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                You have completed <strong className="text-white">"{lesson.title}"</strong>.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">XP Awarded</span>
                <p className="text-xl font-extrabold text-amber-400">+{xpEarned}</p>
              </div>
              <div className="border-r border-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Current Level</span>
                <p className="text-xl font-extrabold text-indigo-400">Level {user?.currentLevel || 2}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
