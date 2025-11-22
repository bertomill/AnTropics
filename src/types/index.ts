export interface User {
  id: string;
  name: string;
  points: number;
  streak: number;
  level: number;
  lastBreakTime?: Date;
  settings: UserSettings;
}

export interface UserSettings {
  breakInterval: number; // minutes
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  workHoursStart: string; // HH:mm format
  workHoursEnd: string; // HH:mm format
  weekendsEnabled: boolean;
}

export interface BreakReminder {
  id: string;
  scheduledTime: Date;
  type: 'micro' | 'stretch' | 'eye';
  completed: boolean;
  points?: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  targetArea: 'neck' | 'shoulders' | 'back' | 'wrists' | 'eyes' | 'posture';
  points: number;
  animationFile?: string;
  instructions: string[];
}

export interface CompletedExercise {
  id: string;
  exerciseId: string;
  completedAt: Date;
  photoUrl?: string;
  points: number;
  duration: number;
}

export interface VirtualPet {
  id: string;
  name: string;
  type: 'plant' | 'creature';
  health: number; // 0-100
  happiness: number; // 0-100
  level: number;
  lastFed?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  points: number;
}

export interface PostureData {
  timestamp: Date;
  score: number; // 0-100
  issues: string[];
  recommendation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
