import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fetchStorefront } from './api/client.ts';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { BrandPage } from './components/BrandPage.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ContactModal } from './components/ContactModal.tsx';
import { Navbar } from './components/Navbar.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { ProductShowroom } from './components/ProductShowroom.tsx';
import { StatsSection } from './components/StatsSection.tsx';
import { StorySections } from './components/StorySections.tsx';
import { TrustAndClosing } from './components/TrustAndClosing.tsx';
import { SectionMicroDivider } from './components/ui/SectionMotion.tsx';
import { DEFAULT_STORE_SEED } from './data/defaultSeed.ts';
import type { BrandItem, CartItem, CategoryItem, Product, SiteConfig } from './types.ts';

gsap.registerPlugin(ScrollTrigger);

const CART_STORAGE_KEY = 'horon_phone_cart_v1';

export default function App() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_STORE_SEED.products);
  const [brands, setBrands] = useState<BrandItem[]>(DEFAULT_STORE_SEED.brands);
  const [categories, setCategories] = useState<CategoryItem[]>(
    DEFAULT_STORE_SEED.categories,
  );
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(
    DEFAULT_STORE_SEED.siteConfig,
  );

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as CartItem[];
    } catch {
      // ignore invalid storage
    }
    return [];
  });

  const [selectedBrandPage, setSelectedBrandPage] = useState<string | null>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#marque/')) {
      return decodeURIComponent(hash.slice('#marque/'.length));
    }
    return null;
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const lenisRef = useRef<Lenis | null>(null);

  const loadStorefront = useCallback(async () => {
    try {
      const data = await fetchStorefront();
      setProducts(data.products);
      setBrands(data.brands);
      setCategories(data.categories);
      setSiteConfig(data.siteConfig);
    } catch {
      // Keep seed fallback if initial fetch fails
    }
  }, []);

  useEffect(() => {
    loadStorefront();
  }, [loadStorefront]);

  // Synchroniser le hash navigateur (#marque/...)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#marque/')) {
        setSelectedBrandPage(decodeURIComponent(hash.slice('#marque/'.length)));
      } else {
        setSelectedBrandPage(null);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Smooth scroll Lenis uniquement sur la page vitrine principale
  useEffect(() => {
    if (adminOpen || selectedBrandPage || reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [adminOpen, selectedBrandPage, reducedMotion]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage quota errors
    }
  }, [cartItems]);

  const scrollToElement = useCallback(
    (id: string) => {
      if (selectedBrandPage) {
        setSelectedBrandPage(null);
        window.history.pushState(null, '', '#');
        window.setTimeout(() => {
          const target = document.getElementById(id);
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -64 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [selectedBrandPage],
  );

  const handleOpenBrandPage = useCallback((brandName: string) => {
    setSelectedBrandPage(brandName);
    window.history.pushState(null, '', `#marque/${encodeURIComponent(brandName)}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleBackToHome = useCallback(() => {
    setSelectedBrandPage(null);
    window.history.pushState(null, '', '#');
    window.setTimeout(() => {
      const el = document.getElementById('showroom-section');
      el?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 60);
  }, []);

  const handleAddToCart = useCallback((product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const nextQty =
          product.availability === 'Pre-Order'
            ? existing.quantity + quantity
            : Math.min(product.stock, existing.quantity + quantity);
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: nextQty } : i,
        );
      }
      return [...prev, { product, quantity }];
    });
    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((cur) => (cur === product.id ? null : cur));
    }, 1400);
  }, []);

  const handleUpdateCartQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        const maxQty =
          i.product.availability === 'Pre-Order' ? 20 : Math.max(1, i.product.stock);
        return { ...i, quantity: Math.min(maxQty, qty) };
      }),
    );
  }, []);

  const handleRemoveCartItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const handleOrderSuccess = useCallback(() => {
    setCartItems([]);
    loadStorefront();
  }, [loadStorefront]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  if (adminOpen) {
    return (
      <AdminDashboard
        products={products}
        brands={brands}
        categories={categories}
        siteConfig={siteConfig}
        onRefreshStorefront={loadStorefront}
        onClose={() => setAdminOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111318] overflow-x-clip">
      <Navbar
        onOpenContact={() => setContactOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenBrandPage={handleOpenBrandPage}
        onScrollToSection={scrollToElement}
        bannerEnabled={siteConfig.bannerEnabled}
        bannerText={siteConfig.bannerText}
      />

      {selectedBrandPage ? (
        <main>
          <BrandPage
            brandName={selectedBrandPage}
            brands={brands}
            categories={categories}
            products={products}
            onBackHome={handleBackToHome}
            onSelectBrand={handleOpenBrandPage}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            recentlyAddedId={recentlyAddedId}
          />
        </main>
      ) : (
        <main>
          <StorySections
            siteConfig={siteConfig}
            brands={brands}
            onExploreBrands={() => scrollToElement('showroom-section')}
            onOpenBrandPage={handleOpenBrandPage}
            onDiscoverHoron={() => scrollToElement('why-horon-section')}
            reducedMotion={reducedMotion}
          />

          <SectionMicroDivider
            variant="orb-sweep"
            reducedMotion={reducedMotion}
            className="bg-[#F6F7F9]"
          />

          <ProductShowroom
            brands={brands}
            siteConfig={siteConfig}
            onSelectBrandPage={handleOpenBrandPage}
            reducedMotion={reducedMotion}
          />

          <SectionMicroDivider
            variant="harmonic-bars"
            reducedMotion={reducedMotion}
            className="bg-[#F2F4F7]"
          />

          <StatsSection reducedMotion={reducedMotion} />

          <SectionMicroDivider
            variant="scroll-chevron"
            reducedMotion={reducedMotion}
            className="bg-[#EFF1F5]"
          />

          <TrustAndClosing
            siteConfig={siteConfig}
            reducedMotion={reducedMotion}
            onExploreBrands={() => scrollToElement('showroom-section')}
            onContactUs={() => setContactOpen(true)}
            onOpenAdmin={() => setAdminOpen(true)}
          />
        </main>
      )}

      <ProductDetailModal
        product={quickViewProduct}
        products={products}
        siteConfig={siteConfig}
        onClose={() => setQuickViewProduct(null)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        siteConfig={siteConfig}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cartItems}
        siteConfig={siteConfig}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <ContactModal
        open={contactOpen}
        siteConfig={siteConfig}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
