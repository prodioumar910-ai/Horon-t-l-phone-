import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  MapPin,
  Navigation,
} from 'lucide-react';
import type { SiteConfig } from '../types.ts';
import { EdgeGradientRibbons } from './EdgeGradientRibbons.tsx';
import { AnimatedSectionTitle } from './ui/SectionMotion.tsx';

export const HORON_MAPS_URL =
  'https://maps.app.goo.gl/frovAmXFRFCLXfen9?g_st=ic';

interface LocationSectionProps {
  siteConfig: SiteConfig;
  reducedMotion: boolean;
}

const ROUTE_STEPS = [
  {
    num: '01',
    title: 'Centre-Ville de Bamako',
    detail: 'Empruntez l’axe principal en direction de Bamako-Coura.',
  },
  {
    num: '02',
    title: 'Repère Malitelda',
    detail: 'Continuez tout près de Malitelda au cœur de Bamako-Coura.',
  },
  {
    num: '03',
    title: 'Showroom HORON PHONE',
    detail: 'Vous êtes arrivé — accueil, test des appareils et retrait direct.',
  },
];

export const LocationSection: React.FC<LocationSectionProps> = ({
  siteConfig,
  reducedMotion,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setActiveStep(2);
      return;
    }
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % ROUTE_STEPS.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(HORON_MAPS_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard permission denials
    }
  };

  return (
    <section
      id="location-section"
      aria-label="Localisation HORON PHONE Bamako"
      className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 horon-surface-pearl"
    >
      <EdgeGradientRibbons variant="closing" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#F2F4F8]/95 to-transparent z-[1]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F2F4F8]/95 to-transparent z-[1]"
      />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Colonne gauche : explication claire + étapes guidées + lien exact */}
        <div className="lg:col-span-5">
          <AnimatedSectionTitle
            eyebrow={`Localisation · ${siteConfig.storeAddress}`}
            title="TROUVEZ LA BOUTIQUE EN UN INSTANT."
            reducedMotion={reducedMotion}
            accentLine
            titleClassName="mt-3 font-display font-semibold tracking-tight text-[#111318] text-3xl sm:text-4xl leading-[1.1] text-balance"
          />
          <p className="mt-3.5 text-sm sm:text-base text-[#20242C]/80 leading-relaxed">
            Située à <span className="font-semibold text-[#111318]">Bamako-Coura</span>,
            tout près de <span className="font-semibold text-[#111318]">Malitelda</span>,
            notre boutique vous accueille dans un espace moderne et accessible.
          </p>

          {/* 3 étapes simples synchronisées avec l'animation */}
          <div className="mt-7 space-y-2.5">
            {ROUTE_STEPS.map((step, index) => {
              const isCurrent = index === activeStep;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'bg-white/95 border-[#1769E0]/40 shadow-[0_12px_30px_rgba(23,105,224,0.09)]'
                      : 'bg-white/55 border-[#E9EBEF] hover:bg-white/80'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full text-[11px] font-mono font-semibold flex items-center justify-center shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-[#1769E0] text-white'
                        : 'bg-[#F0F2F6] text-[#20242C]/70'
                    }`}
                  >
                    {step.num}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-[#111318]">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#20242C]/75 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-[#20242C]/70">
            <Clock className="w-3.5 h-3.5 text-[#1769E0] shrink-0" />
            <span>{siteConfig.storeHours}</span>
          </div>

          {/* Bouton principal ouvrant le lien Maps exact + copie rapide */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={HORON_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-6 rounded-full bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-[0_10px_26px_rgba(23,105,224,0.22)] whitespace-nowrap"
            >
              <Navigation className="w-4 h-4" />
              <span>Ouvrir l&apos;itinéraire</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="h-11 px-4 rounded-full bg-white/80 hover:bg-white border border-[#E5E8EE] text-[#111318] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lien copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#1769E0]" />
                  <span>Copier le lien</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Colonne droite : carte architecturale moderne et animée (style spatial minimaliste) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-[#E5E8EE] shadow-[0_24px_60px_rgba(17,19,24,0.07)] overflow-hidden p-3 sm:p-4">
            <div className="relative aspect-[16/11] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#F7F9FC] to-[#ECEFF6] border border-[#EDF0F5]">
              {/* Grille architecturale & Fleuve Niger stylisé en vecteur minimaliste */}
              <svg
                viewBox="0 0 640 400"
                className="w-full h-full block select-none"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="horonZoneGlow" cx="76%" cy="34%" r="36%">
                    <stop offset="0%" stopColor="rgba(23, 105, 224, 0.14)" />
                    <stop offset="60%" stopColor="rgba(23, 105, 224, 0.04)" />
                    <stop offset="100%" stopColor="rgba(23, 105, 224, 0)" />
                  </radialGradient>
                  <linearGradient id="horonRouteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94A3B8" />
                    <stop offset="45%" stopColor="#1769E0" />
                    <stop offset="100%" stopColor="#1769E0" />
                  </linearGradient>
                </defs>

                {/* Halo doux autour du showroom */}
                <rect x="0" y="0" width="640" height="400" fill="url(#horonZoneGlow)" />

                {/* Trame urbaine minimaliste (lignes architecturales perle) */}
                <g stroke="#E4E8F1" strokeWidth="1.2" fill="none">
                  <path d="M 0 92 L 640 78" />
                  <path d="M 0 165 L 640 152" />
                  <path d="M 0 245 L 640 228" />
                  <path d="M 0 322 L 640 305" />
                  <path d="M 110 0 L 138 400" />
                  <path d="M 225 0 L 252 400" />
                  <path d="M 355 0 L 372 400" />
                  <path d="M 488 0 L 502 400" />
                </g>

                {/* Courbe douce évoquant le Fleuve Niger au sud */}
                <path
                  d="M -20 380 Q 190 342 380 365 T 660 345"
                  fill="none"
                  stroke="rgba(23, 105, 224, 0.11)"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                <path
                  d="M -20 380 Q 190 342 380 365 T 660 345"
                  fill="none"
                  stroke="rgba(23, 105, 224, 0.22)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />

                {/* Avenues principales menant à Bamako-Coura */}
                <path
                  d="M 55 340 C 130 295, 220 265, 316 226 C 392 195, 435 162, 488 134"
                  fill="none"
                  stroke="#DDE3EE"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Tracé de guidage pointillé gris argent */}
                <path
                  d="M 112 308 C 185 270, 248 252, 316 226 C 390 197, 436 164, 488 134"
                  fill="none"
                  stroke="#B8C2D4"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />

                {/* Tracé animé bleu électrique indiquant le chemin en temps réel */}
                <path
                  d="M 112 308 C 185 270, 248 252, 316 226 C 390 197, 436 164, 488 134"
                  fill="none"
                  stroke="url(#horonRouteGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className={reducedMotion ? '' : 'anim-route-flow'}
                />

                {/* Point animé voyageant le long de la route */}
                {!reducedMotion && (
                  <circle r="5.5" fill="#1769E0" stroke="#ffffff" strokeWidth="2">
                    <animateMotion
                      dur="7.5s"
                      repeatCount="indefinite"
                      path="M 112 308 C 185 270, 248 252, 316 226 C 390 197, 436 164, 488 134"
                    />
                  </circle>
                )}

                {/* Nœud 1 : Centre-Ville */}
                <g transform="translate(112, 308)">
                  <circle
                    r={activeStep === 0 ? 9 : 6}
                    fill={activeStep === 0 ? '#1769E0' : '#FFFFFF'}
                    stroke={activeStep === 0 ? '#1769E0' : '#94A3B8'}
                    strokeWidth="2.5"
                  />
                </g>

                {/* Nœud 2 : Malitelda */}
                <g transform="translate(316, 226)">
                  <circle
                    r={activeStep === 1 ? 10 : 7}
                    fill={activeStep === 1 ? '#1769E0' : '#FFFFFF'}
                    stroke={activeStep === 1 ? '#1769E0' : '#64748B'}
                    strokeWidth="2.5"
                  />
                </g>
              </svg>

              {/* Étiquettes spatiales épurées */}
              <div
                className={`hidden sm:flex items-center gap-1.5 absolute left-[11%] bottom-[13%] px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all duration-300 ${
                  activeStep === 0
                    ? 'bg-[#111318] text-white border-[#111318] shadow-md scale-105'
                    : 'bg-white/90 text-[#20242C] border-[#E5E8EE]'
                }`}
              >
                <span>Centre-Ville</span>
              </div>

              <div
                className={`flex items-center gap-1.5 absolute left-[41%] top-[59%] px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all duration-300 ${
                  activeStep === 1
                    ? 'bg-[#1769E0] text-white border-[#1769E0] shadow-md scale-105'
                    : 'bg-white/95 text-[#111318] border-[#E5E8EE]'
                }`}
              >
                <span>Malitelda</span>
              </div>

              {/* Pin animé HORON PHONE avec halo radar & lien direct */}
              <a
                href={HORON_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Voir HORON PHONE à Bamako-Coura sur la carte"
                className="group absolute left-[76.2%] top-[33.5%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  {!reducedMotion && (
                    <>
                      <span className="anim-radar-pulse absolute w-14 h-14 rounded-full border border-[#1769E0]/45 bg-[#1769E0]/10" />
                      <span
                        className="anim-radar-pulse absolute w-14 h-14 rounded-full border border-[#F58C38]/35"
                        style={{ animationDelay: '1.6s' }}
                      />
                    </>
                  )}
                  <div
                    className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-white border-2 transition-transform duration-300 group-hover:scale-110 shadow-[0_10px_28px_rgba(23,105,224,0.28)] ${
                      activeStep === 2 ? 'border-[#1769E0] scale-105' : 'border-[#1769E0]/80'
                    }`}
                  >
                    <img
                      src="/assets/horon-logo-circle.png"
                      alt="HORON PHONE Showroom"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-2 px-3 py-1 rounded-full bg-[#111318] text-white text-[11px] font-medium tracking-wide shadow-lg flex items-center gap-1.5 whitespace-nowrap group-hover:bg-[#1769E0] transition-colors">
                  <MapPin className="w-3 h-3 text-[#60A5FA] group-hover:text-white" />
                  <span>HORON PHONE · Bamako-Coura</span>
                </div>
              </a>

              {/* Barre explicative en direct en bas de la carte */}
              <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-auto sm:bottom-4 bg-white/90 backdrop-blur-md border border-[#E5E8EE] rounded-2xl px-3.5 py-2.5 shadow-[0_8px_24px_rgba(17,19,24,0.06)] flex items-center gap-3 max-w-sm">
                <span className="w-2 h-2 rounded-full bg-[#1769E0] shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#111318] truncate">
                    {ROUTE_STEPS[activeStep].num} · {ROUTE_STEPS[activeStep].title}
                  </p>
                  <p className="text-[11px] text-[#20242C]/75 truncate">
                    {ROUTE_STEPS[activeStep].detail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
