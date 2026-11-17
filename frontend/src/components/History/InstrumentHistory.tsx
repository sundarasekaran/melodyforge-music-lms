import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HistorySection } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Compass,
  CheckCircle2,
  ChevronRight,
  Award,
  Music,
  Clock,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const InstrumentHistory: React.FC = () => {
  const { awardLocalXp } = useAuth();
  const [sections, setSections] = useState<HistorySection[]>([]);
  const [selectedSection, setSelectedSection] = useState<HistorySection | null>(null);
  const [readSections, setReadSections] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getInstrumentHistory('piano');
        setSections(data);
        if (data.length > 0) {
          setSelectedSection(data[0]);
        }
      } catch (e) {
        console.error('Failed to load instrument history', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleMarkAsRead = (sectionId: number) => {
    if (!readSections.has(sectionId)) {
      setReadSections((prev) => new Set(prev).add(sectionId));
      awardLocalXp(25);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading instrument history...</span>
        </div>
      </div>
    );
  }

  const progressPercent = (readSections.size / Math.max(sections.length, 1)) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Piano History & Evolution"
        subtitle="Explore the 300-year acoustic evolution from Bartolomeo Cristofori's early pianoforte to modern concert grands and digital synthesis."
        icon={<Compass size={22} />}
        actions={
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Completed:</span>
            <span className="text-sm font-bold text-emerald-400">
              {readSections.size} / {sections.length}
            </span>
            <div className="w-20">
              <ProgressBar value={progressPercent} color="emerald" size="sm" />
            </div>
          </div>
        }
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chapter List / Timeline */}
        <div className="lg:col-span-4 space-y-2">
          <span className="block px-2 text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
            Historical Chapters (10 Modules)
          </span>

          <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-1">
            {sections.map((sec) => {
              const isSelected = selectedSection?.id === sec.id;
              const isRead = readSections.has(sec.id);

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border ${
                        isSelected
                          ? 'bg-white/20 text-white border-white/30'
                          : isRead
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {isRead ? '✓' : sec.sectionNumber}
                    </span>
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-bold truncate">{sec.title}</p>
                      <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {sec.era}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`shrink-0 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Chapter Detail Reader */}
        {selectedSection && (
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="indigo" size="sm">
                      Chapter {selectedSection.sectionNumber}
                    </Badge>
                    <Badge variant="slate" size="sm">
                      {selectedSection.era}
                    </Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {selectedSection.title}
                  </h2>
                </div>

                {readSections.has(selectedSection.id) && (
                  <Badge variant="emerald" size="md" dot>
                    Chapter Read
                  </Badge>
                )}
              </div>

              {/* Chapter Narrative Body */}
              <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 mb-6">
                <p>{selectedSection.content}</p>
              </div>

              {/* Key Takeaway Callout Box */}
              {selectedSection.keyTakeaway && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                      Historical Key Takeaway
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {selectedSection.keyTakeaway}
                    </p>
                  </div>
                </div>
              )}

              {/* Historical Focus / Exhibit caption */}
              {selectedSection.imageCaption && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2.5 mb-6">
                  <Music size={16} className="text-indigo-400 shrink-0" />
                  <span>
                    <strong>Historical Focus:</strong> {selectedSection.imageCaption}
                  </span>
                </div>
              )}
            </div>

            {/* Complete Chapter Action Footer */}
            <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock size={14} />
                Approx. 3 minutes reading time
              </span>

              {!readSections.has(selectedSection.id) ? (
                <Button
                  variant="amber"
                  size="md"
                  icon={<Award size={16} />}
                  onClick={() => handleMarkAsRead(selectedSection.id)}
                >
                  Mark as Read (+25 XP)
                </Button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Completed
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
