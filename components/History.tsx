import React from 'react';
import { ActivityRecord } from '../types';
import { ChevronRight, Calendar } from 'lucide-react';

interface HistoryProps {
  records: ActivityRecord[];
  onSelect: (record: ActivityRecord) => void;
  onBack: () => void;
}

export const History: React.FC<HistoryProps> = ({ records, onSelect, onBack }) => {
  return (
    <div className="p-4 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Activity History</h2>
        <button onClick={onBack} className="text-leaf-600 font-medium text-sm">Back to Home</button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No activities yet. Start by logging an activity!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div 
              key={record.id}
              onClick={() => onSelect(record)}
              className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{record.activityType}</h3>
                <p className="text-xs text-gray-500">{record.durationMinutes} min • {new Date(record.timestamp).toLocaleDateString()}</p>
                <p className="text-xs text-gray-700 mt-1 truncate">{record.coaching.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-leaf-100 text-leaf-700`}>
                  {Math.round(record.coaching.confidence * 100)}%
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
