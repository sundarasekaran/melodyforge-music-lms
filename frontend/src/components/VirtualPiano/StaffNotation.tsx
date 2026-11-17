import React from 'react';

interface StaffNotationProps {
  activeNote?: string | null;
  targetNote?: string | null;
}

export const StaffNotation: React.FC<StaffNotationProps> = ({ activeNote, targetNote }) => {
  // Mapping notes to vertical positions on Treble Clef
  // Staff lines (top to bottom): F5 (y=38), D5 (y=48), B4 (y=58), G4 (y=68), E4 (y=78)
  // Spaces: E5 (y=43), C5 (y=53), A4 (y=63), F4 (y=73)
  // Below staff: D4 (y=83), C4 (Middle C ledger line at y=88)
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full px-2 mb-3 text-xs text-slate-400 font-semibold">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm shadow-indigo-500/50" />
          Interactive Treble Clef Notation
        </span>
        <div className="flex items-center gap-4">
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

      <svg viewBox="0 0 420 125" className="w-full max-w-lg h-28 overflow-visible select-none">
        {/* Subtle Staff Plate */}
        <rect x="0" y="8" width="420" height="105" fill="#0A0F1D" rx="16" stroke="#1E293B" strokeWidth="1" />

        {/* 5 Treble Staff Lines */}
        <line x1="25" y1="38" x2="395" y2="38" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="48" x2="395" y2="48" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="58" x2="395" y2="58" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="68" x2="395" y2="68" stroke="#334155" strokeWidth="1.5" />
        <line x1="25" y1="78" x2="395" y2="78" stroke="#334155" strokeWidth="1.5" />

        {/* Treble Clef Glyph Symbol */}
        <text x="36" y="78" fill="#94A3B8" fontSize="58" fontFamily="serif" fontWeight="bold">
          𝄞
        </text>

        {/* 4/4 Time Signature */}
        <text x="76" y="56" fill="#64748B" fontSize="20" fontWeight="bold" fontFamily="sans-serif">4</text>
        <text x="76" y="76" fill="#64748B" fontSize="20" fontWeight="bold" fontFamily="sans-serif">4</text>

        {/* Target Guide Note (Dashed / Ghost) */}
        {targetPos && (
          <g opacity="0.6">
            {targetPos.hasLedger && (
              <line x1="175" y1={targetPos.y} x2="215" y2={targetPos.y} stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
            )}
            <ellipse
              cx="195"
              cy={targetPos.y}
              rx="9"
              ry="6.5"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              transform={`rotate(-22 195 ${targetPos.y})`}
            />
            {targetPos.stemUp ? (
              <line x1="203" y1={targetPos.y - 2} x2="203" y2={targetPos.y - 32} stroke="#F59E0B" strokeWidth="2" />
            ) : (
              <line x1="187" y1={targetPos.y + 2} x2="187" y2={targetPos.y + 32} stroke="#F59E0B" strokeWidth="2" />
            )}
            <text x="195" y="112" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">
              {targetNote}
            </text>
          </g>
        )}

        {/* Real-Time Active Note */}
        {activePos && (
          <g className="transition-all duration-75">
            {activePos.hasLedger && (
              <line x1="270" y1={activePos.y} x2="310" y2={activePos.y} stroke="#10B981" strokeWidth="2.5" />
            )}
            <ellipse
              cx="290"
              cy={activePos.y}
              rx="9.5"
              ry="7"
              fill="#10B981"
              transform={`rotate(-22 290 ${activePos.y})`}
              filter="drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))"
            />
            {activePos.stemUp ? (
              <line x1="298" y1={activePos.y - 2} x2="298" y2={activePos.y - 34} stroke="#10B981" strokeWidth="2" />
            ) : (
              <line x1="282" y1={activePos.y + 2} x2="282" y2={activePos.y + 34} stroke="#10B981" strokeWidth="2" />
            )}
            {activePos.accidental && (
              <text x="272" y={activePos.y + 5} fill="#10B981" fontSize="18" fontWeight="bold">
                {activePos.accidental}
              </text>
            )}
            <text x="290" y="112" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">
              {activeNote}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
