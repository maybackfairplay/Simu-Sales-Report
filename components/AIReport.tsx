
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DashboardStats } from '../types';

export const AIReport: React.FC<{ stats: DashboardStats, history: DashboardStats[] }> = ({ stats, history }) => {
  const [reportData, setReportData] = useState<{ category: string; text: string; type: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Increased history context slice to 15
      const historyContext = history.slice(0, 15).map((s, i) => 
        `Upload ${i}: ${s.totalSales} units, Leader: ${s.topDealer}, Hub: ${s.topBranch}`
      ).join('\n');

      const prompt = `
        LONGITUDINAL AUDIT DATA (Last 15 Reports):
        ${historyContext}
        
        TASK:
        Analyze the trend across these snapshots. 
        Provide 4 sharp institutional insights regarding performance trajectory.
        Focus on "Momentum", "Hub Stability", and "Portfolio Resilience".
        
        FORMAT: Category|Type|Insight Text.
        Types: Risk, Strategy, Growth, Momentum.
        No markdown, under 25 words per insight.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
      });

      const clean = (s: string) => s.replace(/\*\*/g, '').replace(/__/g, '').trim();
      const parsed = (response.text || '').split('\n')
        .filter(l => l.includes('|'))
        .map(line => {
          const [category, type, text] = line.split('|');
          return { category: clean(category), type: clean(type).toLowerCase(), text: clean(text) };
        });
      
      setReportData(parsed.length ? parsed : [{category: "Neural Briefing", type: "strategy", text: clean(response.text || '')}]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="neon-card p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
        <svg className="w-40 h-40 text-[#00d2ff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-white uppercase">Longitudinal Synthesis</h3>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1">
              {history.length > 1 ? `Auditing Across ${history.length} Neural Snapshots` : 'Single Snapshot Audit Protocol'}
            </p>
          </div>
          <button 
            onClick={generateReport} 
            disabled={isGenerating}
            className="btn-neon btn-neon-cyan"
          >
            {isGenerating ? 'Synthesizing...' : 'Execute Full Cycle Audit'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {reportData.length > 0 ? reportData.map((item, idx) => (
            <div key={idx} className="space-y-3 border-l-2 border-white/5 pl-6 group transition-all">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10 ${
                  item.type === 'risk' ? 'text-[#ff007a] border-[#ff007a]/30' : 
                  item.type === 'growth' ? 'text-[#9dff00] border-[#9dff00]/30' : 
                  item.type === 'momentum' ? 'text-[#00d2ff] bg-[#00d2ff]/10 border-[#00d2ff]/30' : 'text-[#7d8597] border-white/10'
                }`}>
                  {item.type}
                </span>
                <h4 className="font-bold text-sm tracking-tight text-white group-hover:text-[#00d2ff] transition-colors uppercase">{item.category}</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.text}</p>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-slate-700 text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">
                Awaiting Longitudinal Data Vectors
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
