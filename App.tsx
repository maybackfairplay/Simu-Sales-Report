
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { AIReport } from './components/AIReport';
import { DataExplorer } from './components/DataExplorer';
import { TrendAnalysis } from './components/TrendAnalysis';
import { SaleRecord, DashboardStats } from './types';
import { parseCSV } from './utils/csvParser';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [prevStats, setPrevStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [appIcon, setAppIcon] = useState<string | null>(localStorage.getItem('spatial_app_icon'));
  
  const fullDashboardRef = useRef<HTMLDivElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const synthesizeIdentity = async () => {
      if (appIcon) {
        updateFavicon(appIcon);
        return;
      }
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = "A futuristic, 3D app icon for AutoSales Management Insights. Sleek car profile, glowing data nodes, Apple Vision Pro spatial aesthetic, glassmorphism, azure/indigo gradients, 1024x1024.";
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64Data = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setAppIcon(base64Data);
            localStorage.setItem('spatial_app_icon', base64Data);
            updateFavicon(base64Data);
            break;
          }
        }
      } catch (error) {
        console.error("Spatial Identity Link Failure", error);
      }
    };
    synthesizeIdentity();
  }, [appIcon]);

  const updateFavicon = (href: string) => {
    const link: any = document.getElementById('dynamic-favicon');
    if (link) link.href = href;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const parsedRecords = await parseCSV(file);
      const filtered = parsedRecords.filter(r => (r.type || '').toLowerCase().includes('mobile device'));

      const dealerMap: Record<string, number> = {}; // Individual shops (Full Name)
      const shopMap: Record<string, number> = {};   // Dealership groups (Prefix before comma)
      const modelMap: Record<string, number> = {};
      const branchMap: Record<string, number> = {}; // Towns

      filtered.forEach(r => {
        const rawFull = (r.dealership || 'Unknown').trim();
        const dealerGroup = rawFull.includes(',') ? rawFull.split(',')[0].trim() : rawFull;
        const m = (r.model || 'Unknown').trim();
        const b = (r.branchOffice || 'Unknown').trim();

        dealerMap[rawFull] = (dealerMap[rawFull] || 0) + 1;
        shopMap[dealerGroup] = (shopMap[dealerGroup] || 0) + 1;
        modelMap[m] = (modelMap[m] || 0) + 1;
        branchMap[b] = (branchMap[b] || 0) + 1;
      });

      const sortBySales = (a: [string, number], b: [string, number]) => b[1] - a[1];
      const sortedDealers = Object.entries(dealerMap).sort(sortBySales);
      const sortedShops = Object.entries(shopMap).sort(sortBySales);
      const sortedModels = Object.entries(modelMap).sort(sortBySales);
      const sortedBranches = Object.entries(branchMap).sort(sortBySales);

      const newStats: DashboardStats = {
        byDealer: sortedDealers.map(([name, sales]) => ({ name, sales })),
        byShop: sortedShops.map(([name, sales]) => ({ name, sales })),
        byModel: sortedModels.map(([name, sales]) => ({ name, sales })),
        byBranch: sortedBranches.map(([name, sales]) => ({ name, sales })),
        totalSales: filtered.length,
        topDealer: sortedDealers[0]?.[0] || 'N/A',
        topShop: sortedShops[0]?.[0] || 'N/A',
        topModel: sortedModels[0]?.[0] || 'N/A',
        topBranch: sortedBranches[0]?.[0] || 'N/A',
        rawRecords: filtered
      };

      if (stats) setPrevStats(stats);
      setStats(newStats);
    } catch (error) {
      alert("Spatial Synthesis Error: Please verify CSV structure.");
    } finally {
      setIsLoading(false);
    }
  }, [stats]);

  const handleReset = () => {
    if (window.confirm("Purge spatial data session?")) {
      setStats(null);
      setPrevStats(null);
    }
  };

  const exportPDF = async () => {
    if (!fullDashboardRef.current) return;
    setIsExporting(true);
    try {
      document.body.classList.add('export-mode');
      const canvas = await html2canvas(fullDashboardRef.current, { scale: 2, useCORS: true, backgroundColor: '#f2f2f7' });
      document.body.classList.remove('export-mode');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`AutoSales_NeuroAudit_${Date.now()}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-24 selection:bg-blue-100 selection:text-blue-900">
      <Header appIcon={appIcon} />
      <main className="flex-grow container mx-auto px-6 pb-24 max-w-7xl">
        {!stats ? (
          <div className="mt-20 flex flex-col items-center stagger-in">
            <div className="glass-2026 squircle p-16 md:p-24 text-center max-w-3xl w-full haptic-card glow-blue">
              <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-blue-400/30 overflow-hidden">
                {appIcon ? (
                  <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-white/20 animate-pulse rounded-xl" />
                )}
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-6">Neural Inflow</h1>
              <p className="text-slate-500 font-semibold text-lg mb-12 uppercase tracking-widest">Awaiting spatial dataset deployment.</p>
              <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 px-6">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                  <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Spatial Intelligence Active</span>
                </div>
                <h2 className="text-7xl font-black tracking-tighter text-spatial leading-[0.9]">Sales Matrix</h2>
              </div>
              <div className="flex gap-4 p-2 glass-2026 squircle-sm border-white/50">
                <input type="file" ref={hiddenFileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) handleFileUpload(f); }} accept=".csv" className="hidden" />
                <button onClick={handleReset} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 transition-colors">Reset</button>
                <button onClick={() => hiddenFileInputRef.current?.click()} className="px-8 py-4 glass-2026 squircle-sm text-[11px] font-black uppercase tracking-widest text-blue-600 haptic-card border-blue-100">Upload New</button>
                <button onClick={exportPDF} className="px-10 py-4 bg-black text-white squircle-sm text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-black/30 haptic-card">Export Audit</button>
              </div>
            </div>

            <div ref={fullDashboardRef} className="space-y-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-in">
                <SpatialMetricTile title="Global Sales" value={stats.totalSales} sub="Unit Velocity" icon="📈" color="blue" />
                <SpatialMetricTile title="Top Shop" value={stats.topDealer} sub="Full Individual Lead" icon="🏛️" color="indigo" />
                <SpatialMetricTile title="Top Dealership" value={stats.topShop} sub="Aggregate Group Lead" icon="🏬" color="rose" />
                <SpatialMetricTile title="Top Town" value={stats.topBranch} sub="Regional Apex" icon="📍" color="emerald" />
              </div>

              <AIReport stats={stats} prevStats={prevStats} />

              {prevStats && (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                   <TrendAnalysis stats={stats} prevStats={prevStats} />
                </div>
              )}

              <Dashboard stats={stats} prevStats={prevStats} />

              <div className="no-export">
                <DataExplorer records={stats.rawRecords} />
              </div>
            </div>
          </div>
        )}
      </main>

      {(isExporting || isLoading) && (
        <div className="fixed inset-0 z-[999] bg-white/60 backdrop-blur-[100px] flex items-center justify-center animate-in fade-in duration-500">
          <div className="text-center">
            <div className="w-24 h-24 bg-black squircle flex items-center justify-center animate-spin mx-auto mb-10 shadow-3xl">
               <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <h3 className="text-3xl font-black text-black tracking-tighter">
              {isLoading ? 'Synthesizing Neural Matrix...' : 'Encoding Briefing...'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

const SpatialMetricTile: React.FC<{ title: string; value: string | number; sub: string; icon: string; color: string }> = ({ title, value, sub, icon, color }) => {
  const colorSchemes: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-100/30 glow-blue',
    indigo: 'text-indigo-600 bg-indigo-100/30 glow-indigo',
    rose: 'text-rose-600 bg-rose-100/30 border-rose-100',
    emerald: 'text-emerald-600 bg-emerald-100/30 border-emerald-100',
  };
  return (
    <div className={`glass-2026 p-10 squircle haptic-card group relative overflow-hidden ${colorSchemes[color]}`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{title}</span>
          <div className="w-12 h-12 glass-2026 squircle-sm flex items-center justify-center text-xl shadow-inner">{icon}</div>
        </div>
        <div className="mb-10">
          <div className={`font-black text-slate-900 tracking-tighter truncate leading-none ${String(value).length > 15 ? 'text-xl' : 'text-4xl'}`}>
            {value}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">{sub}</div>
        </div>
      </div>
    </div>
  );
};

export default App;
