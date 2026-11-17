import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge, UserBadge } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge as UiBadge } from '../ui/Badge';
import {
  Award,
  Star,
  Flame,
  Compass,
  Headphones,
  Music,
  Zap,
  Lock,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const BadgesGallery: React.FC = () => {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [badges, myBadges] = await Promise.all([
          api.getBadges(),
          api.getMyBadges().catch(() => [] as UserBadge[]),
        ]);
        setAllBadges(badges);
        setUserBadges(myBadges);
      } catch (e) {
        console.error('Failed to load badges', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedMap = new Map<string, UserBadge>();
  userBadges.forEach((ub) => earnedMap.set(ub.badge.code, ub));

  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'FIRST_NOTE': return <Music size={28} className="text-amber-400" />;
      case 'KEYBOARD_EXPLORER': return <Compass size={28} className="text-indigo-400" />;
      case 'GOLDEN_EAR': return <Headphones size={28} className="text-purple-400" />;
      case 'STREAK_3_DAYS': return <Flame size={28} className="text-orange-400" />;
      case 'STREAK_7_DAYS': return <Zap size={28} className="text-amber-300" />;
      case 'BASICS_GRADUATE': return <Award size={28} className="text-emerald-400" />;
      case 'XP_MASTER_500': return <Star size={28} className="text-yellow-400" />;
      default: return <Award size={28} className="text-indigo-400" />;
    }
  };

  const categories = ['ALL', 'MASTERY', 'THEORY', 'EAR_TRAINING', 'STREAK'];

  const filteredBadges = filterCategory === 'ALL'
    ? allBadges
    : allBadges.filter((b) => b.category === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading trophies and achievements...</span>
        </div>
      </div>
    );
  }

  const selectedEarned = selectedBadge ? earnedMap.get(selectedBadge.code) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Achievements & Trophies"
        subtitle="Earn recognition badges for theoretical comprehension, pitch precision, and consistent daily practice."
        icon={<Award size={22} />}
        actions={
          <UiBadge variant="emerald" size="md" dot>
            Unlocked: {userBadges.length} / {allBadges.length}
          </UiBadge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBadges.map((badge) => {
          const earned = earnedMap.get(badge.code);

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                earned
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-amber-500/30 shadow-xl shadow-amber-500/5 hover:border-amber-500/50'
                  : 'bg-slate-950/60 border-slate-900 opacity-60 hover:opacity-80 hover:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 ${
                      earned
                        ? 'bg-amber-400/10 border-amber-400/30 ring-2 ring-amber-400/20'
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    {earned ? getBadgeIcon(badge.code) : <Lock size={22} />}
                  </div>

                  <UiBadge variant="gold" size="sm">
                    +{badge.xpBonus} XP
                  </UiBadge>
                </div>

                <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="uppercase text-[10px] tracking-wider font-extrabold text-slate-500">
                  {badge.category}
                </span>
                {earned ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Unlocked
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock size={12} /> Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Inspection Modal */}
      {selectedBadge && (
        <Modal
          isOpen={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
          title={selectedBadge.title}
          maxWidth="sm"
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedBadge(null)}>
              Close
            </Button>
          }
        >
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center border text-3xl shadow-xl ${
                selectedEarned
                  ? 'bg-amber-400/15 border-amber-400/30 ring-4 ring-amber-400/20 shadow-amber-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              {selectedEarned ? getBadgeIcon(selectedBadge.code) : <Lock size={32} />}
            </div>

            <div>
              <UiBadge variant={selectedEarned ? 'emerald' : 'slate'} size="sm" className="mb-2">
                {selectedEarned ? 'Achievement Unlocked' : 'Locked Milestone'}
              </UiBadge>
              <h4 className="text-lg font-bold text-white">{selectedBadge.title}</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">{selectedBadge.description}</p>
            </div>

            <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Bonus Reward:</span>
                <span className="font-bold text-amber-400">+{selectedBadge.xpBonus} Experience Points</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Category:</span>
                <span className="font-semibold text-slate-200 uppercase">{selectedBadge.category}</span>
              </div>
              {selectedEarned && (
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Earned Date:</span>
                  <span className="font-semibold text-emerald-400">
                    {new Date(selectedEarned.awardedAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
