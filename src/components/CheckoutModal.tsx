import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, MessageCircle, X } from 'lucide-react';
import { submitOrder } from '../api/client.ts';
import type { CartItem, Order, PreferredContact, SiteConfig } from '../types.ts';
import { buildWhatsAppLink, formatFcfa } from '../utils/format.ts';

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  siteConfig: SiteConfig;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  items,
  siteConfig,
  onClose,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [preferredContact, setPreferredContact] =
    useState<PreferredContact>('WhatsApp');
  const [paymentMethod, setPaymentMethod] = useState(
    siteConfig.enabledPaymentMethods[0] || '',
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const totalXof = items.reduce(
    (sum, item) => sum + item.product.priceXof * item.quantity,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim() || !deliveryLocation.trim()) {
      setError(
        'Veuillez renseigner votre nom complet, votre numéro de téléphone et votre lieu de livraison.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const { order } = await submitOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryLocation: deliveryLocation.trim(),
        preferredContact,
        paymentMethod: paymentMethod || siteConfig.enabledPaymentMethods[0] || '',
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        notes: notes.trim(),
      });
      setConfirmedOrder(order);
      onOrderSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'enregistrer la commande.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setError(null);
    onClose();
  };

  const orderWhatsAppHref = confirmedOrder
    ? buildWhatsAppLink(
        siteConfig.whatsappNumber,
        `Bonjour HORON PHONE, je viens de passer la commande ${confirmedOrder.orderNumber} (${formatFcfa(
          confirmedOrder.totalXof,
        )}). Nom : ${confirmedOrder.customerName}. Lieu : ${confirmedOrder.deliveryLocation}.`,
      )
    : null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#111318]/45 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Validation de commande"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-[#E9EBEF] shadow-[0_28px_80px_rgba(17,19,24,0.18)] p-6 sm:p-8"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fermer"
              className="absolute top-5 right-5 w-9 h-9 rounded-full hover:bg-[#F5F6F8] flex items-center justify-center text-[#111318] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {confirmedOrder ? (
              <div className="py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#1769E0]/10 text-[#1769E0] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#1769E0]">
                  Commande confirmée
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[#111318]">
                  Commande #{confirmedOrder.orderNumber}
                </h2>
                <p className="mt-2 text-sm text-[#20242C]/80 max-w-md mx-auto">
                  Merci, {confirmedOrder.customerName}. Notre équipe à Bamako a bien reçu
                  votre commande et vous contactera via {confirmedOrder.preferredContact}.
                </p>

                <div className="mt-6 p-5 bg-[#F5F6F8] rounded-2xl border border-[#E9EBEF] text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#A6ABB3]">Lieu de livraison</span>
                    <span className="font-medium text-[#111318]">
                      {confirmedOrder.deliveryLocation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A6ABB3]">Mode de paiement</span>
                    <span className="font-medium text-[#111318]">
                      {confirmedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E9EBEF]">
                    <span className="font-semibold text-[#111318]">Total</span>
                    <span className="font-mono font-semibold text-[#111318] tabular-nums">
                      {formatFcfa(confirmedOrder.totalXof)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {orderWhatsAppHref && (
                    <a
                      href={orderWhatsAppHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1769E0] text-white text-sm font-medium inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Confirmer sur WhatsApp</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111318] text-white text-sm font-medium cursor-pointer"
                  >
                    Retour au showroom
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#1769E0]">
                    Commande
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-[#111318]">
                    Finaliser votre commande
                  </h2>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F6F8] border border-[#E9EBEF] space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between text-xs sm:text-sm gap-4"
                    >
                      <span className="text-[#20242C] truncate">
                        {item.quantity} × {item.product.name}
                      </span>
                      <span className="font-mono font-medium text-[#111318] tabular-nums shrink-0">
                        {formatFcfa(item.product.priceXof * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[#E9EBEF] flex items-center justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span className="font-mono text-[#111318] tabular-nums">
                      {formatFcfa(totalXof)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#20242C] mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Votre nom complet"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E9EBEF] focus:border-[#1769E0] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#20242C] mb-1.5">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Votre numéro de contact"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E9EBEF] focus:border-[#1769E0] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#20242C] mb-1.5">
                    Lieu de livraison (Bamako / Mali) *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Quartier, rue ou retrait en boutique"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E9EBEF] focus:border-[#1769E0] focus:outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#20242C] mb-1.5">
                      Mode de contact préféré
                    </label>
                    <select
                      value={preferredContact}
                      onChange={(e) =>
                        setPreferredContact(e.target.value as PreferredContact)
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E9EBEF] bg-white focus:border-[#1769E0] focus:outline-none text-sm"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone Call">Appel téléphonique</option>
                      <option value="In-Store Pickup">Retrait en boutique</option>
                    </select>
                  </div>

                  {siteConfig.enabledPaymentMethods.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-[#20242C] mb-1.5">
                        Mode de paiement
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-[#E9EBEF] bg-white focus:border-[#1769E0] focus:outline-none text-sm"
                      >
                        {siteConfig.enabledPaymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#20242C] mb-1.5">
                    Notes complémentaires (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Couleur souhaitée, créneau de livraison ou question"
                    className="w-full p-3 rounded-xl border border-[#E9EBEF] focus:border-[#1769E0] focus:outline-none text-sm"
                  />
                </div>

                {error && (
                  <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full h-12 rounded-xl bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? 'Confirmation en cours...'
                    : `Valider la commande · ${formatFcfa(totalXof)}`}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
