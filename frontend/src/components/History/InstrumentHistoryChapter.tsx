import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HistoryChapter, TimelineEvent, HistoricalFact, GalleryItem, KnowledgeCheckQuestion } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { audioEngine } from '../../audio/AudioEngine';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { ChapterProgress } from './ChapterProgress';
import { HistoryTimeline } from './HistoryTimeline';
import { HistoricalFactCard } from './HistoricalFactCard';
import { HistoricalImageGallery } from './HistoricalImageGallery';
import { HistoryKnowledgeCheck } from './HistoryKnowledgeCheck';
import {
  ArrowLeft,
  Volume2,
  Clock,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Quote,
  Lightbulb,
} from 'lucide-react';

interface InstrumentHistoryChapterProps {
  instrumentSlug: string;
  instrumentName?: string;
  initialChapterId?: number;
  onBack: () => void;
  onChapterCompleted?: (chapterId: number) => void;
}

export const InstrumentHistoryChapter: React.FC<InstrumentHistoryChapterProps> = ({
  instrumentSlug,
  instrumentName = 'Piano',
  initialChapterId,
  onBack,
  onChapterCompleted,
}) => {
  const { user, awardLocalXp, refreshUser } = useAuth();
  const [chapters, setChapters] = useState<HistoryChapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<number | null>(initialChapterId || null);
  const [loading, setLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getInstrumentHistory(instrumentSlug);
      setChapters(data);
      if (data.length > 0) {
        if (!activeChapterId || !data.some((c) => c.id === activeChapterId)) {
          setActiveChapterId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load instrument history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [instrumentSlug]);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];
  const activeIndex = chapters.findIndex((c) => c.id === activeChapter?.id);
  const nextChapter = activeIndex >= 0 && activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;
  const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;

  // Parse JSON data safely
  const timelineEvents: TimelineEvent[] = activeChapter?.timelineJson
    ? JSON.parse(activeChapter.timelineJson)
    : [];

  const factsList: HistoricalFact[] = activeChapter?.factsJson
    ? JSON.parse(activeChapter.factsJson)
    : [];

  const galleryItems: GalleryItem[] = activeChapter?.galleryJson
    ? JSON.parse(activeChapter.galleryJson)
    : [];

  const quizQuestions: KnowledgeCheckQuestion[] = activeChapter?.quizJson
    ? JSON.parse(activeChapter.quizJson)
    : [];

  // Audio preview handler
  const handlePlayAudio = async () => {
    if (!activeChapter?.audioNote || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioEngine.playNote(activeChapter.audioNote, 1.8);
    } catch (e) {
      console.warn('Audio playback note', e);
    } finally {
      setTimeout(() => setIsPlayingAudio(false), 1800);
    }
  };

  // Complete chapter
  const handleCompleteChapter = async () => {
    if (!activeChapter) return;
    setIsSubmitting(true);
    try {
      const res = await api.completeHistoryChapter(instrumentSlug, activeChapter.id, quizScore);
      setXpEarned(res.xpAwarded || activeChapter.xpReward || 50);
      if (res.xpAwarded > 0) {
        awardLocalXp(res.xpAwarded);
      }
      refreshUser();
      setShowCelebration(true);
      if (onChapterCompleted) {
        onChapterCompleted(activeChapter.id);
      }
      // Refresh local chapters state
      fetchHistory();
    } catch (e) {
      console.error('Error completing history chapter', e);
      setShowCelebration(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading {instrumentName} history course...</span>
        </div>
      </div>
    );
  }

  if (!activeChapter) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">No history chapters found for this instrument.</p>
        <Button variant="outline" onClick={onBack}>
          Back to Curriculum
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <PageHeader
        title={`History of the ${instrumentName}`}
        subtitle={`Interactive educational lessons exploring the acoustic invention, mechanical evolution, and cultural milestones of the ${instrumentName}.`}
        icon={<BookOpen size={22} />}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={onBack}
            >
              Back to Course
            </Button>
          </div>
        }
      />

      {/* Stepped Progress Bar */}
      <ChapterProgress
        chapters={chapters}
        currentChapterId={activeChapter.id}
        onSelectChapter={(id) => setActiveChapterId(id)}
      />

      {/* Chapter Main Container */}
      <article className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-8">
        {/* Chapter Header Badges & Title */}
        <div className="border-b border-slate-800 pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="md">
                Chapter {activeChapter.sectionNumber} of {chapters.length}
              </Badge>
              <Badge variant="slate" size="md">
                {activeChapter.era}
              </Badge>
              {activeChapter.completed && (
                <Badge variant="emerald" size="md" dot>
                  Completed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock size={13} /> {activeChapter.durationMinutes} min read
              </span>
              <span>•</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Award size={13} /> +{activeChapter.xpReward} XP
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {activeChapter.title}
          </h1>

          {/* Chapter Introduction Drop-Cap Prose */}
          {activeChapter.introduction && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/25 border border-indigo-500/20 text-indigo-200 text-sm sm:text-base leading-relaxed italic flex items-start gap-3">
              <Quote size={24} className="text-indigo-400 shrink-0 mt-0.5 opacity-80" />
              <p>{activeChapter.introduction}</p>
            </div>
          )}
        </div>

        {/* Historical Image Gallery / Illustrations */}
        <HistoricalImageGallery
          items={galleryItems}
          primaryImageUrl={activeChapter.imageUrl}
          primaryImageCaption={activeChapter.imageCaption}
          primaryEra={activeChapter.era}
        />

        {/* Historical Explanation Narrative Prose */}
        <div className="prose prose-invert max-w-none space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p className="whitespace-pre-line text-slate-200 font-normal">
            {activeChapter.content}
          </p>
        </div>

        {/* Audio Example Demonstration */}
        {activeChapter.audioNote && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Volume2 size={20} className={isPlayingAudio ? 'animate-bounce' : ''} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Acoustic Audio Example
                </span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Pitch & Hammer Strike: <span className="font-mono text-amber-300">{activeChapter.audioNote}</span>
                </p>
                {activeChapter.audioDescription && (
                  <p className="text-xs text-slate-400 mt-0.5">{activeChapter.audioDescription}</p>
                )}
              </div>
            </div>

            <Button
              variant="amber"
              size="sm"
              isLoading={isPlayingAudio}
              onClick={handlePlayAudio}
              leftIcon={<Volume2 size={15} />}
            >
              Play Acoustic Tone
            </Button>
          </div>
        )}

        {/* Chronological Developments Timeline */}
        {timelineEvents.length > 0 && (
          <HistoryTimeline events={timelineEvents} />
        )}

        {/* Curated Historical Facts Grid */}
        {factsList.length > 0 && (
          <HistoricalFactCard factsList={factsList} />
        )}

        {/* Key Takeaway Callout Banner */}
        {activeChapter.keyTakeaway && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 flex items-start gap-4 shadow-lg">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Lightbulb size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">
                Key Learning Takeaway
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-1 leading-relaxed">
                {activeChapter.keyTakeaway}
              </p>
            </div>
          </div>
        )}

        {/* Interactive Knowledge-Check Quiz */}
        {quizQuestions.length > 0 && (
          <HistoryKnowledgeCheck
            questions={quizQuestions}
            isCompleted={activeChapter.completed}
            onPassed={(score) => setQuizScore(score)}
          />
        )}

        {/* Action Completion & Navigation Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {prevChapter && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => setActiveChapterId(prevChapter.id)}
              >
                Previous Chapter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!activeChapter.completed ? (
              <Button
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                onClick={handleCompleteChapter}
                rightIcon={<Sparkles size={16} />}
              >
                Complete Chapter & Claim {activeChapter.xpReward} XP
              </Button>
            ) : nextChapter ? (
              <Button
                variant="primary"
                size="lg"
                disabled={nextChapter.unlocked === false}
                onClick={() => setActiveChapterId(nextChapter.id)}
                rightIcon={<ChevronRight size={16} />}
              >
                Continue to Chapter {nextChapter.sectionNumber}
              </Button>
            ) : (
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 size={16} /> History Curriculum Mastered!
              </span>
            )}
          </div>
        </div>
      </article>

      {/* Completion Celebration Modal */}
      <Modal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Chapter Mastered!"
        size="md"
      >
        <div className="text-center py-4 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
            <Sparkles size={32} />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white">
              {activeChapter.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              You've completed Chapter {activeChapter.sectionNumber} of the {instrumentName} History Curriculum.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">XP Awarded</span>
              <p className="text-xl font-extrabold text-amber-400">+{xpEarned} XP</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Next Status</span>
              <p className="text-xs font-bold text-emerald-400">
                {nextChapter ? `Chapter ${nextChapter.sectionNumber} Unlocked` : 'Curriculum Complete'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCelebration(false)}
            >
              Review Chapter
            </Button>
            {nextChapter && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setShowCelebration(false);
                  setActiveChapterId(nextChapter.id);
                }}
              >
                Next Chapter
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
