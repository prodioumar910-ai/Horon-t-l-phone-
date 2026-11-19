import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { BrandItem, SiteConfig } from '../types.ts';
import { HoronLogo } from './HoronLogo.tsx';
import { EdgeGradientRibbons } from './EdgeGradientRibbons.tsx';
import { AnimatedSectionTitle } from './ui/SectionMotion.tsx';
import {
  ShowroomStage3D,
  type StorySceneId,
  type StoryStageState,
} from './ShowroomStage3D.tsx';

gsap.registerPlugin(ScrollTrigger);

interface StorySectionsProps {
  siteConfig: SiteConfig;
  brands: BrandItem[];
  onExploreBrands: () => void;
  onOpenBrandPage: (brandName: string) => void;
  onDiscoverHoron: () => void;
  reducedMotion: boolean;
}

export const StorySections: React.FC<StorySectionsProps> = ({
  siteConfig,
  brands,
  onExploreBrands,
  onOpenBrandPage,
  onDiscoverHoron,
  reducedMotion,
}) => {
  const triggerRenderRef = useRef<() => void>(() => {});
  const storyContainerRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const appleSectionRef = useRef<HTMLElement | null>(null);
  const samsungSectionRef = useRef<HTMLElement | null>(null);
  const brandsSectionRef = useRef<HTMLElement | null>(null);
  const tabletsSectionRef = useRef<HTMLElement | null>(null);

  const stageStateRef = useRef<StoryStageState>({
    scene: 'hero',
    heroIntroProgress: reducedMotion ? 1 : 0,
    appleProgress: 0,
    samsungProgress: 0,
    brandsProgress: 0,
    tabletsProgress: 0,
    activeBrandStyle: 'tecno',
    pointerX: 0,
    pointerY: 0,
  });

  const [heroStage, setHeroStage] = useState<'logo' | 'device' | 'headline'>(
    reducedMotion ? 'headline' : 'logo',
  );
  const [activeScene, setActiveScene] = useState<StorySceneId>('hero');
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);

  const discoverBrands = brands.filter(
    (b) => b.active && !['apple', 'samsung'].includes(b.deviceStyle),
  );
  const showcaseBrands = discoverBrands.length > 0 ? discoverBrands : brands.slice(0, 3);
  const currentBrand = showcaseBrands[activeBrandIndex] || showcaseBrands[0];

  const registerTriggerRender = React.useCallback((fn: () => void) => {
    triggerRenderRef.current = fn;
  }, []);

  useEffect(() => {
    if (currentBrand) {
      stageStateRef.current.activeBrandStyle = currentBrand.deviceStyle;
      triggerRenderRef.current();
    }
  }, [currentBrand]);

  useEffect(() => {
    if (reducedMotion) {
      stageStateRef.current.heroIntroProgress = 1;
      setHeroStage('headline');
      triggerRenderRef.current();
      return;
    }

    const introState = { progress: 0 };
    const tl = gsap.timeline();
    const timerLogo = window.setTimeout(() => setHeroStage('device'), 1100);
    const timerHeadline = window.setTimeout(() => setHeroStage('headline'), 3200);

    tl.to(introState, {
      progress: 1,
      duration: 4.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        stageStateRef.current.heroIntroProgress = introState.progress;
        triggerRenderRef.current();
      },
    });

    return () => {
      tl.kill();
      window.clearTimeout(timerLogo);
      window.clearTimeout(timerHeadline);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroSectionRef.current) {
        ScrollTrigger.create({
          trigger: heroSectionRef.current,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => {
            stageStateRef.current.scene = 'hero';
            setActiveScene('hero');
            triggerRenderRef.current();
          },
          onEnterBack: () => {
            stageStateRef.current.scene = 'hero';
            setActiveScene('hero');
            triggerRenderRef.current();
          },
        });
      }

      if (appleSectionRef.current) {
        ScrollTrigger.create({
          trigger: appleSectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          onEnter: () => {
            stageStateRef.current.scene = 'apple';
            setActiveScene('apple');
            triggerRenderRef.current();
          },
          onEnterBack: () => {
            stageStateRef.current.scene = 'apple';
            setActiveScene('apple');
            triggerRenderRef.current();
          },
          onUpdate: (self) => {
            stageStateRef.current.appleProgress = self.progress;
            triggerRenderRef.current();
          },
        });
      }

      if (samsungSectionRef.current) {
        ScrollTrigger.create({
          trigger: samsungSectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          onEnter: () => {
            stageStateRef.current.scene = 'samsung';
            setActiveScene('samsung');
            triggerRenderRef.current();
          },
          onEnterBack: () => {
            stageStateRef.current.scene = 'samsung';
            setActiveScene('samsung');
            triggerRenderRef.current();
          },
          onUpdate: (self) => {
            stageStateRef.current.samsungProgress = self.progress;
            triggerRenderRef.current();
          },
        });
      }

      if (brandsSectionRef.current) {
        ScrollTrigger.create({
          trigger: brandsSectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          onEnter: () => {
            stageStateRef.current.scene = 'brands';
            setActiveScene('brands');
            triggerRenderRef.current();
          },
          onEnterBack: () => {
            stageStateRef.current.scene = 'brands';
            setActiveScene('brands');
            triggerRenderRef.current();
          },
          onUpdate: (self) => {
            stageStateRef.current.brandsProgress = self.progress;
            if (showcaseBrands.length > 1) {
              const idx = Math.min(
                showcaseBrands.length - 1,
                Math.floor(self.progress * showcaseBrands.length),
              );
              setActiveBrandIndex(idx);
            }
            triggerRenderRef.current();
          },
        });
      }

      if (tabletsSectionRef.current) {
        ScrollTrigger.create({
          trigger: tabletsSectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          onEnter: () => {
            stageStateRef.current.scene = 'tablets';
            setActiveScene('tablets');
            triggerRenderRef.current();
          },
          onEnterBack: () => {
            stageStateRef.current.scene = 'tablets';
            setActiveScene('tablets');
            triggerRenderRef.current();
          },
          onUpdate: (self) => {
            stageStateRef.current.tabletsProgress = self.progress;
            triggerRenderRef.current();
          },
        });
      }
    }, storyContainerRef);

    return () => ctx.revert();
  }, [showcaseBrands.length]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
    stageStateRef.current.pointerX = nx;
    stageStateRef.current.pointerY = ny;
    triggerRenderRef.current();
  };

  const stageBgClass =
    activeScene === 'apple' || activeScene === 'brands'
      ? 'horon-surface-pearl'
      : 'horon-surface-white';

  return (
    <div
      ref={storyContainerRef}
      onPointerMove={handlePointerMove}
      className={`relative overflow-x-clip transition-all duration-1000 ${stageBgClass}`}
    >
      {/* Scène 3D WebGL fixe avec rubans de dégradé animés aux bordures */}
      <div className="sticky top-0 h-screen w-full pointer-events-none overflow-hidden z-0">
        <EdgeGradientRibbons variant="story" />
        <div className="relative z-10 w-full h-full">
          <ShowroomStage3D
            stageStateRef={stageStateRef}
            registerTriggerRender={registerTriggerRender}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      {/* Sections 3D synchronisées au scroll — titres précis et boutons CTA uniquement */}
      <div className="relative z-10 -mt-[100vh]">
        {/* SECTION 01 — INTRODUCTION 3D */}
        <section
          id="hero-section"
          ref={heroSectionRef}
          className="min-h-screen flex flex-col justify-between pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div
            className={`flex flex-col items-center text-center transition-all duration-700 ${
              heroStage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <HoronLogo size="sm" />
            <p className="mt-2 text-xs font-medium tracking-[0.18em] text-[#A6ABB3] uppercase">
              {siteConfig.storeAddress}
            </p>
          </div>

          <div className="h-[46vh] sm:h-[52vh]" aria-hidden="true" />

          <div
            className={`flex flex-col items-center text-center max-w-3xl mx-auto transition-all duration-700 ${
              heroStage === 'headline'
                ? 'opacity-100 translate-y-0'
                : 'opacity-80 translate-y-3'
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={onExploreBrands}
                className="px-6 py-3 rounded-full bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_8px_24px_rgba(23,105,224,0.22)]"
              >
                <span>EXPLORER NOS MARQUES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDiscoverHoron}
                className="px-6 py-3 rounded-full bg-white/95 border border-[#E9EBEF] hover:border-[#20242C] text-[#111318] text-sm font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                DÉCOUVRIR HORON PHONE
              </button>
            </div>

            <div className="mt-10 flex flex-col items-center gap-2 text-[#A6ABB3]">
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase">
                DÉFILER POUR EXPLORER
              </span>
              <div className="w-px h-7 bg-[#E9EBEF] overflow-hidden relative">
                <div className="w-full h-full bg-[#1769E0] animate-scroll-line" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#A6ABB3]" />
            </div>
          </div>
        </section>

        {/* SECTION 02 — SCÈNE 3D APPLE */}
        <section
          id="apple-section"
          ref={appleSectionRef}
          className="min-h-[105vh] flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="w-full lg:w-[42%] bg-transparent p-0 mt-[34vh] lg:mt-0">
            <AnimatedSectionTitle
              eyebrow="Univers Apple"
              title={siteConfig.appleHeadline}
              replayOnScroll
              reducedMotion={reducedMotion}
              accentLine
              titleClassName="mt-2 font-display font-semibold tracking-tight text-[#111318] text-xl sm:text-2xl lg:text-3xl leading-[1.15] text-balance"
            />

            <div className="mt-6">
              <button
                type="button"
                onClick={() => onOpenBrandPage('Apple')}
                className="px-6 py-3 rounded-full bg-[#111318] hover:bg-[#1769E0] text-white text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>EXPLORER APPLE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 03 — SCÈNE 3D SAMSUNG */}
        <section
          id="samsung-section"
          ref={samsungSectionRef}
          className="min-h-[105vh] flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="w-full lg:w-[42%] bg-transparent p-0 mt-[34vh] lg:mt-0">
            <AnimatedSectionTitle
              eyebrow="Samsung Galaxy"
              title={siteConfig.samsungHeadline}
              replayOnScroll
              reducedMotion={reducedMotion}
              accentLine
              titleClassName="mt-2 font-display font-semibold tracking-tight text-[#111318] text-xl sm:text-2xl lg:text-3xl leading-[1.15] text-balance"
            />

            <div className="mt-6">
              <button
                type="button"
                onClick={() => onOpenBrandPage('Samsung')}
                className="px-6 py-3 rounded-full bg-[#111318] hover:bg-[#1769E0] text-white text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>DÉCOUVRIR SAMSUNG</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 04 — SCÈNE 3D MARQUES INTERNATIONALES */}
        <section
          id="brands-section"
          ref={brandsSectionRef}
          className="min-h-[110vh] flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="w-full lg:w-[44%] bg-transparent p-0 mt-[34vh] lg:mt-0">
            <AnimatedSectionTitle
              eyebrow="Marques Internationales"
              title="DES SMARTPHONES D'EXCEPTION."
              replayOnScroll
              reducedMotion={reducedMotion}
              accentLine
              titleClassName="mt-2 font-display font-semibold tracking-tight text-[#111318] text-xl sm:text-2xl lg:text-3xl leading-[1.15] text-balance"
            />

            <div className="mt-5 flex flex-wrap items-center gap-1.5 p-1 bg-white/60 backdrop-blur-sm rounded-xl w-fit">
              {showcaseBrands.map((brand, idx) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    setActiveBrandIndex(idx);
                    stageStateRef.current.scene = 'brands';
                    stageStateRef.current.activeBrandStyle = brand.deviceStyle;
                    triggerRenderRef.current();
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    idx === activeBrandIndex
                      ? 'bg-white text-[#111318] shadow-sm'
                      : 'text-[#20242C]/70 hover:text-[#111318]'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>

            {currentBrand && (
              <p className="mt-4 font-display text-base font-semibold text-[#111318]">
                {currentBrand.name}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  currentBrand ? onOpenBrandPage(currentBrand.name) : onExploreBrands()
                }
                className="px-6 py-3 rounded-full bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {currentBrand ? `VOIR ${currentBrand.name}` : 'EXPLORER LES MARQUES'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 05 — SCÈNE 3D TABLETTES */}
        <section
          id="tablets-section"
          ref={tabletsSectionRef}
          className="min-h-[105vh] flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="w-full lg:w-[44%] bg-transparent p-0 mt-[32vh] lg:mt-0">
            <AnimatedSectionTitle
              eyebrow="Tablettes & iPad"
              title={siteConfig.tabletsHeadline}
              replayOnScroll
              reducedMotion={reducedMotion}
              accentLine
              titleClassName="mt-2 font-display font-semibold tracking-tight text-[#111318] text-xl sm:text-2xl lg:text-3xl leading-[1.15] text-balance"
            />

            <div className="mt-6">
              <button
                type="button"
                onClick={onExploreBrands}
                className="px-6 py-3 rounded-full bg-[#111318] hover:bg-[#1769E0] text-white text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>CHOISIR UNE MARQUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Transition fluide en dégradé perle vers la section suivante */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#F6F7F9]/95 z-[5]"
      />
    </div>
  );
};
