import React from 'react';

export default function FollowUpTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No follow-up timeline available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeline.map((item, index) => (
        <div key={index} className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                item.completed
                  ? 'bg-green-500'
                  : item.active
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            >
              {item.completed ? '✓' : index + 1}
            </div>
            {index < timeline.length - 1 && (
              <div
                className={`w-1 h-16 ${
                  item.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            )}
          </div>
          <div className="flex-1 pb-8">
            <div
              className={`p-4 rounded-lg ${
                item.completed
                  ? 'bg-green-50 border border-green-200'
                  : item.active
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              {item.date && (
                <p className="text-xs text-gray-500 mt-2">{item.date}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

