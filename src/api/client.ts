import type {
  BrandItem,
  CategoryItem,
  Order,
  OrderStatus,
  Product,
  SiteConfig,
} from '../types.ts';

export interface StorefrontPayload {
  products: Product[];
  brands: BrandItem[];
  categories: CategoryItem[];
  siteConfig: SiteConfig;
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchStorefront(): Promise<StorefrontPayload> {
  const res = await fetch('/api/storefront');
  return parseJson<StorefrontPayload>(res);
}

export async function submitOrder(payload: {
  customerName: string;
  customerPhone: string;
  deliveryLocation: string;
  preferredContact: Order['preferredContact'];
  paymentMethod: string;
  items: Array<{ productId: string; quantity: number }>;
  notes?: string;
}): Promise<{ order: Order }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<{ order: Order }>(res);
}

export async function adminLogin(password: string): Promise<{ token: string }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return parseJson<{ token: string }>(res);
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  const res = await fetch('/api/admin/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function fetchAdminOrders(token: string): Promise<{ orders: Order[] }> {
  const res = await fetch('/api/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{ orders: Order[] }>(res);
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus,
): Promise<{ order: Order }> {
  const res = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return parseJson<{ order: Order }>(res);
}

export async function createProduct(
  token: string,
  product: Partial<Product>,
): Promise<{ product: Product }> {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  return parseJson<{ product: Product }>(res);
}

export async function updateProduct(
  token: string,
  id: string,
  product: Partial<Product>,
): Promise<{ product: Product }> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  return parseJson<{ product: Product }>(res);
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function createBrand(
  token: string,
  brand: Partial<BrandItem>,
): Promise<{ brand: BrandItem }> {
  const res = await fetch('/api/admin/brands', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(brand),
  });
  return parseJson<{ brand: BrandItem }>(res);
}

export async function updateBrand(
  token: string,
  id: string,
  brand: Partial<BrandItem>,
): Promise<{ brand: BrandItem }> {
  const res = await fetch(`/api/admin/brands/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(brand),
  });
  return parseJson<{ brand: BrandItem }>(res);
}

export async function deleteBrand(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/brands/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function createCategory(
  token: string,
  name: string,
): Promise<{ category: CategoryItem }> {
  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return parseJson<{ category: CategoryItem }>(res);
}

export async function deleteCategory(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function updateSiteConfig(
  token: string,
  config: Partial<SiteConfig>,
): Promise<{ siteConfig: SiteConfig }> {
  const res = await fetch('/api/admin/config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });
  return parseJson<{ siteConfig: SiteConfig }>(res);
}

export async function uploadProductImage(
  token: string,
  dataUrl: string,
  fileName: string,
): Promise<{ imageUrl: string }> {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dataUrl, fileName }),
  });
  return parseJson<{ imageUrl: string }>(res);
}
