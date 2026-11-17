import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Instrument, User, HistoryChapter } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  Shield,
  Users,
  Music,
  BookOpen,
  Clock,
  Plus,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Compass,
  FileText,
  HelpCircle,
  Volume2,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalInstruments: number;
    totalLessons: number;
    totalPracticeSessions: number;
  } | null>(null);

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'INSTRUMENTS' | 'STUDENTS' | 'CURRICULUM' | 'HISTORY'>('INSTRUMENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New instrument modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newFamily, setNewFamily] = useState('Strings');
  const [newDescription, setNewDescription] = useState('');

  // History curriculum admin state
  const [selectedHistorySlug, setSelectedHistorySlug] = useState<string>('piano');
  const [historyChapters, setHistoryChapters] = useState<HistoryChapter[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);

  // Chapter form state
  const [chTitle, setChTitle] = useState('');
  const [chEra, setChEra] = useState('');
  const [chSectionNumber, setChSectionNumber] = useState(1);
  const [chIntroduction, setChIntroduction] = useState('');
  const [chContent, setChContent] = useState('');
  const [chKeyTakeaway, setChKeyTakeaway] = useState('');
  const [chImageUrl, setChImageUrl] = useState('');
  const [chImageCaption, setChImageCaption] = useState('');
  const [chAudioNote, setChAudioNote] = useState('C4');
  const [chAudioDescription, setChAudioDescription] = useState('');
  const [chTimelineJson, setChTimelineJson] = useState('[]');
  const [chFactsJson, setChFactsJson] = useState('[]');
  const [chQuizJson, setChQuizJson] = useState('[]');
  const [chXpReward, setChXpReward] = useState(50);
  const [chDurationMinutes, setChDurationMinutes] = useState(10);
  const [chIsPublished, setChIsPublished] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsData, instData] = await Promise.all([
        api.getAdminStats().catch(() => ({ totalUsers: 2, totalInstruments: 4, totalLessons: 16, totalPracticeSessions: 8 })),
        api.getInstruments(),
      ]);
      setStats(statsData);
      setInstruments(instData);

      setStudents([
        {
          id: 2,
          username: 'student',
          email: 'student@musiclms.com',
          displayName: 'Alex Rivera (Learner)',
          role: 'ROLE_STUDENT',
          totalXp: 250,
          currentLevel: 2,
          currentStreakDays: 4,
        },
        {
          id: 1,
          username: 'admin',
          email: 'admin@musiclms.com',
          displayName: 'Platform Administrator',
          role: 'ROLE_ADMIN',
          totalXp: 1200,
          currentLevel: 5,
          currentStreakDays: 14,
        },
      ]);
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryChapters = async (slug: string) => {
    setLoadingHistory(true);
    try {
      const data = await api.getAdminInstrumentHistory(slug);
      setHistoryChapters(data);
    } catch (e) {
      console.error('Failed to load admin history chapters', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchHistoryChapters(selectedHistorySlug);
    }
  }, [activeTab, selectedHistorySlug]);

  const handleAddInstrument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug || !newName) return;

    const newInst: Instrument = {
      id: Date.now(),
      slug: newSlug.toLowerCase().trim(),
      name: newName.trim(),
      family: newFamily,
      description: newDescription,
      iconName: newSlug.toLowerCase().trim(),
      isActive: true,
      displayOrder: instruments.length + 1,
    };

    setInstruments([...instruments, newInst]);
    setShowAddModal(false);
    setNewSlug('');
    setNewName('');
    setNewDescription('');
  };

  // Toggle publish status
  const handleTogglePublish = async (chapterId: number) => {
    try {
      await api.togglePublishHistoryChapter(chapterId);
      setHistoryChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, isPublished: !c.isPublished } : c))
      );
    } catch (e) {
      console.error('Failed to toggle publish', e);
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (chapterId: number) => {
    if (!window.confirm('Are you sure you want to delete this history chapter?')) return;
    try {
      await api.deleteAdminHistoryChapter(chapterId);
      setHistoryChapters((prev) => prev.filter((c) => c.id !== chapterId));
    } catch (e) {
      console.error('Failed to delete chapter', e);
    }
  };

  // Open modal for editing
  const handleOpenEditModal = (chap: HistoryChapter) => {
    setEditingChapterId(chap.id);
    setChTitle(chap.title);
    setChEra(chap.era || '');
    setChSectionNumber(chap.sectionNumber);
    setChIntroduction(chap.introduction || '');
    setChContent(chap.content);
    setChKeyTakeaway(chap.keyTakeaway || '');
    setChImageUrl(chap.imageUrl || '');
    setChImageCaption(chap.imageCaption || '');
    setChAudioNote(chap.audioNote || 'C4');
    setChAudioDescription(chap.audioDescription || '');
    setChTimelineJson(chap.timelineJson || '[]');
    setChFactsJson(chap.factsJson || '[]');
    setChQuizJson(chap.quizJson || '[]');
    setChXpReward(chap.xpReward || 50);
    setChDurationMinutes(chap.durationMinutes || 10);
    setChIsPublished(chap.isPublished);
    setShowChapterModal(true);
  };

  // Open modal for new chapter
  const handleOpenAddChapterModal = () => {
    setEditingChapterId(null);
    setChTitle('');
    setChEra('');
    setChSectionNumber(historyChapters.length + 1);
    setChIntroduction('');
    setChContent('');
    setChKeyTakeaway('');
    setChImageUrl('');
    setChImageCaption('');
    setChAudioNote('C4');
    setChAudioDescription('');
    setChTimelineJson('[]');
    setChFactsJson('[]');
    setChQuizJson('[]');
    setChXpReward(50);
    setChDurationMinutes(10);
    setChIsPublished(true);
    setShowChapterModal(true);
  };

  // Save or update chapter
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const inst = instruments.find((i) => i.slug === selectedHistorySlug) || instruments[0];
    if (!inst) return;

    const payload: Partial<HistoryChapter> = {
      sectionNumber: chSectionNumber,
      title: chTitle,
      era: chEra,
      introduction: chIntroduction,
      content: chContent,
      keyTakeaway: chKeyTakeaway,
      imageUrl: chImageUrl,
      imageCaption: chImageCaption,
      audioNote: chAudioNote,
      audioDescription: chAudioDescription,
      timelineJson: chTimelineJson,
      factsJson: chFactsJson,
      quizJson: chQuizJson,
      xpReward: chXpReward,
      durationMinutes: chDurationMinutes,
      isPublished: chIsPublished,
    };

    try {
      if (editingChapterId) {
        await api.updateAdminHistoryChapter(editingChapterId, payload);
      } else {
        await api.saveAdminHistoryChapter(inst.id, payload);
      }
      setShowChapterModal(false);
      fetchHistoryChapters(selectedHistorySlug);
    } catch (err) {
      console.error('Error saving history chapter', err);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Platform Administration Console"
        subtitle="Manage instruments, curriculum levels, integrated history modules, and inspect learner progress across the platform."
        icon={<Shield size={22} />}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'HISTORY' ? (
              <Button
                variant="amber"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={handleOpenAddChapterModal}
              >
                Add History Chapter
              </Button>
            ) : (
              <Button
                variant="amber"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={() => setShowAddModal(true)}
              >
                Add Instrument
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 2}
          subtitle="Registered learners"
          icon={<Users size={20} />}
          iconBg="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
        />

        <StatCard
          label="Active Instruments"
          value={instruments.length}
          subtitle="4 Configured with Courses"
          icon={<Music size={20} />}
          iconBg="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
        />

        <StatCard
          label="Published Lessons"
          value={stats?.totalLessons || 16}
          subtitle="Across 4 tiers"
          icon={<BookOpen size={20} />}
          iconBg="bg-amber-500/15 text-amber-400 border border-amber-500/30"
        />

        <StatCard
          label="Practice Sessions"
          value={stats?.totalPracticeSessions || 8}
          subtitle="Audio logs recorded"
          icon={<Clock size={20} />}
          iconBg="bg-purple-500/15 text-purple-400 border border-purple-500/30"
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('INSTRUMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'INSTRUMENTS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Instrument Catalog ({instruments.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'HISTORY'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass size={14} />
          History Curriculum
        </button>
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'STUDENTS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Student Roster ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('CURRICULUM')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CURRICULUM'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Curriculum & Levels (4 Tiers)
        </button>
      </div>

      {/* TAB 1: Instruments Catalog Table */}
      {activeTab === 'INSTRUMENTS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders size={18} className="text-indigo-400" />
              Registered Instruments
            </h3>
            <span className="text-xs text-slate-400">Modular multi-instrument schema</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Instrument</th>
                  <th className="py-3 px-4">Family</th>
                  <th className="py-3 px-4">Curriculum Status</th>
                  <th className="py-3 px-4">Platform Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {instruments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-850/40">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {inst.name}
                      <span className="block text-[11px] text-slate-500 font-mono">/{inst.slug}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{inst.family}</td>
                    <td className="py-3.5 px-4 text-indigo-400 font-medium">
                      4 Tiers • Level 1 History & Lessons Configured
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="emerald" size="sm" dot>
                        Active
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedHistorySlug(inst.slug);
                          setActiveTab('HISTORY');
                        }}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                      >
                        Manage History →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: History Curriculum Manager */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass size={18} className="text-amber-400" />
                Integrated History Chapters Manager
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage, publish, unpublish, and edit instrument history modules embedded in Tier 1 Level 1 courses.
              </p>
            </div>

            {/* Instrument Selector Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {instruments.map((inst) => (
                <button
                  key={inst.slug}
                  onClick={() => setSelectedHistorySlug(inst.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedHistorySlug === inst.slug
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {inst.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading history chapters...
            </div>
          ) : historyChapters.length === 0 ? (
            <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800">
              <Compass size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No history chapters yet for this instrument.</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Add your first educational history chapter.</p>
              <Button variant="amber" size="sm" onClick={handleOpenAddChapterModal}>
                Add Chapter
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Chapter Title</th>
                    <th className="py-3 px-4">Historical Era</th>
                    <th className="py-3 px-4">Duration & XP</th>
                    <th className="py-3 px-4">Publish State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {historyChapters.map((chap) => (
                    <tr key={chap.id} className="hover:bg-slate-850/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        Ch. {chap.sectionNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                        {chap.title}
                        {chap.introduction && (
                          <span className="block text-[11px] text-slate-400 font-normal truncate mt-0.5">
                            {chap.introduction}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs">{chap.era}</td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        <span className="text-slate-300">{chap.durationMinutes} min</span> •{' '}
                        <span className="text-amber-400 font-bold">+{chap.xpReward} XP</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePublish(chap.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            chap.isPublished
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          {chap.isPublished ? (
                            <>
                              <Eye size={12} /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(chap)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Chapter"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(chap.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Chapter"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Students Roster Table */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              Learner Accounts & Progress
            </h3>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-850/40">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{st.displayName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{st.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={st.role === 'ROLE_ADMIN' ? 'indigo' : 'slate'} size="sm">
                        {st.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      Level {st.currentLevel}
                    </td>
                    <td className="py-3.5 px-4 text-orange-400 font-bold">
                      🔥 {st.currentStreakDays}d
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-amber-400">
                      {st.totalXp} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Curriculum Overview */}
      {activeTab === 'CURRICULUM' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Standardized 4-Tier Learning Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Every instrument connects to this unified relational hierarchy, with history directly integrated into Tier 1 Level 1.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Tier 1</span>
              <h4 className="text-sm font-bold text-white mt-1">BASICS (Order 1 • 0 XP Unlock)</h4>
              <p className="text-xs text-slate-400 mt-1">Level 1: Integrated History & Anatomy • Level 2: Notes & Pitch • Level 3: Practical Play.</p>
              <Badge variant="emerald" size="sm" className="mt-3">Published & Active</Badge>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Tier 2</span>
              <h4 className="text-sm font-bold text-white mt-1">INTERMEDIATE (Order 2 • 450 XP Unlock)</h4>
              <p className="text-xs text-slate-400 mt-1">3 Levels: Scales & Formulas, Triads & Chords, Hands Together Song Patterns.</p>
              <Badge variant="indigo" size="sm" className="mt-3">Configured</Badge>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Tier 3</span>
              <h4 className="text-sm font-bold text-white mt-1">PRO (Order 3 • 1000 XP Unlock)</h4>
              <p className="text-xs text-slate-400 mt-1">3 Levels: Harmonic Movement, Arpeggios & Velocity, Repertoire Performance.</p>
              <Badge variant="gold" size="sm" className="mt-3">Configured</Badge>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Tier 4</span>
              <h4 className="text-sm font-bold text-white mt-1">EXPERT (Order 4 • 2000 XP Unlock)</h4>
              <p className="text-xs text-slate-400 mt-1">3 Levels: Polyphonic Voice Leading, Virtuosic Concert Literature, Capstone Recital.</p>
              <Badge variant="gold" size="sm" className="mt-3">Configured</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit History Chapter Modal */}
      {showChapterModal && (
        <Modal
          isOpen={showChapterModal}
          onClose={() => setShowChapterModal(false)}
          title={editingChapterId ? 'Edit History Chapter' : 'Add History Chapter'}
          size="xl"
        >
          <form onSubmit={handleSaveChapter} className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Chapter Number
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={chSectionNumber}
                  onChange={(e) => setChSectionNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Historical Era
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. c. 1700 Florence, Italy"
                  value={chEra}
                  onChange={(e) => setChEra(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  XP Reward
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={chXpReward}
                  onChange={(e) => setChXpReward(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bartolomeo Cristofori and the Early Piano"
                value={chTitle}
                onChange={(e) => setChTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Introduction Summary
              </label>
              <textarea
                rows={2}
                placeholder="Engaging opening overview..."
                value={chIntroduction}
                onChange={(e) => setChIntroduction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Historical Narrative & Explanation
              </label>
              <textarea
                rows={6}
                required
                placeholder="In-depth historical narrative explaining inventions, mechanics, and milestones..."
                value={chContent}
                onChange={(e) => setChContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Key Learning Takeaway
              </label>
              <input
                type="text"
                placeholder="Core educational takeaway..."
                value={chKeyTakeaway}
                onChange={(e) => setChKeyTakeaway(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={chImageUrl}
                  onChange={(e) => setChImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Image Caption
                </label>
                <input
                  type="text"
                  placeholder="Caption for illustration..."
                  value={chImageCaption}
                  onChange={(e) => setChImageCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Audio Tone Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. C4, E2, A4"
                  value={chAudioNote}
                  onChange={(e) => setChAudioNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Audio Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fundamental acoustic resonance..."
                  value={chAudioDescription}
                  onChange={(e) => setChAudioDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Timeline Developments JSON
              </label>
              <textarea
                rows={3}
                placeholder='[{"year": "1700", "event": "Invention", "description": "..."}]'
                value={chTimelineJson}
                onChange={(e) => setChTimelineJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Acoustic Facts JSON
              </label>
              <textarea
                rows={3}
                placeholder='[{"title": "Escapement", "tag": "Engineering", "description": "..."}]'
                value={chFactsJson}
                onChange={(e) => setChFactsJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Knowledge Check Quiz JSON
              </label>
              <textarea
                rows={4}
                placeholder='[{"id": 1, "question": "...", "options": ["A","B"], "correctIndex": 0, "explanation": "..."}]'
                value={chQuizJson}
                onChange={(e) => setChQuizJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPublishedCheck"
                checked={chIsPublished}
                onChange={(e) => setChIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800 focus:ring-amber-500"
              />
              <label htmlFor="isPublishedCheck" className="text-xs font-bold text-slate-300">
                Publish this chapter immediately (visible to students)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowChapterModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="amber" size="sm">
                {editingChapterId ? 'Save Changes' : 'Create History Chapter'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Instrument Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Musical Instrument"
          size="md"
        >
          <form onSubmit={handleAddInstrument} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Instrument Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cello / Trumpet"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Slug Identifier
              </label>
              <input
                type="text"
                required
                placeholder="e.g. cello"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Instrument Family
              </label>
              <select
                value={newFamily}
                onChange={(e) => setNewFamily(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Strings">Strings</option>
                <option value="Woodwinds">Woodwinds</option>
                <option value="Brass">Brass</option>
                <option value="Percussion">Percussion</option>
                <option value="Keyboard">Keyboard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Description
              </label>
              <textarea
                placeholder="Pedagogical description of the instrument..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="amber" size="sm">
                Save & Register Instrument
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
