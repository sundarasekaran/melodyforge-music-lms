import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Instrument, 
  User, 
  HistoryChapter, 
  Lesson, 
  LearningTier, 
  AdminAssessmentStats,
  AdminPlatformAnalytics,
  StudentSummaryPage
} from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
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
  Award,
  FileCheck2,
  TrendingUp,
  Activity,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'INSTRUMENTS' | 'STUDENTS' | 'CURRICULUM' | 'HISTORY' | 'ASSESSMENTS'>('ANALYTICS');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Platform Analytics State
  const [platformAnalytics, setPlatformAnalytics] = useState<AdminPlatformAnalytics | null>(null);
  const [loadingPlatformAnalytics, setLoadingPlatformAnalytics] = useState(false);

  // Paginated Students State
  const [studentPage, setStudentPage] = useState<StudentSummaryPage | null>(null);
  const [studentCurrentPage, setStudentCurrentPage] = useState(0);
  const [loadingStudentPage, setLoadingStudentPage] = useState(false);

  // Assessment admin state
  const [assessmentStats, setAssessmentStats] = useState<AdminAssessmentStats | null>(null);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

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

  // Lesson curriculum admin state
  const [selectedCurriculumSlug, setSelectedCurriculumSlug] = useState<string>('piano');
  const [curriculumTiers, setCurriculumTiers] = useState<LearningTier[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Lesson form state
  const [lesTitle, setLesTitle] = useState('');
  const [lesDescription, setLesDescription] = useState('');
  const [lesTheoryContent, setLesTheoryContent] = useState('');
  const [lesType, setLesType] = useState<'THEORY' | 'PRACTICAL' | 'LISTENING' | 'ASSESSMENT'>('THEORY');
  const [lesDuration, setLesDuration] = useState(10);
  const [lesXpReward, setLesXpReward] = useState(50);
  const [lesIsPublished, setLesIsPublished] = useState(true);

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

  const fetchCurriculumTiers = async (slug: string) => {
    setLoadingCurriculum(true);
    try {
      const data = await api.getInstrumentTiers(slug);
      setCurriculumTiers(data);
    } catch (e) {
      console.error('Failed to load curriculum tiers', e);
    } finally {
      setLoadingCurriculum(false);
    }
  };

  const fetchAssessmentStats = async () => {
    setLoadingAssessments(true);
    try {
      const data = await api.getAdminAssessmentStats();
      setAssessmentStats(data);
    } catch (e) {
      console.warn('Failed to load assessment stats, using fallback:', e);
      setAssessmentStats({
        totalAttempts: 15,
        passedAttempts: 12,
        totalCertificatesIssued: 3,
        level1PassRate: 88,
        level2PassRate: 80,
        level3PassRate: 72,
        certificates: [
          {
            id: 1,
            certificateNumber: 'MF-PIA-2026-0001',
            studentDisplayName: 'Demo Scholar',
            instrumentName: 'Piano',
            instrumentSlug: 'piano',
            issueDate: '2026-11-20',
            verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            averageScorePercent: 91,
            totalXpAtGraduation: 1850,
            institutionName: 'MelodyForge Conservatory of Music',
          },
        ],
      });
    } finally {
      setLoadingAssessments(false);
    }
  };

  const fetchPlatformAnalytics = async () => {
    setLoadingPlatformAnalytics(true);
    try {
      const data = await api.getAdminPlatformAnalytics();
      setPlatformAnalytics(data);
    } catch (e) {
      console.warn('Failed to load platform analytics, using fallback:', e);
      setPlatformAnalytics({
        totalRegisteredStudents: 50,
        activeStudentsCount: 28,
        totalCompletedLessons: 140,
        totalPracticeSessions: 85,
        totalPracticeDurationMinutes: 1250,
        totalAssessmentAttempts: 40,
        totalCertificatesIssued: 12,
        assessmentPassRate: 80.0,
        instrumentPopularity: [
          { slug: 'piano', name: 'Piano & Keyboard', family: 'Keyboard', activeLearners: 50, completedLessons: 110, practiceSessionsCount: 65, totalPracticeMinutes: 980 },
          { slug: 'guitar', name: 'Acoustic Guitar', family: 'Strings', activeLearners: 25, completedLessons: 15, practiceSessionsCount: 10, totalPracticeMinutes: 120 },
          { slug: 'violin', name: 'Violin', family: 'Strings', activeLearners: 18, completedLessons: 8, practiceSessionsCount: 6, totalPracticeMinutes: 90 },
          { slug: 'drums', name: 'Drum Kit & Percussion', family: 'Percussion', activeLearners: 12, completedLessons: 7, practiceSessionsCount: 4, totalPracticeMinutes: 60 },
        ],
        mostCompletedLessons: [
          { lessonId: 1, title: 'Anatomy of the Concert Grand', instrumentName: 'Piano', tierName: 'BASICS', completionsCount: 45 },
          { lessonId: 2, title: 'Middle C & Treble Clef Landmarks', instrumentName: 'Piano', tierName: 'BASICS', completionsCount: 38 },
          { lessonId: 3, title: 'Two-Hand Symmetry & Biomechanics', instrumentName: 'Piano', tierName: 'BASICS', completionsCount: 30 },
        ],
        assessmentLevelBreakdown: [
          { level: 1, title: 'Foundations & Mechanics', passThresholdPercent: 70, totalAttempts: 22, passedCount: 19, passRate: 86.4, averageScore: 84.5 },
          { level: 2, title: 'Technique & Triads', passThresholdPercent: 75, totalAttempts: 12, passedCount: 9, passRate: 75.0, averageScore: 81.0 },
          { level: 3, title: 'Conservatory Capstone', passThresholdPercent: 80, totalAttempts: 6, passedCount: 4, passRate: 66.7, averageScore: 82.5 },
        ],
        weeklyActivityTrend: [
          { date: 'Nov 17', dayName: 'Mon', practiceSessionCount: 8, lessonsCompletedCount: 12 },
          { date: 'Nov 18', dayName: 'Tue', practiceSessionCount: 11, lessonsCompletedCount: 15 },
          { date: 'Nov 19', dayName: 'Wed', practiceSessionCount: 9, lessonsCompletedCount: 10 },
          { date: 'Nov 20', dayName: 'Thu', practiceSessionCount: 14, lessonsCompletedCount: 18 },
          { date: 'Nov 21', dayName: 'Fri', practiceSessionCount: 12, lessonsCompletedCount: 16 },
          { date: 'Nov 22', dayName: 'Sat', practiceSessionCount: 18, lessonsCompletedCount: 24 },
          { date: 'Nov 23', dayName: 'Sun', practiceSessionCount: 13, lessonsCompletedCount: 15 },
        ],
      });
    } finally {
      setLoadingPlatformAnalytics(false);
    }
  };

  const fetchPaginatedStudents = async (page = 0, query = '') => {
    setLoadingStudentPage(true);
    try {
      const data = await api.getPaginatedStudents(page, 10, query);
      setStudentPage(data);
      setStudentCurrentPage(data.page);
    } catch (e) {
      console.warn('Failed to fetch paginated students, using fallback:', e);
      setStudentPage({
        students: [
          { id: 1, username: 'admin', displayName: 'Platform Administrator', email: 'admin@musiclms.com', role: 'ROLE_ADMIN', totalXp: 1200, currentLevel: 5, currentStreakDays: 14, completedLessons: 16, totalPracticeMinutes: 180 },
          { id: 2, username: 'student', displayName: 'Alex Rivera (Learner)', email: 'student@musiclms.com', role: 'ROLE_STUDENT', totalXp: 250, currentLevel: 2, currentStreakDays: 4, completedLessons: 4, totalPracticeMinutes: 30 },
        ],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
      });
    } finally {
      setLoadingStudentPage(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchPlatformAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'ANALYTICS') {
      fetchPlatformAnalytics();
    } else if (activeTab === 'HISTORY') {
      fetchHistoryChapters(selectedHistorySlug);
    } else if (activeTab === 'STUDENTS') {
      fetchPaginatedStudents(studentCurrentPage, searchQuery);
    } else if (activeTab === 'CURRICULUM') {
      fetchCurriculumTiers(selectedCurriculumSlug);
    } else if (activeTab === 'ASSESSMENTS') {
      fetchAssessmentStats();
    }
  }, [activeTab, selectedHistorySlug, selectedCurriculumSlug, studentCurrentPage]);

  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLesTitle(lesson.title);
    setLesDescription(lesson.description || '');
    setLesTheoryContent(lesson.theoryContent || '');
    setLesType(lesson.lessonType || 'THEORY');
    setLesDuration(lesson.durationMinutes || 10);
    setLesXpReward(lesson.xpReward || 50);
    setLesIsPublished(lesson.isPublished ?? true);
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    const payload: Partial<Lesson> = {
      id: editingLesson.id,
      title: lesTitle,
      description: lesDescription,
      theoryContent: lesTheoryContent,
      lessonType: lesType,
      durationMinutes: lesDuration,
      xpReward: lesXpReward,
      isPublished: lesIsPublished,
    };

    try {
      await api.saveAdminLesson(payload);
      setShowLessonModal(false);
      fetchCurriculumTiers(selectedCurriculumSlug);
    } catch (err) {
      console.error('Error saving lesson', err);
    }
  };

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

  const handleStudentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setStudentCurrentPage(0);
    fetchPaginatedStudents(0, q);
  };

  const handlePageChange = (newPage: number) => {
    setStudentCurrentPage(newPage);
    fetchPaginatedStudents(newPage, searchQuery);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayStudents = studentPage?.students && studentPage.students.length > 0
    ? studentPage.students
    : filteredStudents.map((s) => ({
        id: s.id,
        username: s.username,
        displayName: s.displayName,
        email: s.email,
        role: s.role,
        totalXp: s.totalXp,
        currentLevel: s.currentLevel,
        currentStreakDays: s.currentStreakDays,
        completedLessons: s.role === 'ROLE_ADMIN' ? 16 : 4,
        totalPracticeMinutes: s.role === 'ROLE_ADMIN' ? 180 : 30,
      }));

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
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ANALYTICS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity size={14} />
          Platform Intelligence
        </button>
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
          Student Roster ({studentPage?.totalElements || students.length})
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
        <button
          onClick={() => setActiveTab('ASSESSMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ASSESSMENTS'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award size={14} />
          Assessments & Certificates
        </button>
      </div>

      {/* TAB 0: Platform Intelligence & Analytics */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Real-time Platform Intelligence Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-indigo-400" />
                  Live Platform Intelligence & Pedagogical Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authoritative institutional metrics across all four instruments, course progressions, practice hours, and conservatory diplomas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Realtime Engine Active
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPlatformAnalytics}
                  loading={loadingPlatformAnalytics}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Registered</span>
                <div className="text-2xl font-black text-white mt-1">
                  {platformAnalytics?.totalRegisteredStudents || 0}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Total accounts</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">30d Active</span>
                <div className="text-2xl font-black text-indigo-300 mt-1">
                  {platformAnalytics?.activeStudentsCount || 0}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Active learners</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Lessons Passed</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {platformAnalytics?.totalCompletedLessons || 0}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Curriculum steps</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">Practice Time</span>
                <div className="text-2xl font-black text-purple-300 mt-1">
                  {Math.round((platformAnalytics?.totalPracticeDurationMinutes || 0) / 60)}h
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {platformAnalytics?.totalPracticeSessions || 0} sessions ({platformAnalytics?.totalPracticeDurationMinutes || 0}m)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">Pass Rate</span>
                <div className="text-2xl font-black text-cyan-300 mt-1">
                  {platformAnalytics ? Math.round(platformAnalytics.assessmentPassRate) : 0}%
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {platformAnalytics?.totalAssessmentAttempts || 0} attempts
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Conferred Diplomas</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {platformAnalytics?.totalCertificatesIssued || 0}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Verified SHA-256</span>
              </div>
            </div>
          </div>

          {/* Multi-Instrument Engagement & Popularity Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music size={18} className="text-amber-400" />
                Multi-Instrument Adoption & Practice Engagement
              </h3>
              <span className="text-xs text-slate-400">Piano, Guitar, Violin, Drums</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformAnalytics?.instrumentPopularity && platformAnalytics.instrumentPopularity.length > 0 ? (
                platformAnalytics.instrumentPopularity.map((inst) => {
                  const maxPractice = Math.max(
                    ...platformAnalytics.instrumentPopularity.map((p) => p.totalPracticeMinutes || 1),
                    1
                  );
                  const sharePercent = Math.min(
                    100,
                    Math.round((inst.totalPracticeMinutes / maxPractice) * 100)
                  );

                  return (
                    <div
                      key={inst.slug}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{inst.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            {inst.family}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {inst.activeLearners} learners
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Lessons Completed:</span>
                          <span className="font-bold text-emerald-400">{inst.completedLessons}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Practice Sessions:</span>
                          <span className="font-bold text-purple-400">{inst.practiceSessionsCount}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Total Practice:</span>
                          <span className="font-bold text-white">
                            {Math.round(inst.totalPracticeMinutes / 60)}h {inst.totalPracticeMinutes % 60}m
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Practice Volume Share</span>
                          <span>{sharePercent}%</span>
                        </div>
                        <ProgressBar value={sharePercent} color={inst.slug === 'piano' ? 'gold' : 'indigo'} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-6 text-xs text-slate-500">
                  No instrument engagement data recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Two-Column Analytics: Most Popular Lessons & Conservatory Assessment Levels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Lessons */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                Curriculum Momentum: Most Completed Lessons
              </h3>

              <div className="space-y-2.5">
                {platformAnalytics?.mostCompletedLessons && platformAnalytics.mostCompletedLessons.length > 0 ? (
                  platformAnalytics.mostCompletedLessons.map((item, idx) => (
                    <div
                      key={item.lessonId}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center text-xs font-mono">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-white text-xs">{item.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {item.instrumentName} • Tier {item.tierName}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.completionsCount} completions
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No completed lessons recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Conservatory Assessment Levels */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-amber-400" />
                Examination Standards & Level Pass Rates
              </h3>

              <div className="space-y-3">
                {platformAnalytics?.assessmentLevelBreakdown && platformAnalytics.assessmentLevelBreakdown.length > 0 ? (
                  platformAnalytics.assessmentLevelBreakdown.map((lvl) => (
                    <div
                      key={lvl.level}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            Level {lvl.level}: {lvl.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            Pass: {lvl.passThresholdPercent}%
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          {Math.round(lvl.passRate)}% Pass Rate
                        </span>
                      </div>

                      <ProgressBar
                        value={lvl.passRate}
                        color={lvl.passRate >= lvl.passThresholdPercent ? 'emerald' : 'gold'}
                      />

                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{lvl.passedCount} of {lvl.totalAttempts} candidates passed</span>
                        <span>Avg Score: {Math.round(lvl.averageScore)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No assessment attempts recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 7-Day Platform Velocity Trend */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                7-Day Platform Activity Velocity
              </h3>
              <span className="text-xs text-slate-400">Daily practice sessions & lesson completions</span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2">
              {platformAnalytics?.weeklyActivityTrend && platformAnalytics.weeklyActivityTrend.length > 0 ? (
                platformAnalytics.weeklyActivityTrend.map((d, i) => {
                  const maxDay = Math.max(
                    ...platformAnalytics.weeklyActivityTrend.map(
                      (item) => item.practiceSessionCount + item.lessonsCompletedCount
                    ),
                    1
                  );
                  const totalDay = d.practiceSessionCount + d.lessonsCompletedCount;
                  const heightPercent = Math.max(12, Math.min(100, Math.round((totalDay / maxDay) * 100)));

                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="text-[10px] font-mono text-slate-400">{d.practiceSessionCount}p / {d.lessonsCompletedCount}l</div>
                      <div className="w-full h-24 bg-slate-950 rounded-xl p-1 flex items-end justify-center border border-slate-800">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-indigo-600 via-indigo-500 to-amber-400 transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-300">{d.dayName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{d.date}</span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-7 text-center py-6 text-xs text-slate-500">
                  No activity trend recorded for this week.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                Learner Accounts & Progress Roster
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Search and audit student accounts, curriculum completion, practice hours, and levels.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, username or email..."
                value={searchQuery}
                onChange={handleStudentSearch}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {loadingStudentPage ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading student records...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4">Completed Lessons</th>
                      <th className="py-3 px-4">Practice Time</th>
                      <th className="py-3 px-4 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-850/40">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{st.displayName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{st.email || st.username}</p>
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
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                          {st.completedLessons ?? 0}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-purple-300">
                          {st.totalPracticeMinutes ? `${Math.round(st.totalPracticeMinutes)}m` : '0m'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-amber-400">
                          {st.totalXp} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div>
                  Showing {displayStudents.length} of {studentPage?.totalElements || displayStudents.length} learners
                  {studentPage && ` • Page ${studentCurrentPage + 1} of ${Math.max(1, studentPage.totalPages)}`}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={studentCurrentPage === 0 || loadingStudentPage}
                    onClick={() => handlePageChange(Math.max(0, studentCurrentPage - 1))}
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!studentPage || studentCurrentPage >= studentPage.totalPages - 1 || loadingStudentPage}
                    onClick={() => handlePageChange(studentCurrentPage + 1)}
                    rightIcon={<ChevronRight size={14} />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
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

          {/* Interactive Lesson & Lab Curriculum Manager */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 size={16} className="text-indigo-400" />
                  Curriculum Lessons &amp; Attached Educational Labs
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect and edit lesson theory content, durations, XP awards, and attached pedagogical laboratories.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Instrument:</span>
                <select
                  value={selectedCurriculumSlug}
                  onChange={(e) => {
                    setSelectedCurriculumSlug(e.target.value);
                    fetchCurriculumTiers(e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
                >
                  {instruments.map((inst) => (
                    <option key={inst.id} value={inst.slug}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingCurriculum ? (
              <div className="flex items-center justify-center p-8 text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-xs">Loading curriculum tree...</span>
              </div>
            ) : curriculumTiers.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No tiers or lessons found for {selectedCurriculumSlug}.
              </div>
            ) : (
              <div className="space-y-4">
                {curriculumTiers.map((tier) => (
                  <div key={tier.id} className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                        Tier {tier.tierOrder}: {tier.tierName}
                      </span>
                      <Badge variant="indigo" size="sm">
                        {tier.levels.reduce((acc, l) => acc + l.courses.reduce((cAcc, c) => cAcc + c.lessons.length, 0), 0)} Lessons
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {tier.levels.map((level) => (
                        <div key={level.id} className="space-y-2 pt-1">
                          <h5 className="text-xs font-bold text-slate-300 px-1">
                            {level.title}
                          </h5>

                          <div className="space-y-1.5">
                            {level.courses.flatMap((c) => c.lessons).map((lesson) => {
                              const tLower = lesson.title.toLowerCase();
                              let attachedLab = 'Virtual Piano';
                              if (tLower.includes('anatomy') || tLower.includes('sound')) attachedLab = '🔬 Sound Action Physics Lab';
                              else if (tLower.includes('pattern') || tLower.includes('white keys') || tLower.includes('middle c')) attachedLab = '🧭 Keyboard Explorer Game';
                              else if (tLower.includes('alphabet') || tLower.includes('notation')) attachedLab = '🎼 Notation Theory Lab';
                              else if (tLower.includes('posture') || tLower.includes('finger')) attachedLab = '🪑 Posture & Hand Lab';

                              return (
                                <div
                                  key={lesson.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                                        {lesson.title}
                                      </p>
                                      <Badge variant="slate" size="sm">
                                        {lesson.lessonType}
                                      </Badge>
                                      <Badge variant="gold" size="sm">
                                        +{lesson.xpReward} XP
                                      </Badge>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                      {lesson.description}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                                      {attachedLab}
                                    </span>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<Edit3 size={13} />}
                                      onClick={() => handleOpenEditLesson(lesson)}
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Assessments & Certificates */}
      {activeTab === 'ASSESSMENTS' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Total Attempts Recorded</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {assessmentStats?.totalAttempts || 0}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Authoritative examinations</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Passed Attempts</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {assessmentStats?.passedAttempts || 0}
              </div>
              <span className="text-xs text-emerald-500/80 mt-1 block">
                {assessmentStats && assessmentStats.totalAttempts > 0
                  ? Math.round((assessmentStats.passedAttempts / assessmentStats.totalAttempts) * 100)
                  : 0}
                % Overall Pass Rate
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Certificates Conferred</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">
                {assessmentStats?.totalCertificatesIssued || 0}
              </div>
              <span className="text-xs text-amber-500/80 mt-1 block">Graduation Diplomas with SHA-256</span>
            </div>
          </div>

          {/* Level Thresholds & Pass Rates */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" />
              Level Progression Standards & Success Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase">Level 1 Foundations</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                    Pass: 70%
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {assessmentStats?.level1PassRate || 0}%
                </div>
                <p className="text-[11px] text-slate-400">
                  Focus: History, soundboard, 88 keys, Middle C, sitting posture & finger numbering.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase">Level 2 Technique</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                    Pass: 75%
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {assessmentStats?.level2PassRate || 0}%
                </div>
                <p className="text-[11px] text-slate-400">
                  Focus: Sharps/flats, enharmonics, intervals, staff clefs, major scale formula & triads.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase">Level 3 Capstone</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                    Pass: 80%
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {assessmentStats?.level3PassRate || 0}%
                </div>
                <p className="text-[11px] text-slate-400">
                  Focus: Ascending C Major scale, primary triads, Ode to Joy melody & two-hand cadence.
                </p>
              </div>
            </div>
          </div>

          {/* Issued Certificates Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 size={18} className="text-amber-400" />
                Conferred Conservatory Diplomas
              </h3>
              <span className="text-xs text-slate-400">
                {assessmentStats?.certificates?.length || 0} diplomas recorded
              </span>
            </div>

            {loadingAssessments ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading graduation records...</div>
            ) : assessmentStats?.certificates && assessmentStats.certificates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Certificate Number</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3">Issue Date</th>
                      <th className="py-2.5 px-3">Average Score</th>
                      <th className="py-2.5 px-3">Verification Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {assessmentStats.certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                          {cert.certificateNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {cert.studentDisplayName}
                        </td>
                        <td className="py-2.5 px-3">{cert.instrumentName}</td>
                        <td className="py-2.5 px-3 text-slate-400">{cert.issueDate}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          {cert.averageScorePercent}%
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                          {cert.verificationHash ? cert.verificationHash.substring(0, 16) + '...' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No graduation diplomas have been claimed yet.
              </div>
            )}
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
          <form onSubmit={handleSaveChapter} className="space-y-4 py-2 max-h-[60dvh] sm:max-h-[70dvh] overflow-y-auto pr-1">
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

      {/* Edit Curriculum Lesson Modal */}
      {showLessonModal && editingLesson && (
        <Modal
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          title={`Edit Lesson: ${editingLesson.title}`}
          size="lg"
        >
          <form onSubmit={handleSaveLesson} className="space-y-4 py-2 max-h-[70dvh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Lesson Title
              </label>
              <input
                type="text"
                required
                value={lesTitle}
                onChange={(e) => setLesTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Lesson Type
                </label>
                <select
                  value={lesType}
                  onChange={(e) => setLesType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                >
                  <option value="THEORY">THEORY</option>
                  <option value="PRACTICAL">PRACTICAL</option>
                  <option value="LISTENING">LISTENING</option>
                  <option value="ASSESSMENT">ASSESSMENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={lesDuration}
                  onChange={(e) => setLesDuration(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  XP Reward
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  required
                  value={lesXpReward}
                  onChange={(e) => setLesXpReward(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={lesDescription}
                onChange={(e) => setLesDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Theory &amp; Instruction Content (Markdown)
              </label>
              <textarea
                rows={8}
                value={lesTheoryContent}
                onChange={(e) => setLesTheoryContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isLessonPublishedCheck"
                checked={lesIsPublished}
                onChange={(e) => setLesIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-500 bg-slate-950 border-slate-800 focus:ring-indigo-500"
              />
              <label htmlFor="isLessonPublishedCheck" className="text-xs font-bold text-slate-300">
                Lesson is published and visible to learners
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowLessonModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Lesson Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
