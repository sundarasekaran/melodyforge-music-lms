import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LeaderboardEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../ui/PageHeader';
import { Trophy, Flame, Shield, Award, Zap } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        setEntries(data);
      } catch (e) {
        console.error('Failed to load leaderboard', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md shadow-amber-400/30">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-300 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-700 text-amber-100 font-extrabold flex items-center justify-center text-sm shadow-md">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
            #{rank}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading rankings...</span>
        </div>
      </div>
    );
  }

  const top3 = entries.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="Musician Global Rankings"
        subtitle="Learners recognized for cumulative Experience Points (XP) earned across lessons, ear quizzes, and daily practice streaks."
        icon={<Trophy size={22} />}
        actions={
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-2xl border border-indigo-500/20 font-bold">
            <Shield size={14} /> Season 1 Competitive
          </div>
        }
      />

      {/* Top 3 Visual Podium */}
      {top3.length >= 2 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6 pb-2">
          {/* #2 Rank */}
          {top3[1] && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center shadow-xl h-44 sm:h-52 justify-between">
              <span className="text-2xl sm:text-3xl">🥈</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] sm:max-w-full">
                  {top3[1].displayName}
                </p>
                <span className="text-[10px] text-slate-400">Level {top3[1].currentLevel}</span>
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-xl">
                {top3[1].totalXp} XP
              </span>
            </div>
          )}

          {/* #1 Rank (Center, Highest Podium) */}
          {top3[0] && (
            <div className="bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center shadow-2xl h-52 sm:h-64 justify-between relative ring-4 ring-amber-500/10">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow-md">
                CHAMPION
              </div>
              <span className="text-3xl sm:text-4xl mt-2">🥇</span>
              <div>
                <p className="text-sm sm:text-base font-extrabold text-white truncate max-w-[120px] sm:max-w-full">
                  {top3[0].displayName}
                </p>
                <span className="text-xs text-amber-400 font-semibold">Level {top3[0].currentLevel} Virtuoso</span>
              </div>
              <span className="font-extrabold text-sm sm:text-base text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1 rounded-xl">
                {top3[0].totalXp} XP
              </span>
            </div>
          )}

          {/* #3 Rank */}
          {top3[2] && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center shadow-xl h-40 sm:h-48 justify-between">
              <span className="text-2xl sm:text-3xl">🥉</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] sm:max-w-full">
                  {top3[2].displayName}
                </p>
                <span className="text-[10px] text-slate-400">Level {top3[2].currentLevel}</span>
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-xl">
                {top3[2].totalXp} XP
              </span>
            </div>
          )}
        </div>
      )}

      {/* Complete Rankings Roster */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Complete Student Roster</h3>
        <div className="space-y-2">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry.id === user?.id;

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isMe
                    ? 'bg-indigo-950/50 border-indigo-500/50 ring-2 ring-indigo-500/20'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-4">
                  {getRankBadge(rank)}
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {entry.displayName}
                      {isMe && (
                        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          You
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Lvl {entry.currentLevel}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">@{entry.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 sm:gap-8">
                  <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold">
                    <Flame size={15} />
                    <span>{entry.currentStreakDays}d streak</span>
                  </div>

                  <span className="text-sm sm:text-base font-extrabold text-amber-400">
                    {entry.totalXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
