
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DashboardStats } from '../types';

interface WhatsAppReportProps {
  stats: DashboardStats;
  onClose: () => void;
}

export const WhatsAppReport: React.FC<WhatsAppReportProps> = ({ stats, onClose }) => {
  const [reportText, setReportText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [selections, setSelections] = useState({
    totalSales: true,
    metrics: true,
    ranking: true,
    summary: true,
  });

  const fetchSummary = useCallback(async () => {
    if (!selections.summary) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Increased context to top 5 dealers for sharper analysis
      const topDealers = stats.byDealer.slice(0, 5).map(d => `${d.name} (${d.sales}u)`).join(', ');
      const topModels = stats.byModel.slice(0, 3).map(m => m.name).join(', ');
      
      const prompt = `
        Context: Executive Sales Report.
        Data Snapshot: ${stats.totalSales} total units sold.
        Top Performers: ${topDealers}.
        Market Favorites: ${topModels}.
        
        Task: Write a highly professional, 2-sentence executive summary for WhatsApp. 
        Style: Sharp, data-driven, no emojis, no markdown. 
        Focus on growth, market dominance, and specific leader momentum.
      `;

      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });
      
      setSummaryText(response.text?.trim() || "Audit complete. Market performance remains stable.");
    } catch (e) {
      setSummaryText("Intelligence synchronization failed. Manual audit recommended.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }, [stats, selections.summary]);

  // Initial fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Sync the final output text
  useEffect(() => {
    let text = `*EXECUTIVE AUDIT* | ${new Date().toLocaleDateString()}\n`;
    text += `*PROTOCOL:* SIMU-SALES-V3\n\n`;
    
    if (selections.totalSales) {
      text += `*Global Volume:* ${stats.totalSales} Units\n`;
    }
    
    if (selections.metrics) {
      text += `*ETR Pending:* ${stats.metrics.pendingETR}\n`;
      text += `*SW Validation:* ${stats.metrics.pendingSoftware}\n`;
    }
    
    if (selections.ranking) {
      // Updated to slice(0, 10) to capture top 10 dealers
      const top = stats.byDealer.slice(0, 10).map((d, i) => ` ${i+1}. ${d.name} (${d.sales})`).join('\n');
      text += `\n*Top 10 Performers:*\n${top}\n`;
    }
    
    if (selections.summary && summaryText) {
      text += `\n*AI Synthesis:*\n${summaryText}`;
    }
    
    setReportText(text.trim());
  }, [stats, selections, summaryText]);

  return (
    <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in">
      <div className="neon-card w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
              <span className="text-[#00d2ff]">Intelligence</span> Dispatch Hub
            </h3>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">Direct Secure Communication Channel</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-[#ff007a] rounded-full transition-all group">
            <svg className="w-6 h-6 text-white group-hover:scale-75 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 p-8 border-r border-white/5 bg-black/40 space-y-10 custom-scroll overflow-y-auto">
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-8">Payload Modules</label>
                <div className="space-y-8">
                  <Toggle label="Volume Aggregation" active={selections.totalSales} onClick={() => setSelections(s => ({...s, totalSales: !s.totalSales}))} />
                  <Toggle label="Status Metrics" active={selections.metrics} onClick={() => setSelections(s => ({...s, metrics: !s.metrics}))} />
                  <Toggle label="Top 10 Rankings" active={selections.ranking} onClick={() => setSelections(s => ({...s, ranking: !s.ranking}))} />
                  <Toggle label="AI Briefing" active={selections.summary} onClick={() => setSelections(s => ({...s, summary: !s.summary}))} />
                </div>
             </div>
             
             <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase mb-4">Transmission Security</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#9dff00] animate-pulse"></div>
                   <span className="text-[9px] font-mono font-bold text-[#9dff00]">ENCRYPTED_STREAM_ON</span>
                </div>
             </div>
          </div>

          {/* Output Content */}
          <div className="flex-grow flex flex-col p-10 gap-8 bg-black/20 overflow-y-auto custom-scroll">
            
            {/* AI Summary Preview Section */}
            {selections.summary && (
              <div className="space-y-3 animate-in">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-[#00d2ff] uppercase tracking-widest">AI Synthesis Preview</span>
                   <button 
                     onClick={fetchSummary} 
                     disabled={isGenerating}
                     className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-tighter flex items-center gap-2 transition-colors"
                   >
                     <svg className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Regenerate Analysis
                   </button>
                </div>
                <div className={`p-6 rounded-3xl border transition-all duration-500 ${isGenerating ? 'border-white/5 opacity-50' : 'border-[#00d2ff]/20 bg-[#00d2ff]/5 shadow-[0_0_30px_rgba(0,210,255,0.05)]'}`}>
                   {isGenerating ? (
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[#00d2ff] rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-[#00d2ff] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-[#00d2ff] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-widest ml-2">Synchronizing Neural Weights...</span>
                     </div>
                   ) : (
                     <p className="text-[13px] font-medium text-slate-200 leading-relaxed italic">
                       "{summaryText}"
                     </p>
                   )}
                </div>
              </div>
            )}

            <div className="flex-grow flex flex-col gap-3">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Final WhatsApp Payload</span>
               <textarea 
                readOnly 
                className="flex-grow w-full p-8 bg-black/40 border border-white/5 rounded-3xl font-mono text-sm leading-relaxed text-[#00d2ff] outline-none resize-none focus:border-[#00d2ff]/30 transition-all custom-scroll" 
                value={reportText}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <button 
                 onClick={() => { navigator.clipboard.writeText(reportText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                 className="btn-neon w-full justify-center h-14"
               >
                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                 {copied ? 'Payload Cached' : 'Copy Payload'}
               </button>
               <button 
                 onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank')}
                 className="btn-neon btn-neon-cyan w-full justify-center h-14"
               >
                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                 Execute Dispatch
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-5 w-full group text-left transition-all">
    <div className={`w-14 h-7 rounded-full transition-all relative ${active ? 'bg-[#9dff00] shadow-[0_0_15px_rgba(157,255,0,0.3)]' : 'bg-white/5 border border-white/10'}`}>
       <div className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${active ? 'left-8 bg-black scale-90' : 'left-1 bg-slate-600'}`}></div>
    </div>
    <span className={`text-[12px] font-extrabold tracking-tight uppercase transition-colors ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
  </button>
);
