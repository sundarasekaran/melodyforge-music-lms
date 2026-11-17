import React from 'react';
import { HistoryChapter } from '../../types';
import { CheckCircle2, Lock, Sparkles, BookOpen } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface ChapterProgressProps {
  chapters: HistoryChapter[];
  currentChapterId: number;
  onSelectChapter: (chapterId: number) => void;
}

export const ChapterProgress: React.FC<ChapterProgressProps> = ({
  chapters,
  currentChapterId,
  onSelectChapter,
}) => {
  if (!chapters || chapters.length === 0) return null;

  const completedCount = chapters.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedCount / chapters.length) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-400" />
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
            History Modules Progress
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Completed:</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {completedCount} / {chapters.length} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar value={progressPercent} color="emerald" size="sm" />

      {/* Stepped Chapter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
        {chapters.map((chap, idx) => {
          const isCurrent = chap.id === currentChapterId;
          const isCompleted = chap.completed;
          const isUnlocked = chap.unlocked !== false;

          let cardStyle = 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700';
          if (isCurrent) {
            cardStyle = 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30';
          } else if (isCompleted) {
            cardStyle = 'bg-emerald-950/30 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/50';
          } else if (!isUnlocked) {
            cardStyle = 'bg-slate-950/30 text-slate-600 border-slate-900 opacity-60 cursor-not-allowed';
          }

          return (
            <button
              key={chap.id}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onSelectChapter(chap.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${cardStyle}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] font-mono font-extrabold ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>
                  Ch. {chap.sectionNumber}
                </span>
                {isCompleted ? (
                  <CheckCircle2 size={13} className={isCurrent ? 'text-white' : 'text-emerald-400'} />
                ) : !isUnlocked ? (
                  <Lock size={12} className="text-slate-600" />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                )}
              </div>
              <p className="text-[11px] font-bold truncate leading-tight">
                {chap.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
