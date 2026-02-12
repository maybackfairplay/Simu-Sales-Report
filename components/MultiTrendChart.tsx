
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { DashboardStats } from '../types';

interface MultiTrendChartProps {
  history: DashboardStats[];
}

export const MultiTrendChart: React.FC<MultiTrendChartProps> = ({ history }) => {
  if (history.length < 2) return null;

  const chartData = [...history].reverse().map((s, i) => {
    const uploadDate = new Date(s.timestamp || Date.now());
    return {
      name: `T-${history.length - 1 - i}`,
      uploadTime: uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uploadFull: uploadDate.toLocaleString(),
      sales: s.totalSales,
      dataDate: new Date(s.rawRecords[0]?.disbursedOnDate || Date.now()).toLocaleDateString()
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--panel)] border border-[var(--border)] p-5 rounded-xl backdrop-blur-xl shadow-2xl ring-1 ring-black/5">
          <div className="flex flex-col gap-1 mb-3">
             <span className="text-[9px] font-black text-[var(--neon-cyan)] uppercase tracking-widest">Upload Protocol</span>
             <p className="text-[11px] font-bold text-[var(--text-main)]">{data.uploadFull}</p>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Volume Hub</span>
             <p className="text-xl font-black text-[var(--text-main)]">{payload[0].value} <span className="text-[10px] text-[var(--neon-cyan)]">UNITS</span></p>
          </div>
          <p className="mt-3 pt-2 border-t border-[var(--border)] text-[9px] font-bold text-[var(--text-dim)] uppercase italic">Source: {data.dataDate}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="neon-card p-10 group">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="text-2xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">Neural <span className="text-[var(--neon-cyan)]">Timeline</span></h3>
          <p className="text-[10px] font-bold text-[var(--text-dim)] tracking-[0.3em] uppercase mt-2">Historical Performance Continuity Audit</p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-[var(--text-dim)] uppercase">Analysis Cycles</span>
             <span className="text-sm font-black text-[var(--text-main)] font-mono">{history.length} / 15</span>
           </div>
           <div className="w-12 h-12 bg-[var(--neon-cyan)]/5 rounded-2xl border border-[var(--neon-cyan)]/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.05)]">
              <svg className="w-6 h-6 text-[var(--neon-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
           </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis 
              dataKey="uploadTime" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 900 }} 
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--neon-cyan)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="var(--neon-cyan)" 
              strokeWidth={4}
              dot={{ r: 5, fill: 'var(--neon-cyan)', strokeWidth: 2, stroke: 'var(--panel)' }}
              activeDot={{ r: 7, fill: 'var(--panel)', stroke: 'var(--neon-cyan)', strokeWidth: 3 }}
              fillOpacity={1} 
              fill="url(#colorSales)" 
              animationDuration={2000}
            >
              <LabelList 
                dataKey="sales" 
                position="top" 
                offset={25} 
                fill="var(--text-main)" 
                fontSize={14} 
                fontWeight={900} 
                fontFamily="JetBrains Mono" 
                formatter={(val: any) => `${val} U`}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
