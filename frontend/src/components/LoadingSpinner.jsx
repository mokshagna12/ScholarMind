import React, { useState, useEffect } from 'react';

export default function LoadingSpinner() {
  const steps = [
    "Querying arXiv search index...",
    "Retrieving top 10 relevant publications...",
    "Chunking abstracts for precise indexing...",
    "Generating local vector embeddings (all-MiniLM-L6-v2)...",
    "Indexing document chunks into local ChromaDB...",
    "Performing semantic similarity retrieval...",
    "Synthesizing results using Gemini 2.5 Flash RAG..."
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex < steps.length - 1) {
          return prevIndex + 1;
        }
        return prevIndex; // Hold on the final step (RAG generation)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing circle */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-indigo-500/20 animate-ping" />
        
        {/* Middle rotating circle */}
        <div className="w-20 h-20 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin" />
        
        {/* Inner static/pulsing core */}
        <div className="absolute w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full shadow-lg shadow-indigo-500/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-white animate-pulse" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        </div>
      </div>

      <div className="mt-8 text-center max-w-sm">
        <h3 className="text-lg font-semibold text-slate-200">Analyzing Research Topic</h3>
        <p className="text-indigo-400 font-medium text-sm mt-1 animate-pulse min-h-[20px]">
          {steps[currentStepIndex]}
        </p>
        
        {/* Steps track visualizer */}
        <div className="flex justify-center gap-1.5 mt-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStepIndex
                  ? 'w-6 bg-indigo-500'
                  : idx < currentStepIndex
                  ? 'w-2 bg-indigo-500/40'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
