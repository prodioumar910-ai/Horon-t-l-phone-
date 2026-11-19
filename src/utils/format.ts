import type {
  AvailabilityStatus,
  CartItem,
  OrderStatus,
  Product,
} from '../types.ts';

export function formatFcfa(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${new Intl.NumberFormat('fr-FR').format(safe)} FCFA`;
}

export function translateAvailability(status: AvailabilityStatus): string {
  switch (status) {
    case 'In Stock':
      return 'En stock';
    case 'Low Stock':
      return 'Stock limité';
    case 'Pre-Order':
      return 'Précommande';
    case 'Out of Stock':
      return 'Rupture de stock';
    default:
      return status;
  }
}

export function translateOrderStatus(status: OrderStatus): string {
  switch (status) {
    case 'Pending':
      return 'En attente';
    case 'Confirmed':
      return 'Confirmée';
    case 'Preparing':
      return 'En préparation';
    case 'Delivered':
      return 'Livrée';
    case 'Cancelled':
      return 'Annulée';
    default:
      return status;
  }
}

export function sanitizeWhatsAppNumber(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

export function buildWhatsAppLink(rawNumber: string, message: string): string | null {
  const cleaned = sanitizeWhatsAppNumber(rawNumber);
  if (!cleaned || cleaned.length < 7) return null;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function buildProductInquiryMessage(product: Product): string {
  return `Bonjour HORON PHONE, je souhaite obtenir des informations sur : ${product.name} (${formatFcfa(product.priceXof)}).`;
}

export function buildCartWhatsAppMessage(items: CartItem[], totalXof: number): string {
  const lines = items.map(
    (item) =>
      `• ${item.quantity}x ${item.product.name} — ${formatFcfa(
        item.product.priceXof * item.quantity,
      )}`,
  );
  return `Bonjour HORON PHONE, je souhaite commander :\n${lines.join('\n')}\n\nTotal : ${formatFcfa(totalXof)}`;
}
