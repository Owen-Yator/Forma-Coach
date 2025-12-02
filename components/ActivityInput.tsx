import React, { useState } from 'react';

interface ActivityInputProps {
  onSubmit: (activity: { activityType: string; durationMinutes: number; notes: string; fitnessLevel?: string; goal?: string; lastMeal?: string; rpe?: number; equipment?: string[] }) => void;
  onCancel: () => void;
}

export const ActivityInput: React.FC<ActivityInputProps> = ({ onSubmit, onCancel }) => {
  const [activityType, setActivityType] = useState('Workout');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Intermediate');
  const [goal, setGoal] = useState('General Fitness');
  const [lastMeal, setLastMeal] = useState('');
  const [rpe, setRpe] = useState(6);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const presets = ['Workout', 'Run', 'Cycling', 'Yoga', 'HIIT', 'Strength'];
  const quickDurations = [15, 20, 30, 45, 60];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ activityType, durationMinutes: duration, notes, fitnessLevel, goal, lastMeal, rpe, equipment });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Log Activity</h2>
          <button onClick={onCancel} className="text-leaf-600 font-medium">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
            <div className="flex gap-2 mb-2">
              {presets.map(p => (
                <button key={p} type="button" onClick={() => setActivityType(p)} className={`px-3 py-1 rounded-full text-sm ${activityType===p ? 'bg-leaf-600 text-white' : 'bg-gray-100'}`}>
                  {p}
                </button>
              ))}
            </div>
            <input value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Level</label>
            <select value={fitnessLevel} onChange={e => setFitnessLevel(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200">
              <option>General Fitness</option>
              <option>Strength</option>
              <option>Endurance</option>
              <option>Weight Loss</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Meal (optional)</label>
            <input value={lastMeal} onChange={e => setLastMeal(e.target.value)} placeholder="e.g., chicken + rice 2h ago" className="w-full p-3 rounded-lg border border-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <div className="flex gap-2 mb-2">
              {quickDurations.map(d => (
                <button key={d} type="button" onClick={() => setDuration(d)} className={`px-3 py-1 rounded-md ${duration===d ? 'bg-leaf-600 text-white' : 'bg-gray-100'}`}>{d}m</button>
              ))}
            </div>
            <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={1} className="w-36 p-3 rounded-lg border border-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intensity (RPE)</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={10} value={rpe} onChange={e => setRpe(Number(e.target.value))} />
              <div className="text-sm text-gray-600">{rpe}/10</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment (optional)</label>
            <div className="flex gap-2 flex-wrap">
              {['None','Dumbbell','Barbell','Bike','Treadmill','Kettlebell','Band'].map(eq => (
                <button key={eq} type="button" onClick={() => {
                  setEquipment(prev => prev.includes(eq) ? prev.filter(x=>x!==eq) : [...prev, eq]);
                }} className={`px-3 py-1 rounded-full text-sm ${equipment.includes(eq) ? 'bg-leaf-600 text-white' : 'bg-gray-100'}`}>
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-3 rounded-lg border border-gray-200" />
          </div>

          {/* Quick preview */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-700 font-semibold">Preview</div>
            <div className="text-xs text-gray-500">{activityType} • {duration} min • {fitnessLevel} • {goal}</div>
            <div className="text-xs text-gray-600 mt-2 truncate">Notes: {notes || '—'}</div>
            <div className="text-xs text-gray-600 mt-1">RPE: {rpe}/10 • Equipment: {equipment.length ? equipment.join(', ') : 'None'}</div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-leaf-600 text-white rounded-lg font-medium">{submitting ? 'Logging...' : 'Log Activity'}</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
// Export default for easier imports
export default ActivityInput;