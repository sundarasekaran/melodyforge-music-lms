export type Role = 'ROLE_STUDENT' | 'ROLE_ADMIN';

export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string;
  role: Role;
  totalXp: number;
  currentLevel: number;
  currentStreakDays: number;
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: Role;
  totalXp: number;
  currentLevel: number;
  currentStreakDays: number;
}

export interface Instrument {
  id: number;
  slug: string;
  name: string;
  family: string;
  description: string;
  iconName: string;
  isActive: boolean;
  displayOrder: number;
}

export interface TimelineEvent {
  year: string;
  event: string;
  description: string;
}

export interface HistoricalFact {
  title: string;
  tag?: string;
  description: string;
}

export interface GalleryItem {
  imageUrl: string;
  caption: string;
  era?: string;
}

export interface KnowledgeCheckQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface HistoryChapter {
  id: number;
  sectionNumber: number;
  title: string;
  era: string;
  introduction?: string;
  content: string;
  keyTakeaway?: string;
  imageCaption?: string;
  imageUrl?: string;
  timelineJson?: string;
  factsJson?: string;
  galleryJson?: string;
  audioNote?: string;
  audioDescription?: string;
  quizJson?: string;
  xpReward: number;
  durationMinutes: number;
  isPublished: boolean;
  completed?: boolean;
  quizPassed?: boolean;
  scorePercent?: number;
  unlocked?: boolean;
}

export type HistorySection = HistoryChapter;

export interface Exercise {
  id: number;
  exerciseType: 'NOTE_IDENTIFICATION' | 'KEYBOARD_PLAY' | 'INTERVAL_RECOGNITION' | 'NOTATION_READING' | 'MULTIPLE_CHOICE' | 'RHYTHM';
  prompt: string;
  questionData: string; // JSON string
  expectedAnswer: string;
  points: number;
  explanation: string;
  orderIndex: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  theoryContent: string;
  lessonType: 'THEORY' | 'PRACTICAL' | 'LISTENING' | 'ASSESSMENT';
  durationMinutes: number;
  xpReward: number;
  orderIndex: number;
  isPublished: boolean;
  exercises?: Exercise[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface LearningLevel {
  id: number;
  levelNumber: number;
  title: string;
  description: string;
  xpReward: number;
  courses: Course[];
}

export interface LearningTier {
  id: number;
  tierName: 'BASICS' | 'INTERMEDIATE' | 'PRO' | 'EXPERT';
  tierOrder: number;
  description: string;
  requiredXp: number;
  levels: LearningLevel[];
}

export interface UserProgress {
  id: number;
  lessonId?: number;
  lesson?: Lesson;
  completed: boolean;
  scorePercent: number;
  completedAt?: string;
}

export interface PracticeSession {
  id: number;
  durationSeconds: number;
  notes: string;
  audioRecordingUrl?: string;
  xpEarned: number;
  practicedAt: string;
  routineId?: string;
  routineTitle?: string;
  targetBpm?: number;
  timeSignature?: string;
  completedExercises?: number;
  totalExercises?: number;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'INTERRUPTED';
  startedAt?: string;
  completedAt?: string;
}

export interface PracticeStats {
  totalPracticeSeconds: number;
  totalSessionsCompleted: number;
  routinesCompletedCount: number;
  currentStreakDays: number;
  totalPracticeXp: number;
}

export interface Badge {
  id: number;
  code: string;
  title: string;
  description: string;
  iconName: string;
  category: 'STREAK' | 'MASTERY' | 'PRACTICE' | 'EAR_TRAINING' | 'THEORY';
  xpBonus: number;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  awardedAt: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  displayName: string;
  totalXp: number;
  currentLevel: number;
  currentStreakDays: number;
}

// Phase 4: Graded Piano Assessments & Graduation Types
export interface AssessmentQuestion {
  id: number;
  level: number;
  questionOrder: number;
  title: string;
  prompt: string;
  type: 'MULTIPLE_CHOICE' | 'IDENTIFY_KEY' | 'PLAY_SEQUENCE';
  category: string;
  options?: string[];
  targetNote?: string;
  sequenceLength?: number;
  hint?: string;
  points: number;
}

export interface AssessmentItem {
  level: number;
  title: string;
  description: string;
  passingScorePercent: number;
  totalQuestions: number;
  totalPoints: number;
  xpReward: number;
  isLocked: boolean;
  userBestScore?: number;
  passed?: boolean;
  totalAttempts?: number;
  lastAttemptAt?: string;
}

export interface SubmittedAnswer {
  questionId: number;
  selectedOptionIndex?: number;
  playedNote?: string;
  playedSequence?: string[];
}

export interface SubmitAssessmentPayload {
  answers: SubmittedAnswer[];
}

export interface QuestionGradingResult {
  questionId: number;
  correct: boolean;
  pointsEarned: number;
  feedback: string;
}

export interface AssessmentResult {
  attemptId: number;
  level: number;
  scorePercent: number;
  passingScorePercent: number;
  passed: boolean;
  earnedPoints: number;
  totalPoints: number;
  xpAwarded: number;
  newTotalXp: number;
  currentStreakDays: number;
  graduationEligible: boolean;
  questionResults: QuestionGradingResult[];
  newBadges: Array<{
    code: string;
    title: string;
    description: string;
  }>;
}

export interface AssessmentAttemptHistory {
  id: number;
  level: number;
  scorePercent: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  xpAwarded: number;
  startedAt: string;
  completedAt?: string;
}

export interface GraduationStatus {
  eligible: boolean;
  hasCertificate: boolean;
  certificateNumber?: string;
  certificateDate?: string;
  studentDisplayName: string;
  level1Passed: boolean;
  level1BestScore: number;
  level2Passed: boolean;
  level2BestScore: number;
  level3Passed: boolean;
  level3BestScore: number;
  missingRequirements: string[];
}

export interface CertificateData {
  id: number;
  certificateNumber: string;
  studentDisplayName: string;
  instrumentName: string;
  instrumentSlug: string;
  issueDate: string;
  verificationHash: string;
  averageScorePercent: number;
  totalXpAtGraduation: number;
  institutionName: string;
}

export interface AdminAssessmentStats {
  totalAttempts: number;
  passedAttempts: number;
  totalCertificatesIssued: number;
  level1PassRate: number;
  level2PassRate: number;
  level3PassRate: number;
  certificates: CertificateData[];
}

export * from './piano.ts';

