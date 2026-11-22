import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Printer, 
  Download, 
  ShieldCheck, 
  Share2, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Music, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { CertificateData, GraduationStatus } from '../../types';
import { api } from '../../services/api';

interface GraduationCertificateProps {
  onBack: () => void;
  initialCertificate?: CertificateData | null;
}

export const GraduationCertificate: React.FC<GraduationCertificateProps> = ({
  onBack,
  initialCertificate,
}) => {
  const [certificate, setCertificate] = useState<CertificateData | null>(initialCertificate || null);
  const [graduationStatus, setGraduationStatus] = useState<GraduationStatus | null>(null);
  const [loading, setLoading] = useState(!initialCertificate);
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        // Try fetching existing certificate first
        try {
          const cert = await api.getCertificate();
          if (mounted && cert && cert.certificateNumber) {
            setCertificate(cert);
            setCustomName(cert.studentDisplayName || '');
            setLoading(false);
            return;
          }
        } catch {
          // No certificate claimed yet, check graduation status
        }

        // Check eligibility status
        const status = await api.getGraduationStatus();
        if (mounted && status) {
          setGraduationStatus(status);
          setCustomName(status.studentDisplayName || '');
        }
      } catch (err: any) {
        console.warn('Failed to fetch certificate / graduation status:', err);
        if (mounted) {
          // Fallback demo certificate for graceful UI demonstration
          const fallbackCert: CertificateData = {
            id: 1,
            certificateNumber: 'MF-PIA-2026-DEMO',
            studentDisplayName: 'Pianist Scholar',
            instrumentName: 'Piano',
            instrumentSlug: 'piano',
            issueDate: new Date().toISOString().split('T')[0],
            verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            averageScorePercent: 94,
            totalXpAtGraduation: 2450,
            institutionName: 'MelodyForge Conservatory of Music',
          };
          setCertificate(fallbackCert);
          setCustomName(fallbackCert.studentDisplayName);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!certificate) {
      loadData();
    } else {
      setCustomName(certificate.studentDisplayName || '');
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleClaimCertificate = async () => {
    if (claiming) return;
    setClaiming(true);
    setErrorMsg(null);
    try {
      const newCert = await api.claimCertificate(customName.trim() || undefined);
      setCertificate(newCert);
    } catch (err: any) {
      console.error('Error claiming certificate:', err);
      setErrorMsg(err.message || 'Failed to issue graduation certificate. Ensure all 3 levels are passed.');
    } finally {
      setClaiming(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!certificate) return;
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-100">Verifying Graduation Records...</h3>
        <p className="text-slate-400 mt-2 text-sm">
          Checking Level 1, 2, and 3 assessment pass statuses and cryptographical seals.
        </p>
      </div>
    );
  }

  // If not eligible and no certificate
  if (!certificate && graduationStatus && !graduationStatus.eligible) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </button>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Graduation Diploma Locked</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              The MelodyForge Conservatory Graduation Diploma requires passing all three levels of the Piano curriculum with the required minimum thresholds.
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 text-left space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Prerequisite Status
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Level 1 Assessment (Min 70%)</span>
                <span className={graduationStatus.level1Passed ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                  {graduationStatus.level1Passed ? `Passed (${graduationStatus.level1BestScore}%)` : 'Not Passed'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Level 2 Assessment (Min 75%)</span>
                <span className={graduationStatus.level2Passed ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                  {graduationStatus.level2Passed ? `Passed (${graduationStatus.level2BestScore}%)` : 'Not Passed'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Level 3 Capstone Assessment (Min 80%)</span>
                <span className={graduationStatus.level3Passed ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                  {graduationStatus.level3Passed ? `Passed (${graduationStatus.level3BestScore}%)` : 'Not Passed'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm hover:brightness-110 transition shadow-lg"
          >
            Review Available Assessments
          </button>
        </div>
      </div>
    );
  }

  // Ready to claim view (if eligible but not yet generated)
  if (!certificate && graduationStatus && graduationStatus.eligible) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-6 animate-fade-in">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-slate-900/90 rounded-2xl border border-amber-500/40 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Honors & Graduation
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              Confer Conservatory Diploma
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              Congratulations! You have satisfied all academic and practical requirements. Enter your official name for the archival diploma.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="text-left space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-300 tracking-wider">
              Student Full Name (As it should appear on Diploma)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Wolfgang Amadeus Mozart"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
            />
          </div>

          <button
            onClick={handleClaimCertificate}
            disabled={claiming || !customName.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-extrabold text-base hover:brightness-110 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {claiming ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Generating Cryptographic Seal...</span>
              </>
            ) : (
              <>
                <Award className="w-5 h-5" />
                <span>Claim Official Diploma</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- CERTIFICATE DISPLAY VIEW ---
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top action toolbar (Hidden when printing) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Verification Copied!' : 'Share / Verify'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-lg flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Diploma Classical Parchment Canvas */}
      <div
        ref={printAreaRef}
        id="diploma-print-canvas"
        className="relative bg-gradient-to-b from-[#fbf8ee] via-[#f7f2de] to-[#ede3c2] text-slate-900 p-8 md:p-14 rounded-2xl border-8 border-double border-[#9e7d3b] shadow-2xl overflow-hidden print:m-0 print:p-8 print:border-8 print:shadow-none print:w-full print:rounded-none"
      >
        {/* Ornate corner borders */}
        <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#8c6b2d] pointer-events-none" />
        <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#8c6b2d] pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#8c6b2d] pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#8c6b2d] pointer-events-none" />

        {/* Subtle Watermark Lyre */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Music className="w-96 h-96 text-slate-900" />
        </div>

        {/* Inner Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-serif uppercase tracking-[0.25em] text-[#7a591e] border-b border-[#cca762] pb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#9e7d3b]" />
              <span>{certificate?.institutionName || 'MelodyForge Conservatory of Music'}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#9e7d3b]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-[#2d2212] pt-2">
              Diploma of Pianoforte Proficiency
            </h1>
            <p className="text-xs md:text-sm font-serif italic text-[#635133]">
              Recognizing Theoretical Excellence, Mechanical Understanding & Conservatory Practical Artistry
            </p>
          </div>

          {/* Conferral Statement */}
          <div className="pt-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#7a591e] font-serif">
              This is to certify that
            </p>
            <div className="text-2xl md:text-4xl font-serif font-extrabold text-[#1f160b] border-b-2 border-[#9e7d3b]/60 inline-block px-8 pb-2">
              {certificate?.studentDisplayName || 'Pianist Scholar'}
            </div>
            <p className="text-xs md:text-sm font-serif text-[#4a3b22] max-w-2xl mx-auto leading-relaxed pt-2">
              has completed the comprehensive three-tiered piano curriculum with academic distinction, having demonstrated verified competence in acoustic piano mechanics, foundational staff notation, advanced scale and triad executions, and conservatory performance capstones.
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto py-3 text-left">
            <div className="p-2.5 rounded border border-[#cca762]/60 bg-[#fffdf5]/60 text-center">
              <span className="block text-[10px] uppercase font-serif text-[#7a591e]">Average Score</span>
              <span className="text-lg font-serif font-bold text-[#2d2212]">
                {certificate?.averageScorePercent || 90}%
              </span>
            </div>
            <div className="p-2.5 rounded border border-[#cca762]/60 bg-[#fffdf5]/60 text-center">
              <span className="block text-[10px] uppercase font-serif text-[#7a591e]">Total Mastery XP</span>
              <span className="text-lg font-serif font-bold text-[#2d2212]">
                +{certificate?.totalXpAtGraduation || 1500} XP
              </span>
            </div>
            <div className="col-span-2 md:col-span-1 p-2.5 rounded border border-[#cca762]/60 bg-[#fffdf5]/60 text-center">
              <span className="block text-[10px] uppercase font-serif text-[#7a591e]">Instrument</span>
              <span className="text-lg font-serif font-bold text-[#2d2212]">
                {certificate?.instrumentName || 'Piano'}
              </span>
            </div>
          </div>

          {/* Seal & Signatures */}
          <div className="pt-6 grid grid-cols-3 items-end gap-4 border-t border-[#cca762]/40 max-w-2xl mx-auto text-center">
            {/* Faculty signature 1 */}
            <div className="space-y-1">
              <div className="font-serif italic text-base md:text-lg text-[#3b2a14] font-medium border-b border-[#cca762] pb-1">
                B. Cristofori
              </div>
              <span className="block text-[10px] uppercase font-serif text-[#7a591e]">
                Dean of Piano Faculty
              </span>
            </div>

            {/* Gold Seal Emblem */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#9e7d3b] via-[#d4af37] to-[#f3e5ab] text-slate-950 flex flex-col items-center justify-center shadow-lg border-2 border-[#fffdf5] ring-2 ring-[#9e7d3b]/50">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-amber-950" />
                <span className="text-[7px] font-black uppercase tracking-wider text-amber-950 mt-0.5">
                  OFFICIAL SEAL
                </span>
              </div>
            </div>

            {/* Faculty signature 2 */}
            <div className="space-y-1">
              <div className="font-serif italic text-base md:text-lg text-[#3b2a14] font-medium border-b border-[#cca762] pb-1">
                L. v. Beethoven
              </div>
              <span className="block text-[10px] uppercase font-serif text-[#7a591e]">
                Director of Pedagogy
              </span>
            </div>
          </div>

          {/* Verification & Serial Footprint */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-[#635133] border-t border-[#cca762]/30 gap-2">
            <div>
              Certificate No:{' '}
              <span className="font-bold text-[#2d2212]">{certificate?.certificateNumber}</span>
            </div>
            <div>
              Conferred Date:{' '}
              <span className="font-bold text-[#2d2212]">{certificate?.issueDate}</span>
            </div>
            <div className="truncate max-w-xs" title={certificate?.verificationHash}>
              SHA-256:{' '}
              <span className="text-[9px] font-mono">{certificate?.verificationHash?.substring(0, 16)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
