import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { BrandItem, CategoryItem, Product } from '../types.ts';
import { formatFcfa } from '../utils/format.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { ProductImage } from './ProductImage.tsx';
import { EdgeGradientRibbons } from './EdgeGradientRibbons.tsx';
import { extractSeriesKey, getSeriesCardTitle } from '../utils/series.ts';

interface BrandPageProps {
  brandName: string;
  brands: BrandItem[];
  categories: CategoryItem[];
  products: Product[];
  onBackHome: () => void;
  onSelectBrand: (brandName: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  recentlyAddedId: string | null;
}

export const BrandPage: React.FC<BrandPageProps> = ({
  brandName,
  brands,
  categories,
  products,
  onBackHome,
  onSelectBrand,
  onQuickView,
  onAddToCart: _onAddToCart,
  recentlyAddedId: _recentlyAddedId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>(
    'newest',
  );

  const activeBrands = useMemo(
    () => brands.filter((b) => b.active).slice(0, 5),
    [brands],
  );

  const currentBrand = useMemo(
    () =>
      brands.find((b) => b.name.toLowerCase() === brandName.toLowerCase()) ||
      activeBrands[0],
    [activeBrands, brandName, brands],
  );

  // Tous les produits de cette marque
  const brandProducts = useMemo(() => {
    return products.filter(
      (p) => p.brand.toLowerCase() === (currentBrand?.name || brandName).toLowerCase(),
    );
  }, [brandName, currentBrand?.name, products]);

  // Catégories manipulables sur cette page marque
  const categoryOptions = useMemo(() => {
    const names = categories.map((c) => c.name);
    brandProducts.forEach((p) => {
      if (p.category && !names.some((n) => n.toLowerCase() === p.category.toLowerCase())) {
        names.push(p.category);
      }
    });
    return ['Tous', ...names];
  }, [brandProducts, categories]);

  const filteredBrandProducts = useMemo(() => {
    const list = brandProducts.filter((p) => {
      if (selectedCategory !== 'Tous') {
        if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      if (inStockOnly && (p.stock <= 0 || p.availability === 'Out of Stock')) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceXof - b.priceXof;
      if (sortBy === 'price-desc') return b.priceXof - a.priceXof;
      if (sortBy === 'popular') {
        if (a.popular !== b.popular) return a.popular ? -1 : 1;
        return b.priceXof - a.priceXof;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [brandProducts, inStockOnly, selectedCategory, sortBy]);

  // Regrouper par série (une seule carte par série : iPhone 18, iPhone 17, Galaxy S25, etc.)
  const groupedSeriesCards = useMemo(() => {
    const map = new Map<string, Product[]>();
    filteredBrandProducts.forEach((p) => {
      const key = extractSeriesKey(p);
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(p);
      } else {
        map.set(key, [p]);
      }
    });

    return Array.from(map.entries()).map(([seriesKey, items]) => {
      const representative = items[0];
      return {
        seriesKey,
        representative,
        title: getSeriesCardTitle(representative, items.length),
      };
    });
  }, [filteredBrandProducts]);

  const getCategoryLabelForBrand = (catName: string) => {
    const brandLower = (currentBrand?.name || brandName).toLowerCase();
    const catLower = catName.toLowerCase();
    if (catName === 'Tous') return 'Tout voir';
    if (brandLower === 'apple') {
      if (catLower === 'smartphones') return 'iPhone';
      if (catLower === 'tablettes') return 'iPad';
      if (catLower.includes('airpods') || catLower.includes('écouteurs')) return 'AirPods';
    }
    if (brandLower === 'samsung') {
      if (catLower === 'smartphones') return 'Galaxy';
      if (catLower === 'tablettes') return 'Galaxy Tab';
      if (catLower.includes('airpods') || catLower.includes('écouteurs')) return 'Galaxy Buds';
    }
    if (brandLower.includes('xiaomi') || brandLower.includes('redmi')) {
      if (catLower === 'tablettes') return 'Redmi Pad';
      if (catLower.includes('airpods') || catLower.includes('écouteurs')) return 'Redmi Buds';
    }
    if (catLower.includes('airpods') || catLower.includes('écouteurs')) {
      return 'Écouteurs';
    }
    return catName;
  };

  const getCategoryThumbForBrand = (catName: string): string => {
    // Préférer l'image d'un vrai produit de cette marque et catégorie si disponible
    const matchingProduct = brandProducts.find(
      (p) => p.category.toLowerCase() === catName.toLowerCase() && p.imageUrl,
    );
    if (matchingProduct?.imageUrl) return matchingProduct.imageUrl;

    const brandLower = (currentBrand?.name || brandName).toLowerCase();
    const catLower = catName.toLowerCase();

    if (catLower === 'smartphones') {
      if (brandLower === 'apple') return '/src/assets/images/horon_iphone_pro_1795008052838.jpg';
      if (brandLower === 'samsung') return '/src/assets/images/horon_samsung_ultra_1795008052584.jpg';
      if (brandLower.includes('xiaomi') || brandLower.includes('redmi')) {
        return '/src/assets/images/horon_xiaomi_redmi_1795008052902.jpg';
      }
      return '/src/assets/images/horon_tecno_infinix_1795008052857.jpg';
    }
    if (catLower === 'tablettes') {
      if (brandLower === 'samsung' || brandLower === 'tecno') {
        return '/src/assets/images/horon_galaxy_tab_1795008052790.jpg';
      }
      return '/src/assets/images/horon_ipad_pro_1795008052755.jpg';
    }
    if (catLower.includes('airpods') || catLower.includes('écouteurs')) {
      return '/src/assets/images/horon_airpods_audio_1795009755352.jpg';
    }
    return '/src/assets/images/horon_charger_accessory_1795009753995.jpg';
  };

  return (
    <div className="relative min-h-screen overflow-hidden horon-surface-white pt-24 pb-24">
      <EdgeGradientRibbons variant="catalog" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Retour & Sélecteur rapide horizontal des 5 marques */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E9EBEF]">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#20242C] hover:text-[#1769E0] transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </button>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {activeBrands.map((b) => {
              const isSelected =
                b.name.toLowerCase() === (currentBrand?.name || brandName).toLowerCase();
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Tous');
                    onSelectBrand(b.name);
                  }}
                  className={`px-4 py-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#1769E0] shadow-sm'
                      : 'bg-[#F5F6F8] border-[#E9EBEF] hover:border-[#A6ABB3]'
                  }`}
                >
                  <BrandLogo
                    brandName={b.name}
                    deviceStyle={b.deviceStyle}
                    className="scale-90"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* En-tête épuré de la marque : logo uniquement + compteur de modèles */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center">
            <BrandLogo
              brandName={currentBrand?.name || brandName}
              deviceStyle={currentBrand?.deviceStyle}
              className="scale-110 origin-left"
            />
          </div>

          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-[#A6ABB3]">
              Catalogue {currentBrand?.name || brandName}
            </p>
            <p className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#111318] tabular-nums">
              {groupedSeriesCards.length}{' '}
              <span className="text-base font-normal text-[#A6ABB3]">
                {groupedSeriesCards.length > 1 ? 'modèles' : 'modèle'}
              </span>
            </p>
          </div>
        </div>

        {/* Barre horizontale style Apple avec vrais appareils miniatures par catégorie */}
        <div className="py-4 px-3 sm:px-5 bg-[#F5F6F8]/85 rounded-3xl border border-[#E9EBEF] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Catégories de produits"
            className="flex items-stretch gap-2.5 overflow-x-auto pb-1 lg:pb-0"
          >
            {categoryOptions.map((catName) => {
              const count =
                catName === 'Tous'
                  ? brandProducts.length
                  : brandProducts.filter(
                      (p) => p.category.toLowerCase() === catName.toLowerCase(),
                    ).length;

              const active = selectedCategory.toLowerCase() === catName.toLowerCase();
              const label = getCategoryLabelForBrand(catName);

              return (
                <button
                  key={catName}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(catName)}
                  className={`group w-[88px] sm:w-[96px] shrink-0 flex flex-col items-center justify-between gap-1.5 p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-white border-[#1769E0] shadow-[0_8px_22px_rgba(23,105,224,0.12)]'
                      : 'bg-white/70 border-transparent hover:bg-white hover:border-[#E9EBEF]'
                  }`}
                >
                  <div className="w-14 h-11 rounded-xl overflow-hidden bg-[#F5F6F8] border border-black/5 flex items-center justify-center shrink-0">
                    {catName === 'Tous' ? (
                      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#E9EBEF]">
                        <img
                          src={getCategoryThumbForBrand('Smartphones')}
                          alt="Smartphones"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src={getCategoryThumbForBrand('Tablettes')}
                          alt="Tablettes"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src={getCategoryThumbForBrand('AirPods & Écouteurs')}
                          alt="Audio"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src={getCategoryThumbForBrand('Chargeurs')}
                          alt="Chargeurs"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <img
                        src={getCategoryThumbForBrand(catName)}
                        alt={label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>

                  <div className="w-full text-center">
                    <span
                      className={`block text-[11px] font-medium leading-tight truncate ${
                        active ? 'text-[#1769E0] font-semibold' : 'text-[#111318]'
                      }`}
                    >
                      {label}
                    </span>
                    <span className="block text-[10px] text-[#A6ABB3] tabular-nums mt-0.5">
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#20242C] cursor-pointer whitespace-nowrap shrink-0">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-[#A6ABB3] text-[#1769E0] focus:ring-[#1769E0]"
              />
              <span>En stock uniquement</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Trier les modèles"
              className="h-10 px-3 bg-white border border-[#E9EBEF] rounded-xl text-xs font-medium text-[#111318] focus:border-[#1769E0] focus:outline-none cursor-pointer"
            >
              <option value="newest">Plus récents d&apos;abord</option>
              <option value="popular">Populaires</option>
              <option value="price-asc">Prix : croissant</option>
              <option value="price-desc">Prix : décroissant</option>
            </select>
          </div>
        </div>

        {/* Grille des séries / appareils de la marque */}
        {groupedSeriesCards.length === 0 ? (
          <div className="mt-10 py-16 px-6 text-center bg-[#F5F6F8] rounded-2xl border border-[#E9EBEF]">
            <p className="font-display text-lg font-semibold text-[#111318]">
              Aucun produit {currentBrand?.name || brandName} dans cette catégorie.
            </p>
            <p className="mt-2 text-sm text-[#20242C]/75">
              Sélectionnez « Tous les produits » ou une autre catégorie ci-dessus.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Tous');
                setInStockOnly(false);
              }}
              className="mt-5 px-5 py-2.5 rounded-full bg-[#1769E0] text-white text-xs font-medium cursor-pointer"
            >
              Voir tout {currentBrand?.name || brandName}
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {groupedSeriesCards.map(({ seriesKey, representative, title }) => (
              <article
                key={seriesKey}
                className="group flex flex-col bg-white rounded-2xl border border-[#E9EBEF] hover:border-[#A6ABB3]/60 hover:shadow-[0_14px_34px_rgba(17,19,24,0.06)] transition-all duration-300 overflow-hidden"
              >
                <div
                  onClick={() => onQuickView(representative)}
                  className="relative aspect-[4/3] bg-[#F5F6F8] overflow-hidden cursor-pointer"
                >
                  <ProductImage
                    src={representative.imageUrl}
                    alt={title}
                    brandLabel={representative.brand}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                  <h3
                    onClick={() => onQuickView(representative)}
                    className="text-left font-display text-base font-semibold text-[#111318] leading-snug cursor-pointer group-hover:text-[#1769E0] transition-colors line-clamp-2"
                  >
                    {title}
                  </h3>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => onQuickView(representative)}
                      className="px-4 py-2 rounded-full text-sm font-semibold font-mono tabular-nums text-[#111318] bg-white/45 backdrop-blur-md border border-[#111318]/15 shadow-[0_8px_22px_rgba(17,19,24,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] hover:bg-white/80 hover:border-[#1769E0]/45 hover:text-[#1769E0] transition-all whitespace-nowrap cursor-pointer"
                    >
                      {formatFcfa(representative.priceXof)}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
