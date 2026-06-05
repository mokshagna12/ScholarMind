import React, { useState } from 'react';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const sampleTopics = [
    "Quantum Error Correction",
    "CRISPR Off-Target Effects",
    "Transformer Attention Mechanics",
    "Dark Matter Detection"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a research question or enter a topic (e.g. Quantum error correction)..."
          disabled={isLoading}
          className="w-full pl-12 pr-32 py-4 bg-slate-900/60 backdrop-blur-md text-slate-100 placeholder-slate-400 border border-slate-700/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent transition-all duration-300 shadow-xl shadow-black/10 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing
            </span>
          ) : (
            "Analyze"
          )}
        </button>
      </form>
      
      <div className="flex flex-wrap gap-2.5 mt-3 px-1 text-sm items-center">
        <span className="text-slate-400">Try searching:</span>
        {sampleTopics.map((topic) => (
          <button
            key={topic}
            type="button"
            disabled={isLoading}
            onClick={() => {
              setQuery(topic);
              onSearch(topic);
            }}
            className="px-3 py-1 bg-slate-800/40 hover:bg-indigo-950/40 hover:text-indigo-300 text-slate-300 border border-slate-700/40 hover:border-indigo-500/40 rounded-full transition-all duration-200 text-xs font-medium"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
