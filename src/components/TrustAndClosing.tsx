import React, { useEffect, useRef, useState } from 'react';
import {
  Headphones,
  Layers,
  Lock,
  Phone,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { SiteConfig, TrustPillar } from '../types.ts';
import { HoronLogo } from './HoronLogo.tsx';
import { EdgeGradientRibbons } from './EdgeGradientRibbons.tsx';
import { SALES_ADVISORS, resolveAdvisorTelHref } from '../data/advisors.ts';
import { LocationSection } from './LocationSection.tsx';
import { AnimatedSectionTitle, SectionMicroDivider } from './ui/SectionMotion.tsx';

interface TrustAndClosingProps {
  siteConfig: SiteConfig;
  reducedMotion: boolean;
  onExploreBrands: () => void;
  onContactUs: () => void;
  onOpenAdmin: () => void;
}

function renderPillarIcon(icon: TrustPillar['icon']) {
  const cls = 'w-4 h-4 text-[#1769E0]';
  switch (icon) {
    case 'shield':
      return <ShieldCheck className={cls} />;
    case 'layers':
      return <Layers className={cls} />;
    case 'user':
      return <UserCheck className={cls} />;
    case 'lock':
      return <Lock className={cls} />;
    case 'headphones':
      return <Headphones className={cls} />;
    default:
      return <ShieldCheck className={cls} />;
  }
}

export const TrustAndClosing: React.FC<TrustAndClosingProps> = ({
  siteConfig,
  reducedMotion,
  onExploreBrands,
  onContactUs,
  onOpenAdmin,
}) => {
  const scrollTrackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frameCount, setFrameCount] = useState<number>(108);
  const [useVideoFallback, setUseVideoFallback] = useState<boolean>(false);

  // Filtrer l'ancienne carte "Produits de qualité" remplacée par la séquence vidéo défilante
  const remainingPillars = siteConfig.trustPillars.filter(
    (p) => p.id !== 'tp-1' && p.title.toLowerCase() !== 'produits de qualité',
  );

  // Récupérer le nombre réel de trames embarquées dans /media/quality-frames/
  useEffect(() => {
    let active = true;
    fetch('/media/quality-frames/meta.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (active && data?.count && data.count > 0) {
          setFrameCount(data.count);
        }
      })
      .catch(() => {
        // Conserve 108 par défaut
      });
    return () => {
      active = false;
    };
  }, []);

  // Séquence d'images haute fluidité sur Canvas (actifs statiques embarqués, zéro dépendance ffmpeg au déploiement)
  useEffect(() => {
    const track = scrollTrackRef.current;
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!track || !frame || !canvas || reducedMotion || useVideoFallback) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    const loadedImages: Array<HTMLImageElement | null> = new Array(frameCount).fill(null);
    let lastDrawnIdx = -1;
    let loadedCount = 0;
    let failedCount = 0;

    const getFrameUrl = (idx: number) =>
      `/media/quality-frames/frame_${String(idx + 1).padStart(3, '0')}.jpg`;

    const drawFrame = (targetIdx: number) => {
      let bestImg = loadedImages[targetIdx];
      if (!bestImg) {
        // Chercher la trame chargée la plus proche si toutes ne sont pas encore arrivées
        for (let offset = 1; offset < frameCount; offset++) {
          if (targetIdx - offset >= 0 && loadedImages[targetIdx - offset]) {
            bestImg = loadedImages[targetIdx - offset];
            break;
          }
          if (targetIdx + offset < frameCount && loadedImages[targetIdx + offset]) {
            bestImg = loadedImages[targetIdx + offset];
            break;
          }
        }
      }
      if (bestImg && bestImg.complete && bestImg.naturalWidth > 0) {
        ctx.drawImage(bestImg, 0, 0, canvas.width, canvas.height);
      }
    };

    // Prioriser d'abord la trame 1 puis des trames espacées pour réactivité immédiate, puis tout le reste
    const order: number[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < frameCount; i += 8) {
      order.push(i);
      seen.add(i);
    }
    for (let i = 0; i < frameCount; i++) {
      if (!seen.has(i)) order.push(i);
    }

    let cursor = 0;
    const concurrency = 6;

    const loadNext = () => {
      if (cancelled || cursor >= order.length) return;
      const idx = order[cursor++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (cancelled) return;
        loadedCount += 1;
        loadedImages[idx] = img;
        if (idx === 0 && lastDrawnIdx === -1) {
          drawFrame(0);
          lastDrawnIdx = 0;
        }
        loadNext();
      };
      img.onerror = () => {
        if (cancelled) return;
        failedCount += 1;
        if (loadedCount === 0 && (idx === 0 || failedCount >= 4)) {
          setUseVideoFallback(true);
          return;
        }
        loadNext();
      };
      img.src = getFrameUrl(idx);
    };

    for (let w = 0; w < concurrency; w++) {
      loadNext();
    }

    let rafId = 0;
    const tick = () => {
      if (cancelled) return;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      const startY = vh * 0.85;
      const totalDistance = Math.max(1, rect.height - vh * 0.35);
      const rawProgress = (startY - rect.top) / totalDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));

      // Agrandissement fluide du cadre au même rythme que le scroll
      const scale = 0.78 + progress * 0.22;
      const radius = Math.round(28 - progress * 16);
      frame.style.transform = `scale(${scale.toFixed(4)})`;
      frame.style.borderRadius = `${radius}px`;

      // Rendu instantané de la trame correspondant au pourcentage de défilement
      const targetIdx = Math.min(
        frameCount - 1,
        Math.max(0, Math.round(progress * (frameCount - 1))),
      );
      if (targetIdx !== lastDrawnIdx || lastDrawnIdx === -1) {
        drawFrame(targetIdx);
        lastDrawnIdx = targetIdx;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [frameCount, reducedMotion, useVideoFallback]);

  const renderPillarCard = (pillar: TrustPillar, keyPrefix: string) => (
    <div
      key={`${keyPrefix}-${pillar.id}`}
      className="w-[260px] sm:w-[290px] shrink-0 bg-white rounded-xl border border-[#E9EBEF] px-4 py-3.5 flex items-center gap-3.5 shadow-[0_4px_16px_rgba(17,19,24,0.03)]"
    >
      <div className="w-9 h-9 rounded-lg bg-[#F5F6F8] flex items-center justify-center shrink-0">
        {renderPillarIcon(pillar.icon)}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-sm font-semibold text-[#111318] truncate">
          {pillar.title}
        </h3>
        <p className="mt-0.5 text-xs text-[#20242C]/75 line-clamp-2 leading-snug">
          {pillar.description}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* SECTION 07 — VIDÉO GITHUB EN DÉFILEMENT ACTIF & RECTANGLES HORIZONTAUX AUTO-ANIMÉS */}
      <section
        id="why-horon-section"
        className="relative overflow-x-clip py-24 px-4 sm:px-6 lg:px-8 horon-surface-pearl"
      >
        <EdgeGradientRibbons variant="quality" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#EFF1F5]/95 to-transparent z-[1]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F7F8FA]/95 to-transparent z-[1]"
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <AnimatedSectionTitle
              eyebrow="Pourquoi HORON PHONE"
              title={siteConfig.whyHeadline}
              reducedMotion={reducedMotion}
              accentLine
              titleClassName="mt-3 font-display font-semibold tracking-tight text-[#111318] text-2xl sm:text-3xl lg:text-4xl leading-[1.12] text-balance"
            />
          </div>
        </div>

        {/* Séquence vidéo GitHub pilotée image par image sur Canvas au rythme du défilement */}
        <div
          ref={scrollTrackRef}
          className="mt-10 relative z-10 min-h-[195vh] sm:min-h-[225vh] max-w-[1440px] mx-auto"
        >
          <div className="sticky top-20 flex items-center justify-center">
            <div
              ref={frameRef}
              className="w-full overflow-hidden bg-[#111318] border border-[#E9EBEF] shadow-[0_28px_70px_rgba(17,19,24,0.14)] origin-center will-change-transform"
              style={{
                transform: reducedMotion ? 'scale(1)' : 'scale(0.78)',
                borderRadius: reducedMotion ? '16px' : '28px',
              }}
            >
              <div className="relative w-full h-[58vh] sm:h-[74vh] lg:h-[84vh] bg-[#111318]">
                {reducedMotion || useVideoFallback ? (
                  <video
                    src="/media/quality-video.mp4"
                    poster="/media/quality-frames/frame_001.jpg"
                    controls={reducedMotion}
                    muted
                    playsInline
                    loop
                    autoPlay
                    className="w-full h-full object-cover"
                    aria-label="Vidéo de démonstration produit HORON PHONE"
                  />
                ) : (
                  <>
                    <img
                      src="/media/quality-frames/frame_001.jpg"
                      alt="Démonstration de qualité HORON PHONE"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={360}
                      className="relative z-10 w-full h-full object-cover block"
                      aria-label="Animation vidéo au défilement HORON PHONE"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Petits rectangles horizontaux auto-animés */}
        <div className="relative z-10 max-w-7xl mx-auto mt-12 overflow-hidden">
          {reducedMotion ? (
            <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2">
              {remainingPillars.map((pillar) => renderPillarCard(pillar, 'static'))}
            </div>
          ) : (
            <div className="relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
              <div className="animate-horon-marquee gap-4">
                <div className="flex items-stretch gap-4 pr-4">
                  {remainingPillars.map((pillar) => renderPillarCard(pillar, 'a'))}
                </div>
                <div className="flex items-stretch gap-4 pr-4" aria-hidden="true">
                  {remainingPillars.map((pillar) => renderPillarCard(pillar, 'b'))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SectionMicroDivider
        variant="signal-rings"
        reducedMotion={reducedMotion}
        className="bg-[#F7F8FA]"
      />

      {/* SECTION 08 — APPEL À L'ACTION FINAL + 3 GRANDS CERCLES CONSEILLERS VENDEURS */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 horon-surface-white">
        <EdgeGradientRibbons variant="closing" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#F7F8FA]/95 to-transparent z-[1]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F2F4F8]/95 to-transparent z-[1]"
        />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <AnimatedSectionTitle
              eyebrow={siteConfig.storeAddress}
              title={siteConfig.finalCtaHeadline}
              reducedMotion={reducedMotion}
              accentLine
              titleClassName="mt-3 font-display font-semibold tracking-tight text-[#111318] text-3xl sm:text-5xl leading-[1.08] text-balance"
            />
            <p className="mt-4 text-base sm:text-lg text-[#20242C]/80 max-w-xl leading-relaxed">
              {siteConfig.finalCtaSubtitle}
            </p>

            {/* 3 grands cercles horizontaux (tête des vendeurs) avec bouton Appeler en dessous */}
            <div className="mt-10 flex flex-wrap items-start gap-7 sm:gap-10">
              {SALES_ADVISORS.map((advisor) => (
                <div
                  key={advisor.id}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#E9EBEF] bg-[#F5F6F8] shadow-[0_12px_30px_rgba(17,19,24,0.1)]">
                    <img
                      src={advisor.avatar}
                      alt={`${advisor.name} — ${advisor.role}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#111318]">
                    {advisor.name}
                  </p>
                  <p className="text-xs text-[#A6ABB3]">{advisor.role}</p>

                  <a
                    href={resolveAdvisorTelHref(advisor.phone, siteConfig.whatsappNumber)}
                    className="mt-2.5 h-9 px-4 rounded-full bg-[#1769E0] hover:bg-[#1255B8] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appeler</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionMicroDivider
        variant="compass-arc"
        reducedMotion={reducedMotion}
        className="bg-[#F2F4F8]"
      />

      {/* SECTION 09 — LOCALISATION MODERNE & ANIMÉE */}
      <LocationSection siteConfig={siteConfig} reducedMotion={reducedMotion} />

      <SectionMicroDivider
        variant="horizon-fade"
        reducedMotion={reducedMotion}
        className="bg-[#F2F4F8]"
      />

      {/* Pied de page */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-[#F2F4F8] via-[#F6F7F9] to-[#EDEFF3] py-12 px-4 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D8DCE4] to-transparent"
        />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <HoronLogo size="sm" />
            <p className="mt-2 text-xs text-[#20242C]/70">
              {siteConfig.storeAddress} · {siteConfig.storeHours}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#20242C]/75">
            <button
              type="button"
              onClick={onExploreBrands}
              className="hover:text-[#1769E0] transition-colors cursor-pointer"
            >
              Nos Marques
            </button>
            <button
              type="button"
              onClick={onContactUs}
              className="hover:text-[#1769E0] transition-colors cursor-pointer"
            >
              Support Client
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hover:text-[#1769E0] transition-colors cursor-pointer"
            >
              Administration
            </button>
            <span className="text-[#A6ABB3]">
              © {new Date().getFullYear()} HORON PHONE
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};
