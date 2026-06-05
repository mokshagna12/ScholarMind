import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryPanel from './components/SummaryPanel';
import PaperCard from './components/PaperCard';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [currentSearchTopic, setCurrentSearchTopic] = useState('');

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setCurrentSearchTopic(query);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const apiEndpoint = `${apiBaseUrl}/api/research`;

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Server responded with status ${response.status}`);
      }

      setResults(data);
    } catch (err) {
      console.error("Search execution failed:", err);
      setError(err.message || "An unexpected network error occurred. Please check if the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Header section with ambient glow */}
      <header className="relative overflow-hidden py-10 flex flex-col items-center border-b border-slate-900">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/3 -translate-x-1/2 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col items-center text-center px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-2 animate-fade-in">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-100 via-indigo-200 to-violet-200 bg-clip-text text-transparent tracking-tight">
              ScholarMind
            </h1>
          </div>
          
          <p className="text-slate-400 font-medium text-sm sm:text-base max-w-lg mt-2">
            AI-powered RAG assistant querying arXiv to synthesize summaries, identify knowledge gaps, and suggest follow-up questions.
          </p>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        
        {/* Search Input Bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}

        {/* Error Notification Alert */}
        {error && (
          <div className="w-full max-w-4xl mx-auto p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex gap-4 items-start shadow-xl shadow-rose-950/5 animate-shake">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-300">Analysis Request Failed</h3>
              <p className="text-xs text-rose-400/90 mt-1 leading-relaxed">{error}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleSearch(currentSearchTopic)}
                  className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg transition-all duration-200"
                >
                  Retry Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RAG Synthesis and Sidebar Output Layout */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-4 flex-1">
            
            {/* Left Column (3/4 width) - Synthesis Summary, Gaps & Suggested Questions */}
            <div className="lg:col-span-3">
              <SummaryPanel
                summary={results.summary}
                gaps={results.knowledge_gaps}
                followUps={results.follow_up_questions}
                onSelectQuestion={handleSearch}
              />
            </div>

            {/* Right Column (1/4 width) - Scrollable list of original arXiv sources */}
            <div className="lg:col-span-1 bg-slate-900/20 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 flex flex-col max-h-[800px]">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/60">
                <div className="p-1 bg-indigo-500/10 text-indigo-400 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Source Papers ({results.papers.length})
                </h3>
              </div>

              {/* Scrollable container for papers */}
              <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 select-none">
                {results.papers.map((paper, index) => (
                  <PaperCard key={index} paper={paper} />
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900/60 mt-12 bg-slate-950/20">
        <p>ScholarMind Research Assistant • Built with Google Antigravity</p>
      </footer>
      
    </div>
  );
}
