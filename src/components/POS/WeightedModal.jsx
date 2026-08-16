import React, { useState } from 'react';
import { Scale, X, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { usePOS } from '../../context/POSContext';

export default function WeightedModal({ product, onClose }) {
  const { addToCart } = usePOS();
  
  // Modes: 'weight' (بالكيلو/جرام), 'amount' (بالمبلغ)
  const [calcMode, setCalcMode] = useState('weight');
  const [weightKg, setWeightKg] = useState('1.000');
  const [desiredAmount, setDesiredAmount] = useState('');

  if (!product) return null;

  const unitPrice = product.price || 0;

  // Calculate net quantity and total
  let finalQty = 1;
  let finalTotal = 0;

  if (calcMode === 'weight') {
    finalQty = Math.max(0.001, parseFloat(weightKg) || 0);
    finalTotal = finalQty * unitPrice;
  } else {
    const amt = parseFloat(desiredAmount) || 0;
    finalTotal = amt;
    finalQty = unitPrice > 0 ? amt / unitPrice : 0;
  }

  const handlePresetWeight = (kgVal) => {
    setCalcMode('weight');
    setWeightKg(kgVal.toString());
  };

  const handleConfirmAdd = () => {
    if (finalQty <= 0) {
      alert('يرجى إدخال وزن أو مبلغ صحيح');
      return;
    }
    addToCart(product, null, Number(finalQty.toFixed(3)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-base">
            <Scale className="w-5 h-5" />
            <span>حاسبة البيع بالوزن والميزان</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Product Header Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{product.image || '🍎'}</span>
              <div>
                <h3 className="font-extrabold text-sm text-white">{product.name}</h3>
                <p className="text-xs text-slate-400">سعر الكيلو: <span className="text-emerald-400 font-bold">{formatCurrency(unitPrice)}</span></p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              ميزان
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setCalcMode('weight')}
              className={`py-2 rounded-xl transition ${
                calcMode === 'weight'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚖️ حساب بالوزن (كجم)
            </button>
            <button
              onClick={() => setCalcMode('amount')}
              className={`py-2 rounded-xl transition ${
                calcMode === 'amount'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💵 حساب بالمبلغ (جنية)
            </button>
          </div>

          {/* Inputs */}
          {calcMode === 'weight' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الوزن المطلوب بالكيلوجرام (كجم):
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-lg font-black text-amber-400 focus:outline-none focus:border-amber-500"
                  placeholder="مثال: 0.750"
                  autoFocus
                />
              </div>

              {/* Quick Weight Presets */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '250 جرام', val: 0.25 },
                  { label: 'نصف كيلو (500g)', val: 0.5 },
                  { label: '750 جرام', val: 0.75 },
                  { label: '1 كيلو', val: 1.0 },
                  { label: '1.5 كيلو', val: 1.5 },
                  { label: '2 كيلو', val: 2.0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetWeight(preset.val)}
                    className="py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/40 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المبلغ المطلوب دفعه (جنيه):
                </label>
                <input
                  type="number"
                  step="5"
                  value={desiredAmount}
                  onChange={(e) => setDesiredAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                  placeholder="مثال: 50"
                  autoFocus
                />
              </div>

              {/* Quick Amount Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setCalcMode('amount');
                      setDesiredAmount(amt.toString());
                    }}
                    className="py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition"
                  >
                    {amt} ج.م
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calculation Result Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-bold">الوزن المحسوب:</span>
              <span className="text-base font-black text-white">{finalQty.toFixed(3)} كجم</span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block font-bold">السعر الإجمالي:</span>
              <span className="text-lg font-black text-amber-400">{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirmAdd}
            className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-orange-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>إضافة للسلة ({formatCurrency(finalTotal)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
