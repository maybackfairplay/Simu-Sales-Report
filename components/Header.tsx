
import React, { useState, useEffect } from 'react';

export const Header: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const savedTheme = localStorage.getItem('simu-theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.body.classList.add('light');
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    if (newMode) {
      document.body.classList.add('light');
      localStorage.setItem('simu-theme', 'light');
    } else {
      document.body.classList.remove('light');
      localStorage.setItem('simu-theme', 'dark');
    }
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[100] border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-2xl h-16 flex items-center overflow-hidden transition-all duration-500"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 175, 169, 0.05) 0%, transparent 250px)`
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--neon-cyan), transparent 40%)`,
          opacity: 0.03
        }}
      />

      <div className="container mx-auto max-w-7xl px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-[var(--neon-cyan)]/20 rounded-lg rotate-45 group-hover:rotate-90 transition-all duration-700 animate-[spin_8s_linear_infinite]"></div>
              <div className="absolute inset-0 border border-[var(--neon-cyan)]/40 rounded-lg -rotate-12 group-hover:rotate-0 transition-all duration-700 animate-[spin_12s_linear_infinite_reverse]"></div>
              
              <svg className="w-5 h-5 text-[var(--neon-cyan)] relative z-10 drop-shadow-[0_0_8px_rgba(0,175,169,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21a9.003 9.003 0 008.354-5.646M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-[0.3em] uppercase text-[var(--text-main)] leading-none group-hover:text-[var(--neon-cyan)] transition-colors">WATU</span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--neon-cyan)]/80">Intelligence 2026</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-[var(--text-main)]/5 rounded-full border border-[var(--border)] backdrop-blur-md">
             <span className="text-[9px] font-mono font-bold text-[var(--text-dim)] uppercase tracking-widest">[ 0x-WATU-AUDIT ]</span>
             <div className="w-1 h-1 bg-[var(--neon-lime)] rounded-full animate-pulse shadow-[0_0_5px_var(--neon-lime)]"></div>
             <span className="text-[9px] font-mono font-bold text-[var(--neon-lime)] uppercase tracking-widest">Active_Node</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] hover:bg-[var(--text-main)] hover:text-[var(--bg)] transition-all group shadow-sm"
              title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLightMode ? (
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[var(--neon-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-[var(--text-dim)] uppercase">Neural Load</span>
                <span className="text-[10px] font-mono font-bold text-[var(--neon-cyan)]">4.2%</span>
              </div>
              <div className="w-16 h-1 bg-[var(--border)] rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-lime)] transition-all duration-500"
                  style={{ width: '42%' }}
                ></div>
              </div>
            </div>

            <div className="h-8 w-px bg-[var(--border)]"></div>

            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end justify-center">
                  <span className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-tighter">Admin_Root</span>
                  <span className="text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Regional Hub</span>
               </div>
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-lime)] rounded-full blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-[var(--neon-cyan)]/10 flex items-center justify-center group-hover:bg-[var(--neon-cyan)]/20 transition-colors">
                      <svg className="w-5 h-5 text-[var(--neon-cyan)]/60 group-hover:text-[var(--neon-cyan)] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <button className="md:hidden text-[var(--text-main)] hover:text-[var(--neon-cyan)] transition-colors p-2 rounded-lg hover:bg-black/5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};
