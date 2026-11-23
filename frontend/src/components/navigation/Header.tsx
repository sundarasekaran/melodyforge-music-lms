import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Flame,
  Zap,
  ChevronDown,
  LogOut,
  User as UserIcon,
  BookOpen,
  BarChart2,
  Award,
  Settings,
  Shield,
  Volume2,
  VolumeX,
  Music,
  Check,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { audioEngine, PianoVoice } from '../../audio/AudioEngine';

interface HeaderProps {
  activeTab: NavigationTab;
  selectedInstrument: string;
  onInstrumentChange: (slug: string) => void;
  onMobileMenuToggle: () => void;
  onNavigate?: (tab: NavigationTab) => void;
  breadcrumb?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  selectedInstrument,
  onInstrumentChange,
  onMobileMenuToggle,
  onNavigate,
  breadcrumb,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInstMenu, setShowInstMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Audio Engine Settings local state (syncs with audioEngine singleton)
  const [masterVolume, setMasterVolume] = useState<number>(() => audioEngine.getVolume());
  const [activeVoice, setActiveVoice] = useState<PianoVoice>(() => audioEngine.getVoice());
  const [isMuted, setIsMuted] = useState<boolean>(() => audioEngine.isMuted());
  const [autoSustain, setAutoSustain] = useState<boolean>(() => audioEngine.getSustain());
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const instMenuRef = useRef<HTMLDivElement>(null);

  // Close User Menu on click outside or Escape key
  useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        userButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

  // Close Instrument Menu on click outside or Escape key
  useEffect(() => {
    if (!showInstMenu) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (instMenuRef.current && !instMenuRef.current.contains(event.target as Node)) {
        setShowInstMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowInstMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showInstMenu]);

  const instruments = [
    { slug: 'piano', name: 'Piano & Keyboard', active: true, icon: '🎹' },
    { slug: 'guitar', name: 'Acoustic Guitar', active: true, icon: '🎸' },
    { slug: 'violin', name: 'Violin', active: true, icon: '🎻' },
    { slug: 'drums', name: 'Drum Kit', active: true, icon: '🥁' },
  ];

  const currentInst = instruments.find((i) => i.slug === selectedInstrument) || instruments[0];

  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'DASHBOARD': return 'Student Dashboard';
      case 'INSTRUMENTS': return 'My Instruments Catalog';
      case 'ROADMAP': return 'Curriculum & Learning Path';
      case 'PIANO': return 'Concert Grand Virtual Piano';
      case 'EAR_TRAINING': return 'Ear Training Arena';
      case 'STUDIO': return 'Practice Studio & Recorder';
      case 'ASSESSMENTS': return 'Piano Graded Assessments';
      case 'CERTIFICATE': return 'Conservatory Graduation Diploma';
      case 'BADGES': return 'Achievements & Trophies';
      case 'PROGRESS': return 'Learning Progress & Analytics';
      case 'ADMIN': return 'Platform Administration';
      default: return 'MelodyForge';
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setMasterVolume(newVol);
    audioEngine.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      audioEngine.setMuted(false);
    }
    showFeedbackToast('Volume updated');
  };

  const handleVoiceChange = (v: PianoVoice) => {
    setActiveVoice(v);
    audioEngine.setVoice(v);
    audioEngine.playQuickNote(60, 300); // Quick sound preview
    showFeedbackToast(`Voice set to ${v === 'grand' ? 'Grand Piano' : v === 'electric' ? 'Electric Piano' : 'Harpsichord'}`);
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
    showFeedbackToast(nextMute ? 'Audio muted' : 'Audio unmuted');
  };

  const handleSustainToggle = () => {
    const nextSustain = !autoSustain;
    setAutoSustain(nextSustain);
    audioEngine.setSustain(nextSustain);
    showFeedbackToast(nextSustain ? 'Sustain enabled' : 'Sustain disabled');
  };

  const showFeedbackToast = (msg: string) => {
    setSettingsFeedback(msg);
    setTimeout(() => {
      setSettingsFeedback((prev) => (prev === msg ? null : prev));
    }, 2000);
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-2.5 sm:px-6 w-full max-w-full transition-all"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        {/* Left: Mobile hamburger & Page Title / Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 mr-1.5 sm:mr-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            title="Open Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} className="sm:w-5 sm:h-5" />
          </button>

          <div className="min-w-0 flex items-center gap-1.5 sm:gap-2 truncate">
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight truncate">
              {getPageTitle(activeTab)}
            </h2>
            {breadcrumb && (
              <span className="text-[10px] sm:text-xs text-indigo-400 font-semibold bg-indigo-950/80 px-1.5 sm:px-2 py-0.5 rounded border border-indigo-800/60 shrink-0">
                {breadcrumb}
              </span>
            )}
          </div>
        </div>

        {/* Right: Instrument Selector, Gamification Stats & Profile */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Instrument Selector Pill */}
          <div ref={instMenuRef} className="relative">
            <button
              onClick={() => {
                setShowInstMenu(!showInstMenu);
                setShowUserMenu(false);
              }}
              aria-expanded={showInstMenu}
              aria-haspopup="menu"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              title="Select Instrument"
            >
              <span>{currentInst.icon}</span>
              <span className="hidden md:inline">{currentInst.name}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showInstMenu ? 'rotate-180 text-white' : ''}`} />
            </button>

            {showInstMenu && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <span className="block px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Instrument Catalog
                </span>
                {instruments.map((inst) => (
                  <button
                    key={inst.slug}
                    role="menuitem"
                    onClick={() => {
                      onInstrumentChange(inst.slug);
                      setShowInstMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      selectedInstrument === inst.slug ? 'bg-indigo-600/20 text-indigo-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{inst.icon}</span>
                      <span>{inst.name}</span>
                    </span>
                    {inst.active ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">LIVE</span>
                    ) : (
                      <span className="text-[9px] text-slate-500">PREVIEW</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Daily Practice Streak Flame */}
          <div
            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-orange-400 bg-orange-500/10 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-orange-500/20 shadow-sm shrink-0"
            title="Daily Practice Streak"
          >
            <Flame size={13} className="shrink-0" />
            <span>{user?.currentStreakDays || 0}d</span>
          </div>

          {/* XP & Level Badge */}
          <div
            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-amber-400/20 shadow-sm shrink-0"
            title="Total Experience Points"
          >
            <Zap size={12} className="shrink-0" />
            <span>{user?.totalXp || 0} XP</span>
          </div>

          {/* Profile Dropdown Container */}
          <div ref={userMenuRef} className="relative shrink-0">
            <button
              ref={userButtonRef}
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowInstMenu(false);
              }}
              aria-expanded={showUserMenu}
              aria-haspopup="menu"
              aria-controls="user-account-dropdown"
              id="profile-menu-button"
              className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              title="Profile & Account Menu"
              aria-label="Open user profile menu"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-[11px] sm:text-xs font-bold shadow-md shadow-indigo-600/30 shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown size={12} className={`text-slate-400 hidden sm:inline transition-transform duration-200 ${showUserMenu ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showUserMenu && (
              <div
                id="user-account-dropdown"
                role="menu"
                aria-labelledby="profile-menu-button"
                className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                {/* 1. Profile Summary Card */}
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-xs truncate">
                        {user?.displayName || user?.username || 'Student Learner'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user?.email || 'student@melodyforge.edu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px]">
                    <span className={`inline-block text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                      user?.role === 'ROLE_ADMIN'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                    }`}>
                      {user?.role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Student Learner'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      Lvl {user?.currentLevel || 1} • {user?.totalXp || 0} XP
                    </span>
                  </div>
                </div>

                {/* Navigation Menu Items */}
                <div className="space-y-0.5">
                  {/* Option 1: Profile Details */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer group focus:outline-none focus:bg-slate-800"
                  >
                    <UserIcon size={15} className="text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-xs text-white">Profile</div>
                      <div className="text-[10px] text-slate-400">Account overview & credentials</div>
                    </div>
                  </button>

                  {/* Option 2: My Learning */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate?.('DASHBOARD');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer group focus:outline-none focus:bg-slate-800"
                  >
                    <BookOpen size={15} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-xs text-white">My Learning</div>
                      <div className="text-[10px] text-slate-400">Dashboard & curriculum</div>
                    </div>
                  </button>

                  {/* Option 3: My Progress */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate?.('PROGRESS');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer group focus:outline-none focus:bg-slate-800"
                  >
                    <BarChart2 size={15} className="text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-xs text-white">My Progress</div>
                      <div className="text-[10px] text-slate-400">Practice stats & analytics</div>
                    </div>
                  </button>

                  {/* Option 4: Certificates */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate?.('CERTIFICATE');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer group focus:outline-none focus:bg-slate-800"
                  >
                    <Award size={15} className="text-yellow-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-xs text-white">Certificates</div>
                      <div className="text-[10px] text-slate-400">Graduation diploma & exams</div>
                    </div>
                  </button>

                  {/* Option 5: Settings */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowSettingsModal(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer group focus:outline-none focus:bg-slate-800"
                  >
                    <Settings size={15} className="text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-xs text-white">Settings</div>
                      <div className="text-[10px] text-slate-400">Audio, voice & sound preferences</div>
                    </div>
                  </button>

                  {/* Administrative shortcut if ROLE_ADMIN */}
                  {user?.role === 'ROLE_ADMIN' && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate?.('ADMIN');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-purple-950/40 text-purple-300 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer group focus:outline-none focus:bg-purple-950"
                    >
                      <Shield size={15} className="text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex-1 truncate">
                        <div className="font-semibold text-xs text-purple-200">Admin Portal</div>
                        <div className="text-[10px] text-purple-400/80">Platform governance</div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Option 6: Sign Out */}
                <div className="border-t border-slate-800 mt-2 pt-1.5">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold group focus:outline-none focus:bg-rose-950/60"
                  >
                    <LogOut size={15} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="text-xs">Sign Out</div>
                      <div className="text-[10px] text-rose-400/70 font-normal">Log out and clear session</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Account Details Modal */}
      {showProfileModal && (
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Account Profile"
          description="Your MelodyForge student credentials and learning profile."
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-600/30 shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-white truncate">
                  {user?.displayName || user?.username || 'Student Learner'}
                </h4>
                <p className="text-xs text-indigo-400 font-mono">@{user?.username || 'student'}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || 'student@melodyforge.edu'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Role</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {user?.role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Student Learner'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Level</span>
                <p className="text-sm font-bold text-white mt-0.5">Level {user?.currentLevel || 1}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Experience Points</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{user?.totalXp || 0} XP</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Practice Streak</span>
                <p className="text-sm font-bold text-orange-400 mt-0.5">{user?.currentStreakDays || 0} Days Active</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-xs">Curriculum Standing</p>
                <p className="text-[11px] text-indigo-300/80">Tier 1: Basics • Conservatory Piano</p>
              </div>
              <Sparkles size={18} className="text-indigo-400 shrink-0" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowProfileModal(false);
                  onNavigate?.('PROGRESS');
                }}
              >
                View Learning Progress
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Application & Audio Settings Modal */}
      {showSettingsModal && (
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Application & Audio Settings"
          description="Adjust sound synthesis, instrument voices, and playback preferences."
          size="md"
        >
          <div className="space-y-4 text-xs">
            {/* Feedback alert toast */}
            {settingsFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 animate-in fade-in duration-150">
                <Check size={14} className="shrink-0" />
                <span className="font-medium text-xs">{settingsFeedback}</span>
              </div>
            )}

            {/* 1. Master Volume Control */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-2">
                  {isMuted || masterVolume === 0 ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-indigo-400" />}
                  Master Sound Volume
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {isMuted ? 'Muted' : `${Math.round(masterVolume * 100)}%`}
                  </span>
                  <button
                    onClick={handleMuteToggle}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : masterVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="Master volume control"
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* 2. Piano Synthesizer Timbre */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-bold text-white text-xs block">
                Virtual Piano Timbre Voice
              </span>
              <p className="text-[11px] text-slate-400">
                Select your preferred harmonic synthesis voice. Changes take effect immediately.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['grand', 'electric', 'harpsichord'] as PianoVoice[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => handleVoiceChange(v)}
                    className={`py-2 px-2.5 rounded-xl text-center border font-semibold transition-all cursor-pointer ${
                      activeVoice === v
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="capitalize text-xs font-bold">{v}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {v === 'grand' ? 'Acoustic' : v === 'electric' ? 'FM Tine' : 'Baroque'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Sustain Pedal Setting */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Auto-Sustain Pedal</span>
                <span className="text-[11px] text-slate-400">Keep acoustic notes ringing after key release</span>
              </div>
              <button
                onClick={handleSustainToggle}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  autoSustain
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {autoSustain ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSettingsModal(false)}
              >
                Save & Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
