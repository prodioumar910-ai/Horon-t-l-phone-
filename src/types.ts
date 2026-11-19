export type AvailabilityStatus = 'In Stock' | 'Low Stock' | 'Pre-Order' | 'Out of Stock';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Delivered' | 'Cancelled';

export type PreferredContact = 'WhatsApp' | 'Phone Call' | 'In-Store Pickup';

export interface ProductSpecs {
  storage?: string;
  display?: string;
  camera?: string;
  chip?: string;
  battery?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  productType: 'smartphone' | 'tablet' | 'accessory';
  priceXof: number;
  stock: number;
  availability: AvailabilityStatus;
  description: string;
  specs: ProductSpecs;
  imageUrl: string;
  featured: boolean;
  popular: boolean;
  createdAt: string;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  headline: string;
  description: string;
  deviceStyle: 'apple' | 'samsung' | 'tecno' | 'infinix' | 'xiaomi';
  imageUrl: string;
  active: boolean;
  order: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface TrustPillar {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'layers' | 'user' | 'lock' | 'headphones';
}

export interface SiteConfig {
  heroHeadline: string;
  heroSubtitle: string;
  appleHeadline: string;
  appleDescription: string;
  samsungHeadline: string;
  samsungDescription: string;
  tabletsHeadline: string;
  tabletsDescription: string;
  showroomHeadline: string;
  whyHeadline: string;
  finalCtaHeadline: string;
  finalCtaSubtitle: string;
  bannerEnabled: boolean;
  bannerText: string;
  whatsappNumber: string;
  storeAddress: string;
  storeHours: string;
  enabledPaymentMethods: string[];
  trustPillars: TrustPillar[];
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  priceXof: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryLocation: string;
  preferredContact: PreferredContact;
  paymentMethod: string;
  items: OrderItem[];
  totalXof: number;
  status: OrderStatus;
  notes: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreDatabase {
  products: Product[];
  brands: BrandItem[];
  categories: CategoryItem[];
  orders: Order[];
  siteConfig: SiteConfig;
}
