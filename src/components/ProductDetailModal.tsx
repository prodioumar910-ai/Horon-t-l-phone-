import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  HardDrive,
  Phone,
  X,
} from 'lucide-react';
import type { Product, SiteConfig } from '../types.ts';
import { formatFcfa } from '../utils/format.ts';
import { SALES_ADVISORS, resolveAdvisorTelHref } from '../data/advisors.ts';
import { ProductImage } from './ProductImage.tsx';
import { extractSeriesKey, getShortModelLabel } from '../utils/series.ts';

interface ProductDetailModalProps {
  product: Product | null;
  products: Product[];
  siteConfig: SiteConfig;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

function getProductMemoryLabel(product: Product): string {
  if (product.specs.storage && product.specs.storage.trim()) {
    return product.specs.storage.trim();
  }
  const match = product.name.match(/(\d+\s?(?:Go|To|TB|GB))/i);
  if (match) return match[1];
  if (product.productType === 'accessory') {
    return product.specs.battery?.trim() || 'Édition originale';
  }
  return '128 Go / 256 Go';
}

function getProductOriginCountry(product: Product): string {
  const brand = product.brand.toLowerCase();
  if (brand.includes('apple')) return 'États-Unis (USA)';
  if (brand.includes('samsung')) return 'Corée du Sud';
  if (brand.includes('tecno')) return 'Chine · Version Internationale';
  if (brand.includes('infinix')) return 'Chine · Version Internationale';
  if (brand.includes('xiaomi') || brand.includes('redmi')) {
    return 'Chine · Version Globale';
  }
  return 'Importation Officielle';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  products,
  siteConfig,
  onClose,
  onSelectProduct,
}) => {
  const [showAdvisors, setShowAdvisors] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const swipeStartXRef = useRef<number | null>(null);
  const seriesChipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setShowAdvisors(false);
  }, [product?.id]);

  // Défilement gauche/droite strictement limité aux variantes de la même série (ex: uniquement les 18 ou uniquement les 17)
  const carouselProducts = useMemo(() => {
    if (!product) return [];
    const targetSeries = extractSeriesKey(product);
    const sameSeries = products.filter(
      (p) => extractSeriesKey(p) === targetSeries,
    );
    return sameSeries.length > 0 ? sameSeries : [product];
  }, [product, products]);

  const currentIndex = useMemo(() => {
    if (!product) return 0;
    const idx = carouselProducts.findIndex((p) => p.id === product.id);
    return idx >= 0 ? idx : 0;
  }, [carouselProducts, product]);

  const hasMultiple = carouselProducts.length > 1;

  const goToIndex = React.useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      if (!hasMultiple) return;
      const wrapped =
        (nextIndex + carouselProducts.length) % carouselProducts.length;
      setDirection(dir);
      onSelectProduct(carouselProducts[wrapped]);
    },
    [carouselProducts, hasMultiple, onSelectProduct],
  );

  // Centrer la pastille du modèle actif dans la barre horizontale
  useEffect(() => {
    if (!product) return;
    const chip = seriesChipRefs.current[product.id];
    chip?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [product]);

  // Navigation clavier flèche gauche / flèche droite
  useEffect(() => {
    if (!product || !hasMultiple) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToIndex(currentIndex + 1, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToIndex(currentIndex - 1, -1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, goToIndex, hasMultiple, product]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    swipeStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStartXRef.current === null || !hasMultiple) return;
    const deltaX = e.clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (Math.abs(deltaX) < 42) return;
    if (deltaX < 0) {
      goToIndex(currentIndex + 1, 1);
    } else {
      goToIndex(currentIndex - 1, -1);
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111318]/45 backdrop-blur-[3px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-[#E9EBEF] shadow-[0_28px_80px_rgba(17,19,24,0.18)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la fiche produit"
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/95 border border-[#E9EBEF] hover:border-[#111318] flex items-center justify-center text-[#111318] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: direction * 26 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -26 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 md:grid-cols-12"
              >
                {/* Image du produit + Flèches gauche / droite pour défiler entre séries */}
                <div className="relative md:col-span-6 bg-[#F5F6F8] p-5 sm:p-7 flex items-center justify-center">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E9EBEF]/80">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      brandLabel={product.brand}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {hasMultiple && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToIndex(currentIndex - 1, -1);
                        }}
                        aria-label="Modèle précédent"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md border border-[#E5E8EE] shadow-md hover:bg-white hover:border-[#1769E0] flex items-center justify-center text-[#111318] hover:text-[#1769E0] transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToIndex(currentIndex + 1, 1);
                        }}
                        aria-label="Modèle suivant"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md border border-[#E5E8EE] shadow-md hover:bg-white hover:border-[#1769E0] flex items-center justify-center text-[#111318] hover:text-[#1769E0] transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Prix + Petite description (Mémoire & Pays d'origine) + Bouton Appel */}
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-display font-medium text-[#20242C] pr-8">
                      {getShortModelLabel(product.name)}
                    </p>
                    <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-[#111318] tabular-nums pr-8">
                      {formatFcfa(product.priceXof)}
                    </p>

                    {/* Mémoire & Pays d'origine */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl bg-[#F5F6F8] border border-[#E9EBEF] px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#A6ABB3]">
                          <HardDrive className="w-3.5 h-3.5 text-[#1769E0]" />
                          <span>Mémoire</span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm font-semibold text-[#111318]">
                          {getProductMemoryLabel(product)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F5F6F8] border border-[#E9EBEF] px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#A6ABB3]">
                          <Globe className="w-3.5 h-3.5 text-[#1769E0]" />
                          <span>Origine</span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm font-semibold text-[#111318]">
                          {getProductOriginCountry(product)}
                        </p>
                      </div>
                    </div>

                    {/* Petite description bien classe */}
                    <p className="mt-4 text-sm text-[#20242C]/80 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Bouton Appel direct vers l'une des 3 personnes de la section contact */}
                  <div className="mt-6 pt-5 border-t border-[#E9EBEF]">
                    <button
                      type="button"
                      onClick={() => setShowAdvisors((v) => !v)}
                      className="w-full h-11 px-5 rounded-full bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors shadow-[0_8px_22px_rgba(23,105,224,0.22)] cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Appeler</span>
                    </button>

                    {showAdvisors && (
                      <div className="mt-3.5 space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#A6ABB3] text-center">
                          Choisissez un conseiller à appeler
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {SALES_ADVISORS.map((advisor) => (
                            <a
                              key={advisor.id}
                              href={resolveAdvisorTelHref(
                                advisor.phone,
                                siteConfig.whatsappNumber,
                              )}
                              className="group flex flex-col items-center text-center p-2.5 rounded-2xl bg-[#F5F6F8] hover:bg-white border border-[#E9EBEF] hover:border-[#1769E0] hover:shadow-sm transition-all"
                            >
                              <div className="w-11 h-11 rounded-full overflow-hidden border border-[#E9EBEF]">
                                <img
                                  src={advisor.avatar}
                                  alt={advisor.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="mt-1.5 text-xs font-semibold text-[#111318] group-hover:text-[#1769E0]">
                                {advisor.name}
                              </span>
                              <span className="text-[10px] text-[#A6ABB3] leading-tight">
                                {advisor.role}
                              </span>
                              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-[#1769E0]">
                                <Phone className="w-2.5 h-2.5" />
                                <span>Appeler</span>
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Barre de défilement horizontale gauche / droite pour parcourir les autres modèles de la série & marque */}
            {hasMultiple && (
              <div className="border-t border-[#E9EBEF] bg-[#F8F9FB] px-4 py-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToIndex(currentIndex - 1, -1)}
                  aria-label="Défiler à gauche"
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E8EE] hover:border-[#1769E0] flex items-center justify-center text-[#111318] hover:text-[#1769E0] shrink-0 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 flex items-center gap-2 overflow-x-auto py-0.5 scroll-smooth">
                  {carouselProducts.map((item, idx) => {
                    const isActive = item.id === product.id;
                    return (
                      <button
                        key={item.id}
                        ref={(el) => {
                          seriesChipRefs.current[item.id] = el;
                        }}
                        type="button"
                        onClick={() =>
                          goToIndex(idx, idx >= currentIndex ? 1 : -1)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#111318] text-white shadow-sm'
                            : 'bg-white text-[#20242C]/80 border border-[#E5E8EE] hover:border-[#1769E0] hover:text-[#1769E0]'
                        }`}
                      >
                        {getShortModelLabel(item.name)}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => goToIndex(currentIndex + 1, 1)}
                  aria-label="Défiler à droite"
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E8EE] hover:border-[#1769E0] flex items-center justify-center text-[#111318] hover:text-[#1769E0] shrink-0 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
