import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Scale, Search, Plus, UtensilsCrossed, CheckCircle2, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import WeightedModal from './WeightedModal';

export default function AlMaidaScreen() {
  const { products, addToCart } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [weightedTarget, setWeightedTarget] = useState(null);

  // Filter Al-Maida deli / refrigerated products
  const deliProducts = products.filter((p) => {
    const isDeliCategory = p.category === 'قسم المائدة والتلاجة' || p.isDeli;
    if (!isDeliCategory) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.code && p.code.includes(term));
  });

  // Quick weight fraction adder
  const handleQuickAddFraction = (product, fractionKg) => {
    addToCart(product, null, Number(fractionKg.toFixed(3)));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 space-y-4 font-sans">
      
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl font-bold">
              🧀
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>قسم المائدة والتلاجة</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  أجبان ولحوم طازجة
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                اختيار سريع للأوزان (ثمن، ربع، نصف، كيلو) للأجبان واللانشون والبسطرمة والزيتون
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في أصناف المائدة والتلاجة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {deliProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
            <UtensilsCrossed className="w-12 h-12 text-slate-600" />
            <p className="font-bold text-sm">لا توجد أصناف في قسم المائدة مطابقة للبحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {deliProducts.map((product) => {
              const unitPrice = product.price || 0;

              return (
                <div
                  key={product.id}
                  className="p-4 rounded-3xl glass-panel border border-amber-500/20 hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between space-y-3 bg-slate-900/70"
                >
                  <div>
                    {/* Header Info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">
                          {product.image || '🧀'}
                        </span>
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-white">
                            {product.name}
                          </h3>
                          <span className="text-xs font-bold text-emerald-400">
                            {formatCurrency(unitPrice)} / كيلو
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Weight Fractions Buttons Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      إضافة سريعة بالوزن والكسور:
                    </span>

                    <div className="grid grid-cols-5 gap-1.5 text-xs">
                      {[
                        { label: 'ثمن (125g)', val: 0.125 },
                        { label: 'ربع (250g)', val: 0.25 },
                        { label: 'نصف (500g)', val: 0.5 },
                        { label: '3/4 كيلو', val: 0.75 },
                        { label: '1 كيلو', val: 1.0 }
                      ].map((frac) => {
                        const priceForFrac = unitPrice * frac.val;
                        return (
                          <button
                            key={frac.label}
                            onClick={() => handleQuickAddFraction(product, frac.val)}
                            className="p-2 rounded-xl bg-slate-950 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-amber-300 font-bold transition flex flex-col items-center justify-center gap-0.5"
                          >
                            <span className="text-[11px] font-extrabold">{frac.label.split(' ')[0]}</span>
                            <span className="text-[9px] text-emerald-400 font-bold">
                              {priceForFrac.toFixed(1)}ج
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Weight Modal Trigger */}
                  <button
                    onClick={() => setWeightedTarget(product)}
                    className="w-full py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Scale className="w-4 h-4" />
                    <span>إدخال وزن مخصص أو حاسبة الميزان</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weighted Scale Modal */}
      {weightedTarget && (
        <WeightedModal
          product={weightedTarget}
          onClose={() => setWeightedTarget(null)}
        />
      )}
    </div>
  );
}
