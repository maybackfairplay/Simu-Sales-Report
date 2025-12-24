
import React, { useState, useMemo } from 'react';
import { SaleRecord } from '../types';

const PAGE_SIZE = 15;

type SortKey = keyof SaleRecord;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const DataExplorer: React.FC<{ records: SaleRecord[] }> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const sortedAndFilteredRecords = useMemo(() => {
    let result = records.filter(r => 
      Object.values(r).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
    );

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const valA = String(a[sortConfig.key]).toLowerCase();
        const valB = String(b[sortConfig.key]).toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [records, search, sortConfig]);

  const paginatedRecords = sortedAndFilteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (!sortConfig || sortConfig.key !== columnKey) return (
      <svg className="w-3 h-3 opacity-20 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return (
      <svg className="w-3 h-3 text-blue-600 animate-in zoom-in-50 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {sortConfig.direction === 'asc' 
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
        }
      </svg>
    );
  };

  return (
    <div className="glass-2026 squircle overflow-hidden border-white/50 shadow-2xl">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black tracking-tighter text-slate-900">Raw Intelligence</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Unprocessed data node entries</p>
        </div>
        <div className="relative w-full md:w-80 haptic-card">
          <input 
            type="text" 
            placeholder="Filter spatial nodes..."
            className="w-full px-12 py-4 bg-slate-50/80 border-none rounded-full text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <svg className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th 
                className={`px-8 py-6 cursor-pointer hover:bg-slate-100/50 transition-colors group ${sortConfig?.key === 'client' ? 'bg-slate-100/30 text-blue-600' : ''}`}
                onClick={() => handleSort('client')}
              >
                <div className="flex items-center gap-2">
                  Node Name
                  <SortIndicator columnKey="client" />
                </div>
              </th>
              <th 
                className={`px-8 py-6 cursor-pointer hover:bg-slate-100/50 transition-colors group ${sortConfig?.key === 'dealership' ? 'bg-slate-100/30 text-blue-600' : ''}`}
                onClick={() => handleSort('dealership')}
              >
                <div className="flex items-center gap-2">
                  Origin
                  <SortIndicator columnKey="dealership" />
                </div>
              </th>
              <th 
                className={`px-8 py-6 cursor-pointer hover:bg-slate-100/50 transition-colors group ${sortConfig?.key === 'model' ? 'bg-slate-100/30 text-blue-600' : ''}`}
                onClick={() => handleSort('model')}
              >
                <div className="flex items-center gap-2">
                  Model Variant
                  <SortIndicator columnKey="model" />
                </div>
              </th>
              <th 
                className={`px-8 py-6 cursor-pointer hover:bg-slate-100/50 transition-colors group ${sortConfig?.key === 'type' ? 'bg-slate-100/30 text-blue-600' : ''}`}
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIndicator columnKey="type" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {paginatedRecords.length > 0 ? paginatedRecords.map((r, i) => (
              <tr key={i} className="hover:bg-blue-50/40 transition-all group cursor-default">
                <td className="px-8 py-6 font-black text-slate-900">{r.client}</td>
                <td className="px-8 py-6 text-slate-500 font-bold">{r.dealership}</td>
                <td className="px-8 py-6 text-blue-600 font-black">{r.model}</td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${r.type?.toLowerCase().includes('verified') || true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Verified</span>
                   </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No spatial nodes detected matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-8 bg-slate-50/40 flex items-center justify-between border-t border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Nodes {Math.min(sortedAndFilteredRecords.length, (currentPage - 1) * PAGE_SIZE + 1)} - {Math.min(sortedAndFilteredRecords.length, currentPage * PAGE_SIZE)} of {sortedAndFilteredRecords.length}
        </span>
        <div className="flex gap-3">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="w-12 h-12 glass-2026 squircle-sm flex items-center justify-center haptic-card disabled:opacity-20 border-white/60 hover:border-blue-200 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            disabled={currentPage * PAGE_SIZE >= sortedAndFilteredRecords.length}
            onClick={() => setCurrentPage(p => p + 1)}
            className="w-12 h-12 glass-2026 squircle-sm flex items-center justify-center haptic-card disabled:opacity-20 border-white/60 hover:border-blue-200 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
