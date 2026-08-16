import React, { useState } from 'react';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import PaymentModal from './PaymentModal';
import AlternativesModal from './AlternativesModal';
import CameraScannerModal from './CameraScannerModal';
import WeightedModal from './WeightedModal';
import { usePOS } from '../../context/POSContext';
import { ShoppingCart, PauseCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function CashierScreen({ onOpenHeldCarts, onPrintReceiptTrigger }) {
  const { cart, grandTotal } = usePOS();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [alternativeTarget, setAlternativeTarget] = useState(null);
  const [weightedTarget, setWeightedTarget] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const handleSaleSuccess = (completedSale) => {
    setIsCheckoutOpen(false);
    if (onPrintReceiptTrigger) {
      onPrintReceiptTrigger(completedSale);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden h-full">
      
      {/* Product Grid Area */}
      <ProductGrid
        onOpenAlternatives={(prod) => setAlternativeTarget(prod)}
        onOpenWeightedModal={(prod) => setWeightedTarget(prod)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Cart Panel (Desktop fixed sidebar / Mobile slide drawer) */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 h-full ${isMobileCartOpen ? 'block' : 'hidden md:block'}`}>
        <CartPanel
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          isMobileOpen={isMobileCartOpen}
          onCloseMobile={() => setIsMobileCartOpen(false)}
        />
      </div>

      {/* Mobile Floating Cart Action Bar (Visible only on small screens when cart has items) */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="fixed bottom-14 left-4 right-4 z-30 md:hidden">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-xl shadow-emerald-500/30 flex items-center justify-between animate-pulse-glow"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {cart.length}
              </div>
              <span className="text-xs font-bold">عرض سلة المشتريات الحالية</span>
            </div>

            <div className="font-extrabold text-sm">
              {formatCurrency(grandTotal)} ←
            </div>
          </button>
        </div>
      )}

      {/* Modals */}
      {isCheckoutOpen && (
        <PaymentModal
          onClose={() => setIsCheckoutOpen(false)}
          onCompleteSuccess={handleSaleSuccess}
        />
      )}

      {alternativeTarget && (
        <AlternativesModal
          targetProduct={alternativeTarget}
          onClose={() => setAlternativeTarget(null)}
        />
      )}

      {weightedTarget && (
        <WeightedModal
          product={weightedTarget}
          onClose={() => setWeightedTarget(null)}
        />
      )}

      {isScannerOpen && (
        <CameraScannerModal
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
