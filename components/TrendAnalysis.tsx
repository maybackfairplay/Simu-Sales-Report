
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
    const percent = prev !== 0 ? ((delta / prev) * 100).toFixed(1) : '100';
    return { delta, percent, isUp: delta >= 0 };
  };

  const salesDelta = calculateDelta(stats.totalSales, prevStats.totalSales);
  
  const getTopShifter = (currList: {name: string, sales: number}[], prevList: {name: string, sales: number}[]) => {
    const prevMap = new Map(prevList.map(i => [i.name, i.sales]));
    const shifts = currList.map(item => {
      const prevSales = prevMap.get(item.name) || 0;
      return { name: item.name, diff: item.sales - prevSales };
    }).sort((a, b) => b.diff - a.diff);
    return shifts[0];
  };

  const topShopShifter = getTopShifter(stats.byShop, prevStats.byShop);

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

  const shopComparison = getDetailedComparison(stats.byShop, prevStats.byShop);

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="glass-2026 squircle p-12 haptic-card relative group cursor-pointer overflow-hidden border-indigo-200/50 glow-indigo">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-2 block">Cycle Variance Analyzer</span>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Temporal Comparison</h3>
            </div>
            <div className="px-6 py-3 glass-dark-2026 squircle-sm text-[10px] font-black tracking-widest uppercase shadow-xl">Audit Active</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 squircle-sm bg-white/60 border border-white/80">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Volume Momentum</div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-slate-900">{stats.totalSales}</span>
                <span className={`text-sm font-black flex items-center gap-1 ${salesDelta.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {salesDelta.isUp ? '↑' : '↓'} {salesDelta.percent}%
                </span>
              </div>
            </div>

            <div className="p-8 squircle-sm bg-indigo-600 text-white shadow-2xl">
              <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-6">Shop Leader</div>
              <div className="text-2xl font-black truncate">{stats.topShop}</div>
              <p className="mt-4 text-xs font-semibold opacity-80">Shift from previous cycle captured.</p>
            </div>

            <div className="p-8 squircle-sm bg-white/40 border border-white/60">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Peak Efficiency</div>
              <div className="text-2xl font-black text-slate-900 truncate">{topShopShifter?.name || 'N/A'}</div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Net +{topShopShifter?.diff || 0} Growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[120px]" onClick={() => setIsModalOpen(false)} />
          <div className="relative glass-2026 w-full max-w-6xl max-h-[90vh] squircle shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col">
            <div className="p-12 border-b border-white/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-2 block">Enterprise Intelligence</span>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Shop Variance Audit</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-16 h-16 glass-2026 squircle-sm flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 {shopComparison.map((item, idx) => (
                    <div key={idx} className="p-8 glass-2026 squircle-sm border-white/60">
                       <div className="flex justify-between items-center mb-6">
                          <h4 className="font-black text-xl tracking-tighter text-slate-900">{item.name}</h4>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black ${item.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {item.isUp ? '↑' : '↓'} {item.percent}%
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div><span className="text-[9px] font-black text-slate-400 uppercase block">Current</span><span className="text-3xl font-black">{item.curr}</span></div>
                          <div className="h-10 w-px bg-slate-200"></div>
                          <div><span className="text-[9px] font-black text-slate-400 uppercase block">Prev</span><span className="text-2xl font-bold text-slate-400">{item.prev}</span></div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
