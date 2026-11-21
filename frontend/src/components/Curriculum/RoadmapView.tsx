import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LearningTier, Lesson, UserProgress, HistoryChapter } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import {
  SoundActionDiagram,
  PostureAndHandLab,
  KeyboardExplorerGame,
  NotationTheoryLab,
} from '../Labs';
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  Award,
  BookOpen,
  Music,
  Headphones,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Compass,
  ArrowRight,
  Hammer,
  Layers,
  Target,
} from 'lucide-react';

interface RoadmapViewProps {
  selectedInstrument?: string;
  onSelectLesson: (lessonId: number) => void;
  onSelectHistory?: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  selectedInstrument = 'piano',
  onSelectLesson,
  onSelectHistory,
}) => {
  const { user, awardLocalXp } = useAuth();
  const [tiers, setTiers] = useState<LearningTier[]>([]);
  const [historyChapters, setHistoryChapters] = useState<HistoryChapter[]>([]);
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [expandedTiers, setExpandedTiers] = useState<Record<number, boolean>>({ 1: true });
  const [loading, setLoading] = useState(true);
  const [activeLab, setActiveLab] = useState<'PHYSICS' | 'KEYBOARD' | 'POSTURE' | 'NOTATION' | null>(null);

  const userXp = user?.totalXp || 0;
  const instrumentName =
    selectedInstrument === 'guitar'
      ? 'Guitar'
      : selectedInstrument === 'violin'
      ? 'Violin'
      : selectedInstrument === 'drums'
      ? 'Drums'
      : 'Piano';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tierData, progressData, historyData] = await Promise.all([
          api.getInstrumentTiers(selectedInstrument),
          api.getMyProgress().catch(() => [] as UserProgress[]),
          api.getInstrumentHistory(selectedInstrument).catch(() => [] as HistoryChapter[]),
        ]);
        setTiers(tierData);
        setHistoryChapters(historyData);

        const progMap: Record<number, boolean> = {};
        progressData.forEach((p) => {
          if (p.completed) {
            progMap[p.lesson?.id || (p as unknown as { lessonId: number }).lessonId] = true;
          }
        });
        setProgress(progMap);
      } catch (err) {
        console.error('Failed to load curriculum tiers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedInstrument]);

  const toggleTier = (tierId: number) => {
    setExpandedTiers((prev) => ({ ...prev, [tierId]: !prev[tierId] }));
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'LISTENING':
        return <Headphones size={15} className="text-purple-400" />;
      case 'PRACTICAL':
        return <Music size={15} className="text-emerald-400" />;
      case 'ASSESSMENT':
        return <Award size={15} className="text-amber-400" />;
      default:
        return <BookOpen size={15} className="text-indigo-400" />;
    }
  };

  const historyCompletedCount = historyChapters.filter((c) => c.completed).length;
  const isHistoryComplete = historyChapters.length > 0 && historyCompletedCount === historyChapters.length;
  const totalHistoryXp = historyChapters.reduce((acc, c) => acc + (c.xpReward || 50), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading {instrumentName} curriculum & roadmap...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title={`${instrumentName} Learning Path & Curriculum`}
        subtitle={`Standardized 4-tier learning roadmap from foundational history and anatomy through Concert Grand proficiency.`}
        icon={<BookOpen size={22} />}
        actions={
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Experience</span>
              <p className="text-base font-extrabold text-amber-400">{userXp} XP</p>
            </div>
            <div className="border-r border-slate-800 h-6" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Status</span>
              <p className="text-xs font-bold text-emerald-400">
                {userXp >= 2000 ? 'Tier 4: Expert' : userXp >= 1000 ? 'Tier 3: Pro' : userXp >= 450 ? 'Tier 2: Intermediate' : 'Tier 1: Basics'}
              </p>
            </div>
          </div>
        }
      />

      {/* 4 Tiers Progressive Accordion Stack */}
      <div className="space-y-5">
        {tiers.map((tier) => {
          const isUnlocked = userXp >= tier.requiredXp;
          const isExpanded = expandedTiers[tier.id] ?? false;

          return (
            <div
              key={tier.id}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                isUnlocked
                  ? 'bg-slate-900/90 border-slate-800 shadow-xl'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              {/* Tier Header Accordion */}
              <button
                onClick={() => isUnlocked && toggleTier(tier.id)}
                className={`w-full p-4 sm:p-6 flex items-center justify-between cursor-pointer text-left transition-colors min-w-0 gap-3 ${
                  isUnlocked ? 'hover:bg-slate-850/50' : 'cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base border shadow-inner shrink-0 ${
                      isUnlocked
                        ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30'
                        : 'bg-slate-950 text-slate-600 border-slate-800'
                    }`}
                  >
                    {isUnlocked ? `T${tier.tierOrder}` : <Lock size={18} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                        Tier {tier.tierOrder}: {tier.tierName}
                      </h3>
                      {!isUnlocked ? (
                        <Badge variant="gold" size="sm">
                          Unlocks at {tier.requiredXp} XP
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="sm" dot>
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2 sm:line-clamp-none leading-relaxed">{tier.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <span className="text-xs text-slate-500 hidden md:inline font-medium">
                    {tier.levels.length} Levels • {tier.levels.reduce((acc, l) => acc + l.courses.reduce((cAcc, c) => cAcc + c.lessons.length, 0), 0)} Lessons
                  </span>
                  {isUnlocked && (
                    isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </button>

              {/* Levels & Lessons Breakdown */}
              {isUnlocked && isExpanded && (
                <div className="p-4 sm:p-6 pt-0 border-t border-slate-800/80 space-y-4 mt-2 min-w-0">
                  {/* Interactive Pedagogical Labs Showcase for Piano Tier 1 */}
                  {selectedInstrument === 'piano' && tier.tierOrder === 1 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 border border-slate-800 space-y-3 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-400 shrink-0" />
                          <h4 className="text-sm font-bold text-white">Interactive Pedagogical Labs (4 Active Labs)</h4>
                        </div>
                        <span className="text-[11px] text-slate-400">Launch any laboratory environment directly</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Lab 1 */}
                        <button
                          type="button"
                          onClick={() => setActiveLab('PHYSICS')}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-indigo-500/50 text-left transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                                <Hammer size={16} />
                              </span>
                              <Badge variant="indigo" size="sm">Level 1</Badge>
                            </div>
                            <h5 className="text-xs font-bold text-white">Sound Action Physics</h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">60 FPS mechanism simulation, escapement, dampers &amp; soundboard.</p>
                          </div>
                          <span className="text-[11px] font-bold text-indigo-400 mt-3 flex items-center gap-1">Launch Lab →</span>
                        </button>

                        {/* Lab 2 */}
                        <button
                          type="button"
                          onClick={() => setActiveLab('KEYBOARD')}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-amber-500/50 text-left transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                                <Target size={16} />
                              </span>
                              <Badge variant="gold" size="sm">Level 2</Badge>
                            </div>
                            <h5 className="text-xs font-bold text-white">Keyboard Explorer</h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Interactive note geography, landmark identification &amp; octave recognition.</p>
                          </div>
                          <span className="text-[11px] font-bold text-amber-400 mt-3 flex items-center gap-1">Play Game →</span>
                        </button>

                        {/* Lab 3 */}
                        <button
                          type="button"
                          onClick={() => setActiveLab('POSTURE')}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-emerald-500/50 text-left transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                                <Layers size={16} />
                              </span>
                              <Badge variant="emerald" size="sm">Level 3</Badge>
                            </div>
                            <h5 className="text-xs font-bold text-white">Posture &amp; Hand Lab</h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Biomechanics, bench height, knuckle arch, and 1–5 finger numbering.</p>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400 mt-3 flex items-center gap-1">Inspect Ergonomics →</span>
                        </button>

                        {/* Lab 4 */}
                        <button
                          type="button"
                          onClick={() => setActiveLab('NOTATION')}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-purple-500/50 text-left transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                                <Music size={16} />
                              </span>
                              <Badge variant="indigo" size="sm">Level 2/3</Badge>
                            </div>
                            <h5 className="text-xs font-bold text-white">Notation Theory Lab</h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Treble clef lines &amp; spaces, piano key sync, and note duration rhythms.</p>
                          </div>
                          <span className="text-[11px] font-bold text-purple-400 mt-3 flex items-center gap-1">Explore Notation →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {tier.levels.map((level) => {
                    const isLevel1 = level.levelNumber === 1 && tier.tierOrder === 1;

                    return (
                      <div key={level.id} className="bg-slate-950/70 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-800/80 space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-indigo-300 truncate">{level.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 sm:line-clamp-none">{level.description}</p>
                          </div>
                          <Badge variant="gold" size="sm" className="shrink-0">
                            +{level.xpReward} XP
                          </Badge>
                        </div>

                        {/* Integrated History of Instrument Banner (Embedded in Tier 1 -> Level 1) */}
                        {isLevel1 && historyChapters.length > 0 && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/30 border border-indigo-500/30 hover:border-indigo-400/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl min-w-0">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-extrabold shrink-0 shadow-lg shadow-amber-500/20">
                                <Compass size={20} className="sm:w-6 sm:h-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge variant="amber" size="sm">
                                    Chapter 1: History
                                  </Badge>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {historyChapters.length} Modules
                                  </span>
                                </div>
                                <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                                  Origins, Inventions & Master Composers
                                </h4>
                                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                                  Historical developments, tone comparisons, timelines, and chapter checks.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right hidden md:block">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Progress</span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">
                                  {historyCompletedCount} / {historyChapters.length} Completed
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => onSelectHistory && onSelectHistory()}
                                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                              >
                                {isHistoryComplete ? (
                                  <>
                                    <CheckCircle2 size={16} /> Review History
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle size={16} /> Study (+{totalHistoryXp} XP)
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Courses & Lessons in Level */}
                        <div className="space-y-2 min-w-0">
                          {level.courses.map((course) => (
                            <div key={course.id} className="space-y-2 min-w-0">
                              {course.lessons.map((lesson) => {
                                const isCompleted = progress[lesson.id];

                                return (
                                  <button
                                    key={lesson.id}
                                    onClick={() => onSelectLesson(lesson.id)}
                                    className="w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2 sm:gap-3 group cursor-pointer min-w-0"
                                  >
                                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-indigo-500/40 transition-colors shrink-0">
                                        {getLessonTypeIcon(lesson.lessonType)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                                          {lesson.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs text-slate-400 mt-0.5">
                                          <span className="flex items-center gap-1 font-mono">
                                            <Clock size={11} /> {lesson.durationMinutes}m
                                          </span>
                                          <span>•</span>
                                          <span className="text-amber-400 font-bold">
                                            +{lesson.xpReward} XP
                                          </span>
                                          <span>•</span>
                                          <span className="uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-500 font-extrabold">
                                            {lesson.lessonType}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {isCompleted ? (
                                        <Badge variant="emerald" size="sm" dot>
                                          Done
                                        </Badge>
                                      ) : (
                                        <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 sm:px-3 py-1 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                          <PlayCircle size={14} /> <span className="hidden sm:inline">Start</span>
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Lab Modal */}
      {activeLab && (
        <Modal
          isOpen={Boolean(activeLab)}
          onClose={() => setActiveLab(null)}
          title={
            activeLab === 'PHYSICS'
              ? 'Sound Action & Escapement Physics Lab'
              : activeLab === 'KEYBOARD'
              ? 'Keyboard Explorer Game'
              : activeLab === 'POSTURE'
              ? 'Posture & Hand Positioning Lab'
              : 'Notation Theory & Rhythms Lab'
          }
          size="xl"
        >
          <div className="py-2 max-h-[75dvh] overflow-y-auto pr-1">
            {activeLab === 'PHYSICS' && (
              <SoundActionDiagram
                onLabComplete={() => {
                  awardLocalXp(50);
                  setActiveLab(null);
                }}
              />
            )}
            {activeLab === 'KEYBOARD' && (
              <KeyboardExplorerGame
                onGameComplete={() => {
                  awardLocalXp(50);
                  setActiveLab(null);
                }}
              />
            )}
            {activeLab === 'POSTURE' && (
              <PostureAndHandLab
                onLabComplete={() => {
                  awardLocalXp(50);
                  setActiveLab(null);
                }}
              />
            )}
            {activeLab === 'NOTATION' && (
              <NotationTheoryLab
                onLabComplete={() => {
                  awardLocalXp(50);
                  setActiveLab(null);
                }}
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
