import React from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Trash2,
  Plus,
  Minus,
  PauseCircle,
  CreditCard,
  Tag,
  AlertTriangle,
  Pill,
  Calendar,
  X
} from 'lucide-react';
import { formatCurrency, getExpiryStatus } from '../../utils/helpers';

export default function CartPanel({ onOpenCheckout, isMobileOpen, onCloseMobile }) {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    updateItemDiscount,
    clearCart,
    subtotal,
    cartDiscount,
    setCartDiscount,
    grandTotal,
    holdCurrentCart,
    activeMode
  } = usePOS();

  return (
    <div
      className={`glass-panel border-r border-slate-800/80 flex flex-col h-full ${
        isMobileOpen
          ? 'fixed inset-0 z-50 bg-slate-950/95 p-4 md:relative md:inset-auto md:p-0 md:bg-transparent'
          : 'hidden md:flex'
      }`}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-extrabold text-base text-white">سلة الفاتورة الحالية</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            {cart.length} أصناف
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ</span>
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
              🛒
            </div>
            <p className="font-bold text-sm text-slate-400">السلة فارغة حالياً</p>
            <p className="text-xs text-slate-500 max-w-[200px]">
              امسح الباركود أو انقر على المنتجات لإضافتها للفاتورة الحالية
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const expiryInfo = item.batchInfo ? getExpiryStatus(item.batchInfo.expiryDate) : null;
            const itemTotal = (item.price - (item.itemDiscount || 0)) * item.quantity;

            return (
              <div
                key={`${item.id}-${item.selectedBatch || 'nobatch'}`}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1">
                    <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.type === 'pharmacy' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                          {item.dosageForm || 'دواء'}
                        </span>
                      )}
                    </h3>

                    {/* Batch & Expiry Info for Pharmacy */}
                    {item.selectedBatch && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-cyan-400">
                          <Pill className="w-3 h-3" />
                          تشغيلة: {item.selectedBatch}
                        </span>
                        {item.batchInfo && (
                          <span
                            className={`flex items-center gap-1 font-bold ${
                              expiryInfo.status === 'warning'
                                ? 'text-amber-400'
                                : expiryInfo.status === 'expired'
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            انتهاء: {item.batchInfo.expiryDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.selectedBatch)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity and Item Total Control */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1 bg-slate-950 rounded-xl border border-slate-800 p-1">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.selectedBatch, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-black text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.selectedBatch, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-left">
                    <div className="text-xs text-slate-400">
                      {formatCurrency(item.price)} x {item.quantity}
                    </div>
                    <div className="font-extrabold text-sm text-emerald-400">
                      {formatCurrency(itemTotal)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary Footer */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
        {/* Global Cart Discount Field */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-bold">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            خصم إضافي (ج.م):
          </span>
          <input
            type="number"
            min="0"
            value={cartDiscount || ''}
            onChange={(e) => setCartDiscount(Math.max(0, Number(e.target.value) || 0))}
            placeholder="0"
            className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-center font-bold text-emerald-400 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Totals Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </div>
          {cartDiscount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>الخصم الكلي:</span>
              <span className="font-bold">- {formatCurrency(cartDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-black text-white">
            <span>الصافي النهائي:</span>
            <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Cart Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={holdCurrentCart}
            disabled={cart.length === 0}
            className={`py-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
              cart.length > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <PauseCircle className="w-4 h-4" />
            <span>تعليق (F8)</span>
          </button>

          <button
            onClick={() => {
              if (cart.length > 0) onOpenCheckout();
            }}
            disabled={cart.length === 0}
            className={`col-span-2 py-3 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 ${
              cart.length > 0
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>دفع وإتمام (F4)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
