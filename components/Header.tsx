
import React from 'react';

interface HeaderProps {
  appIcon?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ appIcon }) => {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <header className="max-w-4xl mx-auto glass-2026 squircle-sm h-14 flex items-center justify-between px-6 pointer-events-auto border-white/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black squircle-sm flex items-center justify-center haptic-touch overflow-hidden shadow-lg border border-white/20">
            {appIcon ? (
              <img src={appIcon} alt="Identity" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <span className="text-sm font-black tracking-tighter text-slate-900">NeuroSales<span className="text-blue-600"> v26</span></span>
        </div>
        
        <nav className="flex items-center gap-4">
          <div className="px-3 py-1 bg-blue-50/50 rounded-full border border-blue-100/50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Neural Link Active</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-white/50 overflow-hidden shadow-inner">
             <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-indigo-100"></div>
          </div>
        </nav>
      </header>
    </div>
  );
};
