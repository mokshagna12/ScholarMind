import React from 'react';

export default function SummaryPanel({ summary, gaps, followUps, onSelectQuestion }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in w-full max-w-7xl mx-auto">
      
      {/* Synthesized Summary Panel (Left/Main Column) */}
      <div className="lg:col-span-2 flex flex-col bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800/60">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider text-xs">
            Synthesized Summary
          </h2>
        </div>
        
        <div className="text-slate-300 leading-relaxed text-sm space-y-4 whitespace-pre-line overflow-y-auto max-h-[500px] pr-2">
          {summary}
        </div>
      </div>

      {/* Gaps and Follow-ups Column (Right Column) */}
      <div className="flex flex-col gap-6">
        
        {/* Knowledge Gaps Panel */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-800/60">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider text-xs">
              Knowledge Gaps
            </h2>
          </div>
          
          <ul className="space-y-4">
            {gaps && gaps.map((gap, index) => (
              <li key={index} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                <span className="flex-shrink-0 w-5 h-5 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center font-bold text-[10px]">
                  {index + 1}
                </span>
                <p className="flex-1">{gap}</p>
              </li>
            ))}
            {(!gaps || gaps.length === 0) && (
              <p className="text-slate-400 text-xs italic">No knowledge gaps loaded.</p>
            )}
          </ul>
        </div>

        {/* Follow-up Questions Panel */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex-1">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-800/60">
            <div className="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider text-xs">
              Follow-up Inquiries
            </h2>
          </div>
          
          <div className="flex flex-col gap-2">
            {followUps && followUps.map((question, index) => (
              <button
                key={index}
                onClick={() => onSelectQuestion(question)}
                className="text-left w-full p-2.5 bg-slate-800/20 hover:bg-violet-950/20 text-slate-300 hover:text-violet-300 border border-slate-800/50 hover:border-violet-500/30 rounded-xl text-xs transition-all duration-200 line-clamp-2 hover:-translate-y-0.5"
              >
                {question}
              </button>
            ))}
            {(!followUps || followUps.length === 0) && (
              <p className="text-slate-400 text-xs italic">No follow-up questions loaded.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
