import React, { useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { Volume2, Sparkles, Compass } from 'lucide-react';

interface StaffNotationProps {
  activeNote?: string | null;
  targetNote?: string | null;
  onNoteClick?: (note: string) => void;
  interactive?: boolean;
}

interface StaffPitch {
  note: string;
  name: string;
  octave: number;
  clefLabel: string;
  y: number;
  hasLedger: boolean;
  stemUp: boolean;
  midi: number;
}

// Diatonic Treble Staff explorer pitches from Middle C (C4) up to High C (C6)
const EXPLORER_PITCHES: StaffPitch[] = [
  { note: 'C4', name: 'C', octave: 4, clefLabel: 'Middle C · Ledger Line', y: 88, hasLedger: true, stemUp: true, midi: 60 },
  { note: 'D4', name: 'D', octave: 4, clefLabel: 'Space Below Line 1', y: 83, hasLedger: false, stemUp: true, midi: 62 },
  { note: 'E4', name: 'E', octave: 4, clefLabel: 'Line 1 (Bottom Line)', y: 78, hasLedger: false, stemUp: true, midi: 64 },
  { note: 'F4', name: 'F', octave: 4, clefLabel: 'Space 1', y: 73, hasLedger: false, stemUp: true, midi: 65 },
  { note: 'G4', name: 'G', octave: 4, clefLabel: 'Line 2 (Treble G Line)', y: 68, hasLedger: false, stemUp: true, midi: 67 },
  { note: 'A4', name: 'A', octave: 4, clefLabel: 'Space 2', y: 63, hasLedger: false, stemUp: true, midi: 69 },
  { note: 'B4', name: 'B', octave: 4, clefLabel: 'Line 3 (Center Line)', y: 58, hasLedger: false, stemUp: false, midi: 71 },
  { note: 'C5', name: 'C', octave: 5, clefLabel: 'Space 3', y: 53, hasLedger: false, stemUp: false, midi: 72 },
  { note: 'D5', name: 'D', octave: 5, clefLabel: 'Line 4', y: 48, hasLedger: false, stemUp: false, midi: 74 },
  { note: 'E5', name: 'E', octave: 5, clefLabel: 'Space 4 (Top Space)', y: 43, hasLedger: false, stemUp: false, midi: 76 },
  { note: 'F5', name: 'F', octave: 5, clefLabel: 'Line 5 (Top Line)', y: 38, hasLedger: false, stemUp: false, midi: 77 },
  { note: 'G5', name: 'G', octave: 5, clefLabel: 'Space Above Staff', y: 33, hasLedger: false, stemUp: false, midi: 79 },
  { note: 'A5', name: 'A', octave: 5, clefLabel: 'Ledger Line Above', y: 28, hasLedger: true, stemUp: false, midi: 81 },
  { note: 'B5', name: 'B', octave: 5, clefLabel: 'Space Above Ledger', y: 23, hasLedger: false, stemUp: false, midi: 83 },
  { note: 'C6', name: 'C', octave: 6, clefLabel: 'High C · 2nd Ledger', y: 18, hasLedger: true, stemUp: false, midi: 84 },
];

export const StaffNotation: React.FC<StaffNotationProps> = ({
  activeNote,
  targetNote,
  onNoteClick,
  interactive = true,
}) => {
  const [hoveredPitch, setHoveredPitch] = useState<StaffPitch | null>(null);

  // Mapping notes to vertical positions on Treble Clef
  const getNoteY = (noteStr: string): { y: number; hasLedger: boolean; accidental?: string; stemUp: boolean } | null => {
    const match = noteStr.match(/^([A-G])([#b]?)(-?\d+)$/);
    if (!match) return null;
    const [, name, acc, octStr] = match;
    const octave = parseInt(octStr, 10);

    const positions: Record<string, number> = {
      C4: 88,
      D4: 83,
      E4: 78,
      F4: 73,
      G4: 68,
      A4: 63,
      B4: 58,
      C5: 53,
      D5: 48,
      E5: 43,
      F5: 38,
      G5: 33,
      A5: 28,
      B5: 23,
      C6: 18,
    };

    const naturalKey = `${name}${octave}`;
    const y = positions[naturalKey] ?? (octave < 4 ? 93 : 15);
    const hasLedger = naturalKey === 'C4' || naturalKey === 'A5' || naturalKey === 'C6';
    // Musical engraving rule: Notes below B4 have stems pointing UP; notes on or above B4 have stems pointing DOWN
    const stemUp = y >= 58;

    return { y, hasLedger, accidental: acc || undefined, stemUp };
  };

  const activePos = activeNote ? getNoteY(activeNote) : null;
  const targetPos = targetNote ? getNoteY(targetNote) : null;

  const handleStaffNoteClick = (pitch: StaffPitch) => {
    audioEngine.playQuickNote(pitch.note, 500);
    if (onNoteClick) {
      onNoteClick(pitch.note);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col items-center select-none">
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between w-full px-2 mb-3 text-xs text-slate-400 font-semibold gap-2">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm shadow-indigo-500/50" />
          <span>Interactive Treble Clef (𝄞)</span>
          {interactive && (
            <span className="hidden sm:inline-block text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Click notes to play & map
            </span>
          )}
        </span>

        <div className="flex items-center gap-3">
          {hoveredPitch && (
            <span className="text-indigo-300 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
              {hoveredPitch.note} ({hoveredPitch.clefLabel})
            </span>
          )}
          {targetNote && (
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              Target: <span className="bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/30">{targetNote}</span>
            </span>
          )}
          {activeNote && (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              Playing: <span className="bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/30">{activeNote}</span>
            </span>
          )}
        </div>
      </div>

      {/* SVG Treble Staff */}
      <svg viewBox="0 0 540 130" className="w-full max-w-2xl h-28 sm:h-32 overflow-visible select-none">
        {/* Subtle Staff Plate */}
        <rect x="0" y="6" width="540" height="114" fill="#0A0F1D" rx="16" stroke="#1E293B" strokeWidth="1" />

        {/* 5 Treble Staff Lines */}
        <line x1="25" y1="38" x2="515" y2="38" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="48" x2="515" y2="48" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="58" x2="515" y2="58" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="68" x2="515" y2="68" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="78" x2="515" y2="78" stroke="#334155" strokeWidth="1.5" />

        {/* Treble Clef Glyph Symbol */}
        <text x="32" y="78" fill="#94A3B8" fontSize="56" fontFamily="serif" fontWeight="bold">
          𝄞
        </text>

        {/* 4/4 Time Signature */}
        <text x="74" y="56" fill="#64748B" fontSize="20" fontWeight="bold" fontFamily="sans-serif">4</text>
        <text x="74" y="76" fill="#64748B" fontSize="20" fontWeight="bold" fontFamily="sans-serif">4</text>

        {/* Interactive Clickable Pitch Track (Middle C4 to C5 across staff) */}
        {interactive && (
          <g className="cursor-pointer">
            {EXPLORER_PITCHES.slice(0, 8).map((p, idx) => {
              const cx = 115 + idx * 38;
              const isHovered = hoveredPitch?.note === p.note;
              const isActive = activeNote === p.note;

              return (
                <g
                  key={p.note}
                  onClick={() => handleStaffNoteClick(p)}
                  onMouseEnter={() => setHoveredPitch(p)}
                  onMouseLeave={() => setHoveredPitch(null)}
                  className="transition-transform duration-75 group"
                >
                  {/* Ledger Line for C4 */}
                  {p.hasLedger && (
                    <line x1={cx - 14} y1={p.y} x2={cx + 14} y2={p.y} stroke={isHovered ? '#818CF8' : '#475569'} strokeWidth="1.8" />
                  )}

                  {/* Note head */}
                  <ellipse
                    cx={cx}
                    cy={p.y}
                    rx="8"
                    ry="6"
                    fill={isActive ? '#10B981' : isHovered ? '#818CF8' : '#1E293B'}
                    stroke={isActive ? '#10B981' : isHovered ? '#A5B4FC' : '#64748B'}
                    strokeWidth="1.5"
                    transform={`rotate(-20 ${cx} ${p.y})`}
                  />

                  {/* Stem */}
                  {p.stemUp ? (
                    <line x1={cx + 7} y1={p.y - 2} x2={cx + 7} y2={p.y - 26} stroke={isHovered ? '#818CF8' : '#475569'} strokeWidth="1.5" />
                  ) : (
                    <line x1={cx - 7} y1={p.y + 2} x2={cx - 7} y2={p.y + 26} stroke={isHovered ? '#818CF8' : '#475569'} strokeWidth="1.5" />
                  )}

                  {/* Pitch label below note */}
                  <text
                    x={cx}
                    y={108}
                    fill={isHovered ? '#A5B4FC' : '#64748B'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Target Guide Note (Dashed / Ghost) */}
        {targetPos && (
          <g opacity="0.75" className="animate-pulse">
            {targetPos.hasLedger && (
              <line x1="425" y1={targetPos.y} x2="465" y2={targetPos.y} stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
            )}
            <ellipse
              cx="445"
              cy={targetPos.y}
              rx="9"
              ry="6.5"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              transform={`rotate(-22 445 ${targetPos.y})`}
            />
            {targetPos.stemUp ? (
              <line x1="453" y1={targetPos.y - 2} x2="453" y2={targetPos.y - 32} stroke="#F59E0B" strokeWidth="2" />
            ) : (
              <line x1="437" y1={targetPos.y + 2} x2="437" y2={targetPos.y + 32} stroke="#F59E0B" strokeWidth="2" />
            )}
            {targetPos.accidental && (
              <text x="427" y={targetPos.y + 5} fill="#F59E0B" fontSize="18" fontWeight="bold">
                {targetPos.accidental}
              </text>
            )}
            <text x="445" y="112" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">
              Target: {targetNote}
            </text>
          </g>
        )}

        {/* Real-Time Active Playing Note */}
        {activePos && (
          <g className="transition-all duration-75">
            {activePos.hasLedger && (
              <line x1="465" y1={activePos.y} x2="505" y2={activePos.y} stroke="#10B981" strokeWidth="2.5" />
            )}
            <ellipse
              cx="485"
              cy={activePos.y}
              rx="9.5"
              ry="7"
              fill="#10B981"
              transform={`rotate(-22 485 ${activePos.y})`}
              filter="drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))"
            />
            {activePos.stemUp ? (
              <line x1="493" y1={activePos.y - 2} x2="493" y2={activePos.y - 34} stroke="#10B981" strokeWidth="2" />
            ) : (
              <line x1="477" y1={activePos.y + 2} x2="477" y2={activePos.y + 34} stroke="#10B981" strokeWidth="2" />
            )}
            {activePos.accidental && (
              <text x="467" y={activePos.y + 5} fill="#10B981" fontSize="18" fontWeight="bold">
                {activePos.accidental}
              </text>
            )}
            <text x="485" y="112" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">
              {activeNote}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
