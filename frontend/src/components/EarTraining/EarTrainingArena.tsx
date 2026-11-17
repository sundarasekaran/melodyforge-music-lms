import React, { useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';
import {
  Volume2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Flame,
  Headphones,
  ArrowRight,
  Music,
} from 'lucide-react';

interface Question {
  id: number;
  type: 'NOTE' | 'INTERVAL' | 'CHORD';
  prompt: string;
  notes: string[];
  options: string[];
  correctAnswer: string;
  hint: string;
}

const EAR_QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'NOTE',
    prompt: 'Listen carefully. Which note was played?',
    notes: ['C4'],
    options: ['C4', 'E4', 'G4', 'B4'],
    correctAnswer: 'C4',
    hint: 'This is Middle C (C4), vibrating at 261.63 Hz — the central benchmark pitch of keyboard pedagogy.',
  },
  {
    id: 2,
    type: 'NOTE',
    prompt: 'Listen carefully. Which note was played?',
    notes: ['G4'],
    options: ['D4', 'F4', 'G4', 'A4'],
    correctAnswer: 'G4',
    hint: 'G is 5 scale steps above Middle C (a perfect fifth higher), giving a buoyant, resonant quality.',
  },
  {
    id: 3,
    type: 'NOTE',
    prompt: 'Listen carefully. Which note was played?',
    notes: ['E4'],
    options: ['C4', 'D4', 'E4', 'F4'],
    correctAnswer: 'E4',
    hint: 'E is the major third above C, defining the bright, optimistic character of the C Major harmony.',
  },
  {
    id: 4,
    type: 'INTERVAL',
    prompt: 'Listen to this two-note interval. What is it?',
    notes: ['C4', 'G4'],
    options: ['Unison', 'Major 3rd', 'Perfect 5th', 'Octave'],
    correctAnswer: 'Perfect 5th',
    hint: 'C to G forms an open, powerful Perfect 5th interval (7 semitones, as in the opening of Star Wars).',
  },
  {
    id: 5,
    type: 'INTERVAL',
    prompt: 'Listen to this two-note interval. What is it?',
    notes: ['C4', 'C5'],
    options: ['Major 2nd', 'Perfect 4th', 'Major 6th', 'Octave'],
    correctAnswer: 'Octave',
    hint: 'The exact same pitch frequency doubled (261.63 Hz to 523.25 Hz), spanning an 8-note octave.',
  },
  {
    id: 6,
    type: 'CHORD',
    prompt: 'Listen to this 3-note triad. Is it Major or Minor?',
    notes: ['C4', 'E4', 'G4'],
    options: ['Major Triad', 'Minor Triad', 'Diminished', 'Augmented'],
    correctAnswer: 'Major Triad',
    hint: 'C - E - G is constructed with a Major 3rd (4 semitones) followed by a Minor 3rd, resulting in a stable, bright sound.',
  },
  {
    id: 7,
    type: 'CHORD',
    prompt: 'Listen to this 3-note triad. Is it Major or Minor?',
    notes: ['A3', 'C4', 'E4'],
    options: ['Major Triad', 'Minor Triad', 'Suspended', 'Dominant 7th'],
    correctAnswer: 'Minor Triad',
    hint: 'A - C - E starts with a Minor 3rd (3 semitones), creating a reflective, somber, melancholic quality.',
  },
];

export const EarTrainingArena: React.FC = () => {
  const { awardLocalXp } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentQ = EAR_QUESTIONS[currentIndex];

  const playQuestionAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      if (currentQ.type === 'NOTE') {
        await audioEngine.playNote(currentQ.notes[0], 1.2);
      } else if (currentQ.type === 'INTERVAL') {
        await audioEngine.playSequence(currentQ.notes, 500);
      } else if (currentQ.type === 'CHORD') {
        await audioEngine.playChord(currentQ.notes, 1.6);
      }
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    setTotalAnswered((t) => t + 1);

    const correct = option === currentQ.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      awardLocalXp(35);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setCurrentIndex((prev) => (prev + 1) % EAR_QUESTIONS.length);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Ear Training Arena"
        subtitle="Develop absolute and relative pitch recognition across individual notes, harmonic intervals, and chord qualities."
        icon={<Headphones size={22} />}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
              <Flame size={15} />
              <span>Streak: {streak}</span>
            </div>
            <div className="text-xs font-bold text-indigo-400 bg-indigo-600/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              Score: {score} / {totalAnswered}
            </div>
          </div>
        }
      />

      {/* Progress Dots Indicator */}
      <div className="flex items-center justify-center gap-2">
        {EAR_QUESTIONS.map((q, idx) => (
          <div
            key={q.id}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-indigo-500'
                : idx < currentIndex
                ? 'w-2 bg-emerald-500'
                : 'w-2 bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Challenge Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        <Badge variant="indigo" size="sm" className="mb-3">
          Challenge {currentIndex + 1} of {EAR_QUESTIONS.length} • {currentQ.type} RECOGNITION
        </Badge>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 max-w-lg">{currentQ.prompt}</h3>

        {/* Audio Button with Soundwave Waveform Animation */}
        <button
          onClick={playQuestionAudio}
          disabled={isPlaying}
          className="relative group flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-extrabold shadow-xl shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer mb-5"
        >
          <Volume2 className={isPlaying ? 'text-amber-300 animate-bounce' : 'text-white'} size={28} />
          <span className="text-base sm:text-lg">
            {isPlaying ? 'Playing Audio...' : 'Play Musical Tone'}
          </span>

          {/* Sound wave animated bars */}
          {isPlaying && (
            <div className="flex items-center gap-1 ml-2">
              <span className="w-1 h-5 bg-amber-300 rounded-full animate-pulse" />
              <span className="w-1 h-3 bg-amber-300 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-6 bg-amber-300 rounded-full animate-pulse delay-150" />
            </div>
          )}
        </button>

        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <RefreshCw size={13} />
          Tap as many times as needed to listen carefully before choosing
        </p>
      </div>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {currentQ.options.map((opt) => {
          let btnStyle = 'bg-slate-900/90 hover:bg-slate-850 text-slate-200 border-slate-800';

          if (isAnswered) {
            if (opt === currentQ.correctAnswer) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10';
            } else if (opt === selectedAnswer) {
              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/30';
            } else {
              btnStyle = 'bg-slate-950/40 text-slate-500 border-slate-900';
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={`p-4 sm:p-5 rounded-2xl border font-bold text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswered && opt === currentQ.correctAnswer && (
                <CheckCircle2 size={20} className="text-emerald-400" />
              )}
              {isAnswered && opt === selectedAnswer && !isCorrect && (
                <XCircle size={20} className="text-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {isAnswered && (
        <div
          className={`p-5 rounded-2xl border flex items-start gap-3.5 animate-in fade-in duration-200 ${
            isCorrect
              ? 'bg-emerald-950/50 border-emerald-600/40 text-emerald-200'
              : 'bg-rose-950/50 border-rose-600/40 text-rose-200'
          }`}
        >
          {isCorrect ? (
            <Sparkles className="text-emerald-400 shrink-0 mt-0.5" size={22} />
          ) : (
            <XCircle className="text-rose-400 shrink-0 mt-0.5" size={22} />
          )}
          <div className="text-xs sm:text-sm">
            <p className="font-extrabold text-sm sm:text-base">
              {isCorrect ? 'Correct Pitch! +35 XP' : `Incorrect. The correct answer was ${currentQ.correctAnswer}.`}
            </p>
            <p className="text-xs mt-1.5 opacity-90 leading-relaxed">{currentQ.hint}</p>
          </div>
        </div>
      )}

      {/* Next Question Button */}
      {isAnswered && (
        <Button
          variant="primary"
          size="lg"
          className="w-full font-bold shadow-xl cursor-pointer"
          onClick={nextQuestion}
          icon={<ArrowRight size={18} />}
          iconPosition="right"
        >
          Next Challenge
        </Button>
      )}
    </div>
  );
};
