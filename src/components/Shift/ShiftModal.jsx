import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Clock, DollarSign, Lock, Unlock, UserCheck, AlertCircle, Printer, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ShiftModal() {
  const { shift, setShift, salesHistory } = usePOS();

  const [countedCash, setCountedCash] = useState('');
  const [isClosedSuccess, setIsClosedSuccess] = useState(false);

  // Compute shift metrics from sales history
  const shiftSales = salesHistory.filter(
    (s) => new Date(s.date) >= new Date(shift.startTime)
  );

  const totalShiftSales = shiftSales.reduce((acc, s) => acc + s.total, 0);
  const cashSales = shiftSales
    .filter((s) => s.paymentMethod === 'cash')
    .reduce((acc, s) => acc + s.total, 0);

  const cardSales = shiftSales
    .filter((s) => s.paymentMethod === 'card')
    .reduce((acc, s) => acc + s.total, 0);

  const walletSales = shiftSales
    .filter((s) => s.paymentMethod === 'instapay' || s.paymentMethod === 'wallet')
    .reduce((acc, s) => acc + s.total, 0);

  const debtSales = shiftSales
    .filter((s) => s.paymentMethod === 'debt')
    .reduce((acc, s) => acc + s.total, 0);

  const expectedCashInDrawer = (shift.startCash || 0) + cashSales;
  const counted = Number(countedCash) || 0;
  const variance = counted - expectedCashInDrawer; // Positive = Surplus, Negative = Deficit

  const handleCloseShift = () => {
    if (!countedCash) {
      alert('يرجى كتابة النقدية الفردية الموجودة بدرج الكاشير حالياً.');
      return;
    }
    setIsClosedSuccess(true);
  };

  const handleOpenNewShift = () => {
    setShift({
      isOpen: true,
      cashierName: 'محمد أحمد (الكاشير)',
      startTime: new Date().toISOString(),
      startCash: Number(countedCash) || 500.00,
      totalSales: 0,
      salesCount: 0
    });
    setCountedCash('');
    setIsClosedSuccess(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <span>إدارة ورشة الكاشير وإغلاق الدرج</span>
          </h2>
          <p className="text-xs text-slate-400">
            تتبع مبيعات الوردية الحالية، النقدية بالدرج، وحساب العجز أو الزيادة
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          <span>الوردية حية: {shift.cashierName}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">بداية الوردية</span>
          <span className="text-xs font-mono text-slate-300 block">{formatDate(shift.startTime)}</span>
          <span className="text-sm font-black text-white block pt-1">
            عهدة نقدية: {formatCurrency(shift.startCash)}
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">إجمالي مبيعات الوردية</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatCurrency(totalShiftSales)}
          </span>
          <span className="text-[10px] text-slate-500 block">عدد الفواتير: {shiftSales.length}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-1">
          <span className="text-xs text-cyan-400 font-bold block">مقبوضات كاش (Cash)</span>
          <span className="text-xl sm:text-2xl font-black text-cyan-300">
            {formatCurrency(cashSales)}
          </span>
          <span className="text-[10px] text-slate-400 block">+ العهدة = {formatCurrency(expectedCashInDrawer)}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 space-y-1">
          <span className="text-xs text-purple-400 font-bold block">دفع إلكتروني وآجل</span>
          <span className="text-base sm:text-lg font-black text-purple-300 block">
            فيزا: {formatCurrency(cardSales)}
          </span>
          <span className="text-xs font-bold text-amber-400 block">آجل: {formatCurrency(debtSales)}</span>
        </div>
      </div>

      {/* Shift Reconciliation Panel */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          <span>مطابقة درج النقدية وتأكيد الإغلاق</span>
        </h3>

        {!isClosedSuccess ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Counted Cash */}
            <div className="space-y-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">
                أدخل المبلغ النقدي المفعلي الموجود بالدرج حالياً (ج.م):
              </label>

              <input
                type="number"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                placeholder="أدخل المبلع بعد العَد اليدوي..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-xl font-black text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>المبلغ المتوقع بالدرج:</span>
                  <strong className="text-white">{formatCurrency(expectedCashInDrawer)}</strong>
                </div>

                {countedCash && (
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                    <span>نتيجة المطابقة:</span>
                    <span
                      className={
                        variance === 0
                          ? 'text-emerald-400'
                          : variance > 0
                          ? 'text-cyan-400'
                          : 'text-rose-400'
                      }
                    >
                      {variance === 0
                        ? 'مضبوط تماماً (0)'
                        : variance > 0
                        ? `زيادة بالدرج (+${formatCurrency(variance)})`
                        : `عجز بالدرج (${formatCurrency(variance)})`}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCloseShift}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20"
              >
                تأكيد وتقفيل الوردية الحالية
              </button>
            </div>

            {/* Shift Breakdown List */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
              <h4 className="font-bold text-slate-200">ملخص الوردية الإحصائي:</h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                  <span>عدد عمليات البيع:</span>
                  <strong className="text-white">{shiftSales.length} عملية</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                  <span>المقبوضات النقدية (كاش):</span>
                  <strong className="text-emerald-400">{formatCurrency(cashSales)}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                  <span>مدفوعات الفيزا:</span>
                  <strong className="text-cyan-400">{formatCurrency(cardSales)}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                  <span>إنستاباي / محفظة:</span>
                  <strong className="text-purple-400">{formatCurrency(walletSales)}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                  <span>حسابات آجلة:</span>
                  <strong className="text-amber-400">{formatCurrency(debtSales)}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Shift Closed Confirmation Card */
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>

            <div>
              <h4 className="text-lg font-black text-white">تم إغلاق الوردية وحفظ التقرير بنجاح</h4>
              <p className="text-xs text-slate-400">
                الفرق النهائي المسجل بالدرج: {formatCurrency(variance)}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة تقرير Z الوردية</span>
              </button>

              <button
                onClick={handleOpenNewShift}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>فتح وردية جديدة الآن</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
