import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AIResponseCard from '../components/AIResponseCard';
import { getObjectionSuggestion } from '../utils/mockAI';

export default function ObjectionScreen() {
  const { state, applyAISuggestion } = useApp();
  const navigate = useNavigate();
  const [objection, setObjection] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestion = () => {
    if (!objection.trim()) {
      return;
    }

    setLoading(true);
    // Simulate GPT-4 processing delay
    setTimeout(() => {
      const aiSuggestion = getObjectionSuggestion(objection, state.consultation);
      setSuggestion(aiSuggestion);
      setLoading(false);
    }, 2000); // Slightly longer to simulate GPT-4 processing
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      applyAISuggestion(suggestion);
      navigate('/consultation');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/consultation')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            ← Back to Consultation
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  GPT-4
                </div>
              </div>
              <p className="text-gray-600 mt-1 text-sm">Get intelligent suggestions powered by GPT-4 for handling patient objections and concerns</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Concern or Objection
          </label>
          <textarea
            value={objection}
            onChange={(e) => setObjection(e.target.value)}
            placeholder="Enter the patient's concern or objection (e.g., 'This is too expensive, I can't afford it right now')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base min-h-[120px]"
          />
        </div>

        <button
          onClick={handleGetSuggestion}
          disabled={loading || !objection.trim()}
          className={`w-full mb-6 py-3 px-6 rounded-lg font-semibold transition-colors shadow-sm ${
            loading || !objection.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              GPT-4 Processing...
            </span>
          ) : (
            'Get AI Suggestion'
          )}
        </button>

        {suggestion && (
          <AIResponseCard suggestion={suggestion} onApply={handleApplySuggestion} />
        )}
      </div>
    </div>
  );
}

