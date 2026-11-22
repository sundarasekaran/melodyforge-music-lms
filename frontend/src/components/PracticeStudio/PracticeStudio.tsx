import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { VirtualPiano } from '../VirtualPiano/VirtualPiano';
import { StructuredPracticeStudio } from './StructuredPracticeStudio';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PracticeSession } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { cn } from '../../utils/cn';
import {
  Play,
  Square,
  Mic,
  RotateCcw,
  Save,
  Clock,
  BookOpen,
  Music,
  CheckCircle2,
  Trash2,
  Sparkles,
  Layers,
  Compass,
} from 'lucide-react';

export const PracticeStudio: React.FC = () => {
  const { awardLocalXp, refreshUser } = useAuth();
  const [studioMode, setStudioMode] = useState<'structured' | 'free'>('structured');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [practiceNotes, setPracticeNotes] = useState('');

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  // History & Save state
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const fetchSessions = async () => {
    try {
      const data = await api.getPracticeSessions();
      setSessions(data);
    } catch (e) {
      console.warn('Could not fetch practice sessions:', e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer interval
  useEffect(() => {
    if (timerActive) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Recording controls
  const handleStartRecording = () => {
    const started = audioEngine.startRecording();
    if (started) {
      setIsRecording(true);
      setRecordedAudioUrl(null);
      if (!timerActive) setTimerActive(true);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    try {
      const audioUrl = await audioEngine.stopRecording();
      setRecordedAudioUrl(audioUrl);
    } catch (err) {
      console.error('Failed to capture audio recording', err);
    } finally {
      setIsRecording(false);
    }
  };

  // Save practice session
  const handleSaveSession = async () => {
    if (secondsElapsed < 5 && !practiceNotes && !recordedAudioUrl) {
      alert('Please practice for at least a few seconds or enter reflection notes before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const duration = Math.max(secondsElapsed, 30);
      const newSession = await api.logPractice(
        'piano',
        duration,
        practiceNotes || 'Practiced piano scales, chord progressions, and keyboard fluency.',
        recordedAudioUrl || undefined
      );

      setSessions((prev) => [newSession, ...prev]);
      setSaveSuccess(true);
      awardLocalXp(newSession.xpEarned || 30);
      refreshUser();

      setTimerActive(false);
      setSecondsElapsed(0);
      setPracticeNotes('');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save practice session', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Studio Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black">
            <Compass className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-white">Conservatory Studio Hub</h2>
            <p className="text-[11px] text-slate-400">Switch between structured routines or freeform recording</p>
          </div>
        </div>

        <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setStudioMode('structured')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer',
              studioMode === 'structured'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Compass className="h-3.5 w-3.5" />
            Structured Routines & Metronome
          </button>
          <button
            type="button"
            onClick={() => setStudioMode('free')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer',
              studioMode === 'free'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Mic className="h-3.5 w-3.5" />
            Free Recording & Quick Journal
          </button>
        </div>
      </div>

      {studioMode === 'structured' ? (
        <StructuredPracticeStudio />
      ) : (
        <>
          <PageHeader
            title="Practice Studio & Audio Recorder"
            subtitle="Time your practice routines, record pure Web Audio piano output without room noise, and log personal learning reflections."
            icon={<Mic size={22} />}
            actions={
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
                <Clock size={16} className="text-indigo-400" />
                <span className="font-mono text-xl font-extrabold text-white">
                  {formatTime(secondsElapsed)}
                </span>
                <Button
                  variant={timerActive ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setTimerActive(!timerActive)}
                >
                  {timerActive ? 'Pause' : 'Start Timer'}
                </Button>
                <button
                  onClick={() => {
                    if (secondsElapsed > 0) setShowConfirmReset(true);
                  }}
                  disabled={secondsElapsed === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            }
          />

          {/* Recording Control Console */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <Button
                    variant="danger"
                    size="md"
                    icon={<Mic size={18} />}
                    onClick={handleStartRecording}
                  >
                    Start Recording Piano
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    className="border-rose-500 text-rose-400 animate-pulse"
                    icon={<Square size={18} />}
                    onClick={handleStopRecording}
                  >
                    Stop Recording
                  </Button>
                )}

                {isRecording && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Recording Web Audio synthesis directly...</span>
                  </div>
                )}
              </div>

              {/* Replay Widget */}
              {recordedAudioUrl && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-bold">Captured Track:</span>
                  <audio controls src={recordedAudioUrl} className="h-9 w-60 rounded-xl" />
                </div>
              )}
            </div>

            {/* Embedded Interactive Virtual Piano */}
            <VirtualPiano />

            {/* Practice Reflection Journal Form */}
            <div className="pt-6 border-t border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" />
                Practice Journal & Self-Review Notes
              </label>
              <textarea
                value={practiceNotes}
                onChange={(e) => setPracticeNotes(e.target.value)}
                placeholder="Record what you focused on today: e.g. Practiced C Major 5-finger pattern, worked on Middle C landmarks, refined finger coordination..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />

              <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                {saveSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
                    <CheckCircle2 size={18} />
                    <span>Practice session saved! XP awarded & streak updated!</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">
                    Saving logs your practice duration and maintains your active daily streak.
                  </span>
                )}

                <Button
                  variant="amber"
                  size="md"
                  loading={isSaving}
                  icon={<Save size={18} />}
                  onClick={handleSaveSession}
                >
                  Save Practice Session (+XP)
                </Button>
              </div>
            </div>
          </div>

          {/* Practice History Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-indigo-400" />
              Practice History Journal ({sessions.length})
            </h3>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No practice sessions recorded yet. Start the timer or recorder above to log your first session!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Journal Notes</th>
                      <th className="py-3 px-4 text-right">XP Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-slate-850/40">
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {new Date(sess.practicedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-emerald-400 font-bold">
                            {Math.round(sess.durationSeconds / 60)} min ({sess.durationSeconds}s)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">
                          "{sess.notes || 'Keyboard fluency practice'}"
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge variant="gold" size="sm">
                            +{sess.xpEarned} XP
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Confirm Reset Modal */}
          {showConfirmReset && (
            <Modal
              isOpen={showConfirmReset}
              onClose={() => setShowConfirmReset(false)}
              title="Reset Practice Session Timer?"
              description="Are you sure you want to reset the current timer? Unsaved elapsed time will be discarded."
              maxWidth="sm"
              footer={
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowConfirmReset(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setTimerActive(false);
                      setSecondsElapsed(0);
                      setShowConfirmReset(false);
                    }}
                  >
                    Reset Timer
                  </Button>
                </div>
              }
            >
              <div className="py-2 text-xs text-slate-400">
                Current elapsed time: <strong className="text-white font-mono">{formatTime(secondsElapsed)}</strong>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};
