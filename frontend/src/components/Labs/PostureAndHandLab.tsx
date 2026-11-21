import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FINGERS } from '../../data/labsData';

type PostureState = 'correct' | 'slumped' | 'too-low';

export interface PostureAndHandLabProps {
  onLabComplete?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const PostureAndHandLab: React.FC<PostureAndHandLabProps> = ({
  onLabComplete,
  showBack,
  onBack,
}) => {
  const [posture, setPosture] = useState<PostureState>('correct');
  const [hand, setHand] = useState<'right' | 'left'>('right');
  const [activeFinger, setActiveFinger] = useState<number>(1);
  const [handShape, setHandShape] = useState<'curved' | 'flat'>('curved');
  const [completedSteps, setCompletedSteps] = useState({
    postureChecked: false,
    fingersTested: false,
    handShapeChecked: false,
  });

  const handleFingerClick = (f: (typeof FINGERS)[number]) => {
    setActiveFinger(f.num);
    const note = hand === 'right' ? f.rhNote : f.lhNote;
    audioEngine.unlockSync();
    void audioEngine.playNote(note, 0.8);
    setCompletedSteps((prev) => ({ ...prev, fingersTested: true }));
  };

  const animateFiveFingers = () => {
    audioEngine.unlockSync();
    const sequence = hand === 'right' ? FINGERS : [...FINGERS].reverse();
    sequence.forEach((f, idx) => {
      setTimeout(() => {
        setActiveFinger(f.num);
        const note = hand === 'right' ? f.rhNote : f.lhNote;
        void audioEngine.playNote(note, 0.6);
      }, idx * 300);
    });
    setCompletedSteps((prev) => ({ ...prev, fingersTested: true }));
  };

  const handlePostureChange = (p: PostureState) => {
    setPosture(p);
    setCompletedSteps((prev) => ({ ...prev, postureChecked: true }));
  };

  const handleHandShapeChange = (shape: 'curved' | 'flat') => {
    setHandShape(shape);
    setCompletedSteps((prev) => ({ ...prev, handShapeChecked: true }));
  };

  const allInteracted =
    completedSteps.postureChecked &&
    completedSteps.fingersTested &&
    completedSteps.handShapeChecked;

  return (
    <div className="space-y-6">
      {/* 1. Sitting Posture Interactive Guide */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles size={15} />
              <span>Ergonomics &amp; Biomechanics</span>
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Sitting Posture &amp; Bench Alignment
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Compare balanced conservatory posture against common beginner alignment habits.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            {(
              [
                { id: 'correct', label: 'Balanced Alignment' },
                { id: 'slumped', label: 'Slumped / Too Close' },
                { id: 'too-low', label: 'Bench Too Low' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePostureChange(opt.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  posture === opt.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* SVG Posture Silhouette */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
            <svg
              viewBox="0 0 420 250"
              className="w-full h-auto"
              role="img"
              aria-label="Pianist sitting posture biomechanics diagram"
            >
              {/* Floor line */}
              <line x1="20" y1="226" x2="400" y2="226" stroke="#334155" strokeWidth="2" />
              {/* Piano body casing */}
              <rect x="275" y="70" width="115" height="156" rx="6" fill="#1e293b" stroke="#475569" />
              <rect x="245" y="132" width="42" height="14" rx="2" fill="#FAF7F2" stroke="#cbd5e1" />
              <text x="332" y="102" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="700">
                Keybed
              </text>

              {/* Adjustable Piano Bench */}
              <rect
                x={posture === 'slumped' ? '155' : '115'}
                y={posture === 'too-low' ? '186' : '168'}
                width="74"
                height="12"
                rx="3"
                fill="#475569"
              />
              <line
                x1={posture === 'slumped' ? '168' : '128'}
                y1={posture === 'too-low' ? '198' : '180'}
                x2={posture === 'slumped' ? '168' : '128'}
                y2="226"
                stroke="#475569"
                strokeWidth="4"
              />
              <line
                x1={posture === 'slumped' ? '216' : '176'}
                y1={posture === 'too-low' ? '198' : '180'}
                x2={posture === 'slumped' ? '216' : '176'}
                y2="226"
                stroke="#475569"
                strokeWidth="4"
              />

              {/* Pianist Silhouette with Biomechanical Skeletal Rays */}
              {posture === 'correct' && (
                <g stroke="#6366f1" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="152" cy="64" r="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="3" />
                  {/* Straight, buoyant spine */}
                  <line x1="152" y1="80" x2="152" y2="164" stroke="#818cf8" />
                  {/* Upper arm & level forearm */}
                  <polyline points="152,98 168,136 250,136" stroke="#10b981" strokeWidth="5" />
                  {/* Legs & flat grounded feet */}
                  <polyline points="152,164 212,164 218,224 234,224" stroke="#64748b" />
                  {/* Visual Level Forearm Line */}
                  <line x1="168" y1="136" x2="250" y2="136" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="206" y="128" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="700">
                    Forearm Level
                  </text>
                </g>
              )}

              {posture === 'slumped' && (
                <g stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="204" cy="74" r="16" fill="#451a03" stroke="#fbbf24" strokeWidth="3" />
                  {/* Hunched, slumped back */}
                  <path d="M 192 164 Q 178 122 200 90" stroke="#f59e0b" />
                  {/* Cramped elbows pulled backward */}
                  <polyline points="196,104 176,144 248,136" stroke="#ef4444" strokeWidth="5" />
                  <polyline points="192,164 238,164 242,224 256,224" stroke="#64748b" />
                  <text x="180" y="160" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">
                    Cramped Elbow
                  </text>
                </g>
              )}

              {posture === 'too-low' && (
                <g stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="152" cy="84" r="16" fill="#451a03" stroke="#fbbf24" strokeWidth="3" />
                  <line x1="152" y1="100" x2="152" y2="182" stroke="#f59e0b" />
                  {/* Forearms sloping sharply upward */}
                  <polyline points="152,118 168,160 250,136" stroke="#ef4444" strokeWidth="5" />
                  <polyline points="152,182 212,182 218,224 234,224" stroke="#64748b" />
                  <text x="210" y="160" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">
                    Wrist Angle Strain
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Feedback & Ergonomics Prose */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className={cn(
                'flex items-start gap-3 rounded-2xl border p-4 transition-all',
                posture === 'correct'
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
              )}
            >
              {posture === 'correct' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-bold text-white">
                  {posture === 'correct'
                    ? 'Balanced Conservatory Alignment'
                    : posture === 'slumped'
                    ? 'Warning: Sitting Too Close / Slumped Torso'
                    : 'Warning: Bench Too Low — Causes Wrist Flexor Strain'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {posture === 'correct'
                    ? 'Forearms rest parallel to the floor, elbows hang slightly forward of your torso, shoulders stay loose and unclenched, and feet rest flat on the floor for balanced weight support.'
                    : posture === 'slumped'
                    ? 'Sitting too close forces elbows behind your ribcage, jamming your arms against your body. Slide the bench back until your arms hang with natural, unforced freedom.'
                    : 'When the bench is too low, wrists bend upward to reach the keys, causing tendon strain in the carpal tunnel. Raise your bench or add a firm cushion until forearms are level.'}
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Bench position:</strong> Sit comfortably on the front half of the bench so your hips pivot freely with upper body movement.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Elbows &amp; Forearms:</strong> Forearms should be approximately level with the white keys, allowing arm weight to transfer directly into the keys.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Feet:</strong> Both feet flat on the floor (or resting on a pedal extender for younger pianists) to anchor balance.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Hand Position & Interactive Finger Numbering (1–5) */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Layers size={15} />
              <span>Interactive Technique</span>
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Hand Shape &amp; Universal Finger Numbering (1–5)
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Click any finger to hear its designated note, test both hands, and inspect the curved knuckle arch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setHand('left')}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
                  hand === 'left'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Left Hand (LH)
              </button>
              <button
                type="button"
                onClick={() => setHand('right')}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
                  hand === 'right'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Right Hand (RH)
              </button>
            </div>

            <Button
              variant="amber"
              size="sm"
              leftIcon={<Play size={14} />}
              onClick={animateFiveFingers}
            >
              Animate 1–5 Arpeggio
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Interactive Finger Number Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {(hand === 'right' ? FINGERS : [...FINGERS].reverse()).map((f) => {
                const isSelected = activeFinger === f.num;
                const note = hand === 'right' ? f.rhNote : f.lhNote;

                return (
                  <button
                    key={f.num}
                    type="button"
                    onClick={() => handleFingerClick(f)}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-2xl border py-4 px-2 transition-all cursor-pointer select-none',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/20 -translate-y-1 shadow-lg shadow-indigo-600/20'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                    )}
                  >
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                      {f.num}
                    </span>
                    <span className="mt-1 text-xs font-bold text-white">
                      {f.name}
                    </span>
                    <span className="mt-0.5 text-[11px] font-mono text-indigo-300">
                      {note}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>
                <strong className="text-white">Universal Symmetry:</strong> On <em>both</em> hands, the <strong>Thumb is always 1</strong> and the <strong>Pinky is always 5</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Notice that finger 1 (Thumb) moves outward in opposite directions: rightward on the right hand, leftward on the left hand.
              </p>
            </div>
          </div>

          {/* Curved Knuckle Arch vs Flat Collapsed Joint Demo */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Finger Arch Check
              </span>
              <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900 p-0.5">
                <button
                  type="button"
                  onClick={() => handleHandShapeChange('curved')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                    handShape === 'curved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  Curved (Natural)
                </button>
                <button
                  type="button"
                  onClick={() => handleHandShapeChange('flat')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                    handShape === 'flat'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  Flat (Avoid)
                </button>
              </div>
            </div>

            {/* SVG Hand Shape Illustration */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <svg
                viewBox="0 0 280 110"
                className="w-full h-auto"
                role="img"
                aria-label="Curved vs flat finger arch comparison"
              >
                {/* White Key Surface */}
                <rect x="16" y="84" width="248" height="16" rx="3" fill="#FAF7F2" stroke="#94a3b8" />
                <text x="140" y="96" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="700">
                  Piano Key Surface
                </text>

                {handShape === 'curved' ? (
                  <g stroke="#10b981" strokeWidth="5" fill="none" strokeLinecap="round">
                    {/* Natural Curved Arch */}
                    <path d="M 35 66 Q 90 40 130 42 Q 175 44 190 83" />
                    <circle cx="190" cy="83" r="5" fill="#10b981" />
                    <text x="130" y="32" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="700">
                      Rounded Bridge Arch
                    </text>
                  </g>
                ) : (
                  <g stroke="#ef4444" strokeWidth="5" fill="none" strokeLinecap="round">
                    {/* Collapsed Flat Finger */}
                    <path d="M 35 76 L 130 74 L 196 82" />
                    <circle cx="196" cy="82" r="5" fill="#ef4444" />
                    <text x="130" y="60" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">
                      Collapsed Joint
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {handShape === 'curved'
                ? 'Curved fingers form a stable bridge arch (like gently resting your palm over a tennis ball), enabling individual finger independence and clean hammer strikes without wrist fatigue.'
                : 'Flat, collapsed fingers slap the keys with sluggish resistance and cause tendon tightness across the forearm and wrist.'}
            </p>
          </div>
        </div>

        {/* Lab Completion Button */}
        {onLabComplete && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<CheckCircle2 size={16} />}
              onClick={onLabComplete}
            >
              Complete Posture &amp; Hand Lab (+50 XP)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
