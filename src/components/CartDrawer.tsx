import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, MessageCircle, Minus, Plus, Trash2, X } from 'lucide-react';
import type { CartItem, SiteConfig } from '../types.ts';
import { buildCartWhatsAppMessage, buildWhatsAppLink, formatFcfa } from '../utils/format.ts';
import { ProductImage } from './ProductImage.tsx';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  siteConfig: SiteConfig;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  siteConfig,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const totalXof = items.reduce(
    (sum, item) => sum + item.product.priceXof * item.quantity,
    0,
  );
  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const waCartUrl =
    items.length > 0
      ? buildWhatsAppLink(
          siteConfig.whatsappNumber,
          buildCartWhatsAppMessage(items, totalXof),
        )
      : null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111318]/40 backdrop-blur-[2px]"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white h-full border-l border-[#E9EBEF] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-[#E9EBEF] flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#111318]">
                  Votre Sélection
                </h2>
                <p className="text-xs text-[#A6ABB3] tabular-nums">
                  {totalCount} {totalCount > 1 ? 'articles' : 'article'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le panier"
                className="w-9 h-9 rounded-full hover:bg-[#F5F6F8] flex items-center justify-center text-[#111318] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <p className="font-display text-base font-semibold text-[#111318]">
                    Votre panier est vide.
                  </p>
                  <p className="mt-1.5 text-sm text-[#A6ABB3] max-w-xs">
                    Parcourez notre showroom pour ajouter des smartphones, tablettes ou
                    accessoires à votre commande.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 pb-4 border-b border-[#E9EBEF] last:border-none"
                  >
                    <div className="w-20 h-20 rounded-xl bg-[#F5F6F8] overflow-hidden shrink-0 border border-[#E9EBEF]">
                      <ProductImage
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        brandLabel={item.product.brand}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#A6ABB3] uppercase tracking-wider">
                        {item.product.brand}
                      </p>
                      <h3 className="text-sm font-semibold text-[#111318] truncate mt-0.5">
                        {item.product.name}
                      </h3>
                      <p className="mt-1 text-sm font-mono font-medium text-[#111318] tabular-nums">
                        {formatFcfa(item.product.priceXof * item.quantity)}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="inline-flex items-center h-8 rounded-lg border border-[#E9EBEF] bg-[#F5F6F8]">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity - 1)
                            }
                            aria-label="Diminuer la quantité"
                            className="w-8 h-full flex items-center justify-center text-[#111318] hover:text-[#1769E0] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                            aria-label="Augmenter la quantité"
                            className="w-8 h-full flex items-center justify-center text-[#111318] hover:text-[#1769E0] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          aria-label={`Retirer ${item.product.name}`}
                          className="text-xs text-[#A6ABB3] hover:text-[#111318] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Retirer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#E9EBEF] bg-[#F5F6F8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#20242C]">Sous-total</span>
                  <span className="text-lg font-semibold font-mono text-[#111318] tabular-nums">
                    {formatFcfa(totalXof)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="w-full h-12 rounded-xl bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Passer la commande</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {waCartUrl && (
                  <a
                    href={waCartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-xl bg-white border border-[#E9EBEF] hover:border-[#111318] text-[#111318] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#1769E0]" />
                    <span>Partager le panier sur WhatsApp</span>
                  </a>
                )}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
