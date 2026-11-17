import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Compass,
  Music,
  Headphones,
  Mic,
  Award,
  BarChart2,
  Shield,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export type NavigationTab =
  | 'DASHBOARD'
  | 'INSTRUMENTS'
  | 'ROADMAP'
  | 'PIANO'
  | 'EAR_TRAINING'
  | 'STUDIO'
  | 'BADGES'
  | 'PROGRESS'
  | 'ADMIN';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const { user } = useAuth();

  const mainNavItems = [
    { id: 'DASHBOARD' as NavigationTab, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'INSTRUMENTS' as NavigationTab, label: 'My Instruments', icon: <Layers size={18} /> },
    { id: 'ROADMAP' as NavigationTab, label: 'Learning Path', icon: <BookOpen size={18} /> },
  ];

  const practicalItems = [
    { id: 'PIANO' as NavigationTab, label: 'Virtual Piano', icon: <Music size={18} /> },
    { id: 'EAR_TRAINING' as NavigationTab, label: 'Ear Training', icon: <Headphones size={18} /> },
    { id: 'STUDIO' as NavigationTab, label: 'Practice Studio', icon: <Mic size={18} /> },
  ];

  const achievementItems = [
    { id: 'BADGES' as NavigationTab, label: 'Achievements', icon: <Award size={18} /> },
    { id: 'PROGRESS' as NavigationTab, label: 'My Progress', icon: <BarChart2 size={18} /> },
  ];

  const handleItemClick = (id: NavigationTab) => {
    onTabChange(id);
    onMobileClose();
  };

  const renderNavGroup = (title: string, items: typeof mainNavItems) => (
    <div className="mb-4">
      {!isCollapsed && (
        <span className="block px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          {title}
        </span>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Logo & App Title */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
            <div
              className="flex items-center gap-3 cursor-pointer overflow-hidden"
              onClick={() => handleItemClick('DASHBOARD')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
                <Music size={22} />
              </div>
              {!isCollapsed && (
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                    MelodyForge <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">PRO</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium truncate">Music Education LMS</span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
            {renderNavGroup('Learn', mainNavItems)}
            {renderNavGroup('Practice', practicalItems)}
            {renderNavGroup('Mastery', achievementItems)}

            {user?.role === 'ROLE_ADMIN' && (
              <div className="pt-2 border-t border-slate-800/60 mt-2">
                {!isCollapsed && (
                  <span className="block px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-purple-400">
                    Administration
                  </span>
                )}
                <button
                  onClick={() => handleItemClick('ADMIN')}
                  title={isCollapsed ? 'Admin Portal' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === 'ADMIN'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                      : 'text-purple-300 hover:bg-purple-950/40 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Shield size={18} className="shrink-0" />
                  {!isCollapsed && <span>Admin Portal</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Progress Pill */}
        {!isCollapsed ? (
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                ⚡
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Tier 1: Basics</p>
                <p className="text-[10px] text-slate-400">Level {user?.currentLevel || 1} • {user?.totalXp || 0} XP</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-800/80 flex justify-center">
            <span className="text-sm font-bold text-amber-400">Lvl {user?.currentLevel || 1}</span>
          </div>
        )}
      </aside>
    </>
  );
};
