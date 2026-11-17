import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Instrument } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { Music, CheckCircle2, Clock, Sparkles, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { NavigationTab } from '../navigation/Sidebar';

interface InstrumentCatalogProps {
  selectedInstrument: string;
  onSelectInstrument: (slug: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const InstrumentCatalog: React.FC<InstrumentCatalogProps> = ({
  selectedInstrument,
  onSelectInstrument,
  onNavigate,
}) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const data = await api.getInstruments();
        setInstruments(data);
      } catch (e) {
        console.error('Failed to load instruments', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInstruments();
  }, []);

  const getInstrumentEmoji = (slug: string) => {
    switch (slug) {
      case 'piano': return '🎹';
      case 'guitar': return '🎸';
      case 'violin': return '🎻';
      case 'drums': return '🥁';
      default: return '🎵';
    }
  };

  const getInstrumentAura = (slug: string) => {
    switch (slug) {
      case 'piano': return 'from-indigo-900/40 via-slate-900 to-slate-950 border-indigo-500/30';
      case 'guitar': return 'from-amber-900/30 via-slate-900 to-slate-950 border-amber-500/20';
      case 'violin': return 'from-purple-900/30 via-slate-900 to-slate-950 border-purple-500/20';
      case 'drums': return 'from-rose-900/30 via-slate-900 to-slate-950 border-rose-500/20';
      default: return 'from-slate-900 to-slate-950 border-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Multi-Instrument Catalog"
        subtitle="Explore our pluggable multi-instrument learning framework. Master Piano today, with Guitar, Violin, and Drums expanding the platform."
        icon={<Layers size={22} />}
      />

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {instruments.map((inst) => {
          const isSelected = selectedInstrument === inst.slug;
          const isFlagship = inst.slug === 'piano';

          return (
            <div
              key={inst.id}
              className={`rounded-3xl p-6 sm:p-7 border bg-gradient-to-br transition-all duration-200 flex flex-col justify-between shadow-xl ${getInstrumentAura(
                inst.slug
              )} ${isSelected ? 'ring-2 ring-indigo-500/60 shadow-indigo-500/10' : ''}`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getInstrumentEmoji(inst.slug)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{inst.name}</h3>
                      <span className="text-xs text-indigo-400 font-semibold">{inst.family} Family</span>
                    </div>
                  </div>

                  <Badge variant={isFlagship ? 'emerald' : 'gold'} size="sm" dot>
                    {isFlagship ? 'Active / Flagship' : 'Preview Catalog'}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {inst.description}
                </p>

                {/* Curriculum Framework feature list */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 mb-6 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Pedagogical Framework:</span>
                    <span className="font-bold text-slate-200">4 Tiers • 12 Levels</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Curriculum Content:</span>
                    <span className="font-bold text-slate-200">
                      {isFlagship ? 'Full Basics + Pro Roadmap' : 'Curriculum Architecture Configured'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Interactive Simulation:</span>
                    <span className="font-bold text-emerald-400">
                      {isFlagship ? '3-Octave Polyphonic Web Audio Piano' : 'Fretboard / Fingerboard In Dev'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedDetail(inst)}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  View Details & History →
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isSelected ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => {
                      onSelectInstrument(inst.slug);
                      onNavigate('ROADMAP');
                    }}
                  >
                    {isSelected ? 'Currently Selected' : 'Select Instrument'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <Modal
          isOpen={!!selectedDetail}
          onClose={() => setSelectedDetail(null)}
          title={`${selectedDetail.name} — Curriculum & History`}
          description={`Comprehensive multi-instrument learning overview for the ${selectedDetail.family} family.`}
          maxWidth="lg"
          footer={
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedDetail(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onSelectInstrument(selectedDetail.slug);
                  setSelectedDetail(null);
                  onNavigate('ROADMAP');
                }}
              >
                Go to {selectedDetail.name} Learning Path →
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedDetail.description}
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                4-Tier Progressive Learning Framework
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong>Tier 1 (Basics):</strong> Anatomy, notation fundamentals, Middle C landmarks, and listening identification.</li>
                <li><strong>Tier 2 (Intermediate):</strong> Scales, chord triads, two-hand coordination, and tempo accuracy.</li>
                <li><strong>Tier 3 (Pro):</strong> Arpeggios, dynamic velocity, harmonic progressions, and repertoire performance.</li>
                <li><strong>Tier 4 (Expert):</strong> Advanced voice leading, concert literature, interpretation, and final recital.</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
