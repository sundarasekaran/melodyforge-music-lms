import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Target,
  RotateCcw,
  Sparkles,
  Award,
  HelpCircle,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { VirtualPiano88 } from '../VirtualPiano/VirtualPiano88';
import { PianoKeyData } from '../../types';
import { audioEngine } from '../../audio/AudioEngine';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ExplorerChallenge, EXPLORER_CHALLENGES } from '../../data/labsData';

export interface KeyboardExplorerGameProps {
  onGameComplete?: (score: number) => void;
  showBack?: boolean;
  onBack?: () => void;
  filterLevel?: 1 | 2;
}

export const KeyboardExplorerGame: React.FC<KeyboardExplorerGameProps> = ({
  onGameComplete,
  showBack,
  onBack,
  filterLevel,
}) => {
  const [levelFilter, setLevelFilter] = useState<1 | 2 | 'all'>(filterLevel || 'all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    message: string;
  }>({
    status: 'idle',
    message: 'Press the requested landmark key on the keyboard below.',
  });
  const [matchedMidi, setMatchedMidi] = useState<number[]>([]);
  const [errorMidi, setErrorMidi] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const activeChallenges =
    levelFilter === 'all'
      ? EXPLORER_CHALLENGES
      : EXPLORER_CHALLENGES.filter((c) => c.level === levelFilter);

  const current = activeChallenges[currentIndex] || activeChallenges[0];
  const revealTarget = misses >= 2;

  const handleKeyPress = (key: PianoKeyData) => {
    if (completed) return;

    audioEngine.unlockSync();
    void audioEngine.playNote(key.note, 0.8);

    const targetPitchClass = current.targetMidi % 12;
    const isHit = current.allowAnyOctave
      ? key.midi % 12 === targetPitchClass
      : key.midi === current.targetMidi;

    if (isHit) {
      setMatchedMidi([key.midi]);
      setErrorMidi([]);
      const nextScore = score + 1;
      setScore(nextScore);
      setFeedback({
        status: 'correct',
        message: `Spot on! You found ${key.note}${key.enharmonic ? ` (${key.enharmonic}${key.octave})` : ''}!`,
      });

      setTimeout(() => {
        setMatchedMidi([]);
        if (currentIndex + 1 >= activeChallenges.length) {
          setCompleted(true);
          if (onGameComplete) {
            onGameComplete(nextScore);
          }
        } else {
          setCurrentIndex((i) => i + 1);
          setMisses(0);
          setFeedback({
            status: 'idle',
            message: 'Press the requested landmark key on the keyboard below.',
          });
        }
      }, 900);
    } else {
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      setErrorMidi([key.midi]);
      setTimeout(() => setErrorMidi([]), 450);

      setFeedback({
        status: 'wrong',
        message:
          nextMisses >= 2
            ? `You played ${key.note}. We highlighted the target key in gold on the keyboard—strike it to continue!`
            : `You played ${key.note}. Landmark Hint: ${current.hint}`,
      });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setMisses(0);
    setScore(0);
    setCompleted(false);
    setMatchedMidi([]);
    setErrorMidi([]);
    setFeedback({
      status: 'idle',
      message: 'Press the requested landmark key on the keyboard below.',
    });
  };

  const handleFilterChange = (lvl: 1 | 2 | 'all') => {
    setLevelFilter(lvl);
    setCurrentIndex(0);
    setMisses(0);
    setScore(0);
    setCompleted(false);
    setMatchedMidi([]);
    setErrorMidi([]);
    setFeedback({
      status: 'idle',
      message: 'Press the requested landmark key on the keyboard below.',
    });
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl space-y-5">
      {/* Top Header & Score Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Target size={15} />
            <span>Keyboard Geography Explorer</span>
          </div>
          <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {completed ? 'All Keyboard Landmarks Found!' : current.prompt}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {completed
              ? 'Outstanding job! You demonstrated mastery over the black and white key geography.'
              : 'Identify and strike the requested key on the virtual piano using the alternating black key landmarks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Level Filter Switcher */}
          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                levelFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              All ({EXPLORER_CHALLENGES.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange(1)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                levelFilter === 1
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Lvl 1: Naturals
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange(2)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                levelFilter === 2
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Lvl 2: Accidentals
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Badge variant="indigo" size="sm">
              Challenge {Math.min(currentIndex + 1, activeChallenges.length)} / {activeChallenges.length}
            </Badge>
            <Badge variant="gold" size="sm">
              Score: {score}
            </Badge>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-850 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Notification Banner */}
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 text-xs sm:text-sm transition-all',
          feedback.status === 'correct'
            ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200'
            : feedback.status === 'wrong'
            ? 'border-amber-500/40 bg-amber-950/25 text-amber-200'
            : 'border-slate-800 bg-slate-950/80 text-slate-300'
        )}
      >
        {feedback.status === 'correct' ? (
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        ) : feedback.status === 'wrong' ? (
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Compass size={18} className="text-indigo-400 shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <span className="font-semibold leading-relaxed">
            {completed
              ? 'Great ear and visual recognition! You successfully identified all target piano keys.'
              : feedback.message}
          </span>
        </div>
      </div>

      {/* The Unified Virtual Piano Component */}
      <div className="w-full max-w-full overflow-hidden pt-2">
        <VirtualPiano88
          viewMode="compact"
          midiRange={[48, 76]}
          defaultLabels="all"
          targetMidi={!completed && revealTarget ? [current.targetMidi] : []}
          matchedMidi={matchedMidi}
          errorMidi={errorMidi}
          onNotePlay={handleKeyPress}
          compactControls
        />
      </div>

      {/* Completion Modal / Banner */}
      {completed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Keyboard Explorer Badge Challenge Complete!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Final Score: {score} / {activeChallenges.length} • +50 Experience Points
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Play Again
            </Button>
            {onGameComplete && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onGameComplete(score)}
              >
                Claim XP &amp; Continue
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
