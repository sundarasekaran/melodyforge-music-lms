import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Music,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Headphones,
  BookOpen,
  Award,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  WifiOff,
  KeyRound,
  UserX,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthErrorDetails {
  title: string;
  message: string;
  field?: 'identifier' | 'password' | 'email' | 'username' | 'confirmPassword' | 'network' | 'general';
  type: 'CREDENTIALS' | 'NOT_FOUND' | 'NETWORK' | 'VALIDATION' | 'SERVER';
}

interface AuthPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'LOGIN' }) => {
  const { login, register, savedUsername } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(savedUsername || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSlowResponse, setIsSlowResponse] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);

  // Sync remembered username when available
  useEffect(() => {
    if (savedUsername && !loginIdentifier) {
      setLoginIdentifier(savedUsername);
    }
  }, [savedUsername]);

  // Monitor long requests (e.g. Render server waking up)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isSubmitting) {
      timer = setTimeout(() => {
        setIsSlowResponse(true);
      }, 3500);
    } else {
      setIsSlowResponse(false);
    }
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  // Trigger error with haptics & scroll into view on mobile
  const triggerError = (details: AuthErrorDetails) => {
    setAuthError(details);
    if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
      try { window.navigator.vibrate([40, 60, 40]); } catch {}
    }
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const parseAuthError = (err: any, currentMode: 'LOGIN' | 'REGISTER'): AuthErrorDetails => {
    const rawMsg: string = String(err?.message || err?.data?.message || err || '').trim();
    const lower = rawMsg.toLowerCase();
    const status = err?.status;

    // 1. Network / Server Unreachable / Device Offline
    if (
      err?.isNetwork ||
      lower.includes('network') ||
      lower.includes('failed to fetch') ||
      lower.includes('load failed') ||
      lower.includes('offline') ||
      lower.includes('connection error')
    ) {
      return {
        title: 'Connection Error',
        message: 'Unable to reach the MelodyForge server. Please check your internet connection or verify the backend server is reachable.',
        field: 'network',
        type: 'NETWORK',
      };
    }

    // 2. User / Account Not Found
    if (
      lower.includes('no user found') ||
      lower.includes('no account found') ||
      lower.includes('not found') ||
      lower.includes('usernotfound') ||
      status === 404
    ) {
      return {
        title: 'Account Not Found',
        message: rawMsg || 'No account is registered with this username or email. Please check your spelling or click "Create Account".',
        field: 'identifier',
        type: 'NOT_FOUND',
      };
    }

    // 3. Incorrect Password / Bad Credentials
    if (
      lower.includes('incorrect password') ||
      lower.includes('bad credentials') ||
      lower.includes('badcredentials') ||
      lower.includes('invalid credentials')
    ) {
      return {
        title: 'Incorrect Password',
        message: rawMsg.includes('Incorrect password')
          ? rawMsg
          : 'The password you entered is incorrect. Please verify your password and try again.',
        field: 'password',
        type: 'CREDENTIALS',
      };
    }

    // 4. Duplicate Email
    if (
      lower.includes('email') &&
      (lower.includes('already registered') ||
        lower.includes('already taken') ||
        lower.includes('exists') ||
        lower.includes('duplicate'))
    ) {
      return {
        title: 'Email Already In Use',
        message: rawMsg || 'This email address is already registered. Please sign in or use a different email address.',
        field: 'email',
        type: 'VALIDATION',
      };
    }

    // 5. Duplicate Username
    if (
      lower.includes('username') &&
      (lower.includes('already taken') ||
        lower.includes('already registered') ||
        lower.includes('exists'))
    ) {
      return {
        title: 'Username Already Taken',
        message: rawMsg || 'This username is already taken. Please choose another username.',
        field: 'username',
        type: 'VALIDATION',
      };
    }

    // 6. Generic 401 / 403 on Login
    if (currentMode === 'LOGIN' && (status === 401 || status === 403)) {
      return {
        title: 'Sign In Failed',
        message: 'Invalid username or password. Please verify your credentials and try again.',
        field: 'general',
        type: 'CREDENTIALS',
      };
    }

    // 7. Cloud Server 500 / 502 / 503 / 504
    if (status >= 500 || lower.includes('500') || lower.includes('502') || lower.includes('503')) {
      return {
        title: 'Server Error',
        message: 'The MelodyForge cloud service is starting up or temporarily busy. Please wait a moment and try again.',
        field: 'general',
        type: 'SERVER',
      };
    }

    // Fallback
    return {
      title: currentMode === 'LOGIN' ? 'Sign In Error' : 'Registration Error',
      message: rawMsg || (currentMode === 'LOGIN' ? 'Sign in failed. Please verify your details.' : 'Registration failed. Please try again.'),
      field: 'general',
      type: 'VALIDATION',
    };
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      triggerError({
        title: 'Missing Username or Email',
        message: 'Please enter your username or email address.',
        field: 'identifier',
        type: 'VALIDATION',
      });
      return;
    }
    if (!loginPassword) {
      triggerError({
        title: 'Missing Password',
        message: 'Please enter your account password.',
        field: 'password',
        type: 'VALIDATION',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier, loginPassword, rememberMe);
      setSuccessMessage('Welcome back! Loading your music studio...');
    } catch (err: any) {
      triggerError(parseAuthError(err, 'LOGIN'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);

    const name = regName.trim();
    const username = regUsername.trim();
    const email = regEmail.trim();

    if (!name) {
      triggerError({
        title: 'Missing Display Name',
        message: 'Please enter your full name or musician display name.',
        field: 'general',
        type: 'VALIDATION',
      });
      return;
    }
    if (!username || username.length < 3) {
      triggerError({
        title: 'Invalid Username',
        message: 'Username must be at least 3 characters long (letters, numbers, underscores).',
        field: 'username',
        type: 'VALIDATION',
      });
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      triggerError({
        title: 'Invalid Email Address',
        message: 'Please enter a valid email address (e.g. name@domain.com).',
        field: 'email',
        type: 'VALIDATION',
      });
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      triggerError({
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.',
        field: 'password',
        type: 'VALIDATION',
      });
      return;
    }
    if (regPassword !== regConfirmPassword) {
      triggerError({
        title: 'Passwords Do Not Match',
        message: 'The confirmation password does not match. Please re-enter your password.',
        field: 'confirmPassword',
        type: 'VALIDATION',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, username, name, regPassword, rememberMe);
      setSuccessMessage('Account created successfully! Preparing your musical journey...');
    } catch (err: any) {
      triggerError(parseAuthError(err, 'REGISTER'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick-fill credentials helper
  const handleQuickDemo = async (user: string, pass: string) => {
    setLoginIdentifier(user);
    setLoginPassword(pass);
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login(user, pass, true);
    } catch (err: any) {
      triggerError(parseAuthError(err, 'LOGIN'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Smoothly ensure input remains centered and visible above virtual keyboard
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white"
      style={{
        paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 1.25rem))',
        paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand & Product Highlights */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Logo Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 shadow-inner">
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <Music size={12} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              MelodyForge Music Academy
            </span>
            <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Sparkles size={10} /> LIVE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Master Music <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              One Note at a Time
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            A gamified, multi-instrument music learning platform. Play the polyphonic virtual piano,
            train your ear, complete historical chapters, and record your studio practice.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <Music size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Polyphonic Piano</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Web Audio synthesizer & live staff notation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
                <BookOpen size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">4-Tier Curriculum</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Basics to Expert with historical milestones.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Headphones size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Ear Training Arena</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Pitch, interval, and chord recognition quizzes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Gamification & XP</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Daily streak flames, 7 trophies & global rankings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Sign In / Register Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setAuthError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'LOGIN'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setAuthError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'REGISTER'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Notification Banners */}
            {authError && (
              <div
                ref={errorRef}
                role="alert"
                className="mb-5 p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500/80 text-rose-100 shadow-xl shadow-rose-950/40 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/50 shrink-0 mt-0.5">
                      {authError.type === 'NETWORK' ? (
                        <WifiOff size={18} />
                      ) : authError.field === 'password' ? (
                        <KeyRound size={18} />
                      ) : authError.field === 'identifier' ? (
                        <UserX size={18} />
                      ) : (
                        <AlertCircle size={18} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/40">
                          {authError.title}
                        </span>
                      </div>
                      <p className="text-xs text-rose-100 font-medium leading-relaxed">
                        {authError.message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthError(null)}
                    className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors shrink-0 cursor-pointer"
                    title="Dismiss error message"
                    aria-label="Dismiss error"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Cloud Server Cold-Start Helper Note */}
            {isSlowResponse && (
              <div className="mb-5 p-3 rounded-2xl bg-amber-950/50 border border-amber-800/60 text-amber-200 text-[11px] flex items-start gap-2 animate-in fade-in">
                <Loader2 size={14} className="text-amber-400 animate-spin shrink-0 mt-0.5" />
                <span>Cloud server is waking up from idle mode (~20s). Please remain on this screen...</span>
              </div>
            )}

            {/* Tab 1: SIGN IN FORM */}
            {mode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon size={16} />
                    </div>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        if (authError?.field === 'identifier') setAuthError(null);
                      }}
                      placeholder="e.g. student or alex@melodyforge.com"
                      autoComplete="username"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border ${
                        authError?.field === 'identifier'
                          ? 'border-rose-500 ring-2 ring-rose-500/30 text-rose-100'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white'
                      } text-sm placeholder-slate-500 transition-colors`}
                    />
                  </div>
                  {authError?.field === 'identifier' && (
                    <p className="text-[11px] text-rose-400 font-semibold mt-1.5 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{authError.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (authError?.field === 'password') setAuthError(null);
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border ${
                        authError?.field === 'password'
                          ? 'border-rose-500 ring-2 ring-rose-500/30 text-rose-100'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white'
                      } text-sm placeholder-slate-500 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {authError?.field === 'password' && (
                    <p className="text-[11px] text-rose-400 font-semibold mt-1.5 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{authError.message}</span>
                    </p>
                  )}
                </div>

                {/* Remember Credentials Toggle */}
                <div className="flex items-center justify-between pt-1 pb-1">
                  <label
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none"
                  >
                    {rememberMe ? (
                      <CheckSquare size={16} className="text-indigo-400" />
                    ) : (
                      <Square size={16} className="text-slate-600" />
                    )}
                    <span>Save signed credentials for later</span>
                  </label>
                </div>

                {/* Sign In Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Sign In to MelodyForge
                </Button>
              </form>
            )}

            {/* Tab 2: CREATE ACCOUNT FORM */}
            {mode === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon size={16} />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (authError?.field === 'general') setAuthError(null);
                      }}
                      placeholder="e.g. Wolfgang Mozart"
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                        if (authError?.field === 'username') setAuthError(null);
                      }}
                      placeholder="e.g. pianist99"
                      required
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                        authError?.field === 'username'
                          ? 'border-rose-500 ring-2 ring-rose-500/30 text-rose-100'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white'
                      } text-sm placeholder-slate-500 transition-colors`}
                    />
                    {authError?.field === 'username' && (
                      <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{authError.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (authError?.field === 'email') setAuthError(null);
                      }}
                      placeholder="name@domain.com"
                      required
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                        authError?.field === 'email'
                          ? 'border-rose-500 ring-2 ring-rose-500/30 text-rose-100'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white'
                      } text-sm placeholder-slate-500 transition-colors`}
                    />
                    {authError?.field === 'email' && (
                      <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{authError.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (authError?.field === 'password') setAuthError(null);
                      }}
                      placeholder="Min 6 characters"
                      required
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                        authError?.field === 'password'
                          ? 'border-rose-500 ring-2 ring-rose-500/30 text-rose-100'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white'
                      } text-sm placeholder-slate-500 transition-colors`}
                    />
                    {authError?.field === 'password' && (
                      <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{authError.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        if (authError?.field === 'confirmPassword') setAuthError(null);
                      }}
                      placeholder="Repeat password"
                      required
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                        authError?.field === 'confirmPassword'
                          ? 'border-rose-500 ring-2 ring-rose-500/30 text-rose-100'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white'
                      } text-sm placeholder-slate-500 transition-colors`}
                    />
                    {authError?.field === 'confirmPassword' && (
                      <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{authError.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Remember Me */}
                <div className="pt-1">
                  <label
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none"
                  >
                    {rememberMe ? (
                      <CheckSquare size={16} className="text-indigo-400" />
                    ) : (
                      <Square size={16} className="text-slate-600" />
                    )}
                    <span>Save signed credentials on this device</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-2"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Create Account & Start Learning
                </Button>
              </form>
            )}

            {/* Quick Demo Credentials Card (Student Only - No Admin Access) */}
            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" />
                  Student Demo Access
                </span>
                <span className="text-[10px] text-slate-500 font-medium">1-Click Sign In</span>
              </div>

              {/* Student Demo Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo('student', 'student123')}
                className="w-full p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Alex Rivera (Student Learner)
                  </span>
                  <span className="text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                    Level 2 • 250 XP
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  User: <strong className="text-slate-300">student</strong> / <strong className="text-slate-300">student123</strong>
                </div>
              </button>

              <p className="text-[10px] text-slate-500 text-center mt-3">
                🔒 Administrative access is strictly restricted to authorized platform administrator credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
