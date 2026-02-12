
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DashboardStats } from '../types';

export const AIAnalystTerminal: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userMsg = query;
    setQuery('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `
        Current Stats: Total Sales ${stats.totalSales}. 
        Top Dealer: ${stats.topDealer}. 
        Top Model: ${stats.topModel}.
        Metrics: ETR Pending ${stats.metrics.pendingETR}, SW Pending ${stats.metrics.pendingSoftware}.
        Dealer Breakdown: ${stats.byDealer.map(d => `${d.name}: ${d.sales}`).join(', ')}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: ${context}\n\nUser Question: ${userMsg}\n\nAnswer as a sharp corporate analyst. Keep it under 40 words. No emojis.`,
      });

      setHistory(prev => [...prev, { role: 'ai', text: response.text || "Analysis inconclusive." }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'ai', text: "Signal lost. Check node connectivity." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="neon-card bg-[var(--input-bg)] border-cyan-500/10 flex flex-col h-[420px] shadow-2xl overflow-hidden transition-colors duration-500">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-cyan-500/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em]">Analyst_Nexus_v4.2</span>
        </div>
        <div className="flex gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto custom-scroll space-y-6 font-mono text-[11px] bg-black/5">
        <div className="text-[var(--text-dim)] uppercase font-bold tracking-widest text-[9px] border-b border-white/5 pb-2">-- Strategic Data Uplink Connected --</div>
        {history.length === 0 && (
          <div className="text-[var(--text-dim)] leading-relaxed opacity-50 italic">Awaiting inquiry regarding current performance vectors...</div>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'ai' ? 'text-cyan-600 dark:text-cyan-400' : 'text-[var(--text-main)]'}`}>
            <span className="font-black shrink-0 opacity-50">{msg.role === 'ai' ? 'INTEL>' : 'QUERY>'}</span>
            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-3 text-cyan-500 animate-pulse">
            <span className="font-black opacity-50">INTEL></span>
            <span>Parsing Datasets...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleQuery} className="p-5 bg-white/[0.02] border-t border-white/5">
        <div className="flex items-center gap-4 group">
          <span className="text-cyan-500 font-bold group-focus-within:animate-ping transition-all">❯</span>
          <input 
            type="text" 
            placeholder="Engage Strategic AI Agent..."
            className="flex-grow bg-transparent text-[var(--text-main)] text-[12px] font-medium outline-none placeholder:text-[var(--text-dim)] focus:placeholder:opacity-50 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
};
