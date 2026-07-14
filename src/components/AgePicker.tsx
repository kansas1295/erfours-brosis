import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

interface AgePickerProps {
  /** Selected age (as string representing numeric day, e.g. "15") */
  age: string;
  /** Callback triggered when a new age is selected */
  onAgeChange: (newAge: string) => void;
  /** Custom label displayed above the button */
  label?: string;
}

export const AgePicker: React.FC<AgePickerProps> = ({
  age,
  onAgeChange,
  label = 'Umur Panen / Hari Ini',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the popup when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-1.5 relative w-full" ref={containerRef} id="age-picker-container">
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight">
          {label}
        </label>
      )}
      
      {/* Target button element */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-300 rounded-lg py-2 px-3 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-black flex justify-between items-center transition-all h-[46px] bg-white text-slate-800"
        id="age-picker-trigger-button"
      >
        <span>{age ? `HARI KE-${age}` : 'PILIH UMUR HARIAN'}</span>
        <Calendar className="text-emerald-600 shrink-0" size={18} />
      </button>
      
      {/* Slide-out / Drop-down custom calendar table */}
      {isOpen && (
        <div 
          className="absolute z-50 left-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-3 w-[272px] max-w-sm"
          id="age-picker-popup"
        >
          <div className="flex items-center justify-between border-b border-slate-150 pb-1.5 mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Tabel Umur Kumulatif
            </span>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 border border-slate-100 rounded p-1 transition-colors"
              id="age-picker-close-button"
            >
              <X size={12} />
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg scrollbar-thin bg-white" id="age-picker-list-wrapper">
            <table className="w-full text-left text-xs font-mono border-collapse" id="age-picker-table">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase">HARI</th>
                  <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase">FASE</th>
                  <th className="py-2 px-3 text-center text-[9px] font-black text-slate-500 uppercase">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 50 }, (_, i) => {
                  const currentNum = (i + 1).toString();
                  const isSelected = age === currentNum;
                  
                  // Phase classification based on day
                  let fase = 'STARTER';
                  let faseColor = 'text-amber-600 bg-amber-50 border border-amber-100';
                  if (i + 1 > 28) {
                    fase = 'FINISHER';
                    faseColor = 'text-rose-600 bg-rose-50 border border-rose-100';
                  } else if (i + 1 > 14) {
                    fase = 'GROWER';
                    faseColor = 'text-blue-600 bg-blue-50 border border-blue-100';
                  }

                  return (
                    <tr 
                      key={currentNum}
                      onClick={() => {
                        onAgeChange(currentNum);
                        setIsOpen(false);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 font-black text-slate-800">Hari {currentNum}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${faseColor}`}>
                          {fase}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          className={`px-2 py-0.5 text-[9px] rounded font-black transition-all ${
                            isSelected 
                              ? 'bg-emerald-600 text-white shadow-xs scale-105' 
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isSelected ? 'AKTIF' : 'PILIH'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
