import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Flame,
  Zap,
  ChevronDown,
  User as UserIcon,
  Shield,
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
  const { user, logout, switchDemoAccount } = useAuth();
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
      case 'BADGES': return 'Achievements & Trophies';
      case 'PROGRESS': return 'Learning Progress & Analytics';
      case 'ADMIN': return 'Platform Administration';
      default: return 'MelodyForge';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            {getPageTitle(activeTab)}
            {breadcrumb && (
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                {breadcrumb}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Right: Instrument Selector, Gamification Stats & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Instrument Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowInstMenu(!showInstMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <span>{currentInst.icon}</span>
            <span className="hidden md:inline">{currentInst.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
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
          className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 shadow-sm"
          title="Daily Practice Streak"
        >
          <Flame size={15} />
          <span>{user?.currentStreakDays || 0}d</span>
        </div>

        {/* XP & Level Badge */}
        <div
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20 shadow-sm"
          title="Total Experience Points"
        >
          <Zap size={14} />
          <span>{user?.totalXp || 0} XP</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:inline" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
              <div className="p-3 border-b border-slate-800 mb-1">
                <p className="font-bold text-white truncate">{user?.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  {user?.role}
                </span>
              </div>

              <span className="block px-3 py-1 text-[10px] uppercase font-bold text-slate-500">
                Switch Role / Account
              </span>

              <button
                onClick={() => {
                  switchDemoAccount('STUDENT');
                  setShowUserMenu(false);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-300 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserIcon size={14} className="text-indigo-400" />
                  <span>Alex Rivera (Student)</span>
                </span>
                {user?.role === 'ROLE_STUDENT' && <span className="text-emerald-400 font-bold">✓</span>}
              </button>

              <button
                onClick={() => {
                  switchDemoAccount('ADMIN');
                  setShowUserMenu(false);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-300 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield size={14} className="text-purple-400" />
                  <span>Platform Administrator</span>
                </span>
                {user?.role === 'ROLE_ADMIN' && <span className="text-emerald-400 font-bold">✓</span>}
              </button>

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
