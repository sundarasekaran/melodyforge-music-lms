import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Award,
  Music,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { VirtualPiano88 } from '../VirtualPiano/VirtualPiano88';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { STAFF_NOTES, DURATIONS, StaffNoteItem } from '../../data/labsData';

export interface NotationTheoryLabProps {
  onLabComplete?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const NotationTheoryLab: React.FC<NotationTheoryLabProps> = ({
  onLabComplete,
  showBack,
  onBack,
}) => {
  const [selectedNote, setSelectedNote] = useState<StaffNoteItem>(STAFF_NOTES[0]);
  const [activeDuration, setActiveDuration] = useState<string>('quarter');
  const [isPlayingPulse, setIsPlayingPulse] = useState(false);

  // Staff Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Quiz Target Questions (5 curated pitch identification questions)
  const QUIZ_QUESTIONS = [
    { targetMidi: 60, prompt: 'Find Middle C (C4) on the ledger line below the staff.' },
    { targetMidi: 67, prompt: 'Find the note G4 on Line 2 (The Treble G-clef anchor line).' },
    { targetMidi: 65, prompt: 'Find the note F4 in Space 1.' },
    { targetMidi: 72, prompt: 'Find C5 in Space 3 (one octave above Middle C).' },
    { targetMidi: 71, prompt: 'Find B4 on Line 3 (the center staff line).' },
  ];

  const currentQuiz = QUIZ_QUESTIONS[quizIndex];

  const playStaffNote = (item: StaffNoteItem) => {
    setSelectedNote(item);
    audioEngine.unlockSync();
    void audioEngine.playNote(item.note, 0.9);

    if (quizActive && !quizCompleted) {
      if (item.midi === currentQuiz.targetMidi) {
        setQuizScore((s) => s + 1);
        setQuizFeedback(`Correct! That is ${item.label}.`);
        setTimeout(() => {
          if (quizIndex + 1 >= QUIZ_QUESTIONS.length) {
            setQuizCompleted(true);
            setQuizFeedback('Quiz completed! You mastered reading the Treble Staff.');
          } else {
            setQuizIndex((i) => i + 1);
            setQuizFeedback(null);
          }
        }, 1000);
      } else {
        setQuizFeedback(`Incorrect: you clicked ${item.label}. Try again!`);
      }
    }
  };

  const playDurationDemo = async (dur: (typeof DURATIONS)[number]) => {
    if (isPlayingPulse) return;
    setActiveDuration(dur.id);
    setIsPlayingPulse(true);
    audioEngine.unlockSync();

    const bpmInterval = (60 / 100) * 1000; // 100 BPM quarter-note time
    const repeatCount = dur.id === 'whole' ? 1 : dur.id === 'half' ? 2 : dur.id === 'quarter' ? 4 : dur.id === 'eighth' ? 8 : 8;
    const intervalMs = dur.id === 'whole' ? bpmInterval * 4 : dur.id === 'half' ? bpmInterval * 2 : dur.id === 'quarter' ? bpmInterval : dur.id === 'eighth' ? bpmInterval / 2 : bpmInterval / 4;

    for (let i = 0; i < repeatCount; i++) {
      void audioEngine.playNote('C4', Math.max(0.08, intervalMs / 1000 * 0.7));
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    setIsPlayingPulse(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Interactive Treble Staff Explorer */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles size={15} />
              <span>Notation Theory Lab</span>
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Interactive Treble Staff (5 Lines &amp; 4 Spaces)
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Click any note head on the staff to hear its pitch, read its staff location, and see its exact key on the piano.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-extrabold text-amber-400 font-mono">
                {selectedNote.label}
              </p>
              <p className="text-xs text-slate-400">{selectedNote.clef}</p>
            </div>

            <Button
              variant={quizActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setQuizActive(!quizActive);
                setQuizIndex(0);
                setQuizScore(0);
                setQuizCompleted(false);
                setQuizFeedback(null);
              }}
            >
              {quizActive ? 'Exit Staff Quiz' : 'Start Staff Quiz'}
            </Button>
          </div>
        </div>

        {/* Staff Quiz Prompt Banner */}
        {quizActive && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {quizCompleted ? 'Quiz Completed!' : currentQuiz.prompt}
              </h4>
              {quizFeedback && (
                <p className="text-xs text-amber-300 mt-1 font-semibold">{quizFeedback}</p>
              )}
            </div>
            <Badge variant="gold" size="md">
              Score: {quizScore} / {QUIZ_QUESTIONS.length}
            </Badge>
          </div>
        )}

        {/* SVG Treble Staff Engraving */}
        <div className="rounded-2xl border border-slate-800 bg-[#FAF7F2] p-4 sm:p-6 text-slate-900 shadow-inner overflow-x-auto">
          <svg
            viewBox="0 0 760 170"
            className="w-full min-w-[620px] h-auto select-none"
            role="img"
            aria-label="Interactive five-line musical staff"
          >
            {/* 5 Staff lines */}
            {[22, 42, 62, 82, 102].map((y) => (
              <line key={y} x1="40" y1={y} x2="730" y2={y} stroke="#1e293b" strokeWidth="1.8" />
            ))}

            {/* Treble Clef Symbol (𝄞) */}
            <text x="50" y="94" fontSize="64" fontFamily="serif" fill="#0f172a">
              𝄞
            </text>

            {/* Time signature (4/4) */}
            <text x="110" y="60" fontSize="32" fontWeight="bold" fontFamily="serif" fill="#0f172a">
              4
            </text>
            <text x="110" y="96" fontSize="32" fontWeight="bold" fontFamily="serif" fill="#0f172a">
              4
            </text>

            {/* Clickable Notes */}
            {STAFF_NOTES.map((n, idx) => {
              const x = 160 + idx * 52;
              const isActive = selectedNote.midi === n.midi;

              return (
                <g
                  key={n.midi}
                  className="cursor-pointer group"
                  onClick={() => playStaffNote(n)}
                >
                  {/* Middle C Ledger Line */}
                  {n.midi === 60 && (
                    <line x1={x - 18} y1={n.y} x2={x + 18} y2={n.y} stroke="#0f172a" strokeWidth="2.2" />
                  )}

                  {/* Note head ellipse (standard 18° tilt) */}
                  <ellipse
                    cx={x}
                    cy={n.y}
                    rx="12"
                    ry="8.5"
                    transform={`rotate(-18 ${x} ${n.y})`}
                    fill={isActive ? '#d97706' : '#0f172a'}
                    className="transition-colors group-hover:fill-amber-600"
                  />

                  {/* Stem: points up if below B4, down if B4 or above */}
                  {n.y > 62 ? (
                    <line
                      x1={x + 11}
                      y1={n.y}
                      x2={x + 11}
                      y2={n.y - 40}
                      stroke={isActive ? '#d97706' : '#0f172a'}
                      strokeWidth="2.2"
                    />
                  ) : (
                    <line
                      x1={x - 11}
                      y1={n.y}
                      x2={x - 11}
                      y2={n.y + 40}
                      stroke={isActive ? '#d97706' : '#0f172a'}
                      strokeWidth="2.2"
                    />
                  )}

                  {/* Note Name Label below staff */}
                  <text
                    x={x}
                    y="152"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fill={isActive ? '#b45309' : '#475569'}
                  >
                    {n.note}
                  </text>

                  {/* Mnemonic letter above */}
                  {n.mnemonic && (
                    <text
                      x={x}
                      y="14"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#64748b"
                    >
                      {n.mnemonic}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Mnemonic Memorization Aids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
            <strong className="text-white text-sm block">Treble Clef Lines (Bottom to Top):</strong>
            <p className="text-amber-400 font-extrabold text-sm tracking-wide">
              E – G – B – D – F
            </p>
            <p className="text-slate-400 text-xs">
              Mnemonic: <em>&ldquo;Every Good Boy Does Fine&rdquo;</em> (Line 1 = E4, Line 5 = F5)
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
            <strong className="text-white text-sm block">Treble Clef Spaces (Bottom to Top):</strong>
            <p className="text-emerald-400 font-extrabold text-sm tracking-wide">
              F – A – C – E
            </p>
            <p className="text-slate-400 text-xs">
              Mnemonic: Spells the word <em>&ldquo;FACE&rdquo;</em> (Space 1 = F4, Space 4 = E5)
            </p>
          </div>
        </div>

        {/* Synchronized Virtual Piano Key Highlighting */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white">Corresponding Piano Key for {selectedNote.label}:</span>
            <span>Click any staff note to see it illuminated on the keys</span>
          </div>
          <VirtualPiano88
            viewMode="compact"
            midiRange={[48, 76]}
            defaultLabels="all"
            targetMidi={[selectedNote.midi]}
            matchedMidi={[selectedNote.midi]}
            onNotePlay={(k) => {
              const matched = STAFF_NOTES.find((s) => s.midi === k.midi);
              if (matched) setSelectedNote(matched);
            }}
            compactControls
          />
        </div>
      </div>

      {/* 2. Note Durations & Rhythmic Pulse Module */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Clock size={15} />
            <span>Rhythm &amp; Meter</span>
          </div>
          <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Note Durations &amp; Rhythmic Pulses
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            In standard 4/4 time, each note duration halves the length of the previous note. Click any card to hear its pulse pattern at 100 BPM.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DURATIONS.map((dur) => {
            const isSelected = activeDuration === dur.id;

            return (
              <button
                key={dur.id}
                type="button"
                onClick={() => playDurationDemo(dur)}
                className={cn(
                  'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-600/20 -translate-y-1'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{dur.symbol}</span>
                    <Badge variant={isSelected ? 'indigo' : 'slate'} size="sm">
                      {dur.beats} {dur.beats === 1 ? 'beat' : 'beats'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{dur.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{dur.ratio}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                    <Volume2 size={13} /> Hear Pulse
                  </span>
                  <span className="text-slate-500 font-mono">100 BPM</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion button */}
        {onLabComplete && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<CheckCircle2 size={16} />}
              onClick={onLabComplete}
            >
              Complete Notation Theory Lab (+50 XP)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
