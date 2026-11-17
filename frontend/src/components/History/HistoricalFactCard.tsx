import React from 'react';
import { HistoricalFact } from '../../types';
import { Lightbulb, Info, Sparkles, BookOpen } from 'lucide-react';

interface HistoricalFactCardProps {
  facts?: HistoricalFact[];
  factsList?: HistoricalFact[];
  title?: string;
}

export const HistoricalFactCard: React.FC<HistoricalFactCardProps> = ({
  facts,
  factsList,
  title = 'Key Facts & Acoustic Highlights',
}) => {
  const allFacts = facts || factsList || [];
  if (allFacts.length === 0) return null;

  const getTagBadgeColor = (tag?: string) => {
    switch (tag?.toLowerCase()) {
      case 'acoustics':
      case 'physics':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'engineering':
      case 'mechanics':
      case 'materials':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'terminology':
      case 'etymology':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'technique':
      case 'performance':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb size={16} className="text-amber-400" />
        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">{title}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {allFacts.map((fact, index) => (
          <div
            key={index}
            className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTagBadgeColor(fact.tag)}`}>
                  {fact.tag || 'Fact'}
                </span>
                <Sparkles size={13} className="text-slate-600" />
              </div>
              <h5 className="text-sm font-bold text-slate-100 mb-1.5">{fact.title}</h5>
              <p className="text-xs text-slate-400 leading-relaxed">{fact.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
