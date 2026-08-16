import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { CATEGORIES } from '../../data/initialData';
import {
  Search,
  Camera,
  Barcode,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  RefreshCw,
  Plus,
  ChevronRight,
  ChevronLeft,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { formatCurrency, getExpiryStatus } from '../../utils/helpers';

export default function ProductGrid({ onOpenAlternatives, onOpenWeightedModal, onOpenScanner }) {
  const { products, activeMode, setActiveMode, addToCart } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [pharmaSearchType, setPharmaSearchType] = useState('all'); // 'all', 'name', 'ingredient'

  const searchInputRef = useRef(null);
  const categoriesScrollRef = useRef(null);

  // Keyboard shortcut listener for F2 (Focus Barcode/Search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll categories horizontally
  const handleScrollCategories = (direction) => {
    if (categoriesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter products by mode & categories & search text
  const filteredProducts = products.filter((product) => {
    // Mode filter
    if (activeMode === 'market' && product.type !== 'market') return false;
    if (activeMode === 'pharmacy' && product.type !== 'pharmacy') return false;

    // Category filter
    if (selectedCategory !== 'الكل' && product.category !== selectedCategory) {
      return false;
    }

    // Search query filter
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const matchName = product.name.toLowerCase().includes(term);
    const matchCode = product.code && product.code.includes(term);
    const matchBarcode = product.barcode && product.barcode.includes(term);
    const matchIngredient =
      product.activeIngredient && product.activeIngredient.toLowerCase().includes(term);

    if (pharmaSearchType === 'ingredient') return matchIngredient;
    if (pharmaSearchType === 'name') return matchName;

    return matchName || matchCode || matchBarcode || matchIngredient;
  });

  // Handle direct barcode scanner enter key input
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      const exactMatch = products.find(
        (p) => p.barcode === searchTerm.trim() || p.code === searchTerm.trim()
      );
      if (exactMatch) {
        if (exactMatch.isWeighted && onOpenWeightedModal) {
          onOpenWeightedModal(exactMatch);
        } else {
          addToCart(exactMatch);
        }
        setSearchTerm('');
      }
    }
  };

  const categoriesList = activeMode === 'market'
    ? CATEGORIES.market
    : activeMode === 'pharmacy'
    ? CATEGORIES.pharmacy
    : [...new Set([...CATEGORIES.market, ...CATEGORIES.pharmacy])];

  // Helper to count items per category in active mode
  const getCategoryItemCount = (catName) => {
    return products.filter((p) => {
      if (activeMode === 'market' && p.type !== 'market') return false;
      if (activeMode === 'pharmacy' && p.type !== 'pharmacy') return false;
      if (catName === 'الكل') return true;
      return p.category === catName;
    }).length;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 space-y-3">
      
      {/* Search Bar & Scanner Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              activeMode === 'pharmacy'
                ? 'ابحث باسم الدواء، الباركود، أو المادة الفعالة... (F2)'
                : 'ابحث باسم المنتج، الكود، أو امسح الباركود... (F2)'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Camera Scanner Trigger Button */}
        <button
          onClick={onOpenScanner}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:from-emerald-500 hover:to-teal-500 transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>مسح باركود</span>
        </button>
      </div>

      {/* Mode Quick Filter & Search Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Active Mode Quick Switch Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setActiveMode('pharmacy');
              setSelectedCategory('الكل');
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
              activeMode === 'pharmacy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>الصيدلية ({products.filter((p) => p.type === 'pharmacy').length})</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('market');
              setSelectedCategory('الكل');
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
              activeMode === 'market'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>السوبرماركت ({products.filter((p) => p.type === 'market').length})</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('hybrid');
              setSelectedCategory('الكل');
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
              activeMode === 'hybrid'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>عرض الكل ({products.length})</span>
          </button>
        </div>

        {/* Pharmacy Search Type Selector */}
        {(activeMode === 'pharmacy' || activeMode === 'hybrid') && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold hidden sm:inline">طريقة البحث:</span>
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setPharmaSearchType('all')}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  pharmaSearchType === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400'
                }`}
              >
                بالاسم والرمز
              </button>
              <button
                onClick={() => setPharmaSearchType('ingredient')}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  pharmaSearchType === 'ingredient'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400'
                }`}
              >
                💊 بالمادة الفعالة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills Slider with Arrow Controls */}
      <div className="relative flex items-center gap-1">
        <button
          onClick={() => handleScrollCategories('right')}
          className="p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0"
          title="التمرير لليمين"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          ref={categoriesScrollRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50"
        >
          {categoriesList.map((cat) => {
            const count = getCategoryItemCount(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/30 text-emerald-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleScrollCategories('left')}
          className="p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0"
          title="التمرير لليصار"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center space-y-3 p-4">
            <Barcode className="w-12 h-12 text-slate-600 animate-pulse" />
            <div>
              <p className="font-extrabold text-sm text-white">لم يتم العثور على منتجات مطابقة للبحث</p>
              <p className="text-xs text-slate-400 mt-1">
                قد تكون المنتجات تابعة لنمط آخر (ماركت أو صيدلية) أو قسم مختلف.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('الكل');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
              >
                إلغاء التصفية وقواطع البحث
              </button>

              {activeMode !== 'hybrid' && (
                <button
                  onClick={() => {
                    setActiveMode('hybrid');
                    setSelectedCategory('الكل');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>عرض كافة المنتجات (النمط المدمج)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isPharma = product.type === 'pharmacy';
              const isLowStock = product.stock <= product.minStock;

              // Format title for clean rendering
              const nameParts = product.name.split('(');
              const mainTitle = nameParts[0].trim();
              const subTitle = nameParts[1] ? nameParts[1].replace(')', '').trim() : '';

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (product.isWeighted && onOpenWeightedModal) {
                      onOpenWeightedModal(product);
                    } else {
                      addToCart(product);
                    }
                  }}
                  className={`group relative p-3.5 rounded-2xl glass-card hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between border min-h-[175px] ${
                    isPharma ? 'border-cyan-900/40 bg-slate-900/60' : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-sm">{product.image || '📦'}</span>

                      <div className="flex flex-col items-end gap-1">
                        {/* Stock status badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.stock <= 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isLowStock
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {product.stock <= 0
                            ? 'نفذ'
                            : `مخزون: ${product.stock} ${product.unit || 'عبوة'}`}
                        </span>

                        {product.isWeighted && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                            <Scale className="w-2.5 h-2.5" /> ميزان
                          </span>
                        )}

                        {isPharma && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                            {product.dosageForm || 'دواء'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-2">
                      <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {mainTitle}
                      </h3>
                      {subTitle && (
                        <span className="text-[11px] font-mono text-slate-400 block truncate">
                          ({subTitle})
                        </span>
                      )}
                    </div>

                    {/* Pharma Active Ingredient Subtext */}
                    {isPharma && product.activeIngredient && (
                      <p className="text-[10px] text-cyan-300/90 line-clamp-1 mb-2 font-medium" title={product.activeIngredient}>
                        🧪 <span dir="auto">{product.activeIngredient}</span>
                      </p>
                    )}
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 mt-auto">
                    <div className="font-black text-sm text-emerald-400 flex items-center gap-0.5">
                      <span>{formatCurrency(product.price)}</span>
                      {product.isWeighted && <span className="text-[10px] text-slate-400 font-normal">/كجم</span>}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Show Pharmacy Alternative Drugs Lookup Button */}
                      {isPharma && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAlternatives(product);
                          }}
                          className="px-2 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition text-[10px] font-bold flex items-center gap-1"
                          title="عرض البدائل المثيلة"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>البدائل</span>
                        </button>
                      )}

                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black group-hover:bg-emerald-400 shadow-md transition active:scale-95">
                        <Plus className="w-4.5 h-4.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
