import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { BrandItem, SiteConfig } from '../types.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { EdgeGradientRibbons } from './EdgeGradientRibbons.tsx';
import { AnimatedSectionTitle } from './ui/SectionMotion.tsx';

interface ProductShowroomProps {
  brands: BrandItem[];
  siteConfig: SiteConfig;
  onSelectBrandPage: (brandName: string) => void;
  reducedMotion?: boolean;
}

export const ProductShowroom: React.FC<ProductShowroomProps> = ({
  brands,
  siteConfig,
  onSelectBrandPage,
  reducedMotion = false,
}) => {
  const activeBrands = useMemo(
    () => brands.filter((b) => b.active).slice(0, 5),
    [brands],
  );

  return (
    <section
      id="showroom-section"
      className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 horon-surface-white"
    >
      <EdgeGradientRibbons variant="showroom" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#F6F7F9]/90 to-transparent z-[1]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F2F4F7]/90 to-transparent z-[1]"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <AnimatedSectionTitle
            align="center"
            eyebrow="Nos Marques"
            title={siteConfig.showroomHeadline}
            reducedMotion={reducedMotion}
            accentLine
            titleClassName="mt-2 font-display font-semibold tracking-tight text-[#111318] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] text-balance"
          />
        </div>

        {/* Barre horizontale des 5 logos de marques cliquables uniquement */}
        <div className="mt-12">
          <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
            {activeBrands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => onSelectBrandPage(brand.name)}
                aria-label={`Découvrir les produits ${brand.name}`}
                className="group relative flex-1 min-w-[164px] md:min-w-0 shrink-0 flex flex-col items-center justify-center gap-3 h-32 px-4 rounded-2xl bg-[#F5F6F8] hover:bg-white border border-[#E9EBEF] hover:border-[#1769E0] hover:shadow-[0_14px_32px_rgba(23,105,224,0.1)] transition-all duration-200 cursor-pointer"
              >
                <BrandLogo
                  brandName={brand.name}
                  deviceStyle={brand.deviceStyle}
                  className="group-hover:scale-[1.05] transition-transform duration-200"
                />
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A6ABB3] group-hover:text-[#1769E0] transition-colors">
                  <span>Voir la boutique</span>
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
