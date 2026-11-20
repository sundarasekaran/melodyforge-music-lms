import React, { useEffect, useState } from 'react';
import { Music, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number; // milliseconds
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDuration = 2200,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDuration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 400); // Wait for fade-out animation to complete
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDuration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden transition-opacity duration-400 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1.5rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1.5rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top spacing */}
      <div className="w-full flex justify-end">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400/80 uppercase tracking-widest bg-indigo-950/60 border border-indigo-800/40 px-3 py-1 rounded-full">
          <Sparkles size={12} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          Music Academy
        </span>
      </div>

      {/* Central Opening Logo & Branding */}
      <div className="flex flex-col items-center text-center space-y-6 relative z-10 my-auto">
        {/* Animated Radiant Musical Icon */}
        <div className="relative flex items-center justify-center">
          {/* Outer glowing pulsing rings */}
          <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-indigo-600/20 blur-xl animate-pulse" />
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border border-indigo-500/30 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border border-purple-500/40" />

          {/* Central Logo Emblem Box */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/50 border border-indigo-400/40">
            <Music size={40} className="sm:hidden text-white drop-shadow-md" />
            <Music size={48} className="hidden sm:block text-white drop-shadow-md" />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Melody<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Forge</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide">
            Master Music • One Note at a Time
          </p>
        </div>

        {/* Dynamic Musical Equalizer Audio Bars */}
        <div className="flex items-center justify-center gap-1.5 h-8 pt-2">
          <span className="w-1.5 bg-indigo-500 rounded-full animate-soundwave-1" />
          <span className="w-1.5 bg-indigo-400 rounded-full animate-soundwave-2" />
          <span className="w-1.5 bg-purple-400 rounded-full animate-soundwave-3" />
          <span className="w-1.5 bg-amber-400 rounded-full animate-soundwave-4" />
          <span className="w-1.5 bg-indigo-400 rounded-full animate-soundwave-5" />
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-xs space-y-2 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>Preparing Studio...</span>
          <span className="text-indigo-400 font-mono">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-sm shadow-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
