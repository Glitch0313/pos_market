import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import CashierScreen from './components/POS/CashierScreen';
import InventoryScreen from './components/Inventory/InventoryScreen';
import ShiftModal from './components/Shift/ShiftModal';
import ReportsScreen from './components/Reports/ReportsScreen';
import ThermalReceipt from './components/Receipt/ThermalReceipt';
import LoginScreen from './components/Auth/LoginScreen';
import AlMaidaScreen from './components/POS/AlMaidaScreen';
import SettingsModal from './components/Settings/SettingsModal';
import { PauseCircle, Play, Trash2, X } from 'lucide-react';
import { formatCurrency } from './utils/helpers';

function POSAppContent() {
  const { activeTab, heldCarts, restoreHeldCart, setCurrentUser } = usePOS();
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState(null);

  // System Lock & Authentication State
  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem('pos_locked') === 'true' || !sessionStorage.getItem('pos_authenticated');
  });

  const handleLoginSuccess = (userObj) => {
    setIsLocked(false);
    sessionStorage.setItem('pos_authenticated', 'true');
    sessionStorage.setItem('pos_locked', 'false');
    if (userObj) {
      setCurrentUser(userObj);
    }
  };

  const handleLockSession = () => {
    setIsLocked(true);
    sessionStorage.setItem('pos_locked', 'true');
  };

  if (isLocked) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <Header
        onOpenHeldCarts={() => setIsHeldCartsModalOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
        onLockSession={handleLockSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Responsive Sidebar Navigation */}
        <Navigation
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Tab View Container */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950/60 pb-16 md:pb-0">
          {activeTab === 'pos' && (
            <CashierScreen
              onOpenHeldCarts={() => setIsHeldCartsModalOpen(true)}
              onPrintReceiptTrigger={(saleRecord) => setActiveReceiptSale(saleRecord)}
            />
          )}

          {activeTab === 'almaida' && <AlMaidaScreen />}

          {activeTab === 'inventory' && <InventoryScreen />}

          {activeTab === 'shift' && <ShiftModal />}

          {(activeTab === 'reports' || activeTab === 'sales') && (
            <ReportsScreen
              onPrintInvoice={(saleRecord) => setActiveReceiptSale(saleRecord)}
            />
          )}
        </main>
      </div>

      {/* Held Carts Modal */}
      {isHeldCartsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base">
                <PauseCircle className="w-5 h-5" />
                <span>قائمة الفواتير المعلقة ({heldCarts.length})</span>
              </div>
              <button
                onClick={() => setIsHeldCartsModalOpen(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {heldCarts.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">لا توجد فواتير معلقة حالياً</p>
              ) : (
                heldCarts.map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">
                        فاتورة معلقة - {h.time}
                      </div>
                      <div className="text-xs text-slate-400">
                        العميل: {h.customer ? h.customer.name : 'عميل نقدي'} | الأصناف: {h.cart.length}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        restoreHeldCart(h.id);
                        setIsHeldCartsModalOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>استرجاع الفاتورة</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Thermal Receipt Print Preview Modal */}
      {activeReceiptSale && (
        <ThermalReceipt
          saleRecord={activeReceiptSale}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <POSAppContent />
    </POSProvider>
  );
}
