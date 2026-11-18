import { 
  AuthResponse, 
  Instrument, 
  HistorySection, 
  LearningTier, 
  Lesson, 
  UserProgress, 
  PracticeSession, 
  Badge, 
  UserBadge, 
  LeaderboardEntry 
} from '../types';

const DEFAULT_API_URL = import.meta.env.PROD 
  ? 'https://melodyforge-music-lms-backend.onrender.com' 
  : '';

const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '') + '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('music_lms_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('music_lms_token', token);
    } else {
      localStorage.removeItem('music_lms_token');
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
        const errorBody = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorBody.message || `Request failed with status ${res.status}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      console.warn(`API call ${endpoint} failed or offline:`, err);
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
    return this.request<LearningTier[]>(`/instruments/${slug}/tiers`);
  }

  // Curriculum & Lesson Endpoints
  public async getLesson(id: number): Promise<{ lesson: Lesson; completed: boolean; scorePercent: number }> {
    return this.request<{ lesson: Lesson; completed: boolean; scorePercent: number }>(`/lessons/${id}`);
  }

  public async completeLesson(id: number, scorePercent = 100): Promise<{ lessonId: number; completed: boolean; xpAwarded: number; totalXp: number; currentLevel: number }> {
    return this.request(`/lessons/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ scorePercent }),
    });
  }

  public async getMyProgress(): Promise<UserProgress[]> {
    return this.request<UserProgress[]>('/lessons/progress/me');
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
}

export const api = new ApiService();
