import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import AddProductModal from './AddProductModal';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Calendar,
  Pill,
  ShoppingBag,
  Edit,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { formatCurrency, getExpiryStatus } from '../../utils/helpers';

export default function InventoryScreen() {
  const { products, activeMode, systemScope } = usePOS();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'low_stock', 'near_expiry', 'pharmacy', 'market'
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Enforce system scope products filter
  const scopedProducts = products.filter((p) => {
    if (systemScope === 'pharmacy_only' && p.type !== 'pharmacy') return false;
    if (systemScope === 'market_only' && p.type !== 'market') return false;
    return true;
  });

  // Computed stats
  const totalStockCount = scopedProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalStockValue = scopedProducts.reduce((acc, p) => acc + (p.price * p.stock || 0), 0);
  const lowStockCount = scopedProducts.filter((p) => p.stock <= p.minStock).length;

  const nearExpiryCount = scopedProducts.filter((p) => {
    if (p.type !== 'pharmacy' || !p.batches) return false;
    return p.batches.some((b) => getExpiryStatus(b.expiryDate).status !== 'normal');
  }).length;

  // Filter products
  const filteredProducts = scopedProducts.filter((p) => {
    // Mode filter if selected
    if (filterType === 'pharmacy' && p.type !== 'pharmacy') return false;
    if (filterType === 'market' && p.type !== 'market') return false;
    if (filterType === 'low_stock' && p.stock > p.minStock) return false;
    if (filterType === 'near_expiry') {
      if (p.type !== 'pharmacy' || !p.batches) return false;
      const hasExpiryWarning = p.batches.some(
        (b) => getExpiryStatus(b.expiryDate).status !== 'normal'
      );
      if (!hasExpiryWarning) return false;
    }

    if (!search.trim()) return true;

    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.includes(term)) ||
      (p.activeIngredient && p.activeIngredient.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>إدارة المخزون والدفعات والمنتجات</span>
          </h2>
          <p className="text-xs text-slate-400">
            متابعة أرصدة الأصناف، تواريخ الصلاحية للأدوية، والأسعار
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsAddModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">إجمالي عدد المنتجات</span>
          <span className="text-xl sm:text-2xl font-black text-white">{scopedProducts.length} أصناف</span>
          <span className="text-[10px] text-slate-500 block">إجمالي الكمية: {totalStockCount} قطعة</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">قيمة المخزون الإجمالية</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatCurrency(totalStockValue)}
          </span>
          <span className="text-[10px] text-slate-500 block">بسعر البيع الحالي</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 space-y-1">
          <span className="text-xs text-amber-400 font-bold block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            نواقص المخزون
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-300">{lowStockCount} منتج</span>
          <span className="text-[10px] text-amber-400/80 block">تجاوزت حد إعادة الطلب</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 bg-rose-500/5 space-y-1">
          <span className="text-xs text-rose-400 font-bold block flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            تنبيهات الصلاحية (الأدوية)
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-300">{nearExpiryCount} دواء</span>
          <span className="text-[10px] text-rose-400/80 block">ينتهي قريباً أو منتهي</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'low_stock', label: '⚠️ قرب النفاذ' },
            { id: 'near_expiry', label: '⏳ قرب الصلاحية' },
            ...(systemScope === 'full_hybrid'
              ? [
                  { id: 'pharmacy', label: '💊 أدوية' },
                  { id: 'market', label: '🛒 سوبرماركت' }
                ]
              : [])
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في المخزون..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">المنتج / الدواء</th>
                <th className="p-3.5">النوع والتصنيف</th>
                <th className="p-3.5">الباركود</th>
                <th className="p-3.5">سعر البيع</th>
                <th className="p-3.5">سعر التكلفة</th>
                <th className="p-3.5">الرصيد المتاح</th>
                <th className="p-3.5">التشغيلة والصلاحية</th>
                <th className="p-3.5 text-center">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.map((product) => {
                const isPharma = product.type === 'pharmacy';
                const firstBatch = product.batches?.[0];
                const expiryInfo = firstBatch ? getExpiryStatus(firstBatch.expiryDate) : null;

                return (
                  <tr key={product.id} className="hover:bg-slate-900/40 transition">
                    
                    {/* Name & Active Ingredient */}
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{product.image || '📦'}</span>
                        <div>
                          <span>{product.name}</span>
                          {isPharma && product.activeIngredient && (
                            <span className="block text-[10px] text-cyan-300 font-normal">
                              🧪 {product.activeIngredient}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type & Category */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                        {product.category}
                      </span>
                    </td>

                    {/* Barcode */}
                    <td className="p-3.5 font-mono text-slate-400">
                      {product.barcode}
                    </td>

                    {/* Price */}
                    <td className="p-3.5 font-bold text-emerald-400">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Cost */}
                    <td className="p-3.5 font-bold text-slate-400">
                      {formatCurrency(product.costPrice || 0)}
                    </td>

                    {/* Stock Balance */}
                    <td className="p-3.5">
                      <span
                        className={`font-black px-2.5 py-1 rounded-xl text-xs inline-block ${
                          product.stock <= product.minStock
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {product.stock} {product.unit || 'عبوة'}
                      </span>
                    </td>

                    {/* Batch & Expiry */}
                    <td className="p-3.5">
                      {isPharma && firstBatch ? (
                        <div className="text-[11px] space-y-0.5">
                          <span className="font-mono text-cyan-400 block">
                            تشغيلة: {firstBatch.batchNo}
                          </span>
                          <span
                            className={`font-bold block ${
                              expiryInfo.status === 'warning'
                                ? 'text-amber-400'
                                : expiryInfo.status === 'expired'
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            انتهاء: {firstBatch.expiryDate}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Edit Action */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsAddModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="تعديل المنتج"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <AddProductModal
          initialProduct={editingProduct}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
