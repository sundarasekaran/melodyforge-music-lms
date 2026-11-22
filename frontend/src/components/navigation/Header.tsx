import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Flame,
  Zap,
  ChevronDown,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavigationTab;
  selectedInstrument: string;
  onInstrumentChange: (slug: string) => void;
  onMobileMenuToggle: () => void;
  breadcrumb?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  selectedInstrument,
  onInstrumentChange,
  onMobileMenuToggle,
  breadcrumb,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInstMenu, setShowInstMenu] = useState(false);

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

  return (
    <header
      className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-2.5 sm:px-6 w-full max-w-full overflow-hidden transition-all"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
      }}
    >
      {/* Left: Mobile hamburger & Page Title / Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 mr-1.5 sm:mr-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0 cursor-pointer"
          title="Open Menu"
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
        <div className="relative">
          <button
            onClick={() => setShowInstMenu(!showInstMenu)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Select Instrument"
          >
            <span>{currentInst.icon}</span>
            <span className="hidden md:inline">{currentInst.name}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {showInstMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50">
              <span className="block px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                Instrument Catalog
              </span>
              {instruments.map((inst) => (
                <button
                  key={inst.slug}
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

        {/* Profile Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1 p-1 sm:p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            title="Profile Menu"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] sm:text-xs font-bold shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:inline" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
              <div className="p-3 border-b border-slate-800 mb-1">
                <p className="font-bold text-white truncate">{user?.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className={`inline-block mt-1 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                  user?.role === 'ROLE_ADMIN' 
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                }`}>
                  {user?.role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Student Learner'}
                </span>
              </div>

              <div className="p-2 space-y-1 text-slate-400 text-[11px]">
                <div className="flex justify-between py-1">
                  <span>Current Level:</span>
                  <span className="font-bold text-white">Level {user?.currentLevel || 1}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total XP:</span>
                  <span className="font-bold text-amber-400">{user?.totalXp || 0} XP</span>
                </div>
              </div>

              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
