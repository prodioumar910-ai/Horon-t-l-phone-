import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, MapPin, MessageCircle, X } from 'lucide-react';
import type { SiteConfig } from '../types.ts';
import { buildWhatsAppLink } from '../utils/format.ts';

interface ContactModalProps {
  open: boolean;
  siteConfig: SiteConfig;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  open,
  siteConfig,
  onClose,
}) => {
  const waHref = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    'Bonjour HORON PHONE, je souhaite des conseils personnalisés pour choisir un appareil.',
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111318]/45 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Contacter HORON PHONE"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-[#E9EBEF] shadow-[0_28px_80px_rgba(17,19,24,0.18)] p-6 sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la fenêtre de contact"
              className="absolute top-5 right-5 w-9 h-9 rounded-full hover:bg-[#F5F6F8] flex items-center justify-center text-[#111318] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#1769E0]">
              Support Client
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#111318]">
              Contacter HORON PHONE
            </h2>
            <p className="mt-2 text-sm text-[#20242C]/80 leading-relaxed">
              Vérifiez la disponibilité en boutique, comparez nos smartphones et tablettes ou
              planifiez un retrait à Bamako.
            </p>

            <div className="mt-6 space-y-3 p-4 rounded-2xl bg-[#F5F6F8] border border-[#E9EBEF] text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#1769E0] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#111318]">Adresse du showroom</p>
                  <p className="text-xs text-[#20242C]/75 mt-0.5">
                    {siteConfig.storeAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#E9EBEF]">
                <Clock className="w-4 h-4 text-[#1769E0] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#111318]">Horaires d&apos;ouverture</p>
                  <p className="text-xs text-[#20242C]/75 mt-0.5">{siteConfig.storeHours}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuter sur WhatsApp</span>
                </a>
              ) : (
                <div className="p-4 rounded-xl border border-[#E9EBEF] text-xs text-[#20242C]/80 leading-relaxed">
                  Le numéro WhatsApp est configurable depuis le tableau de bord
                  d&apos;administration. Vous pouvez également passer commande directement via
                  notre catalogue en ligne.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
