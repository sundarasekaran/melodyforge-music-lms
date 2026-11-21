import React, { useState, useMemo, useCallback } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { StaffNotation } from './StaffNotation';
import { VirtualPiano88 } from './VirtualPiano88';
import {
  SCALES,
  CHORDS,
  MELODIES,
  getKeyByMidi,
  getKeyByNoteName,
} from '../../data/pianoNotes';
import { PianoKeyData, VirtualPianoMode } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Music,
  Compass,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface VirtualPianoProps {
  highlightedNote?: string | null;
  targetNotes?: string[];
  onNotePlayed?: (note: string) => void;
  showStaff?: boolean;
  initialMode?: VirtualPianoMode;
  compactOnly?: boolean;
  defaultView?: 'compact' | 'full88';
}

const GUIDED_NOTE_TARGETS = [60, 64, 67, 65, 69, 62, 71, 66, 70, 72]; // C4, E4, G4, F4, A4, D4, B4, F#4, Bb4, C5

const MODE_TABS: { id: VirtualPianoMode; label: string; icon: string; description: string }[] = [
  { id: 'free', label: 'Free Play', icon: '🎹', description: 'Explore all 88 keys freely with Grand, Electric, or Harpsichord voices and sustain.' },
  { id: 'guided-notes', label: 'Guided Notes', icon: '🎯', description: 'Follow the glowing target keys one by one across the keyboard to build note fluency.' },
  { id: 'scale-practice', label: 'Scale Practice', icon: '🎼', description: 'Learn complete Major and Minor scales with thumb-tuck fingering rules.' },
  { id: 'chord-practice', label: 'Chord Practice', icon: '🎶', description: 'Master foundational Major and Minor triads and chord voicings.' },
  { id: 'melody-practice', label: 'Melody Practice', icon: '✨', description: 'Play beloved songs note-by-note with tempo demonstrations and finger numbers.' },
];

export const VirtualPiano: React.FC<VirtualPianoProps> = ({
  highlightedNote,
  targetNotes = [],
  onNotePlayed,
  showStaff = true,
  initialMode = 'free',
  compactOnly = false,
  defaultView = 'compact',
}) => {
  const [mode, setMode] = useState<VirtualPianoMode>(initialMode);
  const [viewMode, setViewMode] = useState<'compact' | 'full88'>(defaultView);
  const [lastPlayedNote, setLastPlayedNote] = useState<string | null>(null);

  // Guided Notes mode state
  const [guidedIdx, setGuidedIdx] = useState(0);
  const [guidedHits, setGuidedHits] = useState(0);

  // Scale Practice mode state
  const [selectedScaleId, setSelectedScaleId] = useState(SCALES[0].id);
  const [scaleStep, setScaleStep] = useState(0);
  const [scaleDone, setScaleDone] = useState(false);

  // Chord Practice mode state
  const [selectedChordId, setSelectedChordId] = useState(CHORDS[0].id);
  const [chordFoundMidi, setChordFoundMidi] = useState<number[]>([]);

  // Melody Practice mode state
  const [selectedMelodyId, setSelectedMelodyId] = useState(MELODIES[1].id); // Ode to Joy
  const [melodyStep, setMelodyStep] = useState(0);
  const [melodyDone, setMelodyDone] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Error feedback state
  const [errorMidi, setErrorMidi] = useState<number[]>([]);

  const activeScale = SCALES.find((s) => s.id === selectedScaleId) ?? SCALES[0];
  const activeChord = CHORDS.find((c) => c.id === selectedChordId) ?? CHORDS[0];
  const activeMelody = MELODIES.find((m) => m.id === selectedMelodyId) ?? MELODIES[0];

  // Resolve external props target / highlighted notes into MIDI numbers
  const externalHighlightedMidi = useMemo(() => {
    const list: number[] = [];
    if (highlightedNote) {
      const k = getKeyByNoteName(highlightedNote);
      if (k) list.push(k.midi);
    }
    targetNotes.forEach((n) => {
      const k = getKeyByNoteName(n);
      if (k) list.push(k.midi);
    });
    return list;
  }, [highlightedNote, targetNotes]);

  // Determine active target and highlighted notes according to mode
  const { targetMidis, highlightedMidis, matchedMidis } = useMemo(() => {
    if (compactOnly || mode === 'free') {
      return {
        targetMidis: externalHighlightedMidi,
        highlightedMidis: [],
        matchedMidis: [],
      };
    }

    if (mode === 'guided-notes') {
      const target = GUIDED_NOTE_TARGETS[guidedIdx];
      return {
        targetMidis: [target],
        highlightedMidis: [],
        matchedMidis: [],
      };
    }

    if (mode === 'scale-practice') {
      const expected = activeScale.midiSample[scaleStep];
      return {
        targetMidis: scaleDone ? [] : [expected],
        highlightedMidis: activeScale.midiSample,
        matchedMidis: scaleDone ? activeScale.midiSample : activeScale.midiSample.slice(0, scaleStep),
      };
    }

    if (mode === 'chord-practice') {
      return {
        targetMidis: activeChord.midiNotes,
        highlightedMidis: activeChord.midiNotes,
        matchedMidis: chordFoundMidi,
      };
    }

    if (mode === 'melody-practice') {
      const curStep = activeMelody.steps[melodyStep];
      return {
        targetMidis: melodyDone || !curStep ? [] : [curStep.midi],
        highlightedMidis: [],
        matchedMidis: [],
      };
    }

    return { targetMidis: [], highlightedMidis: [], matchedMidis: [] };
  }, [
    mode,
    compactOnly,
    externalHighlightedMidi,
    guidedIdx,
    activeScale,
    scaleStep,
    scaleDone,
    activeChord,
    chordFoundMidi,
    activeMelody,
    melodyStep,
    melodyDone,
  ]);

  // Current target note name for StaffNotation
  const currentTargetNoteName = useMemo(() => {
    if (highlightedNote) return highlightedNote;
    if (targetMidis.length > 0) {
      const k = getKeyByMidi(targetMidis[0]);
      return k?.note || null;
    }
    return null;
  }, [highlightedNote, targetMidis]);

  // Main note strike handler
  const handleNotePlay = useCallback(
    (key: PianoKeyData) => {
      setLastPlayedNote(key.note);
      onNotePlayed?.(key.note);

      if (compactOnly || mode === 'free') return;

      if (mode === 'guided-notes') {
        const target = GUIDED_NOTE_TARGETS[guidedIdx];
        if (key.midi === target) {
          setGuidedHits((h) => h + 1);
          setGuidedIdx((i) => (i + 1) % GUIDED_NOTE_TARGETS.length);
        } else {
          setErrorMidi([key.midi]);
          setTimeout(() => setErrorMidi([]), 350);
        }
        return;
      }

      if (mode === 'scale-practice' && !scaleDone) {
        const expected = activeScale.midiSample[scaleStep];
        if (key.midi === expected) {
          const next = scaleStep + 1;
          if (next >= activeScale.midiSample.length) {
            setScaleDone(true);
          } else {
            setScaleStep(next);
          }
        } else {
          setErrorMidi([key.midi]);
          setTimeout(() => setErrorMidi([]), 350);
        }
        return;
      }

      if (mode === 'chord-practice') {
        if (activeChord.midiNotes.includes(key.midi)) {
          setChordFoundMidi((prev) => (prev.includes(key.midi) ? prev : [...prev, key.midi]));
        } else {
          setErrorMidi([key.midi]);
          setTimeout(() => setErrorMidi([]), 350);
        }
        return;
      }

      if (mode === 'melody-practice' && !melodyDone) {
        const currentTarget = activeMelody.steps[melodyStep];
        if (currentTarget && key.midi === currentTarget.midi) {
          const next = melodyStep + 1;
          if (next >= activeMelody.steps.length) {
            setMelodyDone(true);
          } else {
            setMelodyStep(next);
          }
        } else {
          setErrorMidi([key.midi]);
          setTimeout(() => setErrorMidi([]), 350);
        }
        return;
      }
    },
    [
      compactOnly,
      mode,
      guidedIdx,
      scaleDone,
      activeScale,
      scaleStep,
      activeChord,
      melodyDone,
      activeMelody,
      melodyStep,
      onNotePlayed,
    ]
  );

  // Play audio demos for scales, chords, and melodies
  const playScaleDemo = async () => {
    if (isPlayingDemo) return;
    setIsPlayingDemo(true);
    await audioEngine.playSequence(activeScale.midiSample, 420);
    setIsPlayingDemo(false);
  };

  const playChordDemo = async () => {
    if (isPlayingDemo) return;
    setIsPlayingDemo(true);
    await audioEngine.playChord(activeChord.midiNotes, 1.4);
    setIsPlayingDemo(false);
  };

  const playMelodyDemo = async () => {
    if (isPlayingDemo) return;
    setIsPlayingDemo(true);
    const midis = activeMelody.steps.map((s) => s.midi);
    const intervalMs = Math.round((60 / activeMelody.bpm) * 1000);
    await audioEngine.playSequence(midis, intervalMs);
    setIsPlayingDemo(false);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* 1. Learning Mode Selector (When not embedded compactly in lesson exercises) */}
      {!compactOnly && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Compass className="text-indigo-400" size={18} />
                Piano Studio Learning Modes
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Select a pedagogical mode to practice with interactive guidance
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id);
                  setErrorMidi([]);
                  setScaleStep(0);
                  setScaleDone(false);
                  setChordFoundMidi([]);
                  setMelodyStep(0);
                  setMelodyDone(false);
                }}
                className={cn(
                  'flex flex-col items-start p-3 rounded-2xl text-left transition-all border cursor-pointer',
                  mode === tab.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-2 text-sm font-bold mb-1">
                  <span>{tab.icon}</span>
                  <span className={mode === tab.id ? 'text-indigo-300' : 'text-slate-200'}>
                    {tab.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {tab.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Interactive Staff Notation Display */}
      {showStaff && (
        <div className="w-full">
          <StaffNotation
            activeNote={lastPlayedNote}
            targetNote={currentTargetNoteName}
            onNoteClick={(clickedNote) => {
              setLastPlayedNote(clickedNote);
              onNotePlayed?.(clickedNote);
            }}
          />
        </div>
      )}

      {/* 3. Pedagogical Mode Guidance Cards */}
      {!compactOnly && mode !== 'free' && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          {/* GUIDED NOTES MODE */}
          {mode === 'guided-notes' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">Guided Note Discovery</Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    Hits: <strong className="text-amber-400 font-mono">{guidedHits}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Locate and strike the glowing amber key on the keyboard below
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target: <strong className="text-amber-400 font-mono text-sm">{getKeyByMidi(GUIDED_NOTE_TARGETS[guidedIdx])?.note}</strong>
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGuidedIdx((i) => (i + 1) % GUIDED_NOTE_TARGETS.length)}
              >
                Skip Target
              </Button>
            </div>
          )}

          {/* SCALE PRACTICE MODE */}
          {mode === 'scale-practice' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {SCALES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedScaleId(s.id);
                        setScaleStep(0);
                        setScaleDone(false);
                      }}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                        selectedScaleId === s.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playScaleDemo}
                    disabled={isPlayingDemo}
                    icon={<Play size={14} />}
                  >
                    Hear Scale
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setScaleStep(0);
                      setScaleDone(false);
                    }}
                    icon={<RotateCcw size={14} />}
                  >
                    Restart
                  </Button>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Formula:</span>
                    <span className="font-mono text-amber-300 font-bold">{activeScale.formula}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {activeScale.description}
                  </p>
                </div>

                {/* Traversal Step Indicators */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {activeScale.midiSample.map((m, idx) => {
                    const noteKey = getKeyByMidi(m);
                    const isDone = scaleDone || idx < scaleStep;
                    const isCur = !scaleDone && idx === scaleStep;
                    return (
                      <div
                        key={m}
                        className={cn(
                          'flex flex-col items-center justify-center w-10 h-12 rounded-xl text-xs font-mono font-bold border transition-all',
                          isDone && 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
                          isCur && 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-md animate-pulse',
                          !isDone && !isCur && 'bg-slate-900 text-slate-500 border-slate-800'
                        )}
                      >
                        <span>{noteKey?.note}</span>
                        <span className="text-[9px] opacity-80">{activeScale.fingeringsRH[idx]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {scaleDone && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={18} />
                    <span>Scale traversal completed successfully! Excellent thumb tuck technique.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHORD PRACTICE MODE */}
          {mode === 'chord-practice' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {CHORDS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedChordId(c.id);
                        setChordFoundMidi([]);
                      }}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                        selectedChordId === c.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playChordDemo}
                    disabled={isPlayingDemo}
                    icon={<Play size={14} />}
                  >
                    Hear Triad Voicing
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setChordFoundMidi([])}
                    icon={<RotateCcw size={14} />}
                  >
                    Reset Keys
                  </Button>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-indigo-400">{activeChord.quality} Triad</span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{activeChord.formula}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {activeChord.mood}
                  </p>
                </div>

                {/* Triad Notes Status */}
                <div className="flex items-center gap-2">
                  {activeChord.midiNotes.map((m) => {
                    const noteKey = getKeyByMidi(m);
                    const isFound = chordFoundMidi.includes(m);
                    return (
                      <div
                        key={m}
                        className={cn(
                          'flex flex-col items-center justify-center w-12 h-12 rounded-xl text-xs font-mono font-bold border transition-all',
                          isFound
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md'
                            : 'bg-slate-900 text-amber-300 border-amber-500/40 animate-pulse'
                        )}
                      >
                        <span>{noteKey?.note}</span>
                        <span className="text-[9px] opacity-80">{isFound ? 'Hit ✓' : 'Press'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MELODY PRACTICE MODE */}
          {mode === 'melody-practice' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {MELODIES.map((mel) => (
                    <button
                      key={mel.id}
                      type="button"
                      onClick={() => {
                        setSelectedMelodyId(mel.id);
                        setMelodyStep(0);
                        setMelodyDone(false);
                      }}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                        selectedMelodyId === mel.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      )}
                    >
                      {mel.title}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playMelodyDemo}
                    disabled={isPlayingDemo}
                    icon={<Play size={14} />}
                  >
                    Listen to Melody Demo
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setMelodyStep(0);
                      setMelodyDone(false);
                    }}
                    icon={<RotateCcw size={14} />}
                  >
                    Restart Song
                  </Button>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-white">{activeMelody.composer}</span>
                    <span>•</span>
                    <span className="text-indigo-400">{activeMelody.difficulty}</span>
                    <span>•</span>
                    <span>{activeMelody.timeSignature} Meter ({activeMelody.bpm} BPM)</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {activeMelody.description}
                  </p>
                </div>

                {/* Current Song Step Box */}
                {!melodyDone && activeMelody.steps[melodyStep] && (
                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Next Note</p>
                      <p className="text-xs font-mono text-slate-300">
                        Step {melodyStep + 1} of {activeMelody.steps.length}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-bold flex flex-col items-center justify-center font-mono shadow-lg shadow-amber-500/20">
                      <span className="text-base leading-none">{activeMelody.steps[melodyStep].note}</span>
                      {activeMelody.steps[melodyStep].finger && (
                        <span className="text-[10px] font-sans opacity-90">Finger {activeMelody.steps[melodyStep].finger}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {melodyDone && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <Sparkles size={20} />
                    <span>Bravo! You performed {activeMelody.title} from start to finish!</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMelodyStep(0);
                      setMelodyDone(false);
                    }}
                  >
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Dual-Mode Virtual Piano Keybed */}
      <div className="w-full">
        <VirtualPiano88
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          targetMidi={targetMidis}
          highlightedMidi={highlightedMidis}
          matchedMidi={matchedMidis}
          errorMidi={errorMidi}
          onNotePlay={handleNotePlay}
          compactControls={compactOnly}
        />
      </div>
    </div>
  );
};
