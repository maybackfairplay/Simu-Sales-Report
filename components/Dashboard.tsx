
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LabelList, Cell, Legend, PieChart, Pie
} from 'recharts';
import { DashboardStats, AggregatedData } from '../types';

const COLORS = ['#00afa9', '#8cc63f', '#f2264b', '#fbb040', '#7a5af8', '#6366f1'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--panel)] border border-[var(--border)] p-6 rounded-[24px] shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 animate-in">
        <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-3">{data.name || data.model}</p>
        <div className="flex items-center gap-8">
          <p className="text-3xl font-black text-[var(--text-main)]">{data.sales || data.value} <span className="text-[10px] font-bold text-[var(--neon-cyan)] ml-1">UNITS</span></p>
          {data.share && (
            <p className="text-xs font-black text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-lg">{data.share}% <span className="text-[8px] text-emerald-500/60 ml-1 uppercase">SHARE</span></p>
          )}
        </div>
        {(data.prevSales !== undefined) && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-6">
             <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Baseline Audit</span>
             <span className="text-[11px] font-mono font-bold text-[var(--text-dim)]">{data.prevSales}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const ClickableTick = (props: any) => {
  const { x, y, payload, onFocus, currentFocus } = props;
  const isActive = payload.value === currentFocus;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-14}
        y={0}
        dy={4}
        textAnchor="end"
        fill={isActive ? 'var(--neon-lime)' : 'var(--text-dim)'}
        className="text-[10px] font-black uppercase tracking-tight cursor-pointer transition-colors duration-300 hover:fill-[var(--text-main)]"
        onClick={(e) => {
          e.stopPropagation();
          onFocus(payload.value);
        }}
      >
        {payload.value.length > 24 ? payload.value.substring(0, 22) + '...' : payload.value}
      </text>
    </g>
  );
};

interface DashboardProps {
  stats: DashboardStats;
  prevStats: DashboardStats | null;
  focusFilter: string | null;
  onFocus: (term: string) => void;
  isGlobalFocusMode?: boolean;
  onToggleGlobalFocusMode?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  prevStats, 
  focusFilter, 
  onFocus, 
  isGlobalFocusMode, 
  onToggleGlobalFocusMode 
}) => {
  const modelData = stats.byModel.slice(0, 6).map((m, i) => ({
    name: m.name,
    value: m.sales,
    share: Math.round((m.sales / stats.totalSales) * 100)
  }));

  const dealersWithShare = stats.byDealer.slice(0, 30).map(d => {
    const prevDealer = prevStats?.byDealer.find(pd => pd.name === d.name);
    return {
      ...d,
      share: Math.round((d.sales / stats.totalSales) * 100),
      prevSales: prevDealer?.sales
    };
  });

  const chartHeight = Math.max(500, dealersWithShare.length * 48);
  const dimClass = "transition-all duration-700 " + (isGlobalFocusMode ? "opacity-10 blur-[2px] pointer-events-none scale-95" : "opacity-100");

  return (
    <div className="space-y-16">
      {/* PRIMARY: Dealership Performance */}
      <div className={`neon-card p-12 group transition-all duration-700 relative z-50 ${isGlobalFocusMode ? 'shadow-[0_0_80px_rgba(0,175,169,0.15)] border-[var(--neon-cyan)]' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-10">
          <div>
            <h3 className="text-3xl font-black tracking-tight text-[var(--text-main)] uppercase italic">Market <span className="text-[var(--neon-cyan)]">Concentration</span></h3>
            <p className="text-[10px] font-bold text-[var(--text-dim)] tracking-[0.4em] uppercase mt-3">
              {prevStats ? 'Cross-Period Variance Audit' : 'Consolidated Performance Vector'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onToggleGlobalFocusMode}
              className={`px-6 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${
                isGlobalFocusMode 
                ? 'bg-[var(--neon-cyan)] border-[var(--neon-cyan)] text-white shadow-[0_0_20px_rgba(0,175,169,0.4)]' 
                : 'border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] hover:border-[var(--text-main)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {isGlobalFocusMode ? 'EXIT_FOCUS' : 'FOCUS_MODE'}
            </button>
            <button 
              onClick={() => onFocus('')}
              className={`px-6 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-[0.3em] ${
                focusFilter 
                ? 'border-[var(--neon-pink)]/40 text-[var(--neon-pink)] bg-[var(--neon-pink)]/5' 
                : 'border-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)] hover:text-white'
              }`}
            >
              {focusFilter ? 'RESET FOCUS' : 'SYSTEM OVERVIEW'}
            </button>
          </div>
        </div>
        
        <div className="h-[650px] overflow-y-auto custom-scroll pr-4 -mr-4">
          <div style={{ height: `${chartHeight}px`, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dealersWithShare} 
                layout="vertical" 
                margin={{ left: 10, right: 100, top: 10, bottom: 10 }}
                onClick={(data: any) => { if(data?.activePayload?.[0]) onFocus(data.activePayload[0].payload.name); }}
                style={{ cursor: 'pointer' }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="barGradientActive" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--neon-lime)" stopOpacity={1}/>
                    <stop offset="100%" stopColor="var(--neon-lime)" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={180} 
                  tick={<ClickableTick onFocus={onFocus} currentFocus={focusFilter} />} 
                  axisLine={false} 
                  tickLine={false} 
                  interval={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--text-dim)', fillOpacity: 0.05 }} />
                <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={26}>
                   {dealersWithShare.map((entry, index) => (
                     <Cell 
                       key={`cell-${index}`} 
                       fill={focusFilter === entry.name ? "url(#barGradientActive)" : "url(#barGradient)"}
                       className="transition-all duration-700"
                     />
                   ))}
                   <LabelList 
                     dataKey="sales" 
                     position="right" 
                     content={(props: any) => {
                       const { x, y, width, value, index } = props;
                       const d = dealersWithShare[index];
                       const diff = d.prevSales !== undefined ? value - d.prevSales : 0;
                       const isPositive = diff >= 0;
                       return (
                         <g>
                           <text x={x + width + 16} y={y + 18} fill="var(--text-main)" fontSize={13} fontWeight={900} fontFamily="JetBrains Mono">{value}</text>
                           {d.prevSales !== undefined && (
                             <text x={x + width + 55} y={y + 18} fill={isPositive ? 'var(--neon-lime)' : 'var(--neon-pink)'} fontSize={10} fontWeight={800} fontFamily="JetBrains Mono">
                               {isPositive ? '+' : ''}{diff}
                             </text>
                           )}
                         </g>
                       );
                     }}
                   />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 ${dimClass}`}>
        <div className={`neon-card p-12 flex flex-col min-h-[550px] transition-all duration-700 ${focusFilter ? 'border-[var(--neon-lime)]/30' : ''}`}>
          <div className="mb-12">
            <h3 className="text-2xl font-black tracking-tight text-[var(--text-main)] uppercase italic">
              {focusFilter ? 'Sub-Node Density' : 'Terminal Performance'}
            </h3>
            <p className="text-[10px] font-bold text-[var(--text-dim)] tracking-[0.4em] uppercase mt-3">
              Direct Sales Distribution
            </p>
          </div>
          
          <div className="flex-grow space-y-10">
            {(focusFilter && stats.dealerShopMap[focusFilter] ? stats.dealerShopMap[focusFilter] : stats.byShop).slice(0, 8).map((shop, i, arr) => {
              const maxVal = Math.max(...arr.map(s => s.sales));
              const widthPercentage = (shop.sales / maxVal) * 100;
              const accentColor = focusFilter ? 'var(--neon-lime)' : 'var(--neon-cyan)';
              
              return (
                <div key={i} className="group relative">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[12px] font-black text-[var(--text-dim)] uppercase tracking-tight truncate max-w-[240px] group-hover:text-[var(--text-main)] transition-colors duration-500">{shop.name}</span>
                    <span className="text-sm font-black text-[var(--text-main)] font-mono">{shop.sales} <span className="text-[9px] text-[var(--text-dim)] font-bold ml-1">U</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-[var(--text-dim)]/5 rounded-full overflow-hidden border border-[var(--border)]">
                    <div className="h-full rounded-full transition-all duration-1000 opacity-80" style={{ width: `${widthPercentage}%`, background: `linear-gradient(to right, transparent, ${accentColor})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="neon-card p-12 bg-gradient-to-br from-[var(--text-main)]/[0.01] to-transparent flex flex-col">
          <div className="mb-10">
            <h3 className="text-2xl font-black tracking-tight text-[var(--text-main)] uppercase italic">Portfolio Mix</h3>
            <p className="text-[10px] font-bold text-[var(--text-dim)] tracking-[0.4em] uppercase mt-3">Product Volume Distribution</p>
          </div>
          
          <div className="flex-grow flex flex-col xl:flex-row items-center gap-12">
            <div className="relative w-full aspect-square max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="100%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {modelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em]">Total Units</span>
                 <div className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{stats.totalSales}</div>
              </div>
            </div>

            <div className="flex-grow w-full space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {modelData.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--text-main)]/[0.02] border border-[var(--border)] hover:bg-[var(--text-main)]/[0.05] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] font-black text-[var(--text-dim)] uppercase tracking-tight group-hover:text-[var(--text-main)] transition-colors truncate max-w-[140px]">
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-[var(--text-main)] font-mono">{m.value}</span>
                      <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase">Units</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-bold text-[var(--text-dim)] text-center uppercase tracking-[0.3em] pt-4">Top 6 Market Drivers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
