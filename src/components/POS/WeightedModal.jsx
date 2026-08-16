import React, { useState } from 'react';
import { Scale, X, Check, Calculator } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { usePOS } from '../../context/POSContext';

export default function WeightedModal({ product, onClose }) {
  const { addToCart } = usePOS();
  
  // Modes: 'grams' (بالجرام), 'kg' (بالكيلوجرام), 'amount' (بالمبلغ)
  const [calcMode, setCalcMode] = useState('grams');
  const [weightGrams, setWeightGrams] = useState('250');
  const [weightKg, setWeightKg] = useState('0.250');
  const [desiredAmount, setDesiredAmount] = useState('');

  if (!product) return null;

  const unitPrice = product.price || 0;

  // Calculate net quantity in KG and final total price
  let finalQtyKg = 0;
  let finalTotal = 0;

  if (calcMode === 'grams') {
    const g = parseFloat(weightGrams) || 0;
    finalQtyKg = g / 1000;
    finalTotal = finalQtyKg * unitPrice;
  } else if (calcMode === 'kg') {
    finalQtyKg = Math.max(0.001, parseFloat(weightKg) || 0);
    finalTotal = finalQtyKg * unitPrice;
  } else {
    const amt = parseFloat(desiredAmount) || 0;
    finalTotal = amt;
    finalQtyKg = unitPrice > 0 ? amt / unitPrice : 0;
  }

  const handlePresetGrams = (gramsVal) => {
    setCalcMode('grams');
    setWeightGrams(gramsVal.toString());
    setWeightKg((gramsVal / 1000).toString());
  };

  const handleConfirmAdd = () => {
    if (finalQtyKg <= 0) {
      alert('يرجى إدخال وزن أو مبلغ صحيح');
      return;
    }
    addToCart(product, null, Number(finalQtyKg.toFixed(3)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-base">
            <Scale className="w-5 h-5" />
            <span>حاسبة البيع بالوزن والجرامات ⚖️</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Product Header Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{product.image || '🍎'}</span>
              <div>
                <h3 className="font-extrabold text-sm text-white">{product.name}</h3>
                <p className="text-xs text-slate-400">سعر الكيلو: <span className="text-emerald-400 font-bold">{formatCurrency(unitPrice)} / كجم</span></p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              صنف ميزان
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setCalcMode('grams')}
              className={`py-2 rounded-xl transition ${
                calcMode === 'grams'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚖️ بالجرام (g)
            </button>

            <button
              onClick={() => setCalcMode('kg')}
              className={`py-2 rounded-xl transition ${
                calcMode === 'kg'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🥦 بالكيلو (kg)
            </button>

            <button
              onClick={() => setCalcMode('amount')}
              className={`py-2 rounded-xl transition ${
                calcMode === 'amount'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💵 بالمبلغ (ج.م)
            </button>
          </div>

          {/* Inputs */}
          {calcMode === 'grams' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الوزن بالجرام (Gram):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10"
                    value={weightGrams}
                    onChange={(e) => {
                      setWeightGrams(e.target.value);
                      const g = parseFloat(e.target.value) || 0;
                      setWeightKg((g / 1000).toString());
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xl font-black text-amber-400 focus:outline-none focus:border-amber-500"
                    placeholder="مثال: 250"
                    autoFocus
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    جرام (g)
                  </span>
                </div>
              </div>

              {/* Quick Gram Presets */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '100 جرام', val: 100 },
                  { label: '250 جرام (ربع)', val: 250 },
                  { label: '500 جرام (نصف)', val: 500 },
                  { label: '750 جرام (3/4)', val: 750 },
                  { label: '1000 جرام (1k)', val: 1000 },
                  { label: '1500 جرام (1.5k)', val: 1500 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetGrams(preset.val)}
                    className="py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/40 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {calcMode === 'kg' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الوزن بالكيلوجرام (Kg):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    value={weightKg}
                    onChange={(e) => {
                      setWeightKg(e.target.value);
                      const kg = parseFloat(e.target.value) || 0;
                      setWeightGrams((kg * 1000).toString());
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xl font-black text-amber-400 focus:outline-none focus:border-amber-500"
                    placeholder="مثال: 0.250"
                    autoFocus
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    كجم (kg)
                  </span>
                </div>
              </div>

              {/* Quick Weight Presets */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '0.250 كجم', val: 0.25 },
                  { label: '0.500 كجم', val: 0.5 },
                  { label: '0.750 كجم', val: 0.75 },
                  { label: '1.000 كجم', val: 1.0 },
                  { label: '1.500 كجم', val: 1.5 },
                  { label: '2.000 كجم', val: 2.0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setCalcMode('kg');
                      setWeightKg(preset.val.toString());
                      setWeightGrams((preset.val * 1000).toString());
                    }}
                    className="py-2 px-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/40 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {calcMode === 'amount' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المبلغ المطلوب دفعه (جنيه):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    value={desiredAmount}
                    onChange={(e) => setDesiredAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xl font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                    placeholder="مثال: 20"
                    autoFocus
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ج.م
                  </span>
                </div>
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

          {/* Dynamic Calculation Result Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>الوزن المحسوب بالجرامات / الكيلو:</span>
              <span className="font-bold text-slate-200">
                {(finalQtyKg * 1000).toFixed(0)} جرام ({finalQtyKg.toFixed(3)} كجم)
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
              <span className="text-xs text-slate-300 font-bold">السعر النهائي المطلوب:</span>
              <span className="text-xl font-black text-amber-400">{formatCurrency(finalTotal)}</span>
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
