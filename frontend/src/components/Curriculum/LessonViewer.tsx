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
import { MarkdownContent } from '../ui/MarkdownContent';
import { cn } from '../../utils/cn';
import {
  SoundActionDiagram,
  PostureAndHandLab,
  KeyboardExplorerGame,
  NotationTheoryLab,
} from '../Labs';
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
  Hammer,
  Layers,
  Target,
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
  const [workspaceMode, setWorkspaceMode] = useState<'LAB' | 'PIANO'>('LAB');

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
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-800/80 w-full min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-none"
        >
          <ArrowLeft size={16} className="shrink-0" />
          <span className="truncate">Back to Learning Roadmap</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0 max-w-full">
        {/* Left Column: Lesson Educational Content & Interactive Exercises */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6 w-full min-w-0 max-w-full">
          {/* Theory & Instruction Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl w-full min-w-0 max-w-full break-words overflow-hidden">
            <div className="pb-4 sm:pb-5 border-b border-slate-800 mb-5 sm:mb-6 w-full min-w-0">
              <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-indigo-400 block truncate">
                Tier 1: Basics • Step {lesson.orderIndex}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight break-words">
                {lesson.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed break-words">
                {lesson.description}
              </p>
            </div>

            {/* Learning Objectives Box */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mb-5 sm:mb-6 w-full min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                <ListChecks size={16} className="text-indigo-400 shrink-0" />
                <span>Lesson Learning Objectives</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="break-words leading-snug">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Theory Prose with Full Markdown Support */}
            <MarkdownContent content={lesson.theoryContent} className="mb-6 sm:mb-8" />

            {/* Integrated Pedagogical Lab & Interactive Keyboard Workspace */}
            {(() => {
              const titleLower = lesson.title.toLowerCase();
              const isPostureLesson = titleLower.includes('posture') || titleLower.includes('finger');
              const isKeyboardExplorerLesson =
                titleLower.includes('pattern') ||
                titleLower.includes('white keys') ||
                titleLower.includes('middle c') ||
                titleLower.includes('geography');
              const isNotationLesson =
                titleLower.includes('alphabet') ||
                titleLower.includes('notation') ||
                titleLower.includes('staff');
              const isPhysicsLesson =
                titleLower.includes('anatomy') ||
                titleLower.includes('action') ||
                titleLower.includes('sound');

              const hasPedagogicalLab =
                isPostureLesson || isKeyboardExplorerLesson || isNotationLesson || isPhysicsLesson;

              const shouldShowWorkspace =
                hasPedagogicalLab ||
                lesson.lessonType === 'PRACTICAL' ||
                lesson.lessonType === 'LISTENING' ||
                lesson.lessonType === 'ASSESSMENT';

              if (!shouldShowWorkspace) return null;

              return (
                <div className="my-6 sm:my-8 pt-5 sm:pt-6 border-t border-slate-800 w-full min-w-0 max-w-full overflow-hidden space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400 shrink-0" />
                        <span>Interactive Educational Lab &amp; Workspace</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hands-on laboratory activities integrated into this lesson
                      </p>
                    </div>

                    {hasPedagogicalLab && (
                      <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setWorkspaceMode('LAB')}
                          className={cn(
                            'rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                            workspaceMode === 'LAB'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          <Compass size={13} />
                          Pedagogical Lab
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkspaceMode('PIANO')}
                          className={cn(
                            'rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                            workspaceMode === 'PIANO'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          <BookOpen size={13} />
                          Free Keyboard
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render Dedicated Pedagogical Lab or Virtual Piano Workspace */}
                  {hasPedagogicalLab && workspaceMode === 'LAB' ? (
                    <div className="w-full max-w-full overflow-hidden animate-in fade-in duration-200">
                      {isPostureLesson && (
                        <PostureAndHandLab
                          onLabComplete={() => {
                            awardLocalXp(50);
                            setCompleted(true);
                          }}
                        />
                      )}
                      {isKeyboardExplorerLesson && (
                        <KeyboardExplorerGame
                          onGameComplete={(score) => {
                            awardLocalXp(50);
                          }}
                        />
                      )}
                      {isNotationLesson && (
                        <NotationTheoryLab
                          onLabComplete={() => {
                            awardLocalXp(50);
                            setCompleted(true);
                          }}
                        />
                      )}
                      {isPhysicsLesson && (
                        <SoundActionDiagram
                          compactMode
                          onLabComplete={() => {
                            awardLocalXp(50);
                            setCompleted(true);
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full max-w-full overflow-x-auto">
                      <VirtualPiano
                        highlightedNote={questionMeta.targetNote || (lesson.title.includes('C4') ? 'C4' : null)}
                        onNotePlayed={handleVirtualPianoNote}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Interactive Exercises Stepper */}
            {exercises.length > 0 && (
              <div className="pt-5 sm:pt-6 border-t border-slate-800 w-full min-w-0">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                      <HelpCircle size={18} className="text-amber-400 shrink-0" />
                      <span className="truncate">Knowledge Check ({exercises.length})</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                      Verify your understanding to earn XP
                    </p>
                  </div>
                  <Badge variant="indigo" size="sm" className="shrink-0">
                    {currentExerciseIndex + 1} of {exercises.length}
                  </Badge>
                </div>

                {currentExercise && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mb-4 w-full min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-100 mb-4 break-words">
                      {currentExercise.prompt}
                    </p>

                    {/* Audio demonstration button */}
                    {questionMeta.audioNote && (
                      <button
                        onClick={playExerciseAudio}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/30 mb-4 transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} className="shrink-0" />
                        <span>Play Reference Audio Tone</span>
                      </button>
                    )}

                    {/* Multiple Choice Options */}
                    {questionMeta.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full min-w-0">
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
                              className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left flex items-center justify-between gap-2 cursor-pointer break-words ${btnStyle}`}
                            >
                              <span className="break-words">{opt}</span>
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
                      <div className="text-xs text-amber-300 bg-amber-400/10 p-3 sm:p-3.5 rounded-xl border border-amber-400/20 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400 shrink-0" />
                        <span className="break-words">Play the required note on the virtual keyboard above to submit!</span>
                      </div>
                    )}

                    {/* Evaluation Feedback */}
                    {evaluationResults[currentExercise.id] && (
                      <div
                        className={`mt-4 p-3 sm:p-3.5 rounded-xl text-xs ${
                          evaluationResults[currentExercise.id].correct
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-600/40'
                        }`}
                      >
                        <p className="font-bold">
                          {evaluationResults[currentExercise.id].correct ? '✓ Correct Answer!' : '✗ Not quite.'}
                        </p>
                        <p className="mt-1 opacity-90 break-words">{evaluationResults[currentExercise.id].explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stepper Navigation */}
                {exercises.length > 1 && (
                  <div className="flex items-center justify-between pt-2 w-full min-w-0">
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
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Lesson Sidebar & Navigation Outline */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:sticky lg:top-20 w-full min-w-0 max-w-full">
          {/* Action Card: Complete Lesson */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 w-full min-w-0">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Lesson Status
              </span>
              <h4 className="text-base font-bold text-white mt-0.5 truncate">
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
              className="w-full font-bold justify-center"
              disabled={isSubmitting || completed}
              loading={isSubmitting}
              icon={<CheckCircle2 size={18} />}
              onClick={handleCompleteLesson}
            >
              {completed ? 'Completed' : 'Mark as Complete (+XP)'}
            </Button>
          </div>

          {/* Lesson Metadata Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-3 text-xs w-full min-w-0">
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
