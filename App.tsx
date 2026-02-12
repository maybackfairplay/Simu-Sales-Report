
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { AIReport } from './components/AIReport';
import { DataExplorer } from './components/DataExplorer';
import { TrendAnalysis } from './components/TrendAnalysis';
import { WhatsAppReport } from './components/WhatsAppReport';
import { AIAnalystTerminal } from './components/AIAnalystTerminal';
import { MultiTrendChart } from './components/MultiTrendChart';
import { SaleRecord, DashboardStats, StatusMetrics, AggregatedData, ReportMetadata } from './types';
import { parseCSV } from './utils/csvParser';
import { dbService } from './services/NeuralDatabase';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface StatCardConfig {
  id: string;
  label: string;
  color: 'cyan' | 'emerald' | 'rose' | 'amber';
  sub: string;
  getValue: (s: DashboardStats) => string | number;
  getPrevValue?: (s: DashboardStats) => number | undefined;
}

const DEFAULT_CARD_ORDER: StatCardConfig[] = [
  { 
    id: 'total-units', 
    label: 'Total Units', 
    color: 'cyan', 
    sub: 'Consolidated Volume', 
    getValue: (s) => s.totalSales,
  },
  { 
    id: 'dominant-node', 
    label: 'Dominant Node', 
    color: 'emerald', 
    sub: 'Leaderboard Peak', 
    getValue: (s) => s.topDealer 
  },
  { 
    id: 'validation-queue', 
    label: 'Validation Queue', 
    color: 'rose', 
    sub: 'Pending Verification', 
    getValue: (s) => s.metrics.pendingSoftware 
  },
  { 
    id: 'strategic-hub', 
    label: 'Strategic Hub', 
    color: 'amber', 
    sub: 'Max Density Vector', 
    getValue: (s) => s.topBranch 
  },
];

const App: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [historyStats, setHistoryStats] = useState<DashboardStats[]>([]);
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [focusFilter, setFocusFilter] = useState<string | null>(null);
  const [isGlobalFocusMode, setIsGlobalFocusMode] = useState(false);
  
  const [cardOrder, setCardOrder] = useState<StatCardConfig[]>(DEFAULT_CARD_ORDER);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const fullDashboardRef = useRef<HTMLDivElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
    const savedOrder = localStorage.getItem('simu-card-order');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder) as string[];
        const sorted = [...DEFAULT_CARD_ORDER].sort((a, b) => orderIds.indexOf(a.id) - orderIds.indexOf(b.id));
        setCardOrder(sorted);
      } catch (e) {
        console.error("Failed to load card order", e);
      }
    }
  }, []);

  const loadHistory = async () => {
    const data = await dbService.getReports();
    setReports(data);
    if (data.length > 0 && !stats) {
      loadReport(data[0].id);
    }
  };

  const loadReport = async (id: string) => {
    setIsLoading(true);
    try {
      const current = await dbService.getReportStats(id);
      const historyMetadata = await dbService.getReports();
      const currentIndex = historyMetadata.findIndex(h => h.id === id);
      
      const historyRange = historyMetadata.slice(currentIndex, currentIndex + 15);
      const fetchedStats = await Promise.all(
        historyRange.map(async (h) => {
          const s = await dbService.getReportStats(h.id);
          return s ? ({ ...s, timestamp: h.timestamp } as DashboardStats) : null;
        })
      );
      
      const filteredHistory = fetchedStats.filter((s): s is DashboardStats => s !== null);
      
      setHistoryStats(filteredHistory);
      if (current) {
        const currentMeta = historyMetadata.find(h => h.id === id);
        setStats({ ...current, timestamp: currentMeta?.timestamp });
      }
    } finally {
      setIsLoading(false);
      setIsHistoryOpen(false);
    }
  };

  const deleteReport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await dbService.deleteReport(id);
    if (stats?.id === id) setStats(null);
    loadHistory();
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setFocusFilter(null);
    try {
      const parsedRecords = await parseCSV(file);
      const filtered = parsedRecords.filter(r => (r.type || '').toLowerCase().includes('mobile device'));

      const dealerMap: Record<string, number> = {}; 
      const shopMap: Record<string, number> = {};   
      const modelMap: Record<string, number> = {};
      const branchMap: Record<string, number> = {}; 
      const dealerRelationalMap: Record<string, Record<string, number>> = {};

      const metrics: StatusMetrics = {
        pendingETR: 0,
        pendingSoftware: 0,
        paymentStage: 0,
        reprocessStage: 0
      };

      filtered.forEach(r => {
        const rawFull = (r.dealership || 'Unknown').trim();
        const parts = rawFull.split(',');
        const dealerName = parts[0].trim();
        const shopName = parts.length > 1 ? parts.slice(1).join(',').trim() : 'Main Office';
        const m = (r.model || 'Unknown').trim();
        const b = (r.branchOffice || 'Unknown').trim();
        const s = (r.status || '').toLowerCase();

        dealerMap[dealerName] = (dealerMap[dealerName] || 0) + 1;
        shopMap[shopName] = (shopMap[shopName] || 0) + 1;
        modelMap[m] = (modelMap[m] || 0) + 1;
        branchMap[b] = (branchMap[b] || 0) + 1;

        if (!dealerRelationalMap[dealerName]) dealerRelationalMap[dealerName] = {};
        dealerRelationalMap[dealerName][shopName] = (dealerRelationalMap[dealerName][shopName] || 0) + 1;

        if (s.includes('etr')) metrics.pendingETR++;
        if (s.includes('software')) metrics.pendingSoftware++;
        if (s.includes('payment')) metrics.paymentStage++;
        if (s.includes('reprocess') || s.includes('agreement')) metrics.reprocessStage++;
      });

      const sortBySales = (a: [string, number], b: [string, number]) => b[1] - a[1];
      const sortedDealers = Object.entries(dealerMap).sort(sortBySales);
      const sortedShops = Object.entries(shopMap).sort(sortBySales);
      const sortedModels = Object.entries(modelMap).sort(sortBySales);
      const sortedBranches = Object.entries(branchMap).sort(sortBySales);

      const finalDealerShopMap: Record<string, AggregatedData[]> = {};
      Object.entries(dealerRelationalMap).forEach(([dName, sMap]) => {
        finalDealerShopMap[dName] = Object.entries(sMap).sort(sortBySales).map(([sName, count]) => ({ name: sName, sales: count }));
      });

      const newStats: DashboardStats = {
        byDealer: sortedDealers.map(([name, sales]) => ({ name, sales })),
        byShop: sortedShops.map(([name, sales]) => ({ name, sales })),
        byModel: sortedModels.map(([name, sales]) => ({ name, sales })),
        byBranch: sortedBranches.map(([name, sales]) => ({ name, sales })),
        dealerShopMap: finalDealerShopMap,
        totalSales: filtered.length,
        topDealer: sortedDealers[0]?.[0] || 'N/A',
        topShop: sortedShops[0]?.[0] || 'N/A',
        topModel: sortedModels[0]?.[0] || 'N/A',
        topBranch: sortedBranches[0]?.[0] || 'N/A',
        rawRecords: filtered,
        metrics,
        healthScore: 100
      };

      const savedId = await dbService.saveReport(newStats, file.name);
      newStats.id = savedId;
      setStats(newStats);
      loadHistory();
      loadReport(savedId);
    } catch (error) {
      console.error(error);
      alert("System Overload: Processing Failure.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportPDF = async () => {
    if (!fullDashboardRef.current) return;
    setIsExporting(true);
    try {
      const isLight = document.body.classList.contains('light');
      const canvas = await html2canvas(fullDashboardRef.current, { 
        scale: 2, 
        backgroundColor: isLight ? '#f8fafc' : '#030712', 
        useCORS: true 
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));
      pdf.save(`Strategic_Audit_${Date.now()}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const onDragStart = (index: number) => setDraggedItemIndex(index);

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newOrder = [...cardOrder];
    const item = newOrder.splice(draggedItemIndex, 1)[0];
    newOrder.splice(index, 0, item);
    setCardOrder(newOrder);
    setDraggedItemIndex(index);
  };

  const onDragEnd = () => {
    setDraggedItemIndex(null);
    localStorage.setItem('simu-card-order', JSON.stringify(cardOrder.map(c => c.id)));
  };

  const dimClass = "transition-all duration-700 " + (isGlobalFocusMode ? "opacity-10 blur-[2px] pointer-events-none scale-95" : "opacity-100");

  const prevStats = historyStats.length > 1 ? historyStats[1] : null;

  return (
    <div className="min-h-screen transition-all duration-500">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 pt-32 pb-24">
        {!stats && reports.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-full max-w-xl text-center space-y-10 animate-stagger">
              <div className="relative w-24 h-24 mx-auto mb-12">
                 <div className="absolute inset-0 bg-[var(--neon-cyan)]/10 rounded-full blur-3xl animate-pulse"></div>
                 <div className="relative w-full h-full bg-[var(--card)] border border-[var(--border)] rounded-[32px] flex items-center justify-center shadow-2xl backdrop-blur-xl">
                    <svg className="w-10 h-10 text-[var(--neon-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
              </div>
              <div>
                <h1 className="text-6xl font-black tracking-tight mb-4 text-[var(--text-main)] uppercase italic">
                  WATU <span className="text-[var(--neon-cyan)]">INTEL</span>
                </h1>
                <p className="text-[var(--text-dim)] text-xs font-bold tracking-[0.4em] uppercase">Tactical Performance Synchronization</p>
              </div>
              <div className="p-8 neon-card border-[var(--border)]">
                <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[var(--text-main)]/[0.01] p-8 rounded-[32px] border border-[var(--border)] backdrop-blur-md transition-all duration-500 ${dimClass}`}>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-lime)] shadow-[0_0_8px_var(--neon-lime)]"></div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[var(--neon-lime)] uppercase">SYNCHRONIZED_ACTIVE</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight text-[var(--text-main)] uppercase">
                  WATU DAILY <span className="text-[var(--neon-cyan)]">SALES</span>
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input type="file" ref={hiddenFileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) handleFileUpload(f); }} accept=".csv" className="hidden" />
                <button onClick={() => setIsHistoryOpen(true)} className="btn-neon">Archives</button>
                <button onClick={() => hiddenFileInputRef.current?.click()} className="btn-neon">Uplink New Data</button>
                <button onClick={() => setIsWhatsAppOpen(true)} className="btn-neon btn-neon-cyan group">
                   Dispatch Hub
                </button>
                <button onClick={exportPDF} className="btn-neon hover:bg-[var(--text-main)]/10">{isExporting ? 'Generating...' : 'Archive PDF'}</button>
              </div>
            </div>

            {stats && (
              <div ref={fullDashboardRef} className="space-y-12 animate-stagger">
                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ${dimClass}`}>
                  {cardOrder.map((config, index) => {
                    let prevValue = undefined;
                    if (config.id === 'total-units') prevValue = prevStats?.totalSales;
                    if (config.id === 'validation-queue') prevValue = prevStats?.metrics.pendingSoftware;

                    return (
                      <StatCard 
                        key={config.id}
                        label={config.label}
                        value={config.getValue(stats)}
                        prevValue={prevValue}
                        color={config.color}
                        sub={config.sub}
                        isDragging={draggedItemIndex === index}
                        onDragStart={() => onDragStart(index)}
                        onDragOver={(e) => onDragOver(e, index)}
                        onDragEnd={onDragEnd}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  <div className="xl:col-span-8 space-y-12">
                     <div className={dimClass}>
                        <MultiTrendChart history={historyStats} />
                     </div>
                     <Dashboard 
                        stats={stats} 
                        prevStats={prevStats} 
                        focusFilter={focusFilter} 
                        onFocus={setFocusFilter} 
                        isGlobalFocusMode={isGlobalFocusMode}
                        onToggleGlobalFocusMode={() => setIsGlobalFocusMode(!isGlobalFocusMode)}
                      />
                     <div className={dimClass}>
                        <AIReport stats={stats} history={historyStats} />
                     </div>
                  </div>
                  <div className={`xl:col-span-4 space-y-12 transition-all duration-500 ${dimClass}`}>
                     <AIAnalystTerminal stats={stats} />
                     {prevStats && <TrendAnalysis stats={stats} prevStats={prevStats} />}
                     <DataExplorer records={stats.rawRecords} externalFilter={focusFilter} onClearFilter={() => setFocusFilter(null)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 transition-all">
          <div className="neon-card w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border-[var(--border)]">
            <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--text-main)]/[0.02]">
              <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Intelligence Archives</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 custom-scroll space-y-4">
              {reports.length === 0 ? (
                <div className="py-20 text-center text-[var(--text-dim)] font-bold uppercase tracking-widest text-[10px]">Archives Empty</div>
              ) : reports.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => loadReport(r.id)}
                  className={`group p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${stats?.id === r.id ? 'border-[var(--neon-cyan)]/50 bg-[var(--neon-cyan)]/5' : 'border-[var(--border)] bg-[var(--text-main)]/[0.02] hover:bg-[var(--text-main)]/[0.05]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stats?.id === r.id ? 'border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)]' : 'border-[var(--border)] text-[var(--text-dim)]'}`}>
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-tight">{r.filename}</p>
                      <p className="text-[10px] text-[var(--text-dim)] font-mono font-bold uppercase tracking-widest mt-1">
                        {new Date(r.timestamp).toLocaleDateString()} • {r.totalSales} UNITS
                      </p>
                    </div>
                  </div>
                  <button onClick={(e) => deleteReport(e, r.id)} className="p-2 text-[var(--neon-pink)] opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isWhatsAppOpen && stats && <WhatsAppReport stats={stats} onClose={() => setIsWhatsAppOpen(false)} />}
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  prevValue?: number; 
  color: string; 
  sub: string;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}> = ({ label, value, prevValue, color, sub, isDragging, onDragStart, onDragOver, onDragEnd }) => {
  const colorMap: Record<string, string> = { 
    cyan: 'border-[var(--neon-cyan)]', 
    emerald: 'border-[var(--neon-lime)]', 
    rose: 'border-[var(--neon-pink)]', 
    amber: 'border-[var(--neon-amber)]' 
  };
  const glowMap: Record<string, string> = { 
    cyan: 'text-[var(--neon-cyan)]', 
    emerald: 'text-[var(--neon-lime)]', 
    rose: 'text-[var(--neon-pink)]', 
    amber: 'text-[var(--neon-amber)]' 
  };
  const delta = prevValue !== undefined && typeof value === 'number' ? value - prevValue : null;
  const isUp = delta !== null && delta >= 0;
  const percent = delta !== null && prevValue !== 0 ? Math.abs((delta / (prevValue || 1)) * 100).toFixed(0) : null;
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`neon-card p-8 border-l-4 ${colorMap[color] || 'border-[var(--border)]'} group cursor-grab active:cursor-grabbing transition-all duration-300 ${isDragging ? 'opacity-30 scale-95 border-dashed border-[var(--border)]' : 'opacity-100 scale-100'}`}
    >
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-center gap-2">
           {delta !== null && (
            <div className={`px-2 py-1 rounded-md text-[9px] font-black font-mono flex items-center gap-1 ${isUp ? 'bg-[var(--neon-lime)]/10 text-[var(--neon-lime)]' : 'bg-[var(--neon-pink)]/10 text-[var(--neon-pink)]'}`}>
               {isUp ? '▲' : '▼'} {percent}%
            </div>
          )}
        </div>
      </div>
      <div className={`text-4xl font-black tracking-tight truncate ${glowMap[color]} mb-3 transition-colors duration-500`}>{value}</div>
      <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.1em]">{sub}</p>
    </div>
  );
};

export default App;
