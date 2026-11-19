import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Headphones,
  Home,
  MoreVertical,
  PhoneCall,
  Shield,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { HoronLogo } from './HoronLogo.tsx';

interface NavbarProps {
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  onOpenBrandPage: (brandName: string) => void;
  onScrollToSection: (sectionId: string) => void;
  bannerEnabled?: boolean;
  bannerText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenContact,
  onOpenAdmin,
  onOpenBrandPage,
  onScrollToSection,
  bannerEnabled,
  bannerText,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [logoTitleTransparent, setLogoTitleTransparent] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const logoBtnRef = useRef<HTMLButtonElement>(null);

  const showBanner = Boolean(
    bannerEnabled && bannerText?.trim() && !bannerDismissed,
  );

  useEffect(() => {
    let rafId = 0;

    const checkOverlap = () => {
      rafId = 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY < 20) {
        setLogoTitleTransparent(false);
        return;
      }

      const btn = logoBtnRef.current;
      const titleEl = btn?.querySelector('[data-horon-logo-title="true"]') as HTMLElement | null;
      if (!titleEl) {
        setLogoTitleTransparent(scrollY > 40);
        return;
      }

      const rect = titleEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const sampleXs = [
        rect.left + rect.width * 0.15,
        rect.left + rect.width * 0.5,
        rect.left + rect.width * 0.85,
      ];
      const sampleY = rect.top + rect.height * 0.5;

      let overlapsContent = false;
      for (const x of sampleXs) {
        const stack = document.elementsFromPoint(x, sampleY);
        for (const el of stack) {
          if (el.closest('header')) continue;
          const tag = el.tagName.toUpperCase();
          if (tag === 'HTML' || tag === 'BODY' || tag === 'MAIN') continue;

          if (el.classList.contains('edge-motion-layer') || el.getAttribute('aria-hidden') === 'true') {
            // Vérifier tout de même si c'est une image/vidéo produit ou un canvas vidéo
            if (tag !== 'IMG' && tag !== 'VIDEO' && tag !== 'CANVAS') continue;
          }

          if (tag === 'IMG' || tag === 'VIDEO') {
            overlapsContent = true;
            break;
          }

          if (tag === 'CANVAS') {
            // Canvas vidéo de la section Pourquoi HORON ou scène 3D en cours de défilement
            if (el.closest('#why-horon-section') || scrollY > 120) {
              overlapsContent = true;
              break;
            }
          }

          if (
            tag === 'H1' ||
            tag === 'H2' ||
            tag === 'H3' ||
            tag === 'H4' ||
            tag === 'P' ||
            tag === 'A' ||
            tag === 'BUTTON' ||
            tag === 'SPAN' ||
            tag === 'LABEL'
          ) {
            if ((el.textContent || '').trim().length > 0) {
              overlapsContent = true;
              break;
            }
          }
        }
        if (overlapsContent) break;
      }

      setLogoTitleTransparent(overlapsContent);
    };

    const scheduleCheck = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(checkOverlap);
    };

    checkOverlap();
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuContainerRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleLinkAction = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-transparent pointer-events-none">
      {showBanner && (
        <div className="pointer-events-auto bg-[#111318]/90 backdrop-blur-md text-white text-xs py-1.5 px-4 flex items-center justify-center gap-4">
          <span className="truncate">{bannerText}</span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Fermer l'annonce"
            className="text-[#A6ABB3] hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1 : Logo sur fond transparent */}
          <button
            ref={logoBtnRef}
            type="button"
            onClick={() =>
              handleLinkAction(() => onScrollToSection('hero-section'))
            }
            className="pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] rounded-lg py-1 cursor-pointer"
            aria-label="Accueil HORON PHONE"
          >
            <HoronLogo size="md" titleTransparent={logoTitleTransparent} />
          </button>

          {/* Zone 2 : Navigation principale desktop sur fond transparent */}
          <nav
            aria-label="Navigation principale"
            className="pointer-events-auto hidden lg:flex items-center gap-7 text-sm font-medium text-[#111318]"
          >
            <button
              type="button"
              onClick={() => onScrollToSection('hero-section')}
              className="hover:text-[#1769E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => onScrollToSection('showroom-section')}
              className="hover:text-[#1769E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Marques
            </button>
            <button
              type="button"
              onClick={() => onOpenBrandPage('Apple')}
              className="hover:text-[#1769E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Apple
            </button>
            <button
              type="button"
              onClick={() => onOpenBrandPage('Samsung')}
              className="hover:text-[#1769E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Samsung
            </button>
            <button
              type="button"
              onClick={() => onScrollToSection('why-horon-section')}
              className="hover:text-[#1769E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Qualité &amp; Services
            </button>
            <button
              type="button"
              onClick={onOpenContact}
              className="hover:text-[#1769E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Zone 3 : Admin + Bouton Trois Points (sans bouton panier) */}
          <div
            ref={menuContainerRef}
            className="pointer-events-auto relative flex items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Tableau de bord administration"
              title="Administration"
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium text-[#111318] bg-white/55 backdrop-blur-md border border-black/10 hover:border-[#1769E0] hover:text-[#1769E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              className={`w-10 h-10 inline-flex items-center justify-center rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                menuOpen
                  ? 'bg-[#111318] text-white border-[#111318] shadow-lg'
                  : 'bg-white/60 text-[#111318] border-black/10 hover:bg-white/85'
              }`}
            >
              {menuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>

            {/* Panneau flottant verre dépoli en grille bento 2 colonnes pour le menu trois points */}
            {menuOpen && (
              <div
                role="menu"
                aria-label="Menu de navigation"
                className="absolute right-0 top-12 w-[min(340px,calc(100vw-2rem))] rounded-3xl bg-white/88 backdrop-blur-2xl border border-[#E9EBEF] shadow-[0_24px_64px_rgba(17,19,24,0.16)] p-4 z-50"
              >
                <div className="flex items-center justify-between px-1 pb-3 mb-3 border-b border-[#E9EBEF]/80">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1769E0]">
                    Showroom Horon
                  </span>
                  <span className="text-[11px] text-[#A6ABB3]">Bamako</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleLinkAction(() => onScrollToSection('hero-section'))
                    }
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-[#F5F6F8]/90 hover:bg-[#1769E0]/10 border border-transparent hover:border-[#1769E0]/30 text-left transition-all cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-[#1769E0]" />
                    <span className="text-xs font-semibold text-[#111318]">
                      Accueil
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleLinkAction(() =>
                        onScrollToSection('showroom-section'),
                      )
                    }
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-[#F5F6F8]/90 hover:bg-[#1769E0]/10 border border-transparent hover:border-[#1769E0]/30 text-left transition-all cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#1769E0]" />
                    <span className="text-xs font-semibold text-[#111318]">
                      Marques
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleLinkAction(() => onOpenBrandPage('Apple'))
                    }
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-[#F5F6F8]/90 hover:bg-[#1769E0]/10 border border-transparent hover:border-[#1769E0]/30 text-left transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-[#111318]" />
                    <span className="text-xs font-semibold text-[#111318]">
                      Apple
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleLinkAction(() => onOpenBrandPage('Samsung'))
                    }
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-[#F5F6F8]/90 hover:bg-[#1769E0]/10 border border-transparent hover:border-[#1769E0]/30 text-left transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#111318]" />
                    <span className="text-xs font-semibold text-[#111318]">
                      Samsung
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleLinkAction(() =>
                        onScrollToSection('why-horon-section'),
                      )
                    }
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-[#F5F6F8]/90 hover:bg-[#1769E0]/10 border border-transparent hover:border-[#1769E0]/30 text-left transition-all cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 text-[#1769E0]" />
                    <span className="text-xs font-semibold text-[#111318]">
                      Qualité &amp; Services
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLinkAction(onOpenContact)}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-[#F5F6F8]/90 hover:bg-[#1769E0]/10 border border-transparent hover:border-[#1769E0]/30 text-left transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-[#1769E0]" />
                    <span className="text-xs font-semibold text-[#111318]">
                      Contact
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
