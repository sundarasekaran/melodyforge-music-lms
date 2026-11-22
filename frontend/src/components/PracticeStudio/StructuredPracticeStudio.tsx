import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  Music,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  Volume2,
  Mic,
  Activity,
  Layers,
  TrendingUp,
  Hand,
  Check,
  AlertCircle,
} from 'lucide-react';
import { ConservatoryMetronome } from '../Metronome/ConservatoryMetronome';
import { VirtualPiano88 } from '../VirtualPiano/VirtualPiano88';
import { audioEngine } from '../../audio/AudioEngine';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PracticeSession, PracticeStats, PianoKeyData } from '../../types';
import {
  PRACTICE_ROUTINES,
  PRACTICE_CATEGORIES,
  PracticeRoutineDefinition,
  PracticeCategory,
} from '../../data/pianoPracticeRoutines';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { cn } from '../../utils/cn';

export const StructuredPracticeStudio: React.FC = () => {
  const { user, awardLocalXp, refreshUser } = useAuth();

  // Active Category Filter & Selected Routine
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRoutine, setActiveRoutine] = useState<PracticeRoutineDefinition>(PRACTICE_ROUTINES[0]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  // Active Session State Machine
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [sessionPaused, setSessionPaused] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Note Interaction & Step Progress
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStepHits, setCurrentStepHits] = useState<number>(0);
  const [stepNoteIndex, setStepNoteIndex] = useState<number>(0);

  // Direct Audio Recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Journal & History
  const [journalNotes, setJournalNotes] = useState<string>('');
  const [sessionsHistory, setSessionsHistory] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState<PracticeStats | null>(null);

  // Modals & Feedback
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completedSessionData, setCompletedSessionData] = useState<PracticeSession | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Metronome Synchronization
  const [metronomeBpm, setMetronomeBpm] = useState<number>(PRACTICE_ROUTINES[0].recommendedBpm);
  const [metronomeTimeSig, setMetronomeTimeSig] = useState<'4/4' | '3/4'>(PRACTICE_ROUTINES[0].timeSignature);

  // Fetch session history & stats from Spring Boot backend
  const loadHistoryAndStats = async () => {
    try {
      const [history, statsData] = await Promise.all([
        api.getPracticeSessions(),
        api.getPracticeStats().catch(() => null),
      ]);
      setSessionsHistory(history);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.warn('Could not load practice history:', err);
    }
  };

  useEffect(() => {
    loadHistoryAndStats();
  }, []);

  // Sync metronome settings when active routine changes
  useEffect(() => {
    setMetronomeBpm(activeRoutine.recommendedBpm);
    setMetronomeTimeSig(activeRoutine.timeSignature);
    setCurrentExerciseIndex(0);
    setCompletedSteps([]);
    setCurrentStepHits(0);
    setStepNoteIndex(0);
  }, [activeRoutine]);

  // Session elapsed timer
  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, sessionPaused]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Current exercise
  const currentExercise = activeRoutine.exercises[currentExerciseIndex] || activeRoutine.exercises[0];

  // Start Structured Routine Session
  const handleStartSession = async () => {
    try {
      audioEngine.unlockSync();
      const session = await api.startPracticeRoutine({
        instrumentSlug: 'piano',
        routineId: activeRoutine.id,
        routineTitle: activeRoutine.title,
        targetBpm: activeRoutine.recommendedBpm,
        timeSignature: activeRoutine.timeSignature,
        totalExercises: activeRoutine.exercises.length,
      });

      setSessionId(session.id);
      setSessionActive(true);
      setSessionPaused(false);
      setElapsedSeconds(0);
      setCompletedSteps([]);
      setCurrentStepHits(0);
      setStepNoteIndex(0);
    } catch (err) {
      console.error('Failed to start practice routine session:', err);
      // Fallback local start
      setSessionActive(true);
      setSessionPaused(false);
      setElapsedSeconds(0);
    }
  };

  // Handle note played on virtual piano
  const handleNotePlay = (key: PianoKeyData) => {
    if (!sessionActive || sessionPaused) return;
    const midi = key.midi;

    if (currentExercise.mode === 'sequence') {
      const expectedMidi = currentExercise.targetMidi[stepNoteIndex];
      if (midi === expectedMidi) {
        const nextIndex = stepNoteIndex + 1;
        setStepNoteIndex(nextIndex);
        setCurrentStepHits((h) => h + 1);

        if (nextIndex >= currentExercise.targetMidi.length) {
          // Finished this sequence exercise!
          markExerciseComplete(currentExerciseIndex);
        }
      }
    } else if (currentExercise.mode === 'chord') {
      if (currentExercise.targetMidi.includes(midi)) {
        setCurrentStepHits((h) => h + 1);
        // If student struck at least 3 correct chord keys
        if (currentStepHits + 1 >= currentExercise.targetMidi.length) {
          markExerciseComplete(currentExerciseIndex);
        }
      }
    } else {
      // Free or walk mode
      setCurrentStepHits((h) => h + 1);
      if (currentStepHits + 1 >= 8) {
        markExerciseComplete(currentExerciseIndex);
      }
    }
  };

  // Mark exercise completed
  const markExerciseComplete = async (exerciseIdx: number) => {
    if (!completedSteps.includes(exerciseIdx)) {
      const updated = [...completedSteps, exerciseIdx];
      setCompletedSteps(updated);

      // Play soft harmonic reward chord
      audioEngine.playChord([60, 64, 67, 72], 0.4);

      // Sync progress to backend
      if (sessionId) {
        try {
          await api.updatePracticeRoutineProgress(sessionId, {
            durationSeconds: elapsedSeconds,
            completedExercises: updated.length,
            notes: journalNotes,
          });
        } catch (e) {
          console.warn('Could not sync interim progress:', e);
        }
      }

      // If next exercise exists, auto advance after brief delay
      if (exerciseIdx + 1 < activeRoutine.exercises.length) {
        setTimeout(() => {
          setCurrentExerciseIndex(exerciseIdx + 1);
          setStepNoteIndex(0);
          setCurrentStepHits(0);
        }, 600);
      }
    }
  };

  // Complete entire routine session
  const handleCompleteSession = async () => {
    setIsSaving(true);
    try {
      const finalCompleted = Math.max(completedSteps.length, 1);
      const finalDuration = Math.max(elapsedSeconds, 30);

      let savedSession: PracticeSession;
      if (sessionId) {
        savedSession = await api.completePracticeRoutine(sessionId, {
          durationSeconds: finalDuration,
          completedExercises: finalCompleted,
          notes: journalNotes || `Completed ${activeRoutine.title}`,
          audioRecordingUrl: recordedAudioUrl || undefined,
        });
      } else {
        savedSession = await api.logPractice(
          'piano',
          finalDuration,
          journalNotes || `Completed ${activeRoutine.title}`,
          recordedAudioUrl || undefined
        );
      }

      setCompletedSessionData(savedSession);
      setShowCompletionModal(true);

      // Update local state and streak/XP
      if (savedSession.xpEarned) {
        awardLocalXp(savedSession.xpEarned);
      }
      refreshUser();

      // Clean up session
      setSessionActive(false);
      setSessionPaused(false);
      setSessionId(null);
      setElapsedSeconds(0);
      setJournalNotes('');
      setRecordedAudioUrl(null);
      loadHistoryAndStats();
    } catch (err) {
      console.error('Failed to complete practice session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Play audio reference demo of current exercise
  const handlePlayDemo = () => {
    if (currentExercise.mode === 'chord') {
      audioEngine.playChord(currentExercise.targetMidi, 1.2);
    } else {
      const intervalMs = Math.round((60 / currentExercise.recommendedBpm) * 750);
      audioEngine.playSequence(currentExercise.targetMidi, intervalMs);
    }
  };

  // Audio recording controls
  const handleStartRecording = () => {
    const started = audioEngine.startRecording();
    if (started) {
      setIsRecording(true);
      setRecordedAudioUrl(null);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    try {
      const url = await audioEngine.stopRecording();
      setRecordedAudioUrl(url);
    } catch (e) {
      console.error('Failed to capture audio:', e);
    } finally {
      setIsRecording(false);
    }
  };

  // Filtered routines
  const filteredRoutines =
    selectedCategory === 'all'
      ? PRACTICE_ROUTINES
      : PRACTICE_ROUTINES.filter((r) => r.category === selectedCategory);

  // Highlighted keys on virtual piano
  const currentTargetMidi = currentExercise.mode === 'sequence'
    ? [currentExercise.targetMidi[stepNoteIndex] ?? currentExercise.targetMidi[0]]
    : currentExercise.targetMidi;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Practice Summary Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Conservatory Workout Room
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Structured Piano Practice Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Train rhythm, finger dexterity, scale transitions, and classical repertoire with a sample-accurate
            conservatory metronome and server-validated progress tracking.
          </p>
        </div>

        {/* Global Practice Metric Counters */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500">Practice Logged</span>
            <div className="font-mono text-lg font-black text-amber-400">
              {stats ? Math.round(stats.totalPracticeSeconds / 60) : 0} min
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500">Streak</span>
            <div className="flex items-center justify-end gap-1 font-mono text-lg font-black text-emerald-400">
              <Flame className="h-4 w-4 fill-current" />
              <span>{user?.currentStreakDays ?? 1}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Category Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Select Practice Routine
          </h2>
          <span className="text-xs text-slate-500">5 Structured Routines</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            All Routines ({PRACTICE_ROUTINES.length})
          </button>
          {PRACTICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer',
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Routine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map((routine) => {
            const isSelected = activeRoutine.id === routine.id;
            return (
              <div
                key={routine.id}
                onClick={() => {
                  if (!sessionActive) setActiveRoutine(routine);
                }}
                className={cn(
                  'rounded-3xl border p-5 transition-all cursor-pointer flex flex-col justify-between',
                  isSelected
                    ? 'border-amber-400/80 bg-slate-900 shadow-xl shadow-amber-400/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      {routine.categoryLabel}
                    </span>
                    <Badge variant={routine.difficulty === 'Absolute Beginner' ? 'outline' : 'gold'} size="sm">
                      {routine.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-base font-extrabold text-white">{routine.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{routine.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3 font-mono">
                    <span>{routine.recommendedBpm} BPM</span>
                    <span>·</span>
                    <span>{routine.timeSignature}</span>
                    <span>·</span>
                    <span>~{routine.estimatedMinutes}m</span>
                  </div>

                  <span className="font-bold text-amber-400">+{routine.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Practice Workspace: Metronome (Left) & Active Workout / Exercise Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Conservatory Metronome */}
        <div className="lg:col-span-5 space-y-6">
          <ConservatoryMetronome
            initialBpm={metronomeBpm}
            initialTimeSignature={metronomeTimeSig}
            onBpmChange={(b) => setMetronomeBpm(b)}
            onTimeSignatureChange={(sig) => setMetronomeTimeSig(sig)}
          />

          {/* Direct Audio Recording Studio Console */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pure Web Audio Synthesis Recorder
                </h4>
              </div>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  Recording
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Captures direct synthesiser audio output without microphone room noise or echo.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Mic className="h-4 w-4" />
                  Record Audio
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-500 bg-rose-950/40 text-rose-300 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Square className="h-4 w-4" />
                  Stop Recording
                </button>
              )}

              {recordedAudioUrl && (
                <div className="flex items-center gap-2">
                  <audio controls src={recordedAudioUrl} className="h-8 w-48 rounded-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Exercise Runner */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 space-y-6 shadow-2xl">
          {/* Header of Active Routine */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Active Routine
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">{activeRoutine.categoryLabel}</span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">
                {activeRoutine.title}
              </h2>
            </div>

            {/* Session Timer & Action Button */}
            <div className="flex items-center gap-3">
              {sessionActive ? (
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="font-mono text-lg font-black text-white">
                    {formatTime(elapsedSeconds)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSessionPaused(!sessionPaused)}
                    className="text-xs font-bold text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    {sessionPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>
              ) : (
                <Button
                  variant="amber"
                  size="md"
                  icon={<Play className="h-4 w-4 fill-current" />}
                  onClick={handleStartSession}
                >
                  Start Practice Routine
                </Button>
              )}
            </div>
          </div>

          {/* Exercise Step Navigator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-200">
                Exercise {currentExerciseIndex + 1} of {activeRoutine.exercises.length}: {currentExercise.title}
              </span>
              <span className="font-mono">
                {completedSteps.length} / {activeRoutine.exercises.length} Completed
              </span>
            </div>

            {/* Step Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-300"
                style={{
                  width: `${(completedSteps.length / activeRoutine.exercises.length) * 100}%`,
                }}
              />
            </div>

            {/* Exercise Instruction Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Instruction
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlayDemo}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Hear Audio Demo
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base font-semibold text-white">
                {currentExercise.instruction}
              </p>

              {/* Target Notes & Fingering Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-500 font-semibold mr-1">Target Notes:</span>
                {currentExercise.targetNotes.map((note, idx) => {
                  const isCurrentTarget =
                    currentExercise.mode === 'sequence' && stepNoteIndex === idx;
                  const isPast =
                    currentExercise.mode === 'sequence' && stepNoteIndex > idx;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-all',
                        isCurrentTarget
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300 scale-105'
                          : isPast
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-900 text-slate-300'
                      )}
                    >
                      <span>{note}</span>
                      {currentExercise.fingeringsRH[idx] && (
                        <span className="text-[10px] text-slate-400 font-sans">
                          (F{currentExercise.fingeringsRH[idx]})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pedagogical Hint */}
              <div className="flex items-start gap-2 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> {currentExercise.hint}
                </span>
              </div>
            </div>

            {/* Exercise Step Navigation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (currentExerciseIndex > 0) {
                    setCurrentExerciseIndex(currentExerciseIndex - 1);
                    setStepNoteIndex(0);
                    setCurrentStepHits(0);
                  }
                }}
                disabled={currentExerciseIndex === 0}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Exercise
              </button>

              <div className="flex items-center gap-2">
                {currentExerciseIndex + 1 < activeRoutine.exercises.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      markExerciseComplete(currentExerciseIndex);
                      setCurrentExerciseIndex(currentExerciseIndex + 1);
                      setStepNoteIndex(0);
                      setCurrentStepHits(0);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Next Exercise
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteSession}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 fill-current" />
                    Complete Practice Routine (+XP)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reflection Journal Form */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              Practice Session Journal & Self-Review Notes
            </label>
            <textarea
              value={journalNotes}
              onChange={(e) => setJournalNotes(e.target.value)}
              placeholder="Record your tempo stability, hand relaxation, or specific challenges encountered during this routine..."
              className="w-full h-20 bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Embedded Virtual Piano for Active Practice */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Interactive Practice Keyboard (Target Keys Illuminated)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Play via touch, mouse, or computer keyboard (A–L, W, E, T, Y, U)
          </span>
        </div>

        <VirtualPiano88
          viewMode="compact"
          targetMidi={currentTargetMidi}
          highlightedMidi={currentExercise.targetMidi}
          onNotePlay={handleNotePlay}
          defaultLabels="all"
        />
      </div>

      {/* Practice Journal History */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Practice History Journal ({sessionsHistory.length} Sessions)
            </h3>
          </div>
        </div>

        {sessionsHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No practice sessions recorded yet. Start a structured routine above to build your journal!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Routine / Drill</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Journal Notes</th>
                  <th className="py-3 px-4 text-right">XP Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessionsHistory.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {new Date(sess.practicedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">
                        {sess.routineTitle || 'General Piano Practice'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                      {Math.round((sess.durationSeconds || 60) / 60)} min ({sess.durationSeconds || 60}s)
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">
                      "{sess.notes || 'Keyboard fluency & timing practice'}"
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="gold" size="sm">
                        +{sess.xpEarned} XP
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && completedSessionData && (
        <Modal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          title="Routine Session Completed!"
          description="Congratulations! Your practice session has been validated and recorded on your conservatory record."
          maxWidth="md"
          footer={
            <Button variant="primary" size="md" onClick={() => setShowCompletionModal(false)}>
              Awesome, Return to Studio
            </Button>
          }
        >
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <Award className="h-12 w-12 text-amber-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-lg font-bold text-white">{activeRoutine.title}</h4>
                <div className="mt-2 flex items-center justify-center gap-4 text-sm font-mono">
                  <span className="text-emerald-400 font-bold">
                    +{completedSessionData.xpEarned} XP Earned
                  </span>
                  <span>·</span>
                  <span className="text-slate-300">
                    {Math.round(completedSessionData.durationSeconds / 60)} min Duration
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Your practice streak has been updated, and achievements have been evaluated server-side.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
