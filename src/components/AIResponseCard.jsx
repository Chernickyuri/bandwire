import React from 'react';
import { formatCurrency } from '../utils/helpers';

export default function AIResponseCard({ suggestion, onApply, canApply = true }) {
  if (!suggestion) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">AI Assistant Response</h3>
            <p className="text-xs text-gray-500">Powered by GPT-4</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          GPT-4
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{suggestion.explanation}</p>
        {suggestion.reasoning && (
          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-1">AI Reasoning:</p>
            <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
          </div>
        )}
        {suggestion.confidence && (
          <div className="mt-2 text-xs text-gray-500">
            Confidence: <span className="font-semibold">{(suggestion.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
        <h4 className="font-semibold text-gray-800 mb-2">Suggested Changes:</h4>
        {suggestion.dceAutoFixed && suggestion.originalSuggestion && (
          <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Original AI suggestion (adjusted for DCE compliance):</p>
            <div className="text-xs text-gray-500 line-through">
              Down Payment: {formatCurrency(suggestion.originalSuggestion.downPayment)} • 
              Duration: {suggestion.originalSuggestion.installments} months
            </div>
          </div>
        )}
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700">
              Down Payment: <strong>{formatCurrency(suggestion.suggestedChanges.downPayment)}</strong>
              {suggestion.dceAutoFixed && (
                <span className="ml-2 text-xs text-yellow-600">(DCE adjusted)</span>
              )}
            </span>
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700">
              Duration: <strong>{suggestion.suggestedChanges.installments} months</strong>
              {suggestion.dceAutoFixed && (
                <span className="ml-2 text-xs text-yellow-600">(DCE adjusted)</span>
              )}
            </span>
          </li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Coordinator Script:</h4>
        <p className="text-gray-700 italic leading-relaxed">"{suggestion.script}"</p>
      </div>

      {onApply && (
        <button
          onClick={onApply}
          disabled={!canApply}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors shadow-md ${
            canApply
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canApply ? 'Apply Suggestion' : 'Cannot Apply - DCE Validation Failed'}
        </button>
      )}
    </div>
  );
}

