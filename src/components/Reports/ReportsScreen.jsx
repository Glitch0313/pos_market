import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  BarChart3,
  Receipt,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Pill,
  Printer,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ReportsScreen({ onPrintInvoice }) {
  const { salesHistory, systemScope } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState('all');

  const filteredSales = salesHistory.filter((s) => {
    // Scope filter
    if (systemScope === 'pharmacy_only' && s.mode === 'market') return false;
    if (systemScope === 'market_only' && s.mode === 'pharmacy') return false;

    if (selectedMode !== 'all' && s.mode !== selectedMode) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.id.toLowerCase().includes(term) ||
      (s.customer && s.customer.name.toLowerCase().includes(term))
    );
  });

  // Analytics Metrics
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalInvoices = filteredSales.length;
  const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  const totalDiscountGiven = filteredSales.reduce((acc, s) => acc + (s.discount || 0), 0);

  // Top Selling Items aggregated
  const itemMap = {};
  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!itemMap[item.id]) {
        itemMap[item.id] = { name: item.name, qty: 0, revenue: 0, image: item.image };
      }
      itemMap[item.id].qty += item.quantity;
      itemMap[item.id].revenue += (item.price - (item.itemDiscount || 0)) * item.quantity;
    });
  });

  const topItems = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>لوحة التحليلات وتقارير المبيعات</span>
          </h2>
          <p className="text-xs text-slate-400">
            إحصائيات المبيعات، الفواتير المنفذة، والأصناف الأكثر مبيعاً
          </p>
        </div>

        {/* Mode Selector (Only shown in full hybrid mode) */}
        {systemScope === 'full_hybrid' && (
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setSelectedMode('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedMode === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedMode('pharmacy')}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedMode === 'pharmacy'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400'
              }`}
            >
              💊 مبيعات الصيدلية
            </button>
            <button
              onClick={() => setSelectedMode('market')}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedMode === 'market'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400'
              }`}
            >
              🛒 مبيعات الماركت
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">إجمالي إيراد المبيعات</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-[10px] text-slate-500 block">إجمالي الخصومات: {formatCurrency(totalDiscountGiven)}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">عدد الفواتير الصادرة</span>
          <span className="text-xl sm:text-2xl font-black text-white">{totalInvoices} فاتورة</span>
          <span className="text-[10px] text-slate-500 block">متوسط الفاتورة: {formatCurrency(avgOrderValue)}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-1">
          <span className="text-xs text-cyan-400 font-bold block">متوسط قيمة الفاتورة</span>
          <span className="text-xl sm:text-2xl font-black text-cyan-300">
            {formatCurrency(avgOrderValue)}
          </span>
          <span className="text-[10px] text-slate-400 block">مبيعات اليوم والتاريخ</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 space-y-1">
          <span className="text-xs text-purple-400 font-bold block">المنتجات الأكثر مبيعاً</span>
          <span className="text-xl sm:text-2xl font-black text-purple-300">
            {topItems.length} أصناف
          </span>
          <span className="text-[10px] text-slate-400 block">أعلى طلب من العملاء</span>
        </div>
      </div>

      {/* Top Selling Items & Payment Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Items Widget */}
        <div className="lg:col-span-2 p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>قائمة المنتجات الأكثر مبيعاً والإيرادات</span>
          </h3>

          <div className="space-y-2.5">
            {topItems.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">لا توجد مبيعات مسجلة حتى الآن</p>
            ) : (
              topItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xl">{item.image || '📦'}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{item.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        الكمية المباعة: <strong>{item.qty} قطعة</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-left font-black text-sm text-emerald-400">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-base text-white">إجراءات سريعة</h3>
          <div className="space-y-2 text-xs">
            <button
              onClick={() => window.print()}
              className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>طباعة ملخص تقرير اليوم</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sales Invoices History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>سجل الفواتير الصادرة</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم الفاتورة أو اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">التاريخ والوقت</th>
                <th className="p-3">النمط والعميل</th>
                <th className="p-3">طريقة الدفع</th>
                <th className="p-3">إجمالي الأصناف</th>
                <th className="p-3">صافي المبلغ</th>
                <th className="p-3 text-center">طباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3 font-mono font-bold text-emerald-400">{sale.id}</td>
                  <td className="p-3 font-mono text-slate-400">{formatDate(sale.date)}</td>
                  <td className="p-3">
                    <span className="font-bold text-white block">
                      {sale.customer ? sale.customer.name : 'عميل نقدي'}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {sale.mode === 'pharmacy' ? '💊 صيدلية' : '🛒 سوبرماركت'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                      {sale.paymentMethod === 'cash'
                        ? 'كاش'
                        : sale.paymentMethod === 'card'
                        ? 'بطاقة'
                        : sale.paymentMethod === 'debt'
                        ? 'آجل'
                        : 'إلكتروني'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{sale.items.length} أصناف</td>
                  <td className="p-3 font-black text-emerald-400">{formatCurrency(sale.total)}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onPrintInvoice(sale)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="إعادة طباعة الفاتورة"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
