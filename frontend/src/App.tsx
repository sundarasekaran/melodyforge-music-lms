import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Sidebar, NavigationTab } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { InstrumentCatalog } from './components/Instruments/InstrumentCatalog';
import { RoadmapView } from './components/Curriculum/RoadmapView';
import { LessonViewer } from './components/Curriculum/LessonViewer';
import { InstrumentHistoryChapter } from './components/History/InstrumentHistoryChapter';
import { VirtualPiano } from './components/VirtualPiano/VirtualPiano';
import { EarTrainingArena } from './components/EarTraining/EarTrainingArena';
import { PracticeStudio } from './components/PracticeStudio/PracticeStudio';
import { BadgesGallery } from './components/Gamification/BadgesGallery';
import { Leaderboard } from './components/Gamification/Leaderboard';
import { MyProgressView } from './components/Progress/MyProgressView';
import { AdminPortal } from './components/Admin/AdminPortal';
import { SplashScreen } from './components/ui/SplashScreen';
import { Button } from './components/ui/Button';
import { Music, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('DASHBOARD');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('piano');
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);

  // App opening logo & first-time install detection
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isFirstTimeUser] = useState<boolean>(() => {
    try {
      const alreadyOpened = localStorage.getItem('melodyforge_app_has_opened');
      return !alreadyOpened;
    } catch {
      return false;
    }
  });

  const handleSplashFinish = () => {
    setShowSplash(false);
    try {
      localStorage.setItem('melodyforge_app_has_opened', 'true');
    } catch {}
  };

  // Navigation sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Handle launch lesson from dashboard or roadmap
  const handleLaunchLesson = (lessonId: number) => {
    setActiveTab('ROADMAP');
    setActiveLessonId(lessonId);
    setIsViewingHistory(false);
  };

  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab !== 'ROADMAP') {
      setActiveLessonId(null);
      setIsViewingHistory(false);
    }
  };

  // 1. Opening Logo Screen (always visible first on app start)
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} minDuration={2200} />;
  }

  // 2. Loading State (if auth verification is pending after splash)
  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center text-slate-100 selection:bg-indigo-500 selection:text-white">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 animate-pulse">
          <Music size={28} />
        </div>
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Loading MelodyForge Studio...
        </p>
      </div>
    );
  }

  // 3. Unauthenticated State:
  //    - 1st Time Opening App -> Default to Sign Up (REGISTER)
  //    - Returning User -> Default to Sign In (LOGIN)
  if (!user) {
    return <AuthPage initialMode={isFirstTimeUser ? 'REGISTER' : 'LOGIN'} />;
  }

  // 4. Authenticated State: User is already signed in -> Open already signed account directly!

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Right Application Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen w-full min-w-0 max-w-full transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header Application Bar */}
        <Header
          activeTab={activeTab}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={(slug) => setSelectedInstrument(slug)}
          onMobileMenuToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
          breadcrumb={
            isViewingHistory
              ? `${selectedInstrument.charAt(0).toUpperCase() + selectedInstrument.slice(1)} History`
              : activeLessonId
              ? 'Active Lesson'
              : undefined
          }
        />

        {/* Dynamic Page Content Viewport */}
        <main
          className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-w-0"
          style={{
            paddingBottom: 'max(3rem, calc(env(safe-area-inset-bottom, 0px) + 2.5rem))',
            paddingLeft: 'max(0.75rem, calc(env(safe-area-inset-left, 0px) + 0.5rem))',
            paddingRight: 'max(0.75rem, calc(env(safe-area-inset-right, 0px) + 0.5rem))',
          }}
        >
          {/* TAB 1: Student Dashboard */}
          {activeTab === 'DASHBOARD' && (
            <StudentDashboard
              onNavigate={handleTabChange}
              onLaunchLesson={handleLaunchLesson}
            />
          )}

              {/* TAB 2: Multi-Instrument Catalog */}
              {activeTab === 'INSTRUMENTS' && (
                <InstrumentCatalog
                  selectedInstrument={selectedInstrument}
                  onSelectInstrument={(slug) => setSelectedInstrument(slug)}
                  onNavigate={handleTabChange}
                />
              )}

              {/* TAB 3: Learning Path / Course Roadmap / Integrated History */}
              {activeTab === 'ROADMAP' && (
                isViewingHistory ? (
                  <InstrumentHistoryChapter
                    instrumentSlug={selectedInstrument}
                    instrumentName={
                      selectedInstrument === 'guitar'
                        ? 'Guitar'
                        : selectedInstrument === 'violin'
                        ? 'Violin'
                        : selectedInstrument === 'drums'
                        ? 'Drums'
                        : 'Piano'
                    }
                    onBack={() => setIsViewingHistory(false)}
                  />
                ) : activeLessonId ? (
                  <LessonViewer
                    lessonId={activeLessonId}
                    onBack={() => setActiveLessonId(null)}
                    onLessonCompleted={() => {
                      // Lesson completion handled
                    }}
                  />
                ) : (
                  <RoadmapView
                    selectedInstrument={selectedInstrument}
                    onSelectLesson={(id) => {
                      setActiveLessonId(id);
                      setIsViewingHistory(false);
                    }}
                    onSelectHistory={() => {
                      setIsViewingHistory(true);
                      setActiveLessonId(null);
                    }}
                  />
                )
              )}

              {/* TAB 5: Standalone Concert Grand Virtual Piano */}
              {activeTab === 'PIANO' && (
                <div className="space-y-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Music className="text-indigo-400" size={22} />
                        Concert Grand Virtual Piano
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Polyphonic acoustic piano synthesis, interactive treble clef notation, and computer keyboard controls
                      </p>
                    </div>
                  </div>
                  <VirtualPiano showStaff={true} />
                </div>
              )}

              {/* TAB 6: Ear Training Arena */}
              {activeTab === 'EAR_TRAINING' && (
                <EarTrainingArena />
              )}

              {/* TAB 7: Practice Studio & Audio Recorder */}
              {activeTab === 'STUDIO' && (
                <PracticeStudio />
              )}

              {/* TAB 8: Badges & Achievements */}
              {activeTab === 'BADGES' && (
                <div className="space-y-8">
                  <BadgesGallery />
                  <Leaderboard />
                </div>
              )}

              {/* TAB 9: My Progress & Analytics */}
              {activeTab === 'PROGRESS' && (
                <MyProgressView />
              )}

              {/* TAB 10: Admin Management Portal (Strictly guarded for single administrative credential) */}
              {activeTab === 'ADMIN' && (
                user?.role === 'ROLE_ADMIN' ? (
                  <AdminPortal />
                ) : (
                  <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                      <Music size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-xs text-slate-400 mb-6">
                      Administrative access is strictly restricted to the authorized platform administrator.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => handleTabChange('DASHBOARD')}
                    >
                      Return to Student Dashboard
                    </Button>
                  </div>
                )
              )}
            </main>

        {/* Global Application Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500 w-full min-w-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              <span className="font-bold text-slate-400">MelodyForge LMS</span>
              <span>•</span>
              <span>Multi-Instrument Educational Framework</span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-[11px] text-slate-400">
              <span>Flagship: Piano / Keyboard</span>
              <span>•</span>
              <span>4 Progressive Tiers</span>
              <span>•</span>
              <span>Tone.js & Web Audio Synthesis</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
