import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import StoreSetupWizardModal from './StoreSetupWizardModal';
import { Settings, X, Shield, Package, Pill, ShoppingBag, Layers, UtensilsCrossed, Check, Building2, Wand2, Sparkles } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const { systemScope, setSystemScope, enableAlMaida, setEnableAlMaida, storeInfo } = usePOS();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  if (isWizardOpen) {
    return <StoreSetupWizardModal onClose={() => setIsWizardOpen(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans overflow-y-auto">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 text-emerald-400 font-extrabold text-base">
            <Settings className="w-5 h-5" />
            <span>إعدادات وتخصيص النظام (Settings)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm flex-1">

          {/* Setup Store Wizard Banner Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-sm text-emerald-300">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>إعداد مؤسسة جديدة (Onboarding Wizard)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                المؤسسة الحالية: <strong className="text-white">{storeInfo?.logo} {storeInfo?.name}</strong>
              </p>
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition flex items-center gap-1.5 shadow-md flex-shrink-0"
            >
              <Wand2 className="w-4 h-4" />
              <span>إدخال بيانات مؤسسة جديدة</span>
            </button>
          </div>
          
          {/* System Deployment Scope Option */}
          <div className="space-y-3">
            <label className="font-extrabold text-white text-sm block">
              🎯 نمط تسليم المشروع للعميل (Delivery Scope):
            </label>
            <p className="text-xs text-slate-400">
              يمكنك تخصيص النظام ليعمل كـ صيدلية فقط، أو سوبرماركت فقط، أو نظام مدمج شامل:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: Full Hybrid */}
              <button
                onClick={() => setSystemScope('full_hybrid')}
                className={`p-3.5 rounded-2xl border text-right transition flex items-center justify-between ${
                  systemScope === 'full_hybrid'
                    ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">نظام مدمج شامل (Full Hybrid)</h4>
                    <p className="text-[11px] text-slate-400">دعم كامل لكل من الصيدلية والسوبرماركت والتحويل بينهما بحرية</p>
                  </div>
                </div>
                {systemScope === 'full_hybrid' && <Check className="w-5 h-5 text-purple-400" />}
              </button>

              {/* Option 2: Pharmacy Standalone */}
              <button
                onClick={() => setSystemScope('pharmacy_only')}
                className={`p-3.5 rounded-2xl border text-right transition flex items-center justify-between ${
                  systemScope === 'pharmacy_only'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-lg">
                    💊
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">تسليم كـ صيدلية منفصلة فقط (Pharmacy Only)</h4>
                    <p className="text-[11px] text-slate-400">إخفاء خيارات الماركت كلياً والتركيز الحصري على الأدوية والروشتات</p>
                  </div>
                </div>
                {systemScope === 'pharmacy_only' && <Check className="w-5 h-5 text-cyan-400" />}
              </button>

              {/* Option 3: Supermarket Standalone */}
              <button
                onClick={() => setSystemScope('market_only')}
                className={`p-3.5 rounded-2xl border text-right transition flex items-center justify-between ${
                  systemScope === 'market_only'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg">
                    🛒
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">تسليم كـ سوبرماركت منفصل فقط (Market Only)</h4>
                    <p className="text-[11px] text-slate-400">إخفاء خيارات الصيدلية والتركيز على الماركت والميزان والتلاجة</p>
                  </div>
                </div>
                {systemScope === 'market_only' && <Check className="w-5 h-5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Al-Maida Section Feature Toggle */}
          {systemScope !== 'pharmacy_only' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-300">قسم المائدة والتلاجة (Al-Ma'ida Deli Counter)</h4>
                    <p className="text-[11px] text-slate-400">تفعيل تبويب خاص لبيع الأجبان واللانشون والبسطرمة بكسور الأوزان</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={enableAlMaida}
                  onChange={(e) => setEnableAlMaida(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-left flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 shadow-md transition"
          >
            تأكيد وإغلاق الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}
