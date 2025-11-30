import { CoachingResponse } from '../types';

// Forward client requests to the local agent server.
export const analyzeActivity = async (activityText: string): Promise<CoachingResponse> => {
  const AGENT_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
  try {
    const resp = await fetch(`${AGENT_BASE}/api/agent/act`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: activityText })
    });
    const j = await resp.json();
    if (j && j.coaching) return j.coaching as CoachingResponse;
  } catch (err) {
    console.error('analyzeActivity client error', err);
  }

  // Fallback response if server not available
  return {
    summary: `Quick coaching for: ${activityText.split('\n')[0].slice(0,120)}`,
    confidence: 0.5,
    suggestions: ['Keep consistent — aim for 3 sessions per week.'],
    plan: ['Warm up 5 minutes', 'Main workout', 'Cool down'],
    workouts: [],
    meals: [],
    recovery: []
  };
};
