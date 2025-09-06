// Application constants
export const APP_NAME = "StudyMaster"
export const APP_DESCRIPTION = "Smart Study Scheduler with Spaced Repetition"

// SM-2 Algorithm constants
export const SM2_CONSTANTS = {
  MIN_EASE_FACTOR: 1.3,
  DEFAULT_EASE_FACTOR: 2.5,
  QUALITY_THRESHOLD: 3, // Below this is considered incorrect
  INITIAL_INTERVAL: 1,
  SECOND_INTERVAL: 6,
} as const

// Study session constants
export const STUDY_CONSTANTS = {
  DEFAULT_SESSION_DURATION: 25, // minutes (Pomodoro)
  MAX_CARDS_PER_SESSION: 50,
  MIN_CARDS_PER_SESSION: 5,
  BREAK_DURATION: 5, // minutes
} as const

// Notification constants
export const NOTIFICATION_TYPES = {
  REMINDER: "reminder",
  ACHIEVEMENT: "achievement",
  STREAK: "streak",
  REVIEW_DUE: "review_due",
} as const

// Quality ratings for SM-2
export const QUALITY_RATINGS = [
  {
    value: 0,
    label: "Again",
    description: "Complete blackout",
    color: "bg-red-500 hover:bg-red-600",
    textColor: "text-red-600",
  },
  {
    value: 1,
    label: "Hard",
    description: "Incorrect response; correct one remembered",
    color: "bg-orange-500 hover:bg-orange-600",
    textColor: "text-orange-600",
  },
  {
    value: 2,
    label: "Good",
    description: "Incorrect response; correct one seemed easy",
    color: "bg-yellow-500 hover:bg-yellow-600",
    textColor: "text-yellow-600",
  },
  {
    value: 3,
    label: "Easy",
    description: "Correct response recalled with serious difficulty",
    color: "bg-green-500 hover:bg-green-600",
    textColor: "text-green-600",
  },
  {
    value: 4,
    label: "Perfect",
    description: "Correct response after a hesitation",
    color: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-blue-600",
  },
  {
    value: 5,
    label: "Excellent",
    description: "Perfect response",
    color: "bg-purple-500 hover:bg-purple-600",
    textColor: "text-purple-600",
  },
] as const

// Routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  TOPICS: "/dashboard/topics",
  FLASHCARDS: "/dashboard/flashcards",
  STUDY: "/dashboard/study",
  QUIZZES: "/dashboard/quizzes",
  CALENDAR: "/dashboard/calendar",
  REVIEWS: "/dashboard/reviews",
  SETTINGS: "/dashboard/settings",
  AUTH: {
    SIGN_IN: "/auth/sign-in",
    SIGN_UP: "/auth/sign-up",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
} as const

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "studymaster-theme",
  STUDY_PREFERENCES: "studymaster-study-preferences",
  LAST_SESSION: "studymaster-last-session",
} as const

// Default study preferences
export const DEFAULT_STUDY_PREFERENCES = {
  cardsPerSession: 20,
  sessionDuration: 25,
  showTimer: true,
  autoReveal: false,
  soundEnabled: true,
  dailyGoal: 50, // cards per day
  reminderTime: "09:00",
  reminderEnabled: true,
} as const
