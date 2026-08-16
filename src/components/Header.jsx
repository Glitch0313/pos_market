import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  ShoppingBag,
  Pill,
  Layers,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  PauseCircle,
  Clock,
  UserCheck,
  ShieldAlert,
  Menu,
  X,
  Lock,
  Settings
} from 'lucide-react';

export default function Header({ onOpenHeldCarts, onToggleMobileNav, isMobileNavOpen, onLockSession, onOpenSettings }) {
  const {
    activeMode,
    setActiveMode,
    theme,
    toggleTheme,
    shift,
    heldCarts,
    soundEnabled,
    setSoundEnabled,
    triggerAudio,
    systemScope,
    currentUser
  } = usePOS();

  const [time, setTime] = useState(new Date().toLocaleTimeString('ar-EG'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ar-EG'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleModeChange = (newMode) => {
    setActiveMode(newMode);
    triggerAudio('beep');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-3 py-2.5 sm:px-6">
      <div className="flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            onClick={onToggleMobileNav}
            className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            aria-label="Toggle Menu"
          >
            {isMobileNavOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-base sm:text-xl flex-shrink-0">
              {activeMode === 'pharmacy' ? '💊' : activeMode === 'market' ? '🛒' : '⚡'}
            </div>
            <div>
              <h1 className="font-extrabold text-xs sm:text-lg tracking-tight text-white flex items-center gap-1">
                <span className="whitespace-nowrap">
                  {systemScope === 'pharmacy_only'
                    ? 'صيدلية فارما'
                    : systemScope === 'market_only'
                    ? 'سوبرماركت البركة'
                    : 'فارما ماركت'}
                </span>
                <span className="text-[9px] sm:text-xs px-1.5 py-0.2 sm:py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden xs:inline-block">
                  PRO
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {systemScope === 'pharmacy_only'
                  ? 'نظام إدارة الصيدليات والروشتات الذكي'
                  : systemScope === 'market_only'
                  ? 'نظام إدارة السوبرماركت والميزان الذكي'
                  : 'نظام إدارة الكاشير والمخزون الذكي'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher Buttons (Supermarket vs Pharmacy vs Hybrid) - Desktop */}
        {systemScope === 'full_hybrid' && (
          <div className="hidden lg:flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleModeChange('market')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeMode === 'market'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>سوبر ماركت</span>
            </button>

            <button
              onClick={() => handleModeChange('pharmacy')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeMode === 'pharmacy'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>صيدلية تخصصية</span>
            </button>

            <button
              onClick={() => handleModeChange('hybrid')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeMode === 'hybrid'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>نظام مدمج</span>
            </button>
          </div>
        )}

        {/* Actions & Shift Indicator */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

          {/* Mobile Quick Mode Toggle Selector */}
          {systemScope === 'full_hybrid' && (
            <select
              value={activeMode}
              onChange={(e) => handleModeChange(e.target.value)}
              className="lg:hidden bg-slate-800 text-slate-200 text-[11px] sm:text-xs font-bold rounded-xl px-1.5 py-1 sm:px-2 sm:py-1.5 border border-slate-700 focus:outline-none max-w-[95px] sm:max-w-none"
            >
              <option value="pharmacy">💊 صيدلية</option>
              <option value="market">🛒 ماركت</option>
              <option value="hybrid">⚡ مدمج</option>
            </select>
          )}

          {/* Held Carts Notification Button */}
          {heldCarts.length > 0 && (
            <button
              onClick={onOpenHeldCarts}
              className="relative p-1.5 sm:p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition flex items-center gap-1"
              title="الفواتير المعلقة"
            >
              <PauseCircle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="text-xs font-bold hidden md:inline">معلقة</span>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] sm:text-[11px] flex items-center justify-center">
                {heldCarts.length}
              </span>
            </button>
          )}

          {/* Live Clock & Shift Badge */}
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {time}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-cyan-400" />
              {shift.cashierName}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition hidden xs:block"
            title="تغيير الثيم"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />}
          </button>

          {/* System Deployment Settings Button (Admin Only) */}
          {onOpenSettings && currentUser?.role === 'admin' && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="إعدادات وتخصيص تسليم النظام (للأدمن فقط)"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </button>
          )}

          {/* Lock System Button */}
          {onLockSession && (
            <button
              onClick={onLockSession}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1"
              title="قفل الشاشة والنظام"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              <span className="text-xs font-bold hidden md:inline">قفل</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
