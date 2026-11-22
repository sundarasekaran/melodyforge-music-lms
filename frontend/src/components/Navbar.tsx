import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Music, 
  Flame, 
  Zap, 
  Compass, 
  Headphones, 
  BookOpen, 
  Mic, 
  Award, 
  Shield, 
  User as UserIcon,
  ChevronDown,
  LogOut,
  RefreshCw
} from 'lucide-react';

export type ActiveTab = 'ROADMAP' | 'HISTORY' | 'PIANO' | 'EAR_TRAINING' | 'STUDIO' | 'BADGES' | 'ADMIN' | 'ASSESSMENTS' | 'CERTIFICATE';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  selectedInstrument: string;
  onInstrumentChange: (slug: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  selectedInstrument,
  onInstrumentChange,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInstMenu, setShowInstMenu] = useState(false);

  const instruments = [
    { slug: 'piano', name: 'Piano & Keyboard', active: true, icon: '🎹' },
    { slug: 'guitar', name: 'Guitar', active: false, icon: '🎸' },
    { slug: 'violin', name: 'Violin', active: false, icon: '🎻' },
    { slug: 'drums', name: 'Drums', active: false, icon: '🥁' },
  ];

  const currentInst = instruments.find((i) => i.slug === selectedInstrument) || instruments[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand & Instrument Selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange('ROADMAP')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Music size={22} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                MelodyForge <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">LMS</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">Multi-Instrument Academy</span>
            </div>
          </div>

          {/* Instrument Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowInstMenu(!showInstMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <span>{currentInst.icon}</span>
              <span>{currentInst.name}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showInstMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                <span className="block px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Select Instrument
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
                      <span className="text-[9px] text-slate-500">NEXT</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onTabChange('ROADMAP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ROADMAP' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen size={14} />
            <span>Curriculum</span>
          </button>

          <button
            onClick={() => onTabChange('HISTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'HISTORY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass size={14} />
            <span>History</span>
          </button>

          <button
            onClick={() => onTabChange('PIANO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PIANO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Music size={14} />
            <span>Virtual Piano</span>
          </button>

          <button
            onClick={() => onTabChange('EAR_TRAINING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'EAR_TRAINING' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Headphones size={14} />
            <span>Ear Training</span>
          </button>

          <button
            onClick={() => onTabChange('STUDIO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STUDIO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Mic size={14} />
            <span>Studio & Recorder</span>
          </button>

          <button
            onClick={() => onTabChange('BADGES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BADGES' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award size={14} />
            <span>Trophies</span>
          </button>

          {user?.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => onTabChange('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ADMIN' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400 hover:bg-purple-950/40'
              }`}
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right Gamification Pills & User Profile */}
        <div className="flex items-center gap-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20" title="Daily Practice Streak">
            <Flame size={15} />
            <span>{user?.currentStreakDays || 0}d</span>
          </div>

          {/* XP & Level Pill */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20" title="Experience Points">
            <Zap size={14} />
            <span>Lvl {user?.currentLevel || 1} • {user?.totalXp || 0} XP</span>
          </div>

          {/* User Profile & Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.displayName ? user.displayName.charAt(0) : 'U'}
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="p-2 border-b border-slate-800 mb-1">
                  <p className="font-bold text-white">{user?.displayName}</p>
                  <p className="text-[11px] text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                    {user?.role}
                  </span>
                </div>

                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-950 text-[11px] overflow-x-auto">
        <button
          onClick={() => onTabChange('ROADMAP')}
          className={`px-2.5 py-1 rounded font-bold ${activeTab === 'ROADMAP' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Curriculum
        </button>
        <button
          onClick={() => onTabChange('HISTORY')}
          className={`px-2.5 py-1 rounded font-bold ${activeTab === 'HISTORY' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          History
        </button>
        <button
          onClick={() => onTabChange('PIANO')}
          className={`px-2.5 py-1 rounded font-bold ${activeTab === 'PIANO' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Piano
        </button>
        <button
          onClick={() => onTabChange('EAR_TRAINING')}
          className={`px-2.5 py-1 rounded font-bold ${activeTab === 'EAR_TRAINING' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Ear Training
        </button>
        <button
          onClick={() => onTabChange('STUDIO')}
          className={`px-2.5 py-1 rounded font-bold ${activeTab === 'STUDIO' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Studio
        </button>
        <button
          onClick={() => onTabChange('BADGES')}
          className={`px-2.5 py-1 rounded font-bold ${activeTab === 'BADGES' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Trophies
        </button>
      </div>
    </header>
  );
};
