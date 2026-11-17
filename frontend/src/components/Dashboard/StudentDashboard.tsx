import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LearningTier, Lesson, PracticeSession, UserBadge, Badge as BadgeType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { ProgressRing } from '../ui/ProgressRing';
import {
  Zap,
  Flame,
  Award,
  BookOpen,
  PlayCircle,
  Clock,
  Sparkles,
  Headphones,
  Mic,
  Music,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { NavigationTab } from '../navigation/Sidebar';

interface StudentDashboardProps {
  onNavigate: (tab: NavigationTab) => void;
  onLaunchLesson: (lessonId: number) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onLaunchLesson,
}) => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<LearningTier[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);

  const userXp = user?.totalXp || 0;
  const userLevel = user?.currentLevel || 1;
  const userStreak = user?.currentStreakDays || 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tierData, practiceData, myBadges, badgesList] = await Promise.all([
          api.getInstrumentTiers('piano').catch(() => [] as LearningTier[]),
          api.getPracticeSessions().catch(() => [] as PracticeSession[]),
          api.getMyBadges().catch(() => [] as UserBadge[]),
          api.getBadges().catch(() => [] as BadgeType[]),
        ]);
        setTiers(tierData);
        setPracticeSessions(practiceData);
        setUserBadges(myBadges);
        setAllBadges(badgesList);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Calculate current tier
  const currentTierName =
    userXp >= 2000 ? 'Tier 4: Expert' : userXp >= 1000 ? 'Tier 3: Pro' : userXp >= 450 ? 'Tier 2: Intermediate' : 'Tier 1: Basics';

  // Find next recommended lesson (e.g. from Tier 1)
  const tier1 = tiers.find((t) => t.tierName === 'BASICS') || tiers[0];
  const firstCourse = tier1?.levels?.[0]?.courses?.[0];
  const nextLesson = firstCourse?.lessons?.[0];

  // Calculate total practice duration in minutes
  const totalPracticeMinutes = Math.round(
    practiceSessions.reduce((acc, sess) => acc + (sess.durationSeconds || 0), 0) / 60
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* SECTION 1: Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="gold" size="sm" dot>
                {currentTierName}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">Flagship Instrument: Piano</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.displayName || 'Learner'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Continue your structured journey across musical fundamentals, ear training, and keyboard technique.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {nextLesson && (
              <Button
                variant="primary"
                size="lg"
                icon={<PlayCircle size={20} />}
                onClick={() => onLaunchLesson(nextLesson.id)}
              >
                Continue Learning
              </Button>
            )}
            <Button
              variant="secondary"
              size="lg"
              icon={<Mic size={18} />}
              onClick={() => onNavigate('STUDIO')}
            >
              Practice Studio
            </Button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SECTION 2: Metric Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Experience"
          value={`${userXp} XP`}
          subtitle={`Level ${userLevel} Pianist`}
          icon={<Zap size={20} />}
          iconBg="bg-amber-500/15 text-amber-400 border border-amber-500/30"
          onClick={() => onNavigate('BADGES')}
        />

        <StatCard
          label="Practice Streak"
          value={`${userStreak} Days`}
          subtitle="Daily practice target active"
          icon={<Flame size={20} />}
          iconBg="bg-orange-500/15 text-orange-400 border border-orange-500/30"
          onClick={() => onNavigate('STUDIO')}
        />

        <StatCard
          label="Current Tier"
          value={userXp >= 450 ? 'Tier 2' : 'Tier 1'}
          subtitle={userXp >= 450 ? 'Intermediate Theory' : 'Basics & Foundations'}
          icon={<BookOpen size={20} />}
          iconBg="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
          onClick={() => onNavigate('ROADMAP')}
        />

        <StatCard
          label="Practice Time"
          value={`${totalPracticeMinutes}m`}
          subtitle={`${practiceSessions.length} recorded sessions`}
          icon={<Clock size={20} />}
          iconBg="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          onClick={() => onNavigate('STUDIO')}
        />
      </div>

      {/* SECTION 3 & 4: Continue Learning Hero & Quick Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Course Card (Continue Learning) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                    Active Curriculum
                  </span>
                  <h3 className="text-base font-bold text-white">Tier 1: Basics — Foundational Piano</h3>
                </div>
              </div>
              <Badge variant="indigo" size="sm">Level 1 in Progress</Badge>
            </div>

            {nextLesson ? (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Next Lesson to Master
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mt-0.5">{nextLesson.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md line-clamp-2">
                    {nextLesson.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                    <span className="flex items-center gap-1"><Clock size={12} /> {nextLesson.durationMinutes} mins</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">+{nextLesson.xpReward} XP</span>
                    <span>•</span>
                    <span className="text-indigo-400 uppercase text-[10px] font-bold">{nextLesson.lessonType}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  icon={<PlayCircle size={18} />}
                  onClick={() => onLaunchLesson(nextLesson.id)}
                >
                  Start Lesson
                </Button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4">Explore the Learning Path to begin.</div>
            )}

            {/* Curriculum Progress Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Tier 1 Mastery Completion</span>
                <span className="font-bold text-emerald-400">33% (Level 1 active)</span>
              </div>
              <ProgressBar value={33} color="gold" size="md" />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">All 4 Tiers (12 Levels) follow structured pedagogical progression</span>
            <button
              onClick={() => onNavigate('ROADMAP')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Roadmap</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* SECTION 7: Recommended Quick Drills */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80 mb-4">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-base font-bold text-white">Recommended Drills</h3>
            </div>

            <div className="space-y-3">
              {/* Ear training quick drill */}
              <div
                onClick={() => onNavigate('EAR_TRAINING')}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Headphones size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                      Ear Pitch Training
                    </h4>
                    <p className="text-[11px] text-slate-400">Identify Middle C & intervals</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </div>

              {/* Virtual piano free practice */}
              <div
                onClick={() => onNavigate('PIANO')}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Music size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      Keyboard Exploration
                    </h4>
                    <p className="text-[11px] text-slate-400">Practice 3-octave keyboard & staff</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </div>

              {/* History Reading in Course */}
              <div
                onClick={() => onNavigate('ROADMAP')}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                      Course History Modules
                    </h4>
                    <p className="text-[11px] text-slate-400">Integrated history in Level 1</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-slate-400 text-center">
            Earn bonus XP and maintain your daily streak with every drill completed!
          </div>
        </div>
      </div>

      {/* SECTION 5 & 6: Practice History & Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practice Overview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-indigo-400" />
              Recent Practice Activity
            </h3>
            <button
              onClick={() => onNavigate('STUDIO')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Open Studio →
            </button>
          </div>

          {practiceSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No practice logs yet. Start the session timer in Practice Studio!
            </div>
          ) : (
            <div className="space-y-2.5">
              {practiceSessions.slice(0, 3).map((sess) => (
                <div
                  key={sess.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">
                      Piano Session: {Math.round(sess.durationSeconds / 60)} minutes
                    </p>
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                      "{sess.notes || 'Routine practice'}"
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-amber-400">+{sess.xpEarned} XP</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(sess.practicedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trophies & Milestones */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Achievements & Milestones
            </h3>
            <button
              onClick={() => onNavigate('BADGES')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              View All ({allBadges.length}) →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {allBadges.slice(0, 4).map((badge) => {
              const earned = userBadges.some((ub) => ub.badge.code === badge.code);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    earned
                      ? 'bg-slate-950/90 border-amber-500/30'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{earned ? '🏆' : '🔒'}</span>
                    <span className="text-[10px] font-bold text-amber-400">+{badge.xpBonus} XP</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 truncate">{badge.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{badge.description}</p>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-slate-500">
                    {earned ? <span className="text-emerald-400">✓ Unlocked</span> : 'Locked'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
