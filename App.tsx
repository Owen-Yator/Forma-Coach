import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Dumbbell } from 'lucide-react';
import { ActivityInput } from './components/ActivityInput';
import { CoachingResult } from './components/CoachingResult';
import { History } from './components/History';
import { Button } from './components/Button';
import { analyzeActivity } from './services/geminiService';
import { ActivityRecord, ViewState } from './types';

// Helper for simple unique IDs without external lib overhead if needed, 
// but uuid is standard. Since we can't install, use a simple random string.
const generateId = () => Math.random().toString(36).slice(2, 11);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentDiagnosis, setCurrentDiagnosis] = useState<ActivityRecord | null>(null);
  const [history, setHistory] = useState<ActivityRecord[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('forma_activity_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('forma_activity_history', JSON.stringify(history));
  }, [history]);

  const handleLog = async (activity: { activityType: string; durationMinutes: number; notes: string; fitnessLevel?: string; goal?: string; lastMeal?: string; rpe?: number; equipment?: string[] }) => {
    setView('ANALYZING');

    const text = `Activity: ${activity.activityType}\nDuration: ${activity.durationMinutes} minutes\nFitnessLevel: ${activity.fitnessLevel || 'Unknown'}\nGoal: ${activity.goal || 'General Fitness'}\nLastMeal: ${activity.lastMeal || 'Not provided'}\nRPE: ${activity.rpe || 'N/A'}\nEquipment: ${(activity.equipment || []).join(', ')}\nNotes: ${activity.notes}`;
    const coaching = await analyzeActivity(text);

    const record: ActivityRecord = {
      id: generateId(),
      timestamp: Date.now(),
      activityType: activity.activityType,
      durationMinutes: activity.durationMinutes,
      notes: activity.notes,
      fitnessLevel: activity.fitnessLevel,
      goal: activity.goal,
      lastMeal: activity.lastMeal,
      rpe: activity.rpe,
      equipment: activity.equipment,
      coaching
    };

    setHistory(prev => [record, ...prev]);
    setCurrentDiagnosis(record);
    setView('RESULT');
  };

  const renderContent = () => {
    switch (view) {
      case 'LOG':
        return (
          <ActivityInput 
            onSubmit={handleLog}
            onCancel={() => setView('HOME')}
          />
        );
      
      case 'ANALYZING':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-leaf-50 p-6 text-center animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-leaf-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-leaf-600 rounded-full border-t-transparent animate-spin"></div>
              <Dumbbell className="absolute inset-0 m-auto text-leaf-600 w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Coaching</h2>
            <p className="text-gray-600 max-w-xs">
              FORMA Coach is crafting tailored advice and a short plan for you...
            </p>
          </div>
        );

      case 'RESULT':
        return currentDiagnosis ? (
          <CoachingResult
            record={currentDiagnosis}
            onBack={() => setView('HOME')}
          />
        ) : null;

      case 'HISTORY':
        return (
          <History 
            records={history} 
            onSelect={(record) => {
              setCurrentDiagnosis(record);
              setView('RESULT');
            }}
            onBack={() => setView('HOME')}
          />
        );

      case 'HOME':
      default:
        return (
          <div className="flex flex-col min-h-screen bg-leaf-50">
            {/* Header */}
            <div className="bg-white p-6 pb-12 rounded-b-[2.5rem] shadow-sm relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-leaf-100 p-2 rounded-lg">
                    <Dumbbell className="text-leaf-600 w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">FORMA COACH</h1>
                </div>
                <button 
                  onClick={() => setView('HISTORY')}
                  className="p-2 text-gray-400 hover:text-leaf-600 transition"
                >
                  <HistoryIcon className="w-6 h-6" />
                </button>
              </div>
              
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Train smarter. <br />
                <span className="text-leaf-600">build lasting habits.</span>
              </h2>
              <p className="text-gray-500 mb-6">
                Log an activity to get tailored coaching, tips, and a short plan.
              </p>

              <div className="flex gap-4">
                 <div className="flex-1 bg-leaf-600/10 p-4 rounded-xl border border-leaf-100">
                    <div className="text-2xl font-bold text-leaf-700">{history.length}</div>
                        <div className="text-xs text-leaf-800 font-medium uppercase tracking-wide">Logs</div>
                 </div>
                      <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="text-2xl font-bold text-blue-700">
                          {history.length === 0 ? 0 : Math.round((history.reduce((s, h) => s + (h.coaching.confidence || 0), 0) / history.length) * 100)}%
                        </div>
                        <div className="text-xs text-blue-800 font-medium uppercase tracking-wide">Avg Confidence</div>
                      </div>
              </div>
            </div>

            {/* Main Action */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-8">
              <div className="relative group cursor-pointer" onClick={() => setView('LOG')}>
                <div className="absolute inset-0 bg-leaf-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
                <button className="relative w-24 h-24 bg-gradient-to-tr from-leaf-600 to-leaf-400 rounded-full shadow-xl flex items-center justify-center text-white transform group-hover:scale-105 transition duration-300">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M2 12h20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <p className="mt-6 font-semibold text-gray-600">Tap to Log Activity</p>
            </div>
            
            {/* Recent Items Preview */}
            {history.length > 0 && (
                <div className="bg-white p-6 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Recent Activities</h3>
                        <button onClick={() => setView('HISTORY')} className="text-xs font-bold text-leaf-600 uppercase">View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {history.slice(0, 5).map(h => (
                        <div key={h.id} onClick={() => { setCurrentDiagnosis(h); setView('RESULT'); }} className="shrink-0 w-56 cursor-pointer bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                          <div className="font-semibold text-sm text-gray-800 truncate">{h.activityType}</div>
                          <div className="text-xs text-gray-500">{h.durationMinutes} min • {new Date(h.timestamp).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-700 mt-2">{h.coaching.summary}</div>
                        </div>
                      ))}
                    </div>
                </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-leaf-200">
      {renderContent()}
    </div>
  );
};

export default App;
