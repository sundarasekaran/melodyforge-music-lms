import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap, Flame, Target, Award, PlayCircle, Headphones, Mic } from 'lucide-react';
import { ActiveTab } from '../Navbar';

interface DashboardStatsProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const xp = user?.totalXp || 0;
  const level = user?.currentLevel || 1;
  const streak = user?.currentStreakDays || 0;

  // Level thresholds: 250 XP per level
  const currentLevelBaseXp = (level - 1) * 250;
  const nextLevelXp = level * 250;
  const progressInLevel = Math.min(100, Math.max(0, ((xp - currentLevelBaseXp) / 250) * 100));

  // Weekdays for streak dots
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon, 6=Sun

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Experience & Level Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Zap size={16} /> Level Progression
            </span>
            <span className="text-white font-bold">Level {level}</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-extrabold text-white">{xp}</span>
            <span className="text-xs text-slate-400">/ {nextLevelXp} XP to Level {level + 1}</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
              style={{ width: `${progressInLevel}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          Earn XP by completing piano lessons, acing ear training, and saving practice sessions.
        </p>
      </div>

      {/* Daily Practice Streak Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-orange-400">
              <Flame size={16} /> Practice Streak
            </span>
            <span className="text-orange-400 font-bold">{streak} Days Active</span>
          </div>

          <div className="flex items-center justify-between gap-1 mt-3">
            {days.map((day, idx) => {
              const isActiveDay = idx <= todayIndex && streak > (todayIndex - idx);
              const isToday = idx === todayIndex;

              return (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <span className={`text-[10px] ${isToday ? 'font-bold text-orange-400' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                      isActiveDay
                        ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                        : isToday
                        ? 'border border-dashed border-orange-400 text-orange-400'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {isActiveDay ? '🔥' : '•'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          Log at least 5 minutes in the Practice Studio today to keep your streak burning!
        </p>
      </div>

      {/* Quick Launch & Goal Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Target size={16} /> Daily Goal
            </span>
            <span className="text-emerald-400 font-bold">15 min Goal</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={() => onNavigate('ROADMAP')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center text-center transition-colors cursor-pointer group"
            >
              <PlayCircle size={18} className="text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-200">Resume</span>
            </button>

            <button
              onClick={() => onNavigate('EAR_TRAINING')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center text-center transition-colors cursor-pointer group"
            >
              <Headphones size={18} className="text-purple-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-200">Ear Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('STUDIO')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center text-center transition-colors cursor-pointer group"
            >
              <Mic size={18} className="text-rose-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-200">Record</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-indigo-300 font-medium mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span>Tier 1: Basics</span>
          <span className="text-emerald-400">Recommended Next Step →</span>
        </div>
      </div>
    </div>
  );
};
