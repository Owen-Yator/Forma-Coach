export interface CoachingResponse {
  summary: string;
  confidence: number; // 0..1
  suggestions: string[]; // quick tips
  plan: string[]; // short actionable steps
  focus?: string; // optional focus area (cardio, strength, habits)
  workouts?: string[]; // suggested workout routines (short descriptions)
  meals?: string[]; // meal suggestions
  recovery?: string[]; // post-workout recovery routines
}

export interface ActivityRecord {
  id: string;
  timestamp: number;
  activityType: string;
  durationMinutes: number;
  notes: string;
  fitnessLevel?: string;
  goal?: string;
  lastMeal?: string;
  rpe?: number; // Rate of Perceived Exertion 1-10
  equipment?: string[];
  coaching: CoachingResponse;
}

export type ViewState = 'HOME' | 'LOG' | 'ANALYZING' | 'RESULT' | 'HISTORY';
