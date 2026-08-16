import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, Plus, Save, Package, Pill, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../../data/initialData';

export default function AddProductModal({ initialProduct, onClose }) {
  const { saveProduct, activeMode, systemScope, products } = usePOS();

  const defaultType = initialProduct?.type || (
    systemScope === 'pharmacy_only'
      ? 'pharmacy'
      : systemScope === 'market_only'
      ? 'market'
      : activeMode === 'pharmacy'
      ? 'pharmacy'
      : 'market'
  );

  const [formData, setFormData] = useState({
    id: initialProduct?.id || null,
    name: initialProduct?.name || '',
    barcode: initialProduct?.barcode || String(Math.floor(6220000000 + Math.random() * 9999999)),
    type: defaultType,
    category: initialProduct?.category || (defaultType === 'pharmacy' ? 'مسكنات وخافض حرارة' : 'بقالة ومواد غذائية'),
    price: initialProduct?.price || 10,
    costPrice: initialProduct?.costPrice || 7,
    stock: initialProduct?.stock || 50,
    minStock: initialProduct?.minStock || 10,
    unit: initialProduct?.unit || 'عبوة',
    image: initialProduct?.image || (defaultType === 'pharmacy' ? '💊' : '📦'),
    isWeighted: initialProduct?.isWeighted || false,
    minWeight: initialProduct?.minWeight || 0.05,
    // Pharmacy specific fields
    activeIngredient: initialProduct?.activeIngredient || '',
    dosageForm: initialProduct?.dosageForm || 'أقراص',
    manufacturer: initialProduct?.manufacturer || '',
    requiresPrescription: initialProduct?.requiresPrescription || false,
    dosageInfo: initialProduct?.dosageInfo || '',
    batchNo: initialProduct?.batches?.[0]?.batchNo || 'B-' + Math.floor(1000 + Math.random() * 9000),
    expiryDate: initialProduct?.batches?.[0]?.expiryDate || '2027-06-30',
    alternatives: initialProduct?.alternatives || []
  });

  const [newAlternativeInput, setNewAlternativeInput] = useState('');

  const pharmacyProducts = products ? products.filter((p) => p.type === 'pharmacy') : [];

  const handleAddAlternative = (altName) => {
    const name = altName || newAlternativeInput.trim();
    if (!name) return;
    if (!formData.alternatives.includes(name)) {
      setFormData({
        ...formData,
        alternatives: [...formData.alternatives, name]
      });
    }
    setNewAlternativeInput('');
  };

  const handleRemoveAlternative = (nameToRemove) => {
    setFormData({
      ...formData,
      alternatives: formData.alternatives.filter((alt) => alt !== nameToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('يرجى كتابة اسم المنتج');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      costPrice: Number(formData.costPrice) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
      batches: (formData.type === 'pharmacy' || formData.expiryDate) ? [
        {
          batchNo: formData.batchNo || 'B-' + Math.floor(1000 + Math.random() * 9000),
          expiryDate: formData.expiryDate || '2027-12-31',
          stock: Number(formData.stock) || 0
        }
      ] : null
    };

    saveProduct(payload);
    onClose();
  };

  const currentCategories = formData.type === 'pharmacy' ? CATEGORIES.pharmacy.filter(c => c !== 'الكل') : CATEGORIES.market.filter(c => c !== 'الكل');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base sm:text-lg">
            <Package className="w-5 h-5" />
            <span>{formData.id ? 'تعديل بيانات المنتج' : 'إضافة صنف جديد للمخزون'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Item Type Switcher (Pharmacy vs Market) - Only shown in full hybrid scope */}
          {systemScope === 'full_hybrid' && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-slate-300">نوع المنتج المستهدف:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'market', image: '📦' })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    formData.type === 'market'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  <span>🛒 سوبرماركت</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'pharmacy', image: '💊' })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    formData.type === 'pharmacy'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  <span>💊 دواء / صيدلية</span>
                </button>
              </div>
            </div>
          )}

          {/* General Product Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">اسم المنتج / الدواء *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم المنتج..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">الباركود (Barcode)</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">التصنيف الرئيسي</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">الوحدة القياسية</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="علبة، كيس، كيلو..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Weighted Item Toggle & Minimum Order Weight Field (Supermarket Market Only) */}
          {formData.type === 'market' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isWeighted"
                  checked={formData.isWeighted || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isWeighted: e.target.checked,
                      unit: e.target.checked ? 'كيلو' : formData.unit
                    })
                  }
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="isWeighted" className="font-bold text-amber-300 text-xs cursor-pointer">
                  ⚖️ صنف يباع بالوزن والميزان (السعر المحدد هو سعر الكيلو)
                </label>
              </div>

              {formData.isWeighted && (
                <div className="space-y-1 pt-1 border-t border-amber-500/20">
                  <label className="font-bold text-slate-300 text-xs block">
                    أدنى كمية / وزن مسموح بطلبها (كجم):
                  </label>
                  <input
                    type="number"
                    step="0.025"
                    value={formData.minWeight}
                    onChange={(e) => setFormData({ ...formData, minWeight: Number(e.target.value) || 0.05 })}
                    placeholder="مثال: 0.125 كجم (125 جرام)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {(Number(formData.minWeight || 0) * 1000).toFixed(0)} جرام كحد أدنى عند الشراء
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <label className="font-bold text-slate-400 text-xs">سعر البيع (ج.م)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 text-xs">سعر الشراء (التكلفة)</label>
              <input
                type="number"
                step="0.5"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 text-xs">الكمية بالمخزون</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 text-xs">حد إعادة الطلب</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Expiry Date & Batch Info Section (For both Pharmacy & Market Food/Beverages) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Pill className="w-4 h-4" />
              <span>تاريخ الصلاحية ورقم التشغيلة (Batch & Expiry Date):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">رقم التشغيلة (Batch / Lot No)</label>
                <input
                  type="text"
                  value={formData.batchNo}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  placeholder="مثال: B-2026-90"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">تاريخ انتهاء الصلاحية 📅</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Pharmacy Special Fields (Active Ingredient, Dosage Form) */}
          {formData.type === 'pharmacy' && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-900/50 space-y-3">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Pill className="w-4 h-4" />
                <span>بيانات الصيدلية والدواء التخصصية:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">المادة الفعالة (Active Ingredient)</label>
                  <input
                    type="text"
                    value={formData.activeIngredient}
                    onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                    placeholder="مثل: Paracetamol 500mg"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">الشكل الدوائي</label>
                  <select
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="أقراص">أقراص (Tablets)</option>
                    <option value="كبسولات">كبسولات (Capsules)</option>
                    <option value="شراب">شراب (Syrup)</option>
                    <option value="حقن">حقن (Injection)</option>
                    <option value="مراهم">مراهم/كريمل (Ointment)</option>
                    <option value="قطرة">قطرة (Drops)</option>
                    <option value="فوار">فوار (Effervescent)</option>
                  </select>
                </div>
              </div>

              {/* Medicine Alternatives Linker Section (Pharmacy Only) */}
              <div className="space-y-2 pt-3 border-t border-cyan-900/40">
                <label className="font-bold text-cyan-300 flex items-center justify-between text-xs sm:text-sm">
                  <span>🔗 ربط الأدوية البديلة والمكافئة (Alternatives):</span>
                  <span className="text-[11px] text-slate-400 font-normal">تظهر للكاشير عند طلب بدائل الصنف</span>
                </label>

                {/* Quick Linked Tags */}
                {formData.alternatives && formData.alternatives.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    {formData.alternatives.map((alt) => (
                      <span
                        key={alt}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5"
                      >
                        <span>💊 {alt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAlternative(alt)}
                          className="hover:text-rose-400 font-black text-xs transition"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom Input & Add Button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAlternativeInput}
                    onChange={(e) => setNewAlternativeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAlternative();
                      }
                    }}
                    placeholder="اكتب اسم دواء بديل واضغط إضافة..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAlternative()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold hover:bg-cyan-500/30 text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ربط كبديل</span>
                  </button>
                </div>

                {/* Quick Suggestion Pills from Existing Pharmacy Products */}
                {pharmacyProducts.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-400 block font-bold">
                      💡 اختيارات سريعة من أدوية الصيدلية المتاحة بالنظام:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                      {pharmacyProducts
                        .filter((p) => p.name !== formData.name && !formData.alternatives.includes(p.name))
                        .map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleAddAlternative(p.name)}
                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition flex items-center gap-1 font-bold"
                          >
                            <span>+ {p.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ المنتج</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
