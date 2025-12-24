
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend, LabelList, Rectangle
} from 'recharts';
import { DashboardStats } from '../types';

const COLORS = ['#007AFF', '#5856D6', '#FF2D55', '#34C759', '#AF52DE', '#FF9500', '#5AC8FA'];

const CustomTooltip = ({ active, payload, type }: any) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <div className="glass-dark-2026 px-6 py-4 squircle-sm shadow-3xl border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">{data.name}</p>
        <div className="flex items-baseline gap-3">
           <p className="text-3xl font-black text-white">{payload[0].value}</p>
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Units</span>
        </div>
        {type === 'pie' && data.percent && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Share: {data.percent}%
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<{ stats: DashboardStats, prevStats: DashboardStats | null }> = ({ stats }) => {
  
  // Prepare Pie Data with percentages for the enhanced tooltip
  const pieData = useMemo(() => {
    const total = stats.byModel.reduce((acc, curr) => acc + curr.sales, 0);
    return stats.byModel.slice(0, 8).map(item => ({
      ...item,
      percent: total > 0 ? ((item.sales / total) * 100).toFixed(1) : '0'
    }));
  }, [stats.byModel]);

  return (
    <div className="space-y-12 stagger-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Shop Performance - Individual Entities */}
        <div className="glass-2026 p-12 squircle haptic-card glow-blue">
          <div className="flex justify-between items-start mb-16">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2 block">Individual Shop Rank</span>
              <h3 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Shop Performance</h3>
            </div>
            <div className="w-14 h-14 glass-2026 squircle-sm flex items-center justify-center text-2xl shadow-lg">🏛️</div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byDealer.slice(0, 10)} layout="vertical" margin={{ left: 20, right: 80 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#8e8e93', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,122,255,0.03)', radius: 16 }} />
                <Bar 
                  dataKey="sales" 
                  radius={[0, 20, 20, 0]} 
                  barSize={24} 
                  fill="#007AFF"
                  activeBar={<Rectangle fill="#0056b3" stroke="#007AFF" strokeWidth={2} />}
                >
                  <LabelList dataKey="sales" position="right" offset={20} style={{ fontSize: 14, fontWeight: 900, fill: '#1c1c1e' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dealership Performance - Grouped Entities */}
        <div className="glass-2026 p-12 squircle haptic-card glow-rose">
          <div className="flex justify-between items-start mb-16">
            <div>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] mb-2 block">Aggregate Group Rank</span>
              <h3 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Dealership Performance</h3>
            </div>
            <div className="w-14 h-14 glass-2026 squircle-sm flex items-center justify-center text-2xl shadow-lg">🏬</div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byShop.slice(0, 10)} layout="vertical" margin={{ left: 20, right: 80 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#8e8e93', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,45,85,0.03)', radius: 16 }} />
                <Bar 
                  dataKey="sales" 
                  radius={[0, 20, 20, 0]} 
                  barSize={24} 
                  fill="#FF2D55"
                  activeBar={<Rectangle fill="#b31d3b" stroke="#FF2D55" strokeWidth={2} />}
                >
                  <LabelList dataKey="sales" position="right" offset={20} style={{ fontSize: 14, fontWeight: 900, fill: '#1c1c1e' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Inventory Mix - Pie Chart Interactivity */}
        <div className="glass-2026 p-12 squircle haptic-card glow-indigo lg:col-span-1">
          <div className="flex justify-between items-start mb-16">
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-2 block">Variant Distribution</span>
              <h3 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Portfolio</h3>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={8} 
                  dataKey="sales" 
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((_, index) => (
                    <Cell 
                      key={index} 
                      fill={COLORS[index % COLORS.length]} 
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      className="hover:scale-105 origin-center transform transition-transform"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip type="pie" />} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Towns - Enhanced Visibility and Interaction */}
        <div className="glass-2026 p-12 squircle haptic-card glow-blue lg:col-span-2">
          <div className="mb-12 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] mb-2 block">Regional Operations Intelligence</span>
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Towns</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Active Hubs</span>
                <span className="text-2xl font-black text-slate-900">{stats.byBranch.length}</span>
              </div>
              <div className="w-16 h-16 bg-blue-600 squircle-sm flex items-center justify-center text-3xl shadow-xl shadow-blue-200">📍</div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byBranch.slice(0, 12)} margin={{ top: 20, bottom: 40 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1c1c1e', fontSize: 11, fontWeight: 800 }} height={60} interval={0} angle={-15} textAnchor="end" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,122,255,0.05)', radius: 10 }} />
                <Bar 
                  dataKey="sales" 
                  radius={[12, 12, 0, 0]} 
                  barSize={50} 
                  fill="#007aff"
                  activeBar={<Rectangle fill="#0056b3" stroke="#007AFF" strokeWidth={2} />}
                >
                   {stats.byBranch.map((_, index) => (
                     <Cell key={index} fill={index < 3 ? '#007aff' : 'rgba(0,122,255,0.2)'} style={{ transition: 'all 0.3s' }} />
                   ))}
                   <LabelList dataKey="sales" position="top" style={{ fontSize: 16, fontWeight: 900, fill: '#1c1c1e' }} offset={15} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
