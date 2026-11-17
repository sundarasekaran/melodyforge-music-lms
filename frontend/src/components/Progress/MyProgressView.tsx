import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserProgress, PracticeSession, LearningTier } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { ProgressBar } from '../ui/ProgressBar';
import { ProgressRing } from '../ui/ProgressRing';
import { Badge } from '../ui/Badge';
import { BarChart2, CheckCircle2, Clock, Zap, Flame, Award, BookOpen } from 'lucide-react';

export const MyProgressView: React.FC = () => {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState<UserProgress[]>([]);
  const [practiceList, setPracticeList] = useState<PracticeSession[]>([]);
  const [tiers, setTiers] = useState<LearningTier[]>([]);
  const [loading, setLoading] = useState(true);

  const xp = user?.totalXp || 0;
  const level = user?.currentLevel || 1;
  const streak = user?.currentStreakDays || 0;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [prog, pract, tierData] = await Promise.all([
          api.getMyProgress().catch(() => [] as UserProgress[]),
          api.getPracticeSessions().catch(() => [] as PracticeSession[]),
          api.getInstrumentTiers('piano').catch(() => [] as LearningTier[]),
        ]);
        setProgressList(prog);
        setPracticeList(pract);
        setTiers(tierData);
      } catch (err) {
        console.error('Failed to load user progress', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const completedCount = progressList.filter((p) => p.completed).length;
  const totalPracticeTimeMins = Math.round(
    practiceList.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Learning Progress & Analytics"
        subtitle="Track your curriculum completions, practice time duration, and tier mastery benchmarks."
        icon={<BarChart2 size={22} />}
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Completed Lessons"
          value={completedCount}
          subtitle="Curriculum steps passed"
          icon={<CheckCircle2 size={20} />}
          iconBg="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
        />

        <StatCard
          label="Total Practice Time"
          value={`${totalPracticeTimeMins}m`}
          subtitle="Direct audio studio time"
          icon={<Clock size={20} />}
          iconBg="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
        />

        <StatCard
          label="XP Accumulated"
          value={xp}
          subtitle={`Current: Level ${level}`}
          icon={<Zap size={20} />}
          iconBg="bg-amber-500/15 text-amber-400 border border-amber-500/30"
        />

        <StatCard
          label="Practice Streak"
          value={`${streak} Days`}
          subtitle="Consecutive daily cadence"
          icon={<Flame size={20} />}
          iconBg="bg-orange-500/15 text-orange-400 border border-orange-500/30"
        />
      </div>

      {/* 4-Tier Mastery Progress Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="text-amber-400" size={18} />
            Tier Mastery Benchmarks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress across the four standardized progressive tiers for Piano
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier) => {
            const isUnlocked = xp >= tier.requiredXp;
            // Tier 1 calculation: based on completed lessons
            const completion = tier.tierOrder === 1 ? Math.min(100, (completedCount / 7) * 100) : 0;

            return (
              <div
                key={tier.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Tier {tier.tierOrder}: {tier.tierName}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {isUnlocked ? `${tier.levels.length} Levels Active` : `Unlocks at ${tier.requiredXp} XP`}
                    </span>
                  </div>
                  <Badge variant={isUnlocked ? 'emerald' : 'slate'} size="sm">
                    {isUnlocked ? 'In Progress' : 'Locked'}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Mastery</span>
                    <span className="font-bold text-slate-200">{Math.round(completion)}%</span>
                  </div>
                  <ProgressBar value={completion} color={tier.tierOrder === 1 ? 'gold' : 'indigo'} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
