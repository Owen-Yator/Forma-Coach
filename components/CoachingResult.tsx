import React from 'react';
import { ActivityRecord } from '../types';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface CoachingResultProps {
  record: ActivityRecord;
  onBack: () => void;
}

export const CoachingResult: React.FC<CoachingResultProps> = ({ record, onBack }) => {
  // Estimate calories burned using a simple MET heuristic and assumed weight.
  const estimateCalories = (activityType: string, duration: number, rpe?: number) => {
    // Map some basic activities to METs
    const base = activityType.toLowerCase();
    let met = 5; // default moderate
    if (base.includes('run') || base.includes('running')) met = 9;
    else if (base.includes('hiit')) met = 10;
    else if (base.includes('cycle') || base.includes('cycling') || base.includes('bike')) met = 8;
    else if (base.includes('yoga')) met = 2.5;
    else if (base.includes('strength') || base.includes('workout')) met = 6;
    if (rpe && rpe >= 8) met *= 1.15;
    // calories = MET * 3.5 * weight_kg / 200 * minutes
    const weightKg = 70;
    return Math.round(met * 3.5 * weightKg / 200 * duration);
  };

  const intensityLabel = (rpe?: number) => {
    if (!rpe) return 'Moderate';
    if (rpe <= 3) return 'Low';
    if (rpe <= 6) return 'Moderate';
    return 'High';
  };
  return (
    <div className="pb-24 animate-fade-in">
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{record.activityType}</h2>
            <p className="text-xs text-gray-500">{record.durationMinutes} minutes • {new Date(record.timestamp).toLocaleDateString()}</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="px-2 py-1 bg-leaf-100 rounded-full text-sm font-semibold">{Math.round(record.coaching.confidence * 100)}% confidence</div>
              <div className="px-2 py-1 bg-gray-100 rounded-full text-sm">Est. {estimateCalories(record.activityType, record.durationMinutes, record.rpe)} kcal</div>
              <div className="px-2 py-1 bg-gray-100 rounded-full text-sm">Intensity: {intensityLabel(record.rpe)}</div>
            </div>
          </div>
          <button onClick={onBack} className="px-3 py-1 rounded-md bg-gray-100">Back</button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-gray-900">Summary</h3>
          <p className="text-gray-700 mt-2">{record.coaching.summary}</p>
        </div>

        {record.coaching.suggestions && record.coaching.suggestions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Suggestions</h4>
            <ul className="mt-2 space-y-2">
              {record.coaching.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-leaf-600 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {record.coaching.plan && record.coaching.plan.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Short Plan</h4>
            <ol className="mt-2 list-decimal list-inside text-gray-700 space-y-1">
              {record.coaching.plan.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
        )}

        {record.coaching.workouts && record.coaching.workouts.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Workout Routines</h4>
            <ul className="mt-2 space-y-2 text-gray-700">
              {record.coaching.workouts.map((w, i) => (
                <li key={i} className="bg-gray-50 p-3 rounded-lg">{w}</li>
              ))}
            </ul>
          </div>
        )}

        {record.coaching.meals && record.coaching.meals.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Meal Suggestions</h4>
            <ul className="mt-2 space-y-2 text-gray-700">
              {record.coaching.meals.map((m, i) => (
                <li key={i} className="bg-gray-50 p-3 rounded-lg">{m}</li>
              ))}
            </ul>
          </div>
        )}

        {record.coaching.recovery && record.coaching.recovery.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Post-Workout Recovery</h4>
            <ul className="mt-2 space-y-2 text-gray-700">
              {record.coaching.recovery.map((r, i) => (
                <li key={i} className="bg-gray-50 p-3 rounded-lg">{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={() => {
            // Save simple plan object to localStorage for user to pick up later
            const plan = JSON.parse(localStorage.getItem('forma_plan' )|| '[]');
            plan.unshift({ id: record.id, activity: record.activityType, date: Date.now(), plan: record.coaching.plan });
            localStorage.setItem('forma_plan', JSON.stringify(plan));
            alert('Plan saved to Local Storage');
          }} className="px-4 py-2 bg-leaf-600 text-white rounded-md">Save Plan</button>

          <button onClick={() => {
            // Mark as completed (simple UI feedback)
            alert('Marked complete — nice work!');
          }} className="px-4 py-2 border rounded-md">Mark Completed</button>
        </div>

      </div>
    </div>
  );
};
