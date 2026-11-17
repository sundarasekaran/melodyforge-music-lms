import React from 'react';
import { TimelineEvent } from '../../types';
import { Clock, Calendar, Milestone } from 'lucide-react';

interface HistoryTimelineProps {
  events: TimelineEvent[];
  title?: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  events,
  title = 'Chronological Developments & Milestones',
}) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30">
          <Milestone size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-slate-400">Key chronological breakthroughs and acoustic evolutions</p>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-violet-500 before:to-slate-800">
        {events.map((ev, index) => (
          <div key={index} className="relative group">
            {/* Timeline Dot Node */}
            <div className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 group-hover:border-amber-400 group-hover:scale-125 transition-all shadow-md shadow-indigo-500/20" />

            <div className="bg-slate-950/70 hover:bg-slate-850/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 transition-all">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  <Calendar size={11} /> {ev.year}
                </span>
                <h5 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {ev.event}
                </h5>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{ev.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
