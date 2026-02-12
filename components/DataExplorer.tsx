
import React, { useState, useMemo, useEffect } from 'react';
import { SaleRecord } from '../types';

const PAGE_SIZE = 10;

interface SortConfig {
  key: keyof SaleRecord;
  direction: 'asc' | 'desc';
}

interface DataExplorerProps {
  records: SaleRecord[];
  externalFilter?: string | null;
  onClearFilter?: () => void;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ records, externalFilter, onClearFilter }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // Advanced Filter State
  const [filterModel, setFilterModel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (externalFilter) {
      setSearch(externalFilter);
      setCurrentPage(1);
    }
  }, [externalFilter]);

  // Extract unique values for dropdowns
  const uniqueModels = useMemo(() => Array.from(new Set(records.map(r => r.model))).sort(), [records]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(records.map(r => r.status))).filter(Boolean).sort(), [records]);

  const filteredRecords = useMemo(() => {
    let result = records.filter(r => {
      // General Search
      const matchesSearch = Object.values(r).some(val => 
        String(val).toLowerCase().includes(search.toLowerCase())
      );
      
      // Model Filter
      const matchesModel = !filterModel || r.model === filterModel;
      
      // Status Filter
      const matchesStatus = !filterStatus || r.status === filterStatus;
      
      // Date Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const recordDate = new Date(r.disbursedOnDate).getTime();
        if (startDate && recordDate < new Date(startDate).getTime()) matchesDate = false;
        if (endDate && recordDate > new Date(endDate).getTime()) matchesDate = false;
      }

      return matchesSearch && matchesModel && matchesStatus && matchesDate;
    });

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const valA = String(a[sortConfig.key] || '').toLowerCase();
        const valB = String(b[sortConfig.key] || '').toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [records, search, filterModel, filterStatus, startDate, endDate, sortConfig]);

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch('');
    setFilterModel('');
    setFilterStatus('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    onClearFilter?.();
  };

  return (
    <div className="neon-card overflow-hidden">
      <div className="p-8 border-b border-[var(--border)] space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[var(--text-main)] uppercase">Source Data Explorer</h3>
            <p className="text-[10px] font-bold text-[var(--text-dim)] tracking-widest uppercase mt-1">Direct Node Inspection</p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-[var(--neon-cyan)] border-[var(--neon-cyan)] text-white' : 'border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--input-bg)]'}`}
          >
            {showFilters ? 'CLOSE_HUD' : 'FILTER_PROTOCOLS'}
          </button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search dealership, model, client..."
            className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--neon-cyan)]/30 transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); if(e.target.value === '') resetFilters(); }}
          />
          <svg className="w-4 h-4 text-[var(--text-dim)] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* HUD Filter Section */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1">Asset Model</label>
              <select 
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2 text-[11px] text-[var(--text-main)] outline-none focus:border-[var(--neon-cyan)]/50 appearance-none font-bold"
                value={filterModel}
                onChange={(e) => { setFilterModel(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Models</option>
                {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1">Current Status</label>
              <select 
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2 text-[11px] text-[var(--text-main)] outline-none focus:border-[var(--neon-cyan)]/50 appearance-none font-bold"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1">Temporal Start</label>
              <input 
                type="date" 
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2 text-[11px] text-[var(--text-main)] outline-none focus:border-[var(--neon-cyan)]/50 font-bold"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1">Temporal End</label>
              <input 
                type="date" 
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2 text-[11px] text-[var(--text-main)] outline-none focus:border-[var(--neon-cyan)]/50 font-bold"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="md:col-span-2 pt-2">
               <button 
                onClick={resetFilters}
                className="text-[9px] font-black text-[var(--neon-pink)] uppercase tracking-[0.2em] hover:text-rose-400 transition-colors flex items-center gap-2"
               >
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                 Clear Global Filters
               </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[var(--bg)]/50">
              <th className="px-8 py-5 text-[var(--text-dim)] uppercase font-black tracking-widest">Client</th>
              <th className="px-8 py-5 text-[var(--text-dim)] uppercase font-black tracking-widest">Dealership</th>
              <th className="px-8 py-5 text-[var(--text-dim)] uppercase font-black tracking-widest">Status</th>
              <th className="px-8 py-5 text-[var(--text-dim)] uppercase font-black tracking-widest text-right">Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {paginatedRecords.length > 0 ? paginatedRecords.map((r, i) => (
              <tr key={i} className="hover:bg-[var(--neon-cyan)]/[0.02] transition-colors group">
                <td className="px-8 py-5 text-[var(--text-main)] font-bold">{r.client}</td>
                <td className="px-8 py-5 text-[var(--text-dim)] font-medium">{r.dealership}</td>
                <td className="px-8 py-5">
                   <span className="px-2 py-0.5 rounded-md bg-[var(--input-bg)] text-[var(--text-dim)] font-mono text-[9px] font-bold uppercase border border-[var(--border)] group-hover:border-[var(--neon-cyan)]/20 transition-all">
                     {r.status || 'N/A'}
                   </span>
                </td>
                <td className="px-8 py-5 text-[var(--neon-cyan)] font-black text-right uppercase tracking-tighter">{r.model}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-[var(--text-dim)] font-black uppercase tracking-[0.4em] italic">
                   No Neural Matches Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-[var(--bg)]/30 flex items-center justify-between border-t border-[var(--border)]">
        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">
          Entry {filteredRecords.length === 0 ? 0 : Math.min(filteredRecords.length, (currentPage - 1) * PAGE_SIZE + 1)} - {Math.min(filteredRecords.length, currentPage * PAGE_SIZE)} / {filteredRecords.length}
        </span>
        <div className="flex gap-4">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-full text-[var(--text-main)] hover:bg-[var(--input-bg)] disabled:opacity-20 transition-all hover:border-[var(--neon-cyan)]/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button 
            disabled={currentPage * PAGE_SIZE >= filteredRecords.length}
            onClick={() => setCurrentPage(p => p + 1)}
            className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-full text-[var(--text-main)] hover:bg-[var(--input-bg)] disabled:opacity-20 transition-all hover:border-[var(--neon-cyan)]/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
