/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Dual-Mode Virtual Piano (Compact C3-E5 & Full 88-Key A0-C8)
 * Adapted from PianoVerse for MelodyForge LMS
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Eye,
  Keyboard as KeyboardIcon,
  Sparkles,
} from 'lucide-react';
import {
  KEYBOARD_SHORTCUT_TO_OFFSET,
  PIANO_88_KEYS,
  getKeyByMidi,
  getKeyByNoteName,
  formatNoteLabel,
} from '../../data/pianoNotes';
import { audioEngine, PianoVoice } from '../../audio/AudioEngine';
import { PianoKeyData } from '../../types';
import { cn } from '../../utils/cn';

export interface VirtualPiano88Props {
  /** 'compact' renders C3 to E5 (29 keys); 'full88' renders all 88 keys A0 to C8 */
  viewMode?: 'compact' | 'full88';
  onViewModeChange?: (mode: 'compact' | 'full88') => void;
  /** Custom MIDI bounds for compact view [minMidi, maxMidi]. Default [48, 76] (C3 - E5) */
  midiRange?: [number, number];
  /** Notes highlighted as reference (e.g. scale or chord notes) */
  highlightedMidi?: number[];
  /** Expected target note(s) to hit in guided exercises */
  targetMidi?: number[];
  /** Notes marked as successfully hit */
  matchedMidi?: number[];
  /** Notes that were struck incorrectly */
  errorMidi?: number[];
  /** Note strike callback */
  onNotePlay?: (key: PianoKeyData) => void;
  /** Note release callback */
  onNoteRelease?: (key: PianoKeyData) => void;
  /** Hide top toolbar controls for compact embedded use */
  compactControls?: boolean;
  /** Allow computer keyboard typing */
  enableKeyboardInput?: boolean;
  /** Note label display preference */
  defaultLabels?: 'all' | 'c-only' | 'none';
}

const WHITE_KEY_WIDTH_PX = 42;
const COMPACT_WHITE_KEY_WIDTH_PX = 38;

const OCTAVE_MARKERS = [
  { label: 'A0 (Bass)', midi: 21 },
  { label: 'C1', midi: 24 },
  { label: 'C2', midi: 36 },
  { label: 'C3 (Low)', midi: 48 },
  { label: 'C4 (Mid C)', midi: 60 },
  { label: 'C5 (High)', midi: 72 },
  { label: 'C6', midi: 84 },
  { label: 'C7', midi: 96 },
  { label: 'C8 (Treble)', midi: 108 },
];

export const VirtualPiano88: React.FC<VirtualPiano88Props> = ({
  viewMode = 'compact',
  onViewModeChange,
  midiRange = [48, 76], // C3 to E5 (29 keys)
  highlightedMidi = [],
  targetMidi = [],
  matchedMidi = [],
  errorMidi = [],
  onNotePlay,
  onNoteRelease,
  compactControls = false,
  enableKeyboardInput = true,
  defaultLabels = 'c-only',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [activeMidis, setActiveMidis] = useState<Set<number>>(new Set());
  const [labelMode, setLabelMode] = useState<'all' | 'c-only' | 'none'>(defaultLabels);
  const [keyboardBaseOctave, setKeyboardBaseOctave] = useState<number>(4); // C4 = 60
  const [voice, setVoice] = useState<PianoVoice>(audioEngine.getVoice());
  const [sustain, setSustain] = useState<boolean>(audioEngine.getSustain());
  const [muted, setMuted] = useState<boolean>(audioEngine.isMuted());
  const [volume, setVolume] = useState<number>(audioEngine.getVolume());
  const [lastPlayedKey, setLastPlayedKey] = useState<PianoKeyData | null>(null);

  // Synchronize with AudioEngine changes
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setVoice(audioEngine.getVoice());
      setSustain(audioEngine.getSustain());
      setMuted(audioEngine.isMuted());
      setVolume(audioEngine.getVolume());
    });
    return unsub;
  }, []);

  // Filter keys according to active view mode
  const keysToRender = useMemo(() => {
    if (viewMode === 'full88') return PIANO_88_KEYS;
    return PIANO_88_KEYS.filter((k) => k.midi >= midiRange[0] && k.midi <= midiRange[1]);
  }, [viewMode, midiRange]);

  const whiteKeys = useMemo(() => keysToRender.filter((k) => !k.isBlack), [keysToRender]);
  const blackKeys = useMemo(() => keysToRender.filter((k) => k.isBlack), [keysToRender]);

  // Index map of white keys for alignment
  const whiteIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    whiteKeys.forEach((wk, idx) => map.set(wk.midi, idx));
    return map;
  }, [whiteKeys]);

  const whiteWidth = viewMode === 'full88' ? WHITE_KEY_WIDTH_PX : COMPACT_WHITE_KEY_WIDTH_PX;
  const blackWidth = Math.round(whiteWidth * 0.62);
  const totalKeybedWidth = whiteKeys.length * whiteWidth;

  // Scroll to specified MIDI note on 88-key layout
  const scrollToMidi = useCallback(
    (targetMidiNote: number, behavior: ScrollBehavior = 'smooth') => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const key = getKeyByMidi(targetMidiNote);
      if (!key) return;
      const idx = whiteIndexMap.get(key.isBlack ? key.midi - 1 : key.midi) ?? key.whiteIndex;
      const targetCenter = idx * whiteWidth - container.clientWidth / 2 + whiteWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetCenter),
        behavior,
      });
    },
    [whiteIndexMap, whiteWidth]
  );

  // Auto-center on Middle C when full 88-key view is opened
  useEffect(() => {
    if (viewMode === 'full88') {
      const timer = setTimeout(() => scrollToMidi(60, 'auto'), 80);
      return () => clearTimeout(timer);
    }
  }, [viewMode, scrollToMidi]);

  // Note strike handler
  const handleKeyStrike = useCallback(
    (key: PianoKeyData) => {
      audioEngine.unlockSync();
      audioEngine.startNote(key.midi);
      setLastPlayedKey(key);

      setActiveMidis((prev) => {
        const next = new Set(prev);
        next.add(key.midi);
        return next;
      });

      onNotePlay?.(key);
    },
    [onNotePlay]
  );

  // Note release handler
  const handleKeyRelease = useCallback(
    (key: PianoKeyData) => {
      audioEngine.stopNote(key.midi);

      setActiveMidis((prev) => {
        if (!prev.has(key.midi)) return prev;
        const next = new Set(prev);
        next.delete(key.midi);
        return next;
      });

      onNoteRelease?.(key);
    },
    [onNoteRelease]
  );

  // Computer keyboard bindings
  useEffect(() => {
    if (!enableKeyboardInput) return;
    const downKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Spacebar toggles sustain pedal
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) {
          const next = !audioEngine.getSustain();
          audioEngine.setSustain(next);
        }
        return;
      }

      const lower = e.key.toLowerCase();
      // 'Z' and 'X' shift keyboard octave
      if (lower === 'z' && !e.repeat) {
        setKeyboardBaseOctave((o) => Math.max(1, o - 1));
        return;
      }
      if (lower === 'x' && !e.repeat) {
        setKeyboardBaseOctave((o) => Math.min(6, o + 1));
        return;
      }

      const offset = KEYBOARD_SHORTCUT_TO_OFFSET[lower];
      if (offset === undefined || downKeys.has(lower)) return;
      downKeys.add(lower);

      const baseC = (keyboardBaseOctave + 1) * 12; // C4 = 60
      const midi = baseC + offset;
      const keyObj = getKeyByMidi(midi);
      if (keyObj) {
        e.preventDefault();
        handleKeyStrike(keyObj);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const lower = e.key.toLowerCase();
      if (!downKeys.has(lower)) return;
      downKeys.delete(lower);

      const offset = KEYBOARD_SHORTCUT_TO_OFFSET[lower];
      if (offset === undefined) return;
      const baseC = (keyboardBaseOctave + 1) * 12;
      const keyObj = getKeyByMidi(baseC + offset);
      if (keyObj) {
        e.preventDefault();
        handleKeyRelease(keyObj);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableKeyboardInput, keyboardBaseOctave, handleKeyStrike, handleKeyRelease]);

  // Reverse shortcut lookup for the active keyboardBaseOctave
  const shortcutForMidi = useMemo(() => {
    const map = new Map<number, string>();
    const baseC = (keyboardBaseOctave + 1) * 12;
    Object.entries(KEYBOARD_SHORTCUT_TO_OFFSET).forEach(([char, offset]) => {
      map.set(baseC + offset, char.toUpperCase());
    });
    return map;
  }, [keyboardBaseOctave]);

  const highlightedSet = useMemo(() => new Set(highlightedMidi), [highlightedMidi]);
  const targetSet = useMemo(() => new Set(targetMidi), [targetMidi]);
  const matchedSet = useMemo(() => new Set(matchedMidi), [matchedMidi]);
  const errorSet = useMemo(() => new Set(errorMidi), [errorMidi]);

  return (
    <div className="w-full flex flex-col rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden select-none">
      {/* Top Toolbar Controls */}
      {!compactControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/70 border-b border-slate-800 text-xs">
          {/* Left: View Mode Toggle & Octave Shifts */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => onViewModeChange?.('compact')}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                  viewMode === 'compact'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Compact (C3–E5)
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange?.('full88')}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                  viewMode === 'full88'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Full 88-Key (A0–C8)
              </button>
            </div>

            {/* Timbre Voice Selector */}
            <div className="flex items-center gap-1 bg-slate-900 rounded-xl border border-slate-800 p-0.5">
              {(
                [
                  { id: 'grand', label: 'Grand Piano' },
                  { id: 'electric', label: 'Electric' },
                  { id: 'harpsichord', label: 'Harpsichord' },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => audioEngine.setVoice(v.id)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer',
                    voice === v.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Sustain Pedal Toggle */}
            <button
              type="button"
              onClick={() => audioEngine.setSustain(!sustain)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer',
                sustain
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              )}
              title="Hold pedal down to let struck strings resonate freely (Hotkey: Spacebar)"
            >
              <span className={cn('w-2 h-2 rounded-full', sustain ? 'bg-amber-400 animate-ping' : 'bg-slate-600')} />
              <span>Sustain Pedal</span>
            </button>
          </div>

          {/* Right: Labels, Volume, and Info */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Label Mode */}
            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
              {(
                [
                  { id: 'all', label: 'All Notes' },
                  { id: 'c-only', label: 'C Keys Only' },
                  { id: 'none', label: 'Blank' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLabelMode(opt.id)}
                  className={cn(
                    'px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer',
                    labelMode === opt.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Octave Shifter for Computer Typing */}
            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setKeyboardBaseOctave((o) => Math.max(1, o - 1))}
                disabled={keyboardBaseOctave <= 1}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Shift keyboard keys down one octave (Hotkey: Z)"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono font-bold text-indigo-300 px-2 text-[11px]">
                Octave: C{keyboardBaseOctave}
              </span>
              <button
                type="button"
                onClick={() => setKeyboardBaseOctave((o) => Math.min(6, o + 1))}
                disabled={keyboardBaseOctave >= 6}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Shift keyboard keys up one octave (Hotkey: X)"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Volume & Mute */}
            <div className="flex items-center gap-1.5 bg-slate-900 rounded-xl border border-slate-800 px-2.5 py-1">
              <button
                type="button"
                onClick={() => audioEngine.setMuted(!muted)}
                className="text-slate-400 hover:text-white cursor-pointer"
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (muted) audioEngine.setMuted(false);
                  audioEngine.setVolume(val);
                }}
                className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mini-Map / Quick Register Overview for 88-Key Mode */}
      {viewMode === 'full88' && (
        <div className="flex items-center justify-between gap-1 px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
            Quick Jump:
          </span>
          <div className="flex items-center gap-1.5">
            {OCTAVE_MARKERS.map((om) => (
              <button
                key={om.midi}
                type="button"
                onClick={() => scrollToMidi(om.midi)}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-indigo-600/80 text-slate-300 hover:text-white font-mono transition-colors cursor-pointer shrink-0"
              >
                {om.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Piano Keybed Surface */}
      <div
        ref={scrollContainerRef}
        className={cn(
          'relative w-full overflow-x-auto select-none p-3 sm:p-5 flex justify-start sm:justify-center',
          viewMode === 'full88' && 'justify-start'
        )}
        style={{
          touchAction: 'pan-x',
          paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
        }}
      >
        <div
          className="piano-keybed relative rounded-3xl"
          style={{ width: `${totalKeybedWidth}px`, height: '260px' }}
        >
          {/* 1. Render White Keys */}
          {whiteKeys.map((k, idx) => {
            const isActive = activeMidis.has(k.midi);
            const isTarget = targetSet.has(k.midi);
            const isHighlighted = highlightedSet.has(k.midi);
            const isMatched = matchedSet.has(k.midi);
            const isError = errorSet.has(k.midi);
            const isMiddleC = k.midi === 60;

            const shortcut = shortcutForMidi.get(k.midi);

            const showLabel =
              labelMode === 'all' || (labelMode === 'c-only' && k.pitchClass === 'C');

            return (
              <div
                key={k.midi}
                data-midi={k.midi}
                style={{
                  left: `${idx * whiteWidth}px`,
                  width: `${whiteWidth}px`,
                }}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeyStrike(k);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleKeyRelease(k);
                }}
                onPointerLeave={() => {
                  if (activeMidis.has(k.midi)) handleKeyRelease(k);
                }}
                onPointerCancel={() => {
                  if (activeMidis.has(k.midi)) handleKeyRelease(k);
                }}
                className={cn(
                  'piano-white-key absolute top-0 bottom-0 rounded-b-xl flex flex-col justify-end items-center pb-3 cursor-pointer select-none transition-transform duration-75',
                  isActive && 'is-pressed',
                  isTarget && !isActive && 'ring-4 ring-amber-400 bg-amber-50 animate-pulse',
                  isHighlighted && !isActive && !isTarget && 'bg-indigo-50/90 border-indigo-400',
                  isMatched && 'ring-4 ring-emerald-500 bg-emerald-50',
                  isError && 'ring-4 ring-rose-500 bg-rose-100 animate-bounce'
                )}
              >
                {/* Middle C Dot Indicator */}
                {isMiddleC && (
                  <div
                    className="absolute top-3 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"
                    title="Middle C (C4)"
                  />
                )}

                {/* Keyboard Shortcut badge */}
                {shortcut && (
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200/90 px-1.5 py-0.2 rounded mb-1 border border-slate-300 font-semibold">
                    {shortcut}
                  </span>
                )}

                {/* Note Label */}
                {showLabel && (
                  <span
                    className={cn(
                      'text-xs font-bold tracking-tight',
                      isMiddleC ? 'text-rose-600' : 'text-slate-800'
                    )}
                  >
                    {k.note}
                  </span>
                )}
              </div>
            );
          })}

          {/* 2. Render Black Keys (Positioned absolutely over white key seams) */}
          {blackKeys.map((k) => {
            const leftWhiteIndex = whiteIndexMap.get(k.midi - 1);
            if (leftWhiteIndex === undefined) return null;

            const leftPx = leftWhiteIndex * whiteWidth + whiteWidth - Math.round(blackWidth / 2);

            const isActive = activeMidis.has(k.midi);
            const isTarget = targetSet.has(k.midi);
            const isHighlighted = highlightedSet.has(k.midi);
            const isMatched = matchedSet.has(k.midi);
            const isError = errorSet.has(k.midi);

            const shortcut = shortcutForMidi.get(k.midi);

            return (
              <div
                key={k.midi}
                data-midi={k.midi}
                style={{
                  left: `${leftPx}px`,
                  width: `${blackWidth}px`,
                  height: '148px',
                }}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeyStrike(k);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleKeyRelease(k);
                }}
                onPointerLeave={() => {
                  if (activeMidis.has(k.midi)) handleKeyRelease(k);
                }}
                onPointerCancel={() => {
                  if (activeMidis.has(k.midi)) handleKeyRelease(k);
                }}
                className={cn(
                  'piano-black-key absolute top-0 z-20 rounded-b-lg cursor-pointer select-none flex flex-col justify-end items-center pb-2.5 transition-transform duration-75',
                  isActive && 'is-pressed',
                  isTarget && !isActive && 'ring-2 ring-amber-400 bg-amber-900 animate-pulse',
                  isHighlighted && !isActive && !isTarget && 'ring-2 ring-indigo-400 bg-indigo-950',
                  isMatched && 'ring-2 ring-emerald-400 bg-emerald-950',
                  isError && 'ring-2 ring-rose-500 bg-rose-950'
                )}
              >
                {shortcut && (
                  <span className="text-[9px] font-mono text-slate-300 bg-slate-800/90 px-1 rounded mb-1 font-semibold">
                    {shortcut}
                  </span>
                )}
                {labelMode === 'all' && (
                  <span className="text-[9px] font-bold text-slate-200">{k.pitchClass}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Last Note Played */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span>
            {viewMode === 'full88'
              ? 'Full 88-Key Concert Grand (A0 to C8). Scroll or click quick jump markers.'
              : 'Compact 29-Key View (C3 to E5). Touch-optimized for phones and tablets.'}
          </span>
        </div>

        {lastPlayedKey && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-indigo-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            <span>Struck:</span>
            <span className="font-bold text-amber-400">{formatNoteLabel(lastPlayedKey)}</span>
            <span className="text-slate-500">({lastPlayedKey.frequency} Hz)</span>
          </div>
        )}
      </div>
    </div>
  );
};
