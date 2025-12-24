
import React, { useRef } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="w-full">
      <input type="file" ref={fileInputRef} onChange={handleChange} accept=".csv" className="hidden" />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className={`w-full group relative flex flex-col items-center justify-center p-16 rounded-[2rem] transition-all duration-700 ${
          isLoading 
            ? 'bg-slate-50/50 border border-slate-100 cursor-not-allowed' 
            : 'bg-indigo-50/30 border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 cursor-pointer'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-6">
               <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-900 font-black tracking-tight text-xl">Ingesting Data</p>
            <p className="text-slate-400 text-sm font-bold mt-2">Reconciling regional records...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 w-16 h-16 bg-white shadow-lg rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-indigo-50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Deploy Dataset</h3>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Select Management CSV</p>
            <div className="mt-8 px-4 py-2 bg-white rounded-full text-[10px] font-black text-slate-400 border border-slate-100 group-hover:border-indigo-200 transition-colors">
              Drag & Drop Enabled
            </div>
          </>
        )}
      </button>
    </div>
  );
};
