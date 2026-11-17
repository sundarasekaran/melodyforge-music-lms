import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: {
    text: string;
    positive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  iconBg = 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20',
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'hover:border-slate-700 hover:bg-slate-850 cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-100 tracking-tight">{value}</span>
          {trend && (
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                trend.positive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
