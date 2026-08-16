import React, { useState } from 'react';
import { Camera, Barcode, X, Zap, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export default function CameraScannerModal({ onClose, onScanComplete }) {
  const { products, addToCart, activeMode, systemScope } = usePOS();
  const [simulatedCode, setSimulatedCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Compute effective operating mode based on system deployment scope
  const effectiveMode = systemScope === 'pharmacy_only'
    ? 'pharmacy'
    : systemScope === 'market_only'
    ? 'market'
    : activeMode;

  // Filter products strictly based on effective operating mode
  const scopedProducts = products.filter((p) => {
    if (effectiveMode === 'pharmacy' && p.type !== 'pharmacy') return false;
    if (effectiveMode === 'market' && p.type !== 'market') return false;
    return true;
  });

  const handleSimulatedScan = (code) => {
    const target = scopedProducts.find((p) => p.barcode === code || p.code === code);
    if (target) {
      addToCart(target);
      setStatusMessage(`تم قراءة الباركود بنجاح: ${target.name}`);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setStatusMessage(`لم يتم العثور على منتج بهذا الباركود (${code})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Camera className="w-5 h-5" />
            <span>قارئ الباركود عبر الكاميرا</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Simulation Area */}
        <div className="relative p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[220px]">
          {/* Scanning Animation Frame */}
          <div className="relative w-56 h-40 border-2 border-emerald-500/40 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-900/60 shadow-inner">
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse-glow shadow-lg shadow-emerald-500" />
            <Barcode className="w-20 h-20 text-slate-700 opacity-40" />
            <span className="absolute bottom-2 text-[10px] text-slate-400 font-mono">
              وجه الكاميرا أو اختر باركود محاكي
            </span>
          </div>

          {statusMessage && (
            <div className="mt-3 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Quick Simulated Barcode Test Buttons */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>اختبار محاكاة المسح السريع:</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {scopedProducts.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => handleSimulatedScan(p.barcode)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-right text-xs transition border border-slate-700/60 flex flex-col gap-0.5"
              >
                <span className="font-bold text-slate-200 truncate">{p.name}</span>
                <span className="text-[10px] font-mono text-emerald-400">{p.barcode}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="أدخل الباركود يدوياً للتجربة..."
              value={simulatedCode}
              onChange={(e) => setSimulatedCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSimulatedScan(simulatedCode);
              }}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSimulatedScan(simulatedCode)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
