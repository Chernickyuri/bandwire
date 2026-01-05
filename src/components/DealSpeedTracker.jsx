import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function DealSpeedTracker() {
  const { state } = useApp();
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const targetTime = 300; // 5 minutes in seconds
  const progress = Math.min((elapsed / targetTime) * 100, 100);
  const isOnTarget = elapsed < targetTime;
  const isOverTarget = elapsed >= targetTime;

  // Show alert when target time is exceeded
  useEffect(() => {
    if (isOverTarget && !hasAlerted && !state.agreement.signed) {
      setHasAlerted(true);
      // Visual alert - component will show red background
    }
  }, [isOverTarget, hasAlerted, state.agreement.signed]);

  return (
    <div className={`bg-white border-2 rounded-lg p-5 shadow-lg transition-all duration-300 ${
      isOverTarget && !state.agreement.signed
        ? 'border-red-500 bg-red-50 animate-pulse'
        : 'border-gray-200'
    }`} style={{ minWidth: '280px', width: '100%', maxWidth: '350px' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Deal Speed</h3>
          <p className="text-xs text-gray-500 mt-0.5">Target: &lt; 5 minutes</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold transition-colors ${
            isOnTarget 
              ? 'text-green-600' 
              : isOverTarget && !state.agreement.signed
              ? 'text-red-600'
              : 'text-orange-600'
          }`}>
            {formatTime(elapsed)}
          </div>
          <div className={`text-xs font-medium mt-1 ${
            isOnTarget 
              ? 'text-green-600' 
              : isOverTarget && !state.agreement.signed
              ? 'text-red-600'
              : 'text-orange-600'
          }`}>
            {isOnTarget ? 'On Target' : isOverTarget && !state.agreement.signed ? '⚠ Over Target!' : 'Over Target'}
          </div>
        </div>
      </div>
      
      {isOverTarget && !state.agreement.signed && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs font-semibold text-red-800">
              Target time exceeded! Consider accelerating the deal.
            </p>
          </div>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${
            isOnTarget 
              ? 'bg-green-500' 
              : isOverTarget && !state.agreement.signed
              ? 'bg-red-500'
              : 'bg-orange-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      
      {state.agreement.signed && (
        <div className="mt-3 text-xs text-green-600 font-medium">
          ✓ Agreement signed in {formatTime(elapsed)}
        </div>
      )}
    </div>
  );
}

