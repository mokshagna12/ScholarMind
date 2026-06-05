import React from 'react';

export default function PaperCard({ paper }) {
  // Format authors to show max 3, then "et al."
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Authors';
    if (authors.length <= 3) return authors.join(', ');
    return `${authors.slice(0, 3).join(', ')} et al.`;
  };

  return (
    <a
      href={paper.id}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all duration-300 shadow-md hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer text-left"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2 text-sm leading-snug">
          {paper.title}
        </h4>
        
        {/* arXiv external link icon */}
        <div className="text-slate-500 group-hover:text-indigo-400 p-1 bg-slate-800/50 group-hover:bg-indigo-950/50 rounded-lg transition-all duration-200 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 line-clamp-1">
        {formatAuthors(paper.authors)}
      </p>

      <div className="flex items-center justify-between">
        {/* Year badge */}
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 rounded">
          {paper.year}
        </span>
        
        {/* Small source indicator */}
        <span className="text-[10px] font-medium text-indigo-400/80">
          arXiv API
        </span>
      </div>
    </a>
  );
}
