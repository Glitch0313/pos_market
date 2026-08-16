import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  ShoppingCart,
  Package,
  Receipt,
  Users,
  Clock,
  BarChart3,
  Sparkles
} from 'lucide-react';

export default function Navigation({ isMobileOpen, onCloseMobile }) {
  const { activeTab, setActiveTab, cart } = usePOS();

  const navItems = [
    { id: 'pos', label: 'نقطة البيع (الكاشير)', icon: ShoppingCart, badge: cart.length > 0 ? cart.length : null },
    { id: 'inventory', label: 'إدارة المخزون', icon: Package },
    { id: 'sales', label: 'سجل المبيعات', icon: Receipt },
    { id: 'shift', label: 'إغلاق الوردية', icon: Clock },
    { id: 'reports', label: 'التقارير والتحليلات', icon: BarChart3 }
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 glass-panel border-l border-slate-800/80 p-3 min-h-[calc(100vh-65px)] flex-shrink-0">
        <div className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Helper Banner */}
        <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>اختصارات السريعة (F-Keys)</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <p>• <span className="text-slate-200 font-bold">F2</span> : التركيز على الباركود</p>
            <p>• <span className="text-slate-200 font-bold">F4</span> : إتمام الدفع</p>
            <p>• <span className="text-slate-200 font-bold">F8</span> : تعليق الفاتورة</p>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 glass-panel p-5 transition-transform duration-300 md:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h2 className="font-extrabold text-lg text-white">القائمة الرئيسية</h2>
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
