import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  CreditCard,
  Banknote,
  Smartphone,
  BookOpen,
  CheckCircle2,
  Printer,
  X,
  User,
  FileText,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function PaymentModal({ onClose, onCompleteSuccess }) {
  const {
    grandTotal,
    subtotal,
    totalDiscount,
    cart,
    selectedCustomer,
    customers,
    setSelectedCustomer,
    processSale,
    activeMode,
    prescriptionNote,
    setPrescriptionNote
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'card', 'instapay', 'wallet', 'debt'
  const [paidInput, setPaidInput] = useState(String(grandTotal));
  const [noteInput, setNoteInput] = useState('');

  const paidAmount = Number(paidInput) || 0;
  const changeDue = Math.max(0, paidAmount - grandTotal);

  const handleQuickAdd = (amt) => {
    setPaidInput((prev) => String((Number(prev) || 0) + amt));
  };

  const handleExactAmount = () => {
    setPaidInput(String(grandTotal));
  };

  const handleConfirmCheckout = () => {
    if (paymentMethod === 'cash' && paidAmount < grandTotal) {
      alert(`المبلغ المدفوع أصغر من إجمالي الفاتورة! المطلوب: ${formatCurrency(grandTotal)}`);
      return;
    }

    if (paymentMethod === 'debt' && (!selectedCustomer || selectedCustomer.id === 'c1')) {
      alert('يرجى تحديد عميل مسجل لإضافة الفاتورة للحساب الآجل.');
      return;
    }

    const saleRecord = processSale(paymentMethod, paidAmount, noteInput);
    if (saleRecord && onCompleteSuccess) {
      onCompleteSuccess(saleRecord);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900/60 via-teal-900/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl">
              💰
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">إتمام عملية البيع والدفع</h2>
              <p className="text-xs text-slate-400">حدد طريقة الدفع وقيمة المبلغ المستلم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Amount Overview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">الإجمالي الصافي المطلوب</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <div className="text-xs space-y-1 sm:text-left text-slate-400 border-t sm:border-t-0 sm:border-r border-slate-800 sm:pr-4 pt-2 sm:pt-0">
              <div className="flex justify-between sm:justify-end gap-4">
                <span>المجموع:</span>
                <strong className="text-slate-200">{formatCurrency(subtotal)}</strong>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between sm:justify-end gap-4 text-emerald-400">
                  <span>الخصم:</span>
                  <strong>- {formatCurrency(totalDiscount)}</strong>
                </div>
              )}
              <div className="flex justify-between sm:justify-end gap-4">
                <span>عدد الأصناف:</span>
                <strong className="text-slate-200">{cart.length} أصناف</strong>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">طريقة الدفع:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>نقدي (كاش)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>بطاقة (فيزا)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'instapay'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>إنستاباي/محفظة</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('debt')}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'debt'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>حساب آجل</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details Calculator */}
          {paymentMethod === 'cash' && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">المبلغ المستلم من العميل (ج.م):</label>
                <button
                  onClick={handleExactAmount}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                >
                  المبلغ بالمضبوط ({grandTotal})
                </button>
              </div>

              <input
                type="number"
                value={paidInput}
                onChange={(e) => setPaidInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-white focus:outline-none focus:border-emerald-500 text-center"
              />

              {/* Quick Bill Adder Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAdd(amt)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              {/* Change Due Display */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300">المبلغ المتبقي للعميل (الباقي):</span>
                <span className={`font-black text-lg ${changeDue > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </div>
          )}

          {/* Customer Selection for Debt or Loyalty */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <User className="w-4 h-4 text-cyan-400" />
              <span>بيانات العميل (نقاط الولاء أو الآجل):</span>
            </label>
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                if (found) setSelectedCustomer(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone !== '0000000000' ? `(${c.phone})` : ''} - نقاط: {c.points}
                </option>
              ))}
            </select>
          </div>

          {/* Prescription Notes for Pharmacy Mode */}
          {(activeMode === 'pharmacy' || activeMode === 'hybrid') && (
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <FileText className="w-4 h-4" />
                <span>إرشادات الروشتة والطبيب (اختياري للصيدلية):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="اسم الطبيب المعالج..."
                  value={prescriptionNote.doctorName}
                  onChange={(e) => setPrescriptionNote({ ...prescriptionNote, doctorName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="اسم المريض..."
                  value={prescriptionNote.patientName}
                  onChange={(e) => setPrescriptionNote({ ...prescriptionNote, patientName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
          >
            إلغاء
          </button>

          <button
            onClick={handleConfirmCheckout}
            className="flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>تأكيد وطباعة الفاتورة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
