import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import {
  clampBpm,
  calculateTapBpm,
  getTempoMarking,
  TEMPO_MARKINGS,
} from '../../data/pianoPracticeRoutines';
import { cn } from '../../utils/cn';

export interface ConservatoryMetronomeProps {
  initialBpm?: number;
  initialTimeSignature?: '4/4' | '3/4';
  onBpmChange?: (bpm: number) => void;
  onTimeSignatureChange?: (timeSignature: '4/4' | '3/4') => void;
  onBeat?: (beatNumber: number, measureNumber: number) => void;
  compact?: boolean;
  className?: string;
}

interface ScheduledBeat {
  beat: number;
  measure: number;
  time: number;
}

export const ConservatoryMetronome: React.FC<ConservatoryMetronomeProps> = ({
  initialBpm = 80,
  initialTimeSignature = '4/4',
  onBpmChange,
  onTimeSignatureChange,
  onBeat,
  compact = false,
  className,
}) => {
  // Tempo & Meter
  const [bpm, setBpmState] = useState<number>(() => clampBpm(initialBpm));
  const [timeSignature, setTimeSignatureState] = useState<'4/4' | '3/4'>(initialTimeSignature);
  const [manualInput, setManualInput] = useState<string>(String(initialBpm));

  // Audio & State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Counters
  const [currentBeat, setCurrentBeat] = useState<number>(0); // 1..beatsPerMeasure or 0 when stopped
  const [measureCount, setMeasureCount] = useState<number>(1);
  const [showPresets, setShowPresets] = useState<boolean>(false);

  // Tap-tempo tracking
  const [tapActive, setTapActive] = useState<boolean>(false);
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<number | null>(null);

  // References for the high-precision Web Audio lookahead loop
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const timeSignatureRef = useRef(timeSignature);
  timeSignatureRef.current = timeSignature;

  const beatsPerMeasure = timeSignature === '4/4' ? 4 : 3;
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  beatsPerMeasureRef.current = beatsPerMeasure;

  const volumeRef = useRef(volume);
  volumeRef.current = isMuted ? 0 : volume;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isRunningRef = useRef(false);
  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatIndexRef = useRef<number>(0); // 0..beatsPerMeasure-1
  const currentMeasureRef = useRef<number>(1);
  const schedulerTimerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const notesQueueRef = useRef<ScheduledBeat[]>([]);

  // Update BPM with validation and notification
  const setBpm = useCallback(
    (newBpm: number) => {
      const clamped = clampBpm(newBpm);
      setBpmState(clamped);
      setManualInput(String(clamped));
      if (onBpmChange) onBpmChange(clamped);
    },
    [onBpmChange]
  );

  // Update Time Signature
  const setTimeSignature = useCallback(
    (sig: '4/4' | '3/4') => {
      setTimeSignatureState(sig);
      if (onTimeSignatureChange) onTimeSignatureChange(sig);
    },
    [onTimeSignatureChange]
  );

  // Tap Tempo Handler
  const handleTap = () => {
    const now = Date.now();
    setTapActive(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => setTapActive(false), 200);

    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      // Reset if user stopped tapping for >2.5s
      taps.length = 0;
    }

    taps.push(now);
    if (taps.length > 4) {
      taps.shift();
    }

    if (taps.length >= 2) {
      const calculated = calculateTapBpm(taps);
      setBpm(calculated);
    }
  };

  // High-precision Web Audio lookahead scheduler
  const scheduleNote = (beat: number, measure: number, time: number) => {
    // 1. Add to visual queue
    notesQueueRef.current.push({ beat, measure, time });

    // 2. Schedule audio click at sample-accurate time
    const isDownbeat = beat === 1;
    if (!isMutedRef.current && volumeRef.current > 0) {
      audioEngine.scheduleMetronomeClick(time, isDownbeat, volumeRef.current);
    }
  };

  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatIndexRef.current += 1;
    if (currentBeatIndexRef.current >= beatsPerMeasureRef.current) {
      currentBeatIndexRef.current = 0;
      currentMeasureRef.current += 1;
    }
  };

  const scheduler = useCallback(() => {
    if (!isRunningRef.current) return;
    const lookaheadSec = 0.1; // 100ms lookahead
    const currentTime = audioEngine.getAudioContextTime();

    while (nextNoteTimeRef.current < currentTime + lookaheadSec) {
      const beatNumber = currentBeatIndexRef.current + 1;
      scheduleNote(beatNumber, currentMeasureRef.current, nextNoteTimeRef.current);
      nextNote();
    }
  }, []);

  // Visual synchronization loop
  const updateVisuals = useCallback(() => {
    if (!isRunningRef.current && notesQueueRef.current.length === 0) return;

    const currentTime = audioEngine.getAudioContextTime();
    while (notesQueueRef.current.length > 0 && notesQueueRef.current[0].time <= currentTime) {
      const current = notesQueueRef.current.shift()!;
      setCurrentBeat(current.beat);
      setMeasureCount(current.measure);
      if (onBeat) {
        onBeat(current.beat, current.measure);
      }
    }

    animFrameRef.current = requestAnimationFrame(updateVisuals);
  }, [onBeat]);

  // Start metronome
  const handleStart = () => {
    audioEngine.unlockSync();
    isRunningRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);

    if (currentBeatIndexRef.current === 0 && notesQueueRef.current.length === 0) {
      currentMeasureRef.current = 1;
      setMeasureCount(1);
    }

    nextNoteTimeRef.current = audioEngine.getAudioContextTime() + 0.05;
    notesQueueRef.current = [];

    // Run scheduler check every 25ms
    schedulerTimerRef.current = window.setInterval(scheduler, 25);
    animFrameRef.current = requestAnimationFrame(updateVisuals);
  };

  // Pause metronome
  const handlePause = () => {
    isRunningRef.current = false;
    setIsPaused(true);
    if (schedulerTimerRef.current) {
      clearInterval(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  // Resume metronome
  const handleResume = () => {
    handleStart();
  };

  // Stop metronome completely
  const handleStop = () => {
    isRunningRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentBeat(0);
    currentBeatIndexRef.current = 0;
    currentMeasureRef.current = 1;
    setMeasureCount(1);
    notesQueueRef.current = [];

    if (schedulerTimerRef.current) {
      clearInterval(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (schedulerTimerRef.current) clearInterval(schedulerTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  const tempoInfo = getTempoMarking(bpm);

  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-800 bg-slate-900/95 p-5 sm:p-6 text-white shadow-2xl transition-all',
        className
      )}
    >
      {/* Top Bar: Title & Time Signature & Audio Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Conservatory Metronome
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Lock onto a sample-accurate acoustic click in {timeSignature} meter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Signature Selector */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            {(['4/4', '3/4'] as const).map((sig) => (
              <button
                key={sig}
                type="button"
                onClick={() => setTimeSignature(sig)}
                className={cn(
                  'rounded-lg px-3 py-1 font-mono text-xs font-bold transition-all cursor-pointer',
                  timeSignature === sig
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {sig}
              </button>
            ))}
          </div>

          {/* Mute Button */}
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            aria-label={isMuted ? 'Unmute Metronome' : 'Mute Metronome'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 transition-colors cursor-pointer',
              isMuted ? 'text-rose-400' : 'text-slate-300 hover:text-white'
            )}
            title={isMuted ? 'Unmute Metronome' : 'Mute Metronome'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Presets Toggle */}
          <button
            type="button"
            onClick={() => setShowPresets((s) => !s)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 transition-colors cursor-pointer',
              showPresets ? 'text-amber-400 border-amber-400/50' : 'text-slate-400 hover:text-white'
            )}
            title="Tempo Presets"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preset Drawer */}
      {showPresets && (
        <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 animate-in fade-in duration-150">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Standard Italian Tempo Markings
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TEMPO_MARKINGS.map((tm) => {
              const midBpm = Math.round((tm.min + tm.max) / 2);
              const isSelected = bpm >= tm.min && bpm <= tm.max;
              return (
                <button
                  key={tm.marking}
                  type="button"
                  onClick={() => setBpm(midBpm)}
                  className={cn(
                    'p-2 rounded-xl border text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-amber-400/70 bg-amber-400/10 text-amber-300'
                      : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  )}
                >
                  <div className="font-semibold text-xs">{tm.marking}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{tm.min}–{tm.max} BPM</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Beat Visual Indicator & Big Tempo Readout */}
      <div className="mt-5 rounded-2xl bg-slate-950 border border-slate-800/90 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Animated Beat Bulbs */}
          <div className="flex items-center gap-3">
            {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
              const beatNumber = idx + 1;
              const isLit = isPlaying && !isPaused && currentBeat === beatNumber;
              const isDownbeat = beatNumber === 1;

              return (
                <div
                  key={beatNumber}
                  className={cn(
                    'relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl font-mono text-xl sm:text-2xl font-extrabold transition-all duration-75',
                    isLit
                      ? isDownbeat
                        ? 'scale-110 border-2 border-amber-400 bg-amber-400 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.55)]'
                        : 'scale-105 border-2 border-indigo-400 bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.45)]'
                      : 'border border-slate-800 bg-slate-900/80 text-slate-500'
                  )}
                >
                  <span>{beatNumber}</span>
                  {isDownbeat && (
                    <span className="absolute -top-2 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-slate-950 px-1 rounded border border-amber-400/30">
                      Down
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tempo Readout & Italian Marking */}
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                min={40}
                max={208}
                value={manualInput}
                onChange={(e) => {
                  setManualInput(e.target.value);
                  const parsed = parseInt(e.target.value, 10);
                  if (!isNaN(parsed) && parsed >= 40 && parsed <= 208) {
                    setBpm(parsed);
                  }
                }}
                onBlur={() => {
                  const parsed = parseInt(manualInput, 10);
                  if (isNaN(parsed) || parsed < 40) {
                    setBpm(40);
                  } else if (parsed > 208) {
                    setBpm(208);
                  } else {
                    setBpm(parsed);
                  }
                }}
                className="w-24 bg-transparent font-mono text-4xl sm:text-5xl font-black text-amber-400 text-center sm:text-right focus:outline-none focus:border-b-2 focus:border-amber-400"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                BPM
              </span>
            </div>
            <div className="mt-1">
              <span className="font-semibold text-xs sm:text-sm text-slate-200">
                {tempoInfo.marking}
              </span>
              <span className="ml-2 text-[11px] text-slate-500 hidden sm:inline">
                ({tempoInfo.description})
              </span>
            </div>
          </div>
        </div>

        {/* Counters & Measure Indicator */}
        <div className="mt-4 pt-4 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div>
              Beat:{' '}
              <strong className="text-white font-mono">
                {currentBeat > 0 ? `${currentBeat} / ${beatsPerMeasure}` : '—'}
              </strong>
            </div>
            <div>
              Measure:{' '}
              <strong className="text-white font-mono">
                {isPlaying ? measureCount : '—'}
              </strong>
            </div>
          </div>

          {isPlaying && (
            <button
              type="button"
              onClick={() => {
                currentMeasureRef.current = 1;
                setMeasureCount(1);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Measure
            </button>
          )}
        </div>
      </div>

      {/* BPM Controls: Slider + Increment/Decrement Buttons + Tap Tempo */}
      <div className="mt-5 space-y-4">
        {/* Slider & Step Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setBpm(bpm - 4)}
            aria-label="Decrease tempo by 4 BPM"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>

          <input
            type="range"
            min={40}
            max={208}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            aria-label="Tempo Slider"
            className="flex-1 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <button
            type="button"
            onClick={() => setBpm(bpm + 4)}
            aria-label="Increase tempo by 4 BPM"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Action Controls: Start/Pause/Stop & Tap-Tempo & Volume Slider */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Main Transport Controls */}
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Metronome
              </button>
            ) : isPaused ? (
              <>
                <button
                  type="button"
                  onClick={handleResume}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-300 transition-all cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Resume
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePause}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}

            {/* Tap Tempo Button */}
            <button
              type="button"
              onClick={handleTap}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer',
                tapActive
                  ? 'border-amber-400 bg-amber-400 text-slate-950 scale-95 shadow-md shadow-amber-400/30'
                  : 'text-slate-300 hover:text-white hover:border-slate-700'
              )}
              title="Tap continuously to calculate tempo"
            >
              <Sparkles className="h-3.5 w-3.5" />
              TAP TEMPO
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Volume:</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVol = Number(e.target.value);
                setVolume(newVol);
                if (isMuted && newVol > 0) setIsMuted(false);
              }}
              aria-label="Metronome volume"
              className="w-20 sm:w-28 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-xs font-mono text-slate-400 w-8 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
