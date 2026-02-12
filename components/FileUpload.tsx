
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => { const f = e.target.files?.[0]; if(f) onUpload(f); }} 
        accept=".csv" 
        className="hidden" 
      />
      <div 
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative group cursor-pointer p-12 rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden ${
          isLoading ? 'cursor-not-allowed border-white/5 opacity-50' : 
          isHovered ? 'border-cyan-500/50 bg-cyan-500/[0.03] scale-[1.01]' : 'border-white/10 bg-white/[0.01]'
        }`}
      >
        <div className="scanline"></div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
            <div className="relative w-12 h-12">
               <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Syncing Intelligence</p>
              <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">Processing Data Streams...</p>
            </div>
          </div>
        ) : (
          <div className="text-center relative z-10">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl border transition-all duration-500 flex items-center justify-center ${
              isHovered ? 'border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.2)]' : 'border-white/10 text-slate-500'
            }`}>
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
               </svg>
            </div>
            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">Neural Uplink Port</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-4">Accepting CSV Datasets</p>
            <div className="flex items-center justify-center gap-2">
               <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
               <div className="w-1 h-1 bg-cyan-400/50 rounded-full"></div>
               <div className="w-1 h-1 bg-cyan-400/20 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
