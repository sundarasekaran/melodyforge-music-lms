import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  FileCheck2,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { 
  AssessmentItem, 
  AssessmentAttemptHistory, 
  GraduationStatus, 
  CertificateData 
} from '../../types';
import { api } from '../../services/api';
import { ASSESSMENTS_METADATA } from '../../data/assessmentQuestions';

interface AssessmentsOverviewProps {
  onSelectAssessment: (item: AssessmentItem) => void;
  onViewCertificate: () => void;
}

export const AssessmentsOverview: React.FC<AssessmentsOverviewProps> = ({
  onSelectAssessment,
  onViewCertificate,
}) => {
  const [assessments, setAssessments] = useState<AssessmentItem[]>(ASSESSMENTS_METADATA);
  const [attempts, setAttempts] = useState<AssessmentAttemptHistory[]>([]);
  const [graduationStatus, setGraduationStatus] = useState<GraduationStatus | null>(null);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch server assessment statuses
        try {
          const serverItems = await api.getAssessments();
          if (mounted && serverItems && serverItems.length > 0) {
            setAssessments(serverItems);
          }
        } catch (err) {
          console.warn('Failed to fetch server assessments list:', err);
        }

        // Fetch recent attempts history
        try {
          const attemptList = await api.getAssessmentAttempts();
          if (mounted && attemptList) {
            setAttempts(attemptList);
          }
        } catch (err) {
          console.warn('Failed to fetch attempts:', err);
        }

        // Fetch graduation status
        try {
          const gradStatus = await api.getGraduationStatus();
          if (mounted && gradStatus) {
            setGraduationStatus(gradStatus);
          }
        } catch (err) {
          console.warn('Failed to fetch graduation status:', err);
        }

        // Check if certificate exists
        try {
          const cert = await api.getCertificate();
          if (mounted && cert && cert.certificateNumber) {
            setCertificate(cert);
          }
        } catch {
          // No certificate yet
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const passedCount = assessments.filter((a) => a.passed).length;
  const isAllPassed = passedCount === 3 || (graduationStatus && graduationStatus.eligible);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Graded Piano Curriculum</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Piano Assessments & Conservatory Diploma
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Complete each level's authoritative examination with server-side scoring, virtual keyboard evaluation, and anti-farming protection to qualify for your official Conservatory Graduation Diploma.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 border border-slate-800 rounded-2xl min-w-[200px] text-center shrink-0">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
              Curriculum Progress
            </span>
            <div className="text-4xl font-black text-amber-400 mt-1">
              {passedCount} / 3
            </div>
            <span className="text-xs text-slate-400 mt-1">Levels Passed</span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
                style={{ width: `${(passedCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Graduation Banner Callout if Completed or Claimed */}
      {(isAllPassed || certificate) && (
        <div className="rounded-2xl p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-900/60 border border-amber-500/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                Conservatory Honors
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {certificate
                  ? `Graduation Diploma Issued (${certificate.certificateNumber})`
                  : 'All 3 Levels Passed — You are Eligible for Graduation!'}
              </h3>
              <p className="text-slate-300 text-sm mt-0.5">
                {certificate
                  ? `Conferred on ${certificate.issueDate} with ${certificate.averageScorePercent}% distinction average.`
                  : 'Claim your official archival diploma complete with cryptographic verification seal.'}
              </p>
            </div>
          </div>

          <button
            onClick={onViewCertificate}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-extrabold text-sm hover:brightness-110 transition shadow-xl flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <FileCheck2 className="w-5 h-5" />
            <span>{certificate ? 'View Diploma' : 'Claim Official Diploma'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessments.map((item) => {
          const isPassed = item.passed;
          const isLocked = item.isLocked;

          return (
            <div
              key={item.level}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isPassed
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/20 shadow-xl'
                  : isLocked
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 shadow-xl'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Top badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                      item.level === 1
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : item.level === 2
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    Level {item.level}
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                    Pass: <strong>{item.passingScorePercent}%</strong>
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Assessment Attributes */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase">Questions</span>
                    <span className="font-bold text-slate-200">{item.totalQuestions} Tasks</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase">Reward</span>
                    <span className="font-bold text-amber-400">+{item.xpReward} XP</span>
                  </div>
                </div>

                {/* Score Status */}
                {item.userBestScore !== undefined && item.userBestScore !== null && item.userBestScore > 0 ? (
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                      Best Attempt:
                    </span>
                    <span className="font-extrabold text-sm">{item.userBestScore}%</span>
                  </div>
                ) : null}
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                {isLocked ? (
                  <div className="w-full py-3 rounded-xl bg-slate-800/40 text-slate-500 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-800 cursor-not-allowed">
                    <Lock className="w-4 h-4" />
                    <span>Pass Level {item.level - 1} First</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectAssessment(item)}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                      isPassed
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950'
                    }`}
                  >
                    {isPassed ? (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake to Improve Score</span>
                      </>
                    ) : (
                      <>
                        <span>Start Assessment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Attempts History */}
      {attempts.length > 0 && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Your Examination Records</h3>
            </div>
            <span className="text-xs text-slate-400">{attempts.length} attempts recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Points</th>
                  <th className="py-2.5 px-3">XP Awarded</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      Level {att.level}
                    </td>
                    <td className="py-2.5 px-3 font-bold">{att.scorePercent}%</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          att.passed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {att.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {att.earnedPoints} / {att.totalPoints}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-semibold">
                      +{att.xpAwarded} XP
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
