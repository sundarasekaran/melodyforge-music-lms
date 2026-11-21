import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Film,
  Hammer,
  Pause,
  Play,
  RotateCcw,
  Video,
  Volume2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  YOUTUBE_VIDEOS,
  ACOUSTIC_STAGES,
  DIGITAL_STAGES,
  PLAYABLE_KEYS,
} from '../../data/labsData';

export interface SoundActionDiagramProps {
  onLabComplete?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  compactMode?: boolean;
}

export const SoundActionDiagram: React.FC<SoundActionDiagramProps> = ({
  onLabComplete,
  showBack,
  onBack,
  compactMode = false,
}) => {
  const [viewTab, setViewTab] = useState<'interactive' | 'local-video' | 'youtube'>('interactive');
  const [selectedYoutubeId, setSelectedYoutubeId] = useState<string>(YOUTUBE_VIDEOS[0].id);
  const [localPlaying, setLocalPlaying] = useState(true);
  const [localRate, setLocalRate] = useState<0.5 | 1>(1);

  const [mode, setMode] = useState<'acoustic' | 'digital'>('acoustic');
  const [selectedKey, setSelectedKey] = useState(PLAYABLE_KEYS[1]);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [loopVideo, setLoopVideo] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1>(1);
  const [sustainPedal, setSustainPedal] = useState(false);

  const [progress, setProgress] = useState(0.45);
  const [manualKeyHeld, setManualKeyHeld] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(0.45);
  const manualHeldRef = useRef(false);
  const manualStrikeTimeRef = useRef(0);
  const phaseRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const lastStruckCycleRef = useRef(false);

  const stateRef = useRef({
    mode,
    selectedKey,
    isPlayingVideo,
    loopVideo,
    playbackSpeed,
    sustainPedal,
  });

  useEffect(() => {
    stateRef.current = {
      mode,
      selectedKey,
      isPlayingVideo,
      loopVideo,
      playbackSpeed,
      sustainPedal,
    };
  }, [mode, selectedKey, isPlayingVideo, loopVideo, playbackSpeed, sustainPedal]);

  const stages = mode === 'acoustic' ? ACOUSTIC_STAGES : DIGITAL_STAGES;

  // Sync playback rate for local HD slow-mo video
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.playbackRate = localRate;
    }
  }, [localRate, viewTab]);

  // High-resolution 60fps canvas renderer (Interactive Lab tab)
  useEffect(() => {
    if (viewTab !== 'interactive') return;
    let rafId: number;

    const drawRealisticFrame = (timestamp: number) => {
      if (lastFrameRef.current === null) lastFrameRef.current = timestamp;
      const dt = Math.min(50, timestamp - lastFrameRef.current);
      lastFrameRef.current = timestamp;

      const {
        mode: curMode,
        selectedKey: curKey,
        isPlayingVideo: playing,
        loopVideo: looping,
        playbackSpeed: speed,
        sustainPedal: sustain,
      } = stateRef.current;

      phaseRef.current += dt * 0.05;

      // Update timeline
      if (manualHeldRef.current) {
        const elapsed = timestamp - manualStrikeTimeRef.current;
        const heldP = Math.min(0.62, (elapsed / 320) * 0.62);
        progressRef.current = heldP;
        setProgress(heldP);
      } else if (playing) {
        const durationMs = 3600 / speed;
        const prev = progressRef.current;
        let next = prev + dt / durationMs;
        if (next >= 1) {
          if (looping) {
            next = 0;
            lastStruckCycleRef.current = false;
          } else {
            next = 1;
            setIsPlayingVideo(false);
          }
        }
        if (next >= 0.35 && prev < 0.35 && !lastStruckCycleRef.current) {
          lastStruckCycleRef.current = true;
          audioEngine.unlockSync();
          void audioEngine.playNote(
            curKey.note,
            sustain ? 1.8 : 1.2
          );
        }
        if (next < 0.2) lastStruckCycleRef.current = false;
        progressRef.current = next;
        setProgress(next);
      }

      const p = progressRef.current;
      const isHeld = manualHeldRef.current;

      // Kinematics calculations
      const keyDepress = isHeld
        ? 1
        : p < 0.08
        ? p / 0.08
        : p < 0.85
        ? 1
        : Math.max(0, 1 - (p - 0.85) / 0.12);

      const damperLift =
        sustain || isHeld
          ? 1
          : p < 0.06
          ? 0
          : p < 0.16
          ? (p - 0.06) / 0.1
          : p < 0.86
          ? 1
          : Math.max(0, 1 - (p - 0.86) / 0.1);

      const hammerDeg = (() => {
        if (p < 0.14) return 0;
        if (p < 0.36) return -32 * ((p - 0.14) / 0.22);
        if (p < 0.46) return -32 + 16 * ((p - 0.36) / 0.1);
        if (isHeld || p < 0.85) return -16;
        return -16 * Math.max(0, 1 - (p - 0.85) / 0.12);
      })();

      const vibrating = damperLift > 0.35 && (isHeld || (p >= 0.35 && p <= 0.92));
      const vibAmp = (() => {
        if (!vibrating) return 0;
        if (isHeld) {
          const sec = (timestamp - manualStrikeTimeRef.current) / 1000;
          return Math.max(0.18, Math.exp(-sec * 0.85));
        }
        return Math.max(0.15, 1 - Math.max(0, p - 0.35) * 1.35) * damperLift;
      })();

      // Render Canvas (1280x620 crisp studio frame)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;
          ctx.clearRect(0, 0, W, H);

          // 1. Concert Hall Studio Backdrop
          const bgGrad = ctx.createRadialGradient(W * 0.52, H * 0.35, 60, W * 0.5, H * 0.5, W * 0.72);
          bgGrad.addColorStop(0, '#1e1c19');
          bgGrad.addColorStop(0.55, '#13110e');
          bgGrad.addColorStop(1, '#090807');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          // Piano inner rim shadow
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(0, H - 90, W, 90);

          if (curMode === 'acoustic') {
            // 2. Sitka Spruce Soundboard (top acoustic chamber)
            const sbGrad = ctx.createLinearGradient(440, 40, 1220, 170);
            sbGrad.addColorStop(0, vibrating ? '#8A5E2B' : '#654420');
            sbGrad.addColorStop(0.5, vibrating ? '#B8813D' : '#855B2B');
            sbGrad.addColorStop(1, vibrating ? '#7A5122' : '#573A1A');

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(450, 40, 780, 118, 8);
            ctx.fillStyle = sbGrad;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = vibrating ? '#E5C158' : '#705129';
            ctx.stroke();
            ctx.clip();

            // Subtle Sitka spruce woodgrain fibers
            ctx.strokeStyle = 'rgba(40, 22, 8, 0.28)';
            ctx.lineWidth = 1.2;
            for (let y = 44; y < 158; y += 7) {
              ctx.beginPath();
              ctx.moveTo(450, y);
              ctx.bezierCurveTo(680, y + 4, 980, y - 4, 1230, y + 2);
              ctx.stroke();
            }

            // Acoustic resonance glow pulse when vibrating
            if (vibrating) {
              const pulseAlpha = 0.14 + 0.12 * Math.sin(phaseRef.current * 0.5);
              ctx.fillStyle = `rgba(245, 200, 90, ${pulseAlpha})`;
              ctx.fillRect(450, 40, 780, 118);
            }
            ctx.restore();

            ctx.fillStyle = '#FAF7F2';
            ctx.font = '600 20px system-ui, sans-serif';
            ctx.fillText('Sitka Spruce Soundboard & Hardwood Bridge', 476, 84);
            ctx.fillStyle = '#F5D67B';
            ctx.font = '500 15px system-ui, sans-serif';
            ctx.fillText(
              vibrating
                ? 'Resonating — Amplifying steel string acoustic vibrations'
                : 'Diaphragm that projects faint string vibration into room volume',
              476,
              112
            );

            // Hardwood acoustic bridge
            const bridgeGrad = ctx.createLinearGradient(1130, 158, 1165, 240);
            bridgeGrad.addColorStop(0, '#A47135');
            bridgeGrad.addColorStop(1, '#5D3C18');
            ctx.fillStyle = bridgeGrad;
            ctx.beginPath();
            ctx.roundRect(1130, 158, 30, 96, 4);
            ctx.fill();

            // Cast-iron gold harp plate anchor
            const goldPlate = ctx.createLinearGradient(340, 200, 410, 275);
            goldPlate.addColorStop(0, '#D4AF37');
            goldPlate.addColorStop(0.5, '#9A7422');
            goldPlate.addColorStop(1, '#6E5014');
            ctx.fillStyle = goldPlate;
            ctx.beginPath();
            ctx.roundRect(350, 208, 52, 64, 6);
            ctx.fill();

            // Steel tuning pin
            ctx.fillStyle = '#CBD5E1';
            ctx.beginPath();
            ctx.arc(376, 240, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 3. Tuned Steel / Copper String (y = 240)
            const stringY = 240;
            const xStart = 386;
            const xEnd = 1145;
            const stringCount = curKey.isBass ? 1 : 3;

            for (let s = 0; s < stringCount; s++) {
              const offsetY = (s - (stringCount - 1) / 2) * 3.5;
              ctx.beginPath();
              const segments = 64;
              for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = xStart + (xEnd - xStart) * t;
                const envelope = Math.sin(Math.PI * t);
                const fundamental = Math.sin(phaseRef.current * 2.4) * curKey.waveAmp * vibAmp;
                const overtone =
                  Math.sin(Math.PI * 2 * t) * Math.cos(phaseRef.current * 4.8) * (curKey.waveAmp * 0.32) * vibAmp;
                const y = stringY + offsetY + envelope * (fundamental + overtone);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              if (vibrating) {
                ctx.shadowColor = 'rgba(253, 224, 71, 0.55)';
                ctx.shadowBlur = 10;
              } else {
                ctx.shadowBlur = 0;
              }
              ctx.strokeStyle = curKey.isBass
                ? vibrating
                  ? '#F59E0B'
                  : '#B4743B'
                : vibrating
                ? '#FEF08A'
                : '#CBD5E1';
              ctx.lineWidth = curKey.isBass ? 4.5 : 2.2;
              ctx.stroke();
              ctx.shadowBlur = 0;
            }

            // 4. Damper Felt Assembly (Above string, lifting UP)
            const damperOffsetY = -48 * damperLift;
            const dX = 910;
            const dBaseY = 214 + damperOffsetY;

            // Brass damper wire
            ctx.strokeStyle = '#B89B5E';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(dX + 52, dBaseY + 12);
            ctx.lineTo(dX + 52, 470 - keyDepress * 14);
            ctx.stroke();

            // Mahogany damper head
            const woodGrad = ctx.createLinearGradient(dX, dBaseY - 14, dX, dBaseY + 10);
            woodGrad.addColorStop(0, '#8C4E27');
            woodGrad.addColorStop(1, '#4E2912');
            ctx.fillStyle = woodGrad;
            ctx.beginPath();
            ctx.roundRect(dX, dBaseY - 10, 104, 22, 4);
            ctx.fill();
            ctx.strokeStyle = '#C49A6C';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Red wool felt wedge
            ctx.fillStyle = '#B91C1C';
            ctx.beginPath();
            ctx.moveTo(dX + 8, dBaseY + 12);
            ctx.lineTo(dX + 96, dBaseY + 12);
            ctx.lineTo(dX + 88, dBaseY + 25);
            ctx.lineTo(dX + 16, dBaseY + 25);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = damperLift > 0.5 ? '#86EFAC' : '#FCA5A5';
            ctx.font = '600 17px system-ui, sans-serif';
            ctx.fillText(
              damperLift > 0.5 ? 'Damper Lifted (String Free to Ring)' : 'Damper Resting on String (Muted)',
              dX - 30,
              dBaseY - 20
            );

            // 5. Escapement Hammer & Shank (pivot at x=470, y=408)
            const pivotX = 470;
            const pivotY = 408;
            ctx.save();
            ctx.translate(pivotX, pivotY);
            ctx.rotate((hammerDeg * Math.PI) / 180);

            // Wooden hammer shank
            const shankGrad = ctx.createLinearGradient(0, 0, 170, -90);
            shankGrad.addColorStop(0, '#D4B68C');
            shankGrad.addColorStop(1, '#F3E5CE');
            ctx.strokeStyle = shankGrad;
            ctx.lineWidth = 9;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(164, -92);
            ctx.stroke();

            // Compressed wool felt hammer head + core
            ctx.save();
            ctx.translate(168, -96);
            ctx.rotate(-0.55);
            ctx.fillStyle = '#F7F3EA';
            ctx.shadowColor = 'rgba(0,0,0,0.45)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 30, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Mahogany core
            ctx.fillStyle = '#7C3F1C';
            ctx.beginPath();
            ctx.ellipse(0, 10, 10, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // Flange pivot pin
            ctx.fillStyle = '#D4AF37';
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#E5C158';
            ctx.font = '600 17px system-ui, sans-serif';
            ctx.fillText('Hornbeam Shank & Felt Hammer (Escapement)', 580, 340);

            // 6. Whippen & Jack Assembly
            const whippenLift = -22 * keyDepress;
            ctx.fillStyle = '#423325';
            ctx.strokeStyle = '#8E6D3B';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(410, 418 + whippenLift, 140, 28, 5);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#F4F0E8';
            ctx.font = '600 14px system-ui, sans-serif';
            ctx.fillText('Whippen & Jack', 426, 437 + whippenLift);

            // Acoustic sound waves radiating from soundboard
            if (vibrating) {
              for (let w = 0; w < 3; w++) {
                const alpha = Math.max(0.1, (0.75 - w * 0.2) * vibAmp);
                ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(1155, 290, 34 + w * 24, -0.65, 0.65);
                ctx.stroke();
              }
            }
          } else {
            // DIGITAL SENSOR & DSP VISUALIZATION
            ctx.fillStyle = '#181920';
            ctx.strokeStyle = keyDepress > 0.3 ? '#D4AF37' : '#334155';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(430, 270, 220, 100, 10);
            ctx.fill();
            ctx.stroke();

            // Optical velocity sensor beams
            ctx.strokeStyle = keyDepress > 0.5 ? '#EF4444' : '#10B981';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(460, 305);
            ctx.lineTo(620, 305);
            ctx.moveTo(460, 338);
            ctx.lineTo(620, 338);
            ctx.stroke();

            ctx.fillStyle = '#F4F0E8';
            ctx.font = '600 17px system-ui, sans-serif';
            ctx.fillText('Dual Optical Sensors', 452, 292);
            ctx.fillStyle = '#D4AF37';
            ctx.font = '500 14px monospace';
            ctx.fillText(keyDepress > 0.5 ? 'Δt = 4.2 ms · Velocity 98' : 'Beams Unbroken', 452, 360);

            // DSP Audio Engine + Oscilloscope Waveform
            ctx.fillStyle = '#111218';
            ctx.strokeStyle = vibrating ? '#D4AF37' : '#334155';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(720, 210, 340, 180, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#F4F0E8';
            ctx.font = '600 19px system-ui, sans-serif';
            ctx.fillText('DSP Additive Synthesis Engine', 750, 248);

            ctx.beginPath();
            for (let i = 0; i <= 120; i++) {
              const t = i / 120;
              const x = 750 + t * 280;
              const y =
                305 +
                Math.sin(t * Math.PI * 8 + phaseRef.current * 2.5) * 28 * vibAmp * Math.sin(Math.PI * t);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = vibrating ? '#D4AF37' : '#64748B';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#94A3B8';
            ctx.font = '500 14px monospace';
            ctx.fillText(`Multi-harmonic ${curKey.note} (${curKey.freq})`, 750, 368);

            // Stereo Speaker Output
            ctx.fillStyle = '#161d19';
            ctx.strokeStyle = vibrating ? '#10B981' : '#334155';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(1160, 300, 56, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#F4F0E8';
            ctx.font = '600 16px system-ui, sans-serif';
            ctx.fillText('Speaker', 1126, 306);
          }

          // 7. Balanced Piano Key Lever (Shared)
          ctx.save();
          ctx.translate(360, 492);
          ctx.rotate(((3.2 * keyDepress) * Math.PI) / 180);

          // Wooden key body
          const stickGrad = ctx.createLinearGradient(-300, 0, 200, 0);
          stickGrad.addColorStop(0, '#E8DFCF');
          stickGrad.addColorStop(1, '#B89B6E');
          ctx.fillStyle = stickGrad;
          ctx.beginPath();
          ctx.roundRect(-295, -22, 480, 42, 4);
          ctx.fill();

          // Ivory keytop front
          const ivoryGrad = ctx.createLinearGradient(-295, -22, -295, 16);
          ivoryGrad.addColorStop(0, '#FFFFFF');
          ivoryGrad.addColorStop(1, '#EAE3D3');
          ctx.fillStyle = ivoryGrad;
          ctx.beginPath();
          ctx.roundRect(-295, -22, 220, 38, 4);
          ctx.fill();
          ctx.strokeStyle = '#C7BDAA';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#181614';
          ctx.font = '700 19px system-ui, sans-serif';
          ctx.fillText(`Piano Key (${curKey.note})`, -268, 4);
          ctx.restore();

          // Balance rail fulcrum
          ctx.fillStyle = '#D4AF37';
          ctx.beginPath();
          ctx.moveTo(350, 540);
          ctx.lineTo(370, 540);
          ctx.lineTo(360, 514);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#94A3B8';
          ctx.font = '500 15px system-ui, sans-serif';
          ctx.fillText('Balance Rail Fulcrum', 280, 566);
        }
      }

      rafId = requestAnimationFrame(drawRealisticFrame);
    };

    rafId = requestAnimationFrame(drawRealisticFrame);
    return () => {
      cancelAnimationFrame(rafId);
      lastFrameRef.current = null;
    };
  }, [viewTab]);

  const currentStage =
    stages.find((s) => progress >= s.range[0] && progress <= s.range[1]) ?? stages[stages.length - 1];

  const handleManualKeyPress = useCallback(
    (item: (typeof PLAYABLE_KEYS)[number]) => {
      audioEngine.unlockSync();
      setSelectedKey(item);
      setManualKeyHeld(true);
      manualHeldRef.current = true;
      manualStrikeTimeRef.current = performance.now();
      lastStruckCycleRef.current = true;
      setHasInteracted(true);
      void audioEngine.playNote(item.note, 1.2);
    },
    []
  );

  const handleManualKeyRelease = useCallback((item: (typeof PLAYABLE_KEYS)[number]) => {
    setManualKeyHeld(false);
    manualHeldRef.current = false;
    audioEngine.stopNote(item.note);
    progressRef.current = 0.86;
    setProgress(0.86);
  }, []);

  const handleReplay = () => {
    audioEngine.unlockSync();
    setManualKeyHeld(false);
    manualHeldRef.current = false;
    lastStruckCycleRef.current = false;
    progressRef.current = 0;
    setProgress(0);
    setIsPlayingVideo(true);
    setHasInteracted(true);
  };

  const handleSustainToggle = () => {
    const next = !sustainPedal;
    setSustainPedal(next);
    audioEngine.setSustain(next);
  };

  const activeYoutube =
    YOUTUBE_VIDEOS.find((v) => v.id === selectedYoutubeId) ?? YOUTUBE_VIDEOS[0];

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 lg:p-7 shadow-2xl space-y-5">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Sound Action Physics Lab</span>
          </div>
          <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            How a Piano Produces Sound
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Inspect the 60 FPS acoustic action simulator, watch the slow-motion cutaway video, and explore the physics of escapement, dampers, and soundboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => {
              audioEngine.unlockSync();
              setViewTab('interactive');
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
              viewTab === 'interactive'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Hammer size={14} className="text-amber-400" />
            Interactive Canvas
          </button>
          <button
            type="button"
            onClick={() => setViewTab('local-video')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
              viewTab === 'local-video'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Film size={14} className="text-amber-400" />
            Slow-Mo Cutaway
          </button>
          <button
            type="button"
            onClick={() => setViewTab('youtube')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
              viewTab === 'youtube'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Video size={14} className="text-amber-400" />
            3D Video Guides
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Display (Canvas / Video) */}
        <div className="lg:col-span-8 space-y-4">
          {viewTab === 'interactive' && (
            <div className="space-y-3">
              {/* Toolbar Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
                    <button
                      type="button"
                      onClick={() => setMode('acoustic')}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                        mode === 'acoustic'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      Acoustic Grand
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('digital')}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                        mode === 'digital'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      Digital Optical
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSustainToggle}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer',
                      sustainPedal
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    )}
                  >
                    Pedal: {sustainPedal ? 'DOWN (Sustain ON)' : 'UP'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-850 cursor-pointer"
                  >
                    {isPlayingVideo ? <Pause size={13} /> : <Play size={13} />}
                    {isPlayingVideo ? 'Pause' : 'Play'}
                  </button>

                  <button
                    type="button"
                    onClick={handleReplay}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-850 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 0.5 : 1)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-bold text-slate-300 hover:bg-slate-850 cursor-pointer"
                  >
                    {playbackSpeed}x
                  </button>
                </div>
              </div>

              {/* 60 FPS HTML5 Canvas */}
              <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-black aspect-[1280/620] shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={620}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Playable Key Selector Strip */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select String / Pitch to Strike:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PLAYABLE_KEYS.map((k) => {
                    const isSelected = selectedKey.midi === k.midi;
                    return (
                      <button
                        key={k.midi}
                        type="button"
                        onPointerDown={() => handleManualKeyPress(k)}
                        onPointerUp={() => handleManualKeyRelease(k)}
                        onPointerLeave={() => handleManualKeyRelease(k)}
                        className={cn(
                          'p-2 rounded-xl border text-left transition-all cursor-pointer select-none',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600/20 shadow-md'
                            : 'border-slate-800 bg-slate-900 hover:bg-slate-850'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{k.label}</span>
                          <span className="text-[10px] text-amber-400 font-mono">{k.freq}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{k.stringDesc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {viewTab === 'local-video' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Film size={15} />
                  1080p Slow-Motion Footage · Grand Piano Action in Motion
                </span>
                <span className="text-slate-400 text-[11px]">Stored locally (MP4 &amp; WebM)</span>
              </div>

              <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-black aspect-video shadow-2xl">
                <video
                  ref={localVideoRef}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/videos/grand-piano-action-poster.jpg"
                  onPlay={() => setLocalPlaying(true)}
                  onPause={() => setLocalPlaying(false)}
                  className="h-full w-full object-contain"
                >
                  <source src="/videos/grand-piano-action.mp4" type="video/mp4" />
                  <source src="/videos/grand-piano-action.webm" type="video/webm" />
                </video>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => {
                      const v = localVideoRef.current;
                      if (!v) return;
                      if (v.paused) void v.play();
                      else v.pause();
                    }}
                  >
                    {localPlaying ? 'Pause Video' : 'Play Video'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setLocalRate(localRate === 1 ? 0.5 : 1)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-850 cursor-pointer"
                  >
                    Speed: {localRate}x
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  Notice the hammer rebound back onto the backcheck before the key is released.
                </span>
              </div>
            </div>
          )}

          {viewTab === 'youtube' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-indigo-400">{activeYoutube.title}</span>
                <a
                  href={`https://www.youtube.com/watch?v=${activeYoutube.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  Watch on YouTube
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-black aspect-video shadow-2xl">
                <iframe
                  key={activeYoutube.id}
                  src={`https://www.youtube.com/embed/${activeYoutube.id}?rel=0&modestbranding=1&playsinline=1`}
                  title={activeYoutube.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {YOUTUBE_VIDEOS.map((vid) => {
                  const isCurrent = vid.id === activeYoutube.id;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setSelectedYoutubeId(vid.id)}
                      className={cn(
                        'rounded-xl border p-2.5 text-left transition-all cursor-pointer',
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-600/20'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850'
                      )}
                    >
                      <p className="text-xs font-bold text-white line-clamp-1">{vid.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-2">{vid.focus}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mechanical Explanations & Stage Checklist */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Stage Callout */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="indigo" size="sm">
                Stage {currentStage.step} of {stages.length}
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">
                {Math.round(progress * 100)}% cycle
              </span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">
              {currentStage.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStage.detail}
            </p>
          </div>

          {/* All Stages Progress Stepper */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Mechanical Sequence:
            </span>
            <div className="space-y-1.5">
              {stages.map((st) => {
                const isCurrent = currentStage.step === st.step;
                const isPassed = progress > st.range[1];
                return (
                  <div
                    key={st.step}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5',
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-600/15 text-white shadow-sm'
                        : isPassed
                        ? 'border-slate-800/80 bg-slate-900/40 text-slate-400'
                        : 'border-transparent text-slate-500'
                    )}
                  >
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border',
                        isCurrent
                          ? 'border-indigo-400 bg-indigo-500 text-white'
                          : isPassed
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950 text-slate-600'
                      )}
                    >
                      {isPassed ? '✓' : st.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-snug">{st.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Component Glossary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Key Mechanism Parts:
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <strong className="text-amber-400">Escapement (Scappamento):</strong> Disengages the hammer just before striking so it rebounds freely without muting the string.
              </li>
              <li>
                <strong className="text-amber-400">Backcheck:</strong> Catches the rebounding hammer to prevent unintentional double strikes.
              </li>
              <li>
                <strong className="text-amber-400">Sitka Spruce Soundboard:</strong> Crowns beneath strings to amplify acoustic vibrations into rich, room-filling sound.
              </li>
              <li>
                <strong className="text-amber-400">Sustain Pedal (Damper):</strong> Lifts all 60+ felt dampers simultaneously, allowing unmuted string resonance.
              </li>
            </ul>
          </div>

          {/* Lab Completion Action */}
          {onLabComplete && (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<CheckCircle2 size={16} />}
              onClick={onLabComplete}
            >
              Complete Action Physics Lab (+50 XP)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
