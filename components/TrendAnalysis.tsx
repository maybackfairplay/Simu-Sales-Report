
import React, { useState } from 'react';
import { DashboardStats } from '../types';

interface TrendAnalysisProps {
  stats: DashboardStats;
  prevStats: DashboardStats | null;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ stats, prevStats }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!prevStats) return null;

  const calculateDelta = (curr: number, prev: number) => {
    const delta = curr - prev;
    const percent = prev !== 0 ? ((delta / prev) * 100).toFixed(0) : '100';
    return { delta, percent, isUp: delta >= 0 };
  };

  const salesDelta = calculateDelta(stats.totalSales, prevStats.totalSales);
  
  const getDetailedComparison = (currList: {name: string, sales: number}[], prevList: {name: string, sales: number}[]) => {
    const prevMap = new Map(prevList.map(i => [i.name, i.sales]));
    const allNames = Array.from(new Set([...currList.map(i => i.name), ...prevList.map(i => i.name)]));
    
    return allNames.map(name => {
      const curr = currList.find(i => i.name === name)?.sales || 0;
      const prev = prevMap.get(name) || 0;
      const { delta, percent, isUp } = calculateDelta(curr, prev);
      return { name, curr, prev, delta, percent, isUp };
    }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10);
  };

  const dealerComparison = getDetailedComparison(stats.byDealer, prevStats.byDealer);
  const modelComparison = getDetailedComparison(stats.byModel, prevStats.byModel);
  const branchComparison = getDetailedComparison(stats.byBranch, prevStats.byBranch);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)} 
        className="neon-card p-8 cursor-pointer group animate-in border-white/5 hover:border-[#9dff00]/30"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter text-white uppercase">Cycle Variance</h3>
            <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Temporal audit</p>
          </div>
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-[#9dff00]/50 transition-colors">
             <svg className="w-5 h-5 text-[#9dff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Global Volume Shift</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">{stats.totalSales}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${salesDelta.isUp ? 'text-[#9dff00] bg-[#9dff00]/10' : 'text-[#ff007a] bg-[#ff007a]/10'}`}>
                {salesDelta.isUp ? '↑' : '↓'} {salesDelta.percent}%
              </span>
            </div>
          </div>
          <div className="p-6 bg-[#1a1d29] rounded-2xl border-l-4 border-[#ff007a]">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Market Leader</p>
            <div className="text-lg font-black text-white truncate uppercase tracking-tight">{stats.topDealer}</div>
            <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Dominance</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="neon-card w-full max-w-5xl max-h-[85vh] flex flex-col animate-in shadow-[0_0_100px_rgba(0,0,0,0.8)] border-white/10">
            <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#1a1d29]/90 backdrop-blur-md z-10">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Multi-Vector Drill-down</h2>
                <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1">Cross-Period Performance Variance</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scroll space-y-12">
               {/* Dealership Section */}
               <section>
                 <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-2">
                   <h3 className="text-xs font-black text-[#00d2ff] uppercase tracking-[0.3em]">Node Analysis: Dealerships</h3>
                   <div className="flex-grow h-px bg-gradient-to-r from-[#00d2ff]/20 to-transparent"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dealerComparison.map((item, idx) => <ComparisonCard key={idx} item={item} />)}
                 </div>
               </section>

               {/* Branch Section */}
               <section>
                 <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-2">
                   <h3 className="text-xs font-black text-[#9dff00] uppercase tracking-[0.3em]">Regional Hubs: Branches</h3>
                   <div className="flex-grow h-px bg-gradient-to-r from-[#9dff00]/20 to-transparent"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branchComparison.map((item, idx) => <ComparisonCard key={idx} item={item} />)}
                 </div>
               </section>

               {/* Model Section */}
               <section>
                 <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-2">
                   <h3 className="text-xs font-black text-[#ff007a] uppercase tracking-[0.3em]">Product Vectors: Models</h3>
                   <div className="flex-grow h-px bg-gradient-to-r from-[#ff007a]/20 to-transparent"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modelComparison.map((item, idx) => <ComparisonCard key={idx} item={item} />)}
                 </div>
               </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Fixed ComparisonCard: Using React.FC typing to correctly handle the 'key' prop in map iterations
const ComparisonCard: React.FC<{ item: any }> = ({ item }) => (
  <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
    <div className="flex justify-between items-start mb-6">
      <h4 className="font-black text-[11px] tracking-tight text-slate-300 uppercase pr-4 group-hover:text-white transition-colors">{item.name}</h4>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg ${item.isUp ? 'bg-[#9dff00]/20 text-[#9dff00]' : 'bg-[#ff007a]/20 text-[#ff007a]'}`}>
          {item.isUp ? '+' : ''}{item.delta}
        </span>
        <span className={`text-[8px] font-bold ${item.isUp ? 'text-[#9dff00]/60' : 'text-[#ff007a]/60'}`}>
          {item.isUp ? '▲' : '▼'} {item.percent}%
        </span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Current</span>
        <span className="text-xl font-black text-white">{item.curr}</span>
      </div>
      <div className="h-8 w-px bg-white/5"></div>
      <div className="flex flex-col items-end">
        <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Prior</span>
        <span className="text-lg font-bold text-slate-500">{item.prev}</span>
      </div>
    </div>
  </div>
);
