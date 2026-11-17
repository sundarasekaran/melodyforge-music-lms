import React, { useState, useEffect, useCallback } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { StaffNotation } from './StaffNotation';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Volume2,
  VolumeX,
  Eye,
  Keyboard as KeyboardIcon,
  ChevronLeft,
  ChevronRight,
  Music,
  Sliders,
} from 'lucide-react';

interface VirtualPianoProps {
  highlightedNote?: string | null;
  targetNotes?: string[];
  onNotePlayed?: (note: string) => void;
  showStaff?: boolean;
}

interface KeyConfig {
  note: string;
  isBlack: boolean;
  keyboardKey?: string;
  name: string;
  octave: number;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({
  highlightedNote,
  targetNotes = [],
  onNotePlayed,
  showStaff = true,
}) => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [baseOctave, setBaseOctave] = useState<number>(3); // Default C3 - B5
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showHotkeys, setShowHotkeys] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastPlayedNote, setLastPlayedNote] = useState<string | null>(null);

  // Generate 3 octaves of piano keys based on baseOctave
  const keys: KeyConfig[] = [];
  const notePattern = [
    { name: 'C', isBlack: false, keyIndex: 0 },
    { name: 'C#', isBlack: true, keyIndex: 0 },
    { name: 'D', isBlack: false, keyIndex: 1 },
    { name: 'D#', isBlack: true, keyIndex: 1 },
    { name: 'E', isBlack: false, keyIndex: 2 },
    { name: 'F', isBlack: false, keyIndex: 3 },
    { name: 'F#', isBlack: true, keyIndex: 3 },
    { name: 'G', isBlack: false, keyIndex: 4 },
    { name: 'G#', isBlack: true, keyIndex: 4 },
    { name: 'A', isBlack: false, keyIndex: 5 },
    { name: 'A#', isBlack: true, keyIndex: 5 },
    { name: 'B', isBlack: false, keyIndex: 6 },
  ];

  // Computer keyboard bindings for the central octave (baseOctave + 1, Middle C octave)
  const whiteHotkeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'];
  const blackHotkeys = ['W', 'E', '', 'T', 'Y', 'U', '', 'O', 'P'];

  for (let oct = baseOctave; oct < baseOctave + 3; oct++) {
    for (const item of notePattern) {
      const fullNote = `${item.name}${oct}`;
      let hotkey: string | undefined = undefined;

      // Assign hotkeys to center octave (C4-B4) and start of Octave 5
      if (oct === baseOctave + 1) {
        if (!item.isBlack) {
          hotkey = whiteHotkeys[item.keyIndex];
        } else {
          hotkey = blackHotkeys[item.keyIndex];
        }
      } else if (oct === baseOctave + 2) {
        if (item.name === 'C') hotkey = 'K';
        if (item.name === 'C#') hotkey = 'O';
        if (item.name === 'D') hotkey = 'L';
        if (item.name === 'D#') hotkey = 'P';
        if (item.name === 'E') hotkey = ';';
      }

      keys.push({
        note: fullNote,
        isBlack: item.isBlack,
        keyboardKey: hotkey,
        name: item.name,
        octave: oct,
      });
    }
  }

  // Handle note press
  const handleNotePress = useCallback(
    (note: string) => {
      if (!isMuted) {
        audioEngine.startNote(note, 0.85);
      }
      setActiveNotes((prev) => new Set(prev).add(note));
      setLastPlayedNote(note);
      if (onNotePlayed) {
        onNotePlayed(note);
      }
    },
    [isMuted, onNotePlayed]
  );

  // Handle note release
  const handleNoteRelease = useCallback(
    (note: string) => {
      if (!isMuted) {
        audioEngine.stopNote(note);
      }
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    },
    [isMuted]
  );

  // Computer keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const pressedKey = e.key.toUpperCase();

      const matchedKey = keys.find((k) => k.keyboardKey === pressedKey);
      if (matchedKey) {
        e.preventDefault();
        handleNotePress(matchedKey.note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const releasedKey = e.key.toUpperCase();

      const matchedKey = keys.find((k) => k.keyboardKey === releasedKey);
      if (matchedKey) {
        e.preventDefault();
        handleNoteRelease(matchedKey.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys, handleNotePress, handleNoteRelease]);

  const whiteKeys = keys.filter((k) => !k.isBlack);

  return (
    <div className="w-full flex flex-col items-center bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Musical Staff Display */}
      {showStaff && (
        <div className="w-full max-w-xl mb-5">
          <StaffNotation activeNote={lastPlayedNote} targetNote={highlightedNote} />
        </div>
      )}

      {/* Control Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-5 text-xs">
        {/* Octave Range Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Octaves:</span>
          <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
            <button
              onClick={() => setBaseOctave((o) => Math.max(1, o - 1))}
              disabled={baseOctave <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Shift down one octave"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-indigo-300 px-3 py-0.5 text-xs">
              C{baseOctave} – B{baseOctave + 2}
            </span>
            <button
              onClick={() => setBaseOctave((o) => Math.min(5, o + 1))}
              disabled={baseOctave >= 5}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Shift up one octave"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View Options & Audio Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              showLabels
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Eye size={14} />
            <span>Note Names</span>
          </button>

          <button
            onClick={() => setShowHotkeys(!showHotkeys)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              showHotkeys
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <KeyboardIcon size={14} />
            <span>Key Bindings</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Piano Keyboard Surface */}
      <div className="relative select-none overflow-x-auto pb-4 max-w-full">
        <div className="piano-keybed relative inline-flex p-3 sm:p-4 rounded-3xl">
          {/* Render White Keys */}
          {whiteKeys.map((k) => {
            const isActive = activeNotes.has(k.note);
            const isTarget = highlightedNote === k.note || targetNotes.includes(k.note);
            const isMiddleC = k.note === 'C4';

            return (
              <div
                key={k.note}
                onMouseDown={() => handleNotePress(k.note)}
                onMouseUp={() => handleNoteRelease(k.note)}
                onMouseLeave={() => activeNotes.has(k.note) && handleNoteRelease(k.note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleNotePress(k.note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleNoteRelease(k.note);
                }}
                className={`piano-white-key relative w-11 sm:w-13 md:w-14 h-48 sm:h-56 md:h-60 rounded-b-xl flex flex-col justify-end items-center pb-3 cursor-pointer select-none ${
                  isActive
                    ? 'is-pressed'
                    : isTarget
                    ? 'ring-4 ring-amber-400 bg-amber-50 animate-pulse'
                    : ''
                }`}
              >
                {/* Middle C Dot Indicator */}
                {isMiddleC && (
                  <div
                    className="absolute top-3 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"
                    title="Middle C (C4)"
                  />
                )}

                {/* Hotkey hint */}
                {showHotkeys && k.keyboardKey && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100/90 px-1.5 py-0.2 rounded mb-1 border border-slate-200">
                    {k.keyboardKey}
                  </span>
                )}

                {/* Note Label */}
                {showLabels && (
                  <span
                    className={`text-xs font-bold tracking-tight ${
                      isMiddleC ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {k.note}
                  </span>
                )}
              </div>
            );
          })}

          {/* Render Black Keys Absolutely Positioned */}
          {keys.map((k, index) => {
            if (!k.isBlack) return null;

            const precedingWhiteKeys = keys.slice(0, index).filter((item) => !item.isBlack).length;
            const leftOffset = `calc(${precedingWhiteKeys} * (100% / ${whiteKeys.length}) - 15px)`;

            const isActive = activeNotes.has(k.note);
            const isTarget = highlightedNote === k.note || targetNotes.includes(k.note);

            return (
              <div
                key={k.note}
                style={{ left: leftOffset }}
                onMouseDown={() => handleNotePress(k.note)}
                onMouseUp={() => handleNoteRelease(k.note)}
                onMouseLeave={() => activeNotes.has(k.note) && handleNoteRelease(k.note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleNotePress(k.note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleNoteRelease(k.note);
                }}
                className={`piano-black-key absolute top-3 sm:top-4 z-10 w-7 sm:w-8 md:w-8.5 h-30 sm:h-34 md:h-36 rounded-b-lg cursor-pointer select-none flex flex-col justify-end items-center pb-2.5 ${
                  isActive
                    ? 'is-pressed'
                    : isTarget
                    ? 'ring-2 ring-amber-400 bg-amber-900 animate-pulse'
                    : ''
                }`}
              >
                {showHotkeys && k.keyboardKey && (
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-800/90 px-1 rounded mb-1">
                    {k.keyboardKey}
                  </span>
                )}
                {showLabels && (
                  <span className="text-[10px] font-bold text-slate-200">{k.name}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
        <Music size={14} className="text-indigo-400" />
        <span>Play keys via mouse click, touch, or computer keyboard shortcuts (A-S-D-F... / W-E-T...)</span>
      </div>
    </div>
  );
};
