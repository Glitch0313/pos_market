// Formatting & Helper Utilities for POS System

export function formatCurrency(amount) {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// Calculate days remaining to expiry
export function getExpiryStatus(expiryDateStr) {
  if (!expiryDateStr) return { label: 'طبيعي', status: 'normal', days: 999 };

  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { label: 'منتهي الصلاحية', status: 'expired', days: diffDays };
  } else if (diffDays <= 90) {
    return { label: `قريب الانتهاء (${diffDays} يوم)`, status: 'warning', days: diffDays };
  } else {
    return { label: 'صالح', status: 'normal', days: diffDays };
  }
}

// Thermal receipt generator print trigger
export function triggerPrintReceipt() {
  window.print();
}
