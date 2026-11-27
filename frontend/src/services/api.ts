import type {
  AuthResponse, 
  Instrument, 
  HistorySection, 
  LearningTier, 
  Lesson, 
  UserProgress, 
  PracticeSession, 
  PracticeStats,
  Badge, 
  UserBadge, 
  LeaderboardEntry,
  AssessmentItem,
  AssessmentQuestion,
  SubmitAssessmentPayload,
  AssessmentResult,
  AssessmentAttemptHistory,
  GraduationStatus,
  CertificateData,
  AdminAssessmentStats,
  StudentAnalytics,
  AdminPlatformAnalytics,
  StudentSummaryPage
} from '../types';
import { getFallbackLesson } from '../data/lessonsData.ts';

const DEFAULT_API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.PROD)
  ? 'https://melodyforge-music-lms.onrender.com'
  : 'https://melodyforge-music-lms.onrender.com';

const API_BASE = (((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || DEFAULT_API_URL)).replace(/\/$/, '') + '/api/v1';

class ApiService {
  private token: string | null = null;
  private lessonCache = new Map<number, Lesson>();
  private progressCache = new Map<number, { completed: boolean; scorePercent: number }>();
  private pendingSync = new Map<number, number>();

  constructor() {
    this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('music_lms_token') : null;
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('music_lms_progress_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed === 'object' && parsed !== null) {
            Object.entries(parsed).forEach(([key, val]: [string, any]) => {
              const numId = Number(key);
              if (!isNaN(numId) && val && typeof val.completed === 'boolean') {
                this.progressCache.set(numId, {
                  completed: val.completed,
                  scorePercent: typeof val.scorePercent === 'number' ? val.scorePercent : 100,
                });
              }
            });
          }
        }
        const storedSync = localStorage.getItem('music_lms_pending_sync');
        if (storedSync) {
          const parsedSync = JSON.parse(storedSync);
          if (typeof parsedSync === 'object' && parsedSync !== null) {
            Object.entries(parsedSync).forEach(([key, val]: [string, any]) => {
              const numId = Number(key);
              if (!isNaN(numId) && typeof val === 'number') {
                this.pendingSync.set(numId, val);
              }
            });
          }
        }
      } catch {}
    }
  }

  public cacheLesson(lesson: Lesson) {
    if (lesson && typeof lesson.id === 'number') {
      this.lessonCache.set(lesson.id, lesson);
    }
  }

  public getCachedLesson(id: number): Lesson | undefined {
    return this.lessonCache.get(id) || getFallbackLesson(id);
  }

  public cacheProgress(lessonId: number, completed: boolean, scorePercent = 100) {
    if (typeof lessonId === 'number' && !isNaN(lessonId)) {
      this.progressCache.set(lessonId, { completed, scorePercent });
      if (typeof localStorage !== 'undefined') {
        try {
          const obj: Record<number, { completed: boolean; scorePercent: number }> = {};
          this.progressCache.forEach((val, key) => {
            obj[key] = val;
          });
          localStorage.setItem('music_lms_progress_cache', JSON.stringify(obj));
        } catch {}
      }
    }
  }

  public getCachedProgress(lessonId: number): { completed: boolean; scorePercent: number } | undefined {
    return this.progressCache.get(lessonId);
  }

  public clearProgressCache() {
    this.progressCache.clear();
    this.pendingSync.clear();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('music_lms_progress_cache');
        localStorage.removeItem('music_lms_pending_sync');
      } catch {}
    }
  }

  public queuePendingOfflineLesson(lessonId: number, scorePercent = 100) {
    this.cacheProgress(lessonId, true, scorePercent);
    this.pendingSync.set(lessonId, scorePercent);
    if (typeof localStorage !== 'undefined') {
      try {
        const obj: Record<number, number> = {};
        this.pendingSync.forEach((score, id) => {
          obj[id] = score;
        });
        localStorage.setItem('music_lms_pending_sync', JSON.stringify(obj));
      } catch {}
    }
  }

  public async syncPendingOfflineProgress(): Promise<void> {
    if (!this.token || this.pendingSync.size === 0) return;
    const entries = Array.from(this.pendingSync.entries());
    for (const [id, score] of entries) {
      try {
        await this.completeLesson(id, score);
        this.pendingSync.delete(id);
      } catch (err) {
        console.warn(`Failed to sync offline lesson ${id}:`, err);
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const obj: Record<number, number> = {};
        this.pendingSync.forEach((score, id) => {
          obj[id] = score;
        });
        localStorage.setItem('music_lms_pending_sync', JSON.stringify(obj));
      } catch {}
    }
  }

  public setToken(token: string | null) {
    if (this.token !== token) {
      this.clearProgressCache();
    }
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('music_lms_token', token);
      } else {
        localStorage.removeItem('music_lms_token');
        this.clearProgressCache();
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        let errorData: any = null;
        try {
          errorData = await res.json();
        } catch {
          errorData = null;
        }

        const msg =
          errorData?.message ||
          errorData?.error ||
          (res.status === 401 ? 'Invalid username or password. Please verify your credentials.' : '') ||
          (res.status === 403 ? 'Access forbidden. Please check your credentials or permissions.' : '') ||
          (res.status === 404 ? 'User or requested resource was not found.' : '') ||
          (res.status >= 500 ? 'MelodyForge server is starting up or temporarily busy. Please wait a moment and try again.' : '') ||
          res.statusText ||
          `Request failed with status ${res.status}`;

        const err: any = new Error(msg);
        err.status = res.status;
        err.data = errorData;
        throw err;
      }

      return (await res.json()) as T;
    } catch (err: any) {
      console.warn(`API call ${endpoint} failed:`, err);
      if (err.status) {
        throw err;
      }
      const isNetwork =
        err instanceof TypeError ||
        String(err?.message || '').toLowerCase().includes('failed to fetch') ||
        String(err?.message || '').toLowerCase().includes('network') ||
        String(err?.message || '').toLowerCase().includes('load failed');

      if (isNetwork) {
        const netErr: any = new Error(
          'Network connection error: Unable to reach MelodyForge server. Please check your internet connection or verify the server status.'
        );
        netErr.status = 0;
        netErr.isNetwork = true;
        throw netErr;
      }
      throw err;
    }
  }

  // Auth Endpoints
  public async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    this.setToken(data.token);
    return data;
  }

  public async register(email: string, username: string, displayName: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, displayName, password }),
    });
    this.setToken(data.token);
    return data;
  }

  public async getCurrentUser(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/me');
  }

  // Instrument Endpoints
  public async getInstruments(): Promise<Instrument[]> {
    return this.request<Instrument[]>('/instruments');
  }

  public async getInstrument(slug: string): Promise<Instrument> {
    return this.request<Instrument>(`/instruments/${slug}`);
  }

  public async getInstrumentHistory(slug: string): Promise<HistorySection[]> {
    return this.request<HistorySection[]>(`/instruments/${slug}/history`);
  }

  public async completeHistoryChapter(slug: string, chapterId: number, scorePercent = 100): Promise<{
    chapterId: number;
    completed: boolean;
    quizPassed: boolean;
    scorePercent: number;
    xpAwarded: number;
    totalXp: number;
    currentLevel: number;
  }> {
    return this.request(`/instruments/${slug}/history/${chapterId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ scorePercent }),
    });
  }

  public async getInstrumentTiers(slug: string): Promise<LearningTier[]> {
    const tiers = await this.request<LearningTier[]>(`/instruments/${slug}/tiers`);
    // Cache all discovered lessons for instant offline/fallback access
    if (Array.isArray(tiers)) {
      for (const tier of tiers) {
        if (Array.isArray(tier.levels)) {
          for (const level of tier.levels) {
            if (Array.isArray(level.courses)) {
              for (const course of level.courses) {
                if (Array.isArray(course.lessons)) {
                  for (const lesson of course.lessons) {
                    this.cacheLesson(lesson);
                  }
                }
              }
            }
          }
        }
      }
    }
    return tiers;
  }

  // Curriculum & Lesson Endpoints
  public async getLesson(id: number): Promise<{
    lesson: Lesson;
    completed: boolean | null;
    scorePercent: number | null;
    isProgressAvailable: boolean;
  }> {
    try {
      const data = await this.request<{ lesson: Lesson; completed: boolean; scorePercent: number }>(`/lessons/${id}`);
      if (data?.lesson) {
        this.cacheLesson(data.lesson);
      }
      if (typeof data?.completed === 'boolean') {
        this.cacheProgress(id, data.completed, data.scorePercent ?? 0);
      }
      return {
        lesson: data.lesson,
        completed: data.completed,
        scorePercent: data.scorePercent ?? 0,
        isProgressAvailable: true,
      };
    } catch (err) {
      console.warn(`api.getLesson(${id}) remote fetch failed, recovering from cache or fallback catalog:`, err);
      const cachedLesson = this.lessonCache.get(id) || getFallbackLesson(id);
      if (cachedLesson) {
        const cachedProg = this.progressCache.get(id);
        if (cachedProg) {
          return {
            lesson: cachedLesson,
            completed: cachedProg.completed,
            scorePercent: cachedProg.scorePercent,
            isProgressAvailable: true,
          };
        }
        return {
          lesson: cachedLesson,
          completed: null,
          scorePercent: null,
          isProgressAvailable: false,
        };
      }
      throw err;
    }
  }

  public async completeLesson(id: number, scorePercent = 100): Promise<{ lessonId: number; completed: boolean; xpAwarded: number; totalXp: number; currentLevel: number }> {
    const res = await this.request<{ lessonId: number; completed: boolean; xpAwarded: number; totalXp: number; currentLevel: number }>(`/lessons/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ scorePercent }),
    });
    if (res && res.completed) {
      this.cacheProgress(id, true, scorePercent);
    }
    return res;
  }

  public async getMyProgress(): Promise<UserProgress[]> {
    if (this.pendingSync.size > 0) {
      await this.syncPendingOfflineProgress().catch(() => {});
    }
    const progressList = await this.request<UserProgress[]>('/lessons/progress/me');
    if (Array.isArray(progressList)) {
      for (const p of progressList) {
        const lid = p.lesson?.id || (p as any).lessonId;
        if (typeof lid === 'number') {
          this.cacheProgress(
            lid,
            Boolean(p.completed),
            typeof p.scorePercent === 'number' ? p.scorePercent : (p.completed ? 100 : 0)
          );
        }
      }
    }
    return progressList;
  }

  // Exercise Evaluation
  public async evaluateExercise(exerciseId: number, answer: string): Promise<{ correct: boolean; expectedAnswer: string; pointsAwarded: number; explanation: string }> {
    return this.request(`/exercises/${exerciseId}/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  // Practice Studio Endpoints
  public async logPractice(instrumentSlug: string, durationSeconds: number, notes: string, audioRecordingUrl?: string): Promise<PracticeSession> {
    return this.request<PracticeSession>('/practice/sessions', {
      method: 'POST',
      body: JSON.stringify({ instrumentSlug, durationSeconds, notes, audioRecordingUrl }),
    });
  }

  public async getPracticeSessions(): Promise<PracticeSession[]> {
    return this.request<PracticeSession[]>('/practice/sessions');
  }

  // Structured Practice Routine Endpoints
  public async startPracticeRoutine(data: {
    instrumentSlug: string;
    routineId: string;
    routineTitle: string;
    targetBpm: number;
    timeSignature: string;
    totalExercises: number;
  }): Promise<PracticeSession> {
    return this.request<PracticeSession>('/practice/routines/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updatePracticeRoutineProgress(
    sessionId: number,
    data: {
      durationSeconds: number;
      completedExercises: number;
      notes?: string;
    }
  ): Promise<PracticeSession> {
    return this.request<PracticeSession>(`/practice/routines/${sessionId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async completePracticeRoutine(
    sessionId: number,
    data: {
      durationSeconds: number;
      completedExercises: number;
      notes?: string;
      audioRecordingUrl?: string;
    }
  ): Promise<PracticeSession> {
    return this.request<PracticeSession>(`/practice/routines/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getPracticeStats(): Promise<PracticeStats> {
    return this.request<PracticeStats>('/practice/routines/stats');
  }

  // Gamification Endpoints
  public async getBadges(): Promise<Badge[]> {
    return this.request<Badge[]>('/gamification/badges');
  }

  public async getMyBadges(): Promise<UserBadge[]> {
    return this.request<UserBadge[]>('/gamification/badges/me');
  }

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>('/gamification/leaderboard');
  }

  // Admin Endpoints
  public async getAdminStats(): Promise<{ totalUsers: number; totalInstruments: number; totalLessons: number; totalPracticeSessions: number }> {
    return this.request('/admin/stats');
  }

  public async getAdminInstrumentHistory(slug: string): Promise<HistorySection[]> {
    return this.request<HistorySection[]>(`/admin/instruments/${slug}/history`);
  }

  public async saveAdminHistoryChapter(instrumentId: number, chapter: Partial<HistorySection>): Promise<HistorySection> {
    return this.request<HistorySection>(`/admin/instruments/${instrumentId}/history`, {
      method: 'POST',
      body: JSON.stringify(chapter),
    });
  }

  public async updateAdminHistoryChapter(id: number, chapter: Partial<HistorySection>): Promise<HistorySection> {
    return this.request<HistorySection>(`/admin/history/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chapter),
    });
  }

  public async togglePublishHistoryChapter(id: number): Promise<HistorySection> {
    return this.request<HistorySection>(`/admin/history/${id}/toggle-publish`, {
      method: 'PATCH',
    });
  }

  public async deleteAdminHistoryChapter(id: number): Promise<{ message: string; id: number }> {
    return this.request<{ message: string; id: number }>(`/admin/history/${id}`, {
      method: 'DELETE',
    });
  }

  public async saveAdminLesson(lesson: Partial<Lesson>): Promise<Lesson> {
    return this.request<Lesson>('/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  }

  // Phase 4: Graded Piano Assessments & Graduation Endpoints
  public async getAssessments(): Promise<AssessmentItem[]> {
    return this.request<AssessmentItem[]>('/assessments');
  }

  public async getAssessmentQuestions(level: number): Promise<AssessmentQuestion[]> {
    return this.request<AssessmentQuestion[]>(`/assessments/${level}`);
  }

  public async startAssessmentAttempt(level: number): Promise<{ attemptId: number; level: number; startedAt: string }> {
    return this.request<{ attemptId: number; level: number; startedAt: string }>(`/assessments/${level}/start`, {
      method: 'POST',
    });
  }

  public async submitAssessmentAttempt(attemptId: number, payload: SubmitAssessmentPayload): Promise<AssessmentResult> {
    return this.request<AssessmentResult>(`/assessments/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getAssessmentAttempts(): Promise<AssessmentAttemptHistory[]> {
    return this.request<AssessmentAttemptHistory[]>('/assessments/attempts');
  }

  public async getGraduationStatus(): Promise<GraduationStatus> {
    return this.request<GraduationStatus>('/assessments/graduation/status');
  }

  public async claimCertificate(studentDisplayName?: string): Promise<CertificateData> {
    return this.request<CertificateData>('/assessments/graduation/certificate', {
      method: 'POST',
      body: JSON.stringify({ studentDisplayName }),
    });
  }

  public async getCertificate(): Promise<CertificateData> {
    return this.request<CertificateData>('/assessments/graduation/certificate');
  }

  public async verifyCertificate(certificateNumber: string): Promise<CertificateData> {
    return this.request<CertificateData>(`/assessments/verify/${certificateNumber}`);
  }

  public async getAdminAssessmentStats(): Promise<AdminAssessmentStats> {
    return this.request<AdminAssessmentStats>('/assessments/admin/stats');
  }

  // Phase 5: Student & Admin Platform Analytics Endpoints
  public async getStudentAnalytics(instrument?: string, range?: string): Promise<StudentAnalytics> {
    const params = new URLSearchParams();
    if (instrument && instrument !== 'all') params.append('instrument', instrument);
    if (range && range !== 'all') params.append('range', range);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<StudentAnalytics>(`/analytics/student${qs}`);
  }

  public async getAdminPlatformAnalytics(): Promise<AdminPlatformAnalytics> {
    return this.request<AdminPlatformAnalytics>('/analytics/admin');
  }

  public async getPaginatedStudents(page = 0, size = 10, search?: string): Promise<StudentSummaryPage> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (search && search.trim()) params.append('search', search.trim());
    return this.request<StudentSummaryPage>(`/analytics/admin/students?${params.toString()}`);
  }
}

export const api = new ApiService();
