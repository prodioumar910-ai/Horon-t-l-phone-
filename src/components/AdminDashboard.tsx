import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Edit3,
  Lock,
  LogOut,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  adminLogin,
  createBrand,
  createCategory,
  createProduct,
  deleteBrand,
  deleteCategory,
  deleteProduct,
  fetchAdminOrders,
  updateBrand,
  updateOrderStatus,
  updateProduct,
  updateSiteConfig,
  uploadProductImage,
  verifyAdminSession,
} from '../api/client.ts';
import type {
  AvailabilityStatus,
  BrandItem,
  CategoryItem,
  Order,
  OrderStatus,
  Product,
  SiteConfig,
} from '../types.ts';
import {
  formatFcfa,
  translateAvailability,
  translateOrderStatus,
} from '../utils/format.ts';
import { HoronLogo } from './HoronLogo.tsx';
import { ProductImage } from './ProductImage.tsx';

interface AdminDashboardProps {
  products: Product[];
  brands: BrandItem[];
  categories: CategoryItem[];
  siteConfig: SiteConfig;
  onRefreshStorefront: () => Promise<void>;
  onClose: () => void;
}

type AdminTab = 'products' | 'orders' | 'brands' | 'config';

const TOKEN_STORAGE_KEY = 'horon_admin_token';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  brands,
  categories,
  siteConfig,
  onRefreshStorefront,
  onClose,
}) => {
  const [token, setToken] = useState<string>(() => {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState(brands[0]?.name || 'Apple');
  const [pCategory, setPCategory] = useState(categories[0]?.name || 'Smartphones');
  const [pType, setPType] = useState<Product['productType']>('smartphone');
  const [pPrice, setPPrice] = useState('250000');
  const [pStock, setPStock] = useState('5');
  const [pAvail, setPAvail] = useState<AvailabilityStatus>('In Stock');
  const [pDesc, setPDesc] = useState('');
  const [pImageUrl, setPImageUrl] = useState(
    '/src/assets/images/horon_iphone_pro_1795008052838.jpg',
  );
  const [pStorage, setPStorage] = useState('');
  const [pDisplay, setPDisplay] = useState('');
  const [pCamera, setPCamera] = useState('');
  const [pChip, setPChip] = useState('');
  const [pFeatured, setPFeatured] = useState(false);
  const [pPopular, setPPopular] = useState(false);

  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandHeadline, setNewBrandHeadline] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [newBrandStyle, setNewBrandStyle] =
    useState<BrandItem['deviceStyle']>('tecno');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [configDraft, setConfigDraft] = useState<SiteConfig>(siteConfig);
  const [paymentDraftText, setPaymentDraftText] = useState(
    siteConfig.enabledPaymentMethods.join('\n'),
  );

  useEffect(() => {
    setConfigDraft(siteConfig);
    setPaymentDraftText(siteConfig.enabledPaymentMethods.join('\n'));
  }, [siteConfig]);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!token) {
        setAuthenticated(false);
        setCheckingAuth(false);
        return;
      }
      const ok = await verifyAdminSession(token);
      if (!active) return;
      if (ok) {
        setAuthenticated(true);
        try {
          const data = await fetchAdminOrders(token);
          if (active) setOrders(data.orders);
        } catch {
          // ignore
        }
      } else {
        window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken('');
        setAuthenticated(false);
      }
      setCheckingAuth(false);
    };
    verify();
    return () => {
      active = false;
    };
  }, [token]);

  const showToast = (msg: string) => {
    setErrorNotice(null);
    setStatusNotice(msg);
    window.setTimeout(() => setStatusNotice(null), 3500);
  };

  const showError = (err: unknown) => {
    setStatusNotice(null);
    setErrorNotice(err instanceof Error ? err.message : "Échec de l'opération.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);
    try {
      const { token: newToken } = await adminLogin(passwordInput);
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      setPasswordInput('');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Authentification impossible.',
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setAuthenticated(false);
  };

  const openNewProductForm = () => {
    setEditingProductId(null);
    setPName('');
    setPBrand(brands[0]?.name || 'Apple');
    setPCategory(categories[0]?.name || 'Smartphones');
    setPType('smartphone');
    setPPrice('250000');
    setPStock('5');
    setPAvail('In Stock');
    setPDesc('');
    setPImageUrl('/src/assets/images/horon_iphone_pro_1795008052838.jpg');
    setPStorage('');
    setPDisplay('');
    setPCamera('');
    setPChip('');
    setPFeatured(false);
    setPPopular(false);
    setProductFormOpen(true);
  };

  const openEditProductForm = (p: Product) => {
    setEditingProductId(p.id);
    setPName(p.name);
    setPBrand(p.brand);
    setPCategory(p.category);
    setPType(p.productType);
    setPPrice(String(p.priceXof));
    setPStock(String(p.stock));
    setPAvail(p.availability);
    setPDesc(p.description);
    setPImageUrl(p.imageUrl);
    setPStorage(p.specs.storage || '');
    setPDisplay(p.specs.display || '');
    setPCamera(p.specs.camera || '');
    setPChip(p.specs.chip || '');
    setPFeatured(p.featured);
    setPPopular(p.popular);
    setProductFormOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setErrorNotice(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'));
        reader.readAsDataURL(file);
      });
      const { imageUrl } = await uploadProductImage(token, dataUrl, file.name);
      setPImageUrl(imageUrl);
      showToast('Photo importée sur le serveur.');
    } catch (err) {
      showError(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: pName,
        brand: pBrand,
        category: pCategory,
        productType: pType,
        priceXof: Number(pPrice),
        stock: Number(pStock),
        availability: pAvail,
        description: pDesc,
        imageUrl: pImageUrl,
        featured: pFeatured,
        popular: pPopular,
        specs: {
          storage: pStorage,
          display: pDisplay,
          camera: pCamera,
          chip: pChip,
        },
      };

      if (editingProductId) {
        await updateProduct(token, editingProductId, payload);
        showToast('Produit mis à jour.');
      } else {
        await createProduct(token, payload);
        showToast('Produit ajouté au catalogue.');
      }

      setProductFormOpen(false);
      await onRefreshStorefront();
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(token, id);
      setConfirmDeleteProductId(null);
      await onRefreshStorefront();
      showToast('Produit supprimé.');
    } catch (err) {
      showError(err);
    }
  };

  const handleOrderStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const { order } = await updateOrderStatus(token, orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      showToast(
        `Commande ${order.orderNumber} : ${translateOrderStatus(nextStatus)}.`,
      );
    } catch (err) {
      showError(err);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      await createBrand(token, {
        name: newBrandName,
        headline: newBrandHeadline || newBrandName,
        description: newBrandDesc,
        deviceStyle: newBrandStyle,
        active: true,
      });
      setNewBrandName('');
      setNewBrandHeadline('');
      setNewBrandDesc('');
      await onRefreshStorefront();
      showToast('Marque ajoutée.');
    } catch (err) {
      showError(err);
    }
  };

  const handleToggleBrandActive = async (brand: BrandItem) => {
    try {
      await updateBrand(token, brand.id, { active: !brand.active });
      await onRefreshStorefront();
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand(token, id);
      await onRefreshStorefront();
      showToast('Marque supprimée.');
    } catch (err) {
      showError(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategory(token, newCategoryName);
      setNewCategoryName('');
      await onRefreshStorefront();
      showToast('Catégorie ajoutée.');
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(token, id);
      await onRefreshStorefront();
    } catch (err) {
      showError(err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const enabledPaymentMethods = paymentDraftText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      await updateSiteConfig(token, {
        ...configDraft,
        enabledPaymentMethods,
      });
      await onRefreshStorefront();
      showToast('Paramètres de la vitrine et WhatsApp enregistrés.');
    } catch (err) {
      showError(err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center p-6">
        <p className="text-sm text-[#20242C]">Vérification de la session administrateur...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9EBEF] p-8 shadow-[0_20px_50px_rgba(17,19,24,0.06)]">
          <div className="flex items-center justify-between">
            <HoronLogo size="sm" />
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-[#20242C] hover:text-[#1769E0] inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Boutique</span>
            </button>
          </div>

          <div className="mt-8">
            <div className="w-10 h-10 rounded-xl bg-[#F5F6F8] flex items-center justify-center text-[#1769E0]">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold text-[#111318]">
              Tableau de bord Administration
            </h1>
            <p className="mt-1.5 text-sm text-[#20242C]/75">
              Connectez-vous pour gérer vos produits, prix en FCFA, stocks, commandes,
              bannières et coordonnées WhatsApp.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#20242C] mb-1.5">
                Mot de passe administrateur
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Entrez le mot de passe"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E9EBEF] focus:border-[#1769E0] focus:outline-none text-sm"
              />
              <p className="mt-2 text-[11px] text-[#A6ABB3]">
                Configuré via <span className="font-mono">ADMIN_PASSWORD</span> (par défaut :{' '}
                <span className="font-mono text-[#20242C]">horon-bamako-2026</span>).
              </p>
            </div>

            {authError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-11 rounded-xl bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {loggingIn ? 'Connexion...' : 'Accéder au tableau de bord'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#111318]">
      <header className="sticky top-0 z-30 bg-white border-b border-[#E9EBEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <HoronLogo size="sm" />
            <span className="hidden sm:inline text-xs text-[#A6ABB3]">
              / Administration
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border border-[#E9EBEF] hover:border-[#111318] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voir la boutique</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3.5 rounded-lg bg-[#F5F6F8] hover:bg-[#E9EBEF] text-xs font-medium text-[#20242C] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {statusNotice && (
          <div className="p-3.5 rounded-xl bg-white border border-[#1769E0]/30 text-sm text-[#1769E0] flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}
        {errorNotice && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {errorNotice}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E9EBEF]">
            <p className="text-xs text-[#A6ABB3]">Produits au catalogue</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {products.length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E9EBEF]">
            <p className="text-xs text-[#A6ABB3]">Unités en stock</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {products.reduce((s, p) => s + p.stock, 0)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E9EBEF]">
            <p className="text-xs text-[#A6ABB3]">Commandes clients</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {orders.length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E9EBEF]">
            <p className="text-xs text-[#A6ABB3]">Marques actives</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {brands.filter((b) => b.active).length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E9EBEF] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#1769E0] text-white'
                : 'text-[#20242C] hover:bg-[#F5F6F8]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produits ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#1769E0] text-white'
                : 'text-[#20242C] hover:bg-[#F5F6F8]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Commandes ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-[#1769E0] text-white'
                : 'text-[#20242C] hover:bg-[#F5F6F8]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Marques &amp; Catégories</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'bg-[#1769E0] text-white'
                : 'text-[#20242C] hover:bg-[#F5F6F8]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Accueil, Bannières &amp; WhatsApp</span>
          </button>
        </div>

        {/* PRODUITS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Catalogue Produits</h2>
              <button
                type="button"
                onClick={openNewProductForm}
                className="h-10 px-4 rounded-xl bg-[#1769E0] hover:bg-[#1255B8] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un appareil</span>
              </button>
            </div>

            {productFormOpen && (
              <form
                onSubmit={handleSaveProduct}
                className="bg-white rounded-2xl border border-[#E9EBEF] p-6 space-y-5"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#E9EBEF]">
                  <h3 className="font-display text-base font-semibold">
                    {editingProductId ? 'Modifier le produit' : 'Nouveau produit'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setProductFormOpen(false)}
                    className="text-xs text-[#A6ABB3] hover:text-[#111318] cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#20242C] mb-1">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="ex. iPhone 16 Pro 256 Go"
                      className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#20242C] mb-1">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#20242C] mb-1">
                      Marque *
                    </label>
                    <select
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] bg-white text-sm"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#20242C] mb-1">
                      Catégorie *
                    </label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] bg-white text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#20242C] mb-1">
                      Type d&apos;appareil
                    </label>
                    <select
                      value={pType}
                      onChange={(e) => setPType(e.target.value as Product['productType'])}
                      className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] bg-white text-sm"
                    >
                      <option value="smartphone">Smartphone</option>
                      <option value="tablet">Tablette / iPad</option>
                      <option value="accessory">Accessoire / Chargeur / AirPods</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-[#20242C] mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={pStock}
                        onChange={(e) => setPStock(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#20242C] mb-1">
                        Statut
                      </label>
                      <select
                        value={pAvail}
                        onChange={(e) => setPAvail(e.target.value as AvailabilityStatus)}
                        className="w-full h-10 px-2 rounded-xl border border-[#E9EBEF] bg-white text-xs"
                      >
                        <option value="In Stock">En stock</option>
                        <option value="Low Stock">Stock limité</option>
                        <option value="Pre-Order">Précommande</option>
                        <option value="Out of Stock">Rupture</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#20242C] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E9EBEF] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={pStorage}
                    onChange={(e) => setPStorage(e.target.value)}
                    placeholder="Stockage (ex. 256 Go)"
                    className="h-10 px-3 rounded-xl border border-[#E9EBEF] text-xs"
                  />
                  <input
                    type="text"
                    value={pDisplay}
                    onChange={(e) => setPDisplay(e.target.value)}
                    placeholder="Écran (ex. 6.7 pouces OLED)"
                    className="h-10 px-3 rounded-xl border border-[#E9EBEF] text-xs"
                  />
                  <input
                    type="text"
                    value={pCamera}
                    onChange={(e) => setPCamera(e.target.value)}
                    placeholder="Caméra (ex. 48 MP Triple)"
                    className="h-10 px-3 rounded-xl border border-[#E9EBEF] text-xs"
                  />
                  <input
                    type="text"
                    value={pChip}
                    onChange={(e) => setPChip(e.target.value)}
                    placeholder="Processeur"
                    className="h-10 px-3 rounded-xl border border-[#E9EBEF] text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-7">
                    <label className="block text-xs font-medium text-[#20242C] mb-1">
                      URL ou photo importée
                    </label>
                    <input
                      type="text"
                      value={pImageUrl}
                      onChange={(e) => setPImageUrl(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-xs font-mono"
                    />
                  </div>
                  <div className="md:col-span-5 flex items-end gap-3 pt-4">
                    <label className="h-10 px-4 rounded-xl border border-[#E9EBEF] hover:border-[#1769E0] bg-[#F5F6F8] text-xs font-medium inline-flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#1769E0]" />
                      <span>{uploadingImage ? 'Importation...' : 'Importer une photo'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    <label className="inline-flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={pPopular}
                        onChange={(e) => setPPopular(e.target.checked)}
                      />
                      <span>Populaire</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-[#1769E0] hover:bg-[#1255B8] text-white text-xs font-semibold cursor-pointer"
                  >
                    {editingProductId ? 'Enregistrer' : 'Créer le produit'}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-[#E9EBEF] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E9EBEF] text-xs text-[#A6ABB3]">
                    <th className="py-3.5 px-4 font-medium">Appareil</th>
                    <th className="py-3.5 px-4 font-medium">Marque / Catégorie</th>
                    <th className="py-3.5 px-4 font-medium">Prix (FCFA)</th>
                    <th className="py-3.5 px-4 font-medium">Stock</th>
                    <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EBEF] text-sm">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F5F6F8]/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg bg-[#F5F6F8] overflow-hidden shrink-0 border border-[#E9EBEF]">
                            <ProductImage
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-[#111318]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#20242C]/80">
                        {p.brand} · {p.category}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-medium">
                        {formatFcfa(p.priceXof)}
                      </td>
                      <td className="py-3 px-4 text-xs tabular-nums">
                        {translateAvailability(p.availability)} ({p.stock})
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProductForm(p)}
                            className="p-2 rounded-lg hover:bg-[#E9EBEF] text-[#20242C] cursor-pointer"
                            aria-label={`Modifier ${p.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {confirmDeleteProductId === p.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-medium cursor-pointer"
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteProductId(p.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-[#A6ABB3] hover:text-red-600 cursor-pointer"
                              aria-label={`Supprimer ${p.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMMANDES */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Commandes clients</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E9EBEF] p-12 text-center text-sm text-[#A6ABB3]">
                Aucune commande client enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-[#E9EBEF] p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E9EBEF]">
                      <div>
                        <p className="font-display font-semibold text-base">
                          Commande #{ord.orderNumber}
                        </p>
                        <p className="text-xs text-[#A6ABB3] mt-0.5">
                          {new Date(ord.createdAt).toLocaleString('fr-FR')} ·{' '}
                          {ord.customerName} · {ord.customerPhone}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-sm tabular-nums">
                          {formatFcfa(ord.totalXof)}
                        </span>
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            handleOrderStatusChange(ord.id, e.target.value as OrderStatus)
                          }
                          className="h-9 px-3 rounded-lg border border-[#E9EBEF] bg-[#F5F6F8] text-xs font-medium cursor-pointer"
                        >
                          <option value="Pending">En attente</option>
                          <option value="Confirmed">Confirmée</option>
                          <option value="Preparing">En préparation</option>
                          <option value="Delivered">Livrée</option>
                          <option value="Cancelled">Annulée</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#20242C]">
                      <div>
                        <span className="text-[#A6ABB3]">Livraison :</span>{' '}
                        {ord.deliveryLocation}
                      </div>
                      <div>
                        <span className="text-[#A6ABB3]">Contact :</span>{' '}
                        {ord.preferredContact}
                      </div>
                      <div>
                        <span className="text-[#A6ABB3]">Paiement :</span>{' '}
                        {ord.paymentMethod}
                      </div>
                    </div>

                    <div className="pt-2 space-y-1 text-xs">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[#20242C]">
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                          <span className="font-mono tabular-nums">
                            {formatFcfa(item.priceXof * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MARQUES & CATÉGORIES */}
        {activeTab === 'brands' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#E9EBEF] p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold">Gérer les marques</h2>

              <form
                onSubmit={handleAddBrand}
                className="space-y-3 pb-5 border-b border-[#E9EBEF]"
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Nom de la marque"
                    className="h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                  />
                  <select
                    value={newBrandStyle}
                    onChange={(e) =>
                      setNewBrandStyle(e.target.value as BrandItem['deviceStyle'])
                    }
                    className="h-10 px-3 rounded-xl border border-[#E9EBEF] bg-white text-sm"
                  >
                    <option value="tecno">Style 3D Anneau Halo</option>
                    <option value="xiaomi">Style 3D Module Optique</option>
                    <option value="infinix">Style 3D Céramique</option>
                    <option value="apple">Style 3D Titane Pro</option>
                    <option value="samsung">Style 3D Galaxy Ultra</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={newBrandHeadline}
                  onChange={(e) => setNewBrandHeadline(e.target.value)}
                  placeholder="Titre de présentation de la marque"
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
                <textarea
                  rows={2}
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  placeholder="Courte description de la marque"
                  className="w-full p-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[#1769E0] text-white text-xs font-semibold cursor-pointer"
                >
                  Ajouter la marque
                </button>
              </form>

              <div className="divide-y divide-[#E9EBEF]">
                {brands.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#111318]">{b.name}</p>
                      <p className="text-xs text-[#A6ABB3] truncate">{b.headline}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleBrandActive(b)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                          b.active
                            ? 'bg-[#1769E0]/10 text-[#1769E0]'
                            : 'bg-[#F5F6F8] text-[#A6ABB3]'
                        }`}
                      >
                        {b.active ? 'Active' : 'Masquée'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(b.id)}
                        className="p-1.5 text-[#A6ABB3] hover:text-red-600 cursor-pointer"
                        aria-label={`Supprimer ${b.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E9EBEF] p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold">
                Catégories de produits
              </h2>
              <form
                onSubmit={handleAddCategory}
                className="flex gap-2 pb-5 border-b border-[#E9EBEF]"
              >
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nouvelle catégorie (ex. Montres connectées)"
                  className="flex-1 h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-[#111318] text-white text-xs font-semibold cursor-pointer"
                >
                  Ajouter
                </button>
              </form>

              <div className="divide-y divide-[#E9EBEF]">
                {categories.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#111318]">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-[#A6ABB3] hover:text-red-600 cursor-pointer"
                      aria-label={`Supprimer ${c.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONFIGURATION SITE & WHATSAPP */}
        {activeTab === 'config' && (
          <form
            onSubmit={handleSaveConfig}
            className="bg-white rounded-2xl border border-[#E9EBEF] p-6 space-y-6"
          >
            <h2 className="font-display text-lg font-semibold">
              Textes de la page d&apos;accueil, Bannières &amp; WhatsApp
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Numéro WhatsApp (avec indicatif pays, ex. 223...)
                </label>
                <input
                  type="text"
                  value={configDraft.whatsappNumber}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, whatsappNumber: e.target.value })
                  }
                  placeholder="ex. 223XXXXXXXX"
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Adresse du showroom
                </label>
                <input
                  type="text"
                  value={configDraft.storeAddress}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, storeAddress: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F6F8] border border-[#E9EBEF] space-y-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#111318] cursor-pointer">
                <input
                  type="checkbox"
                  checked={configDraft.bannerEnabled}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, bannerEnabled: e.target.checked })
                  }
                />
                <span>Afficher la bannière d&apos;annonce en haut du site</span>
              </label>
              <input
                type="text"
                value={configDraft.bannerText}
                onChange={(e) =>
                  setConfigDraft({ ...configDraft, bannerText: e.target.value })
                }
                placeholder="Message de la bannière (ex. Showroom ouvert à Bamako du lundi au samedi)"
                className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] bg-white text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Titre principal (Hero)
                </label>
                <input
                  type="text"
                  value={configDraft.heroHeadline}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, heroHeadline: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Sous-titre (Hero)
                </label>
                <input
                  type="text"
                  value={configDraft.heroSubtitle}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, heroSubtitle: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Titre section Apple
                </label>
                <input
                  type="text"
                  value={configDraft.appleHeadline}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, appleHeadline: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Titre section Samsung
                </label>
                <input
                  type="text"
                  value={configDraft.samsungHeadline}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, samsungHeadline: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Titre section Tablettes
                </label>
                <input
                  type="text"
                  value={configDraft.tabletsHeadline}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, tabletsHeadline: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#20242C] mb-1">
                  Titre section Catalogue
                </label>
                <input
                  type="text"
                  value={configDraft.showroomHeadline}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, showroomHeadline: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#E9EBEF] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#20242C] mb-1">
                Modes de paiement activés (un par ligne)
              </label>
              <textarea
                rows={3}
                value={paymentDraftText}
                onChange={(e) => setPaymentDraftText(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E9EBEF] text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-[#1769E0] hover:bg-[#1255B8] text-white text-sm font-medium cursor-pointer"
              >
                Enregistrer la configuration
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};
