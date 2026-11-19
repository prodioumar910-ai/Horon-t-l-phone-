import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { DEFAULT_STORE_SEED } from './src/data/defaultSeed.ts';
import type {
  BrandItem,
  CategoryItem,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  SiteConfig,
  StoreDatabase,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execFileAsync = promisify(execFile);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'horon-db.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CACHE_DIR = path.join(DATA_DIR, 'cache');
const FRAMES_DIR = path.join(CACHE_DIR, 'frames');
const QUALITY_VIDEO_FILE = path.join(CACHE_DIR, 'quality-video.mp4');
const QUALITY_VIDEO_SCRUB_FILE = path.join(CACHE_DIR, 'quality-video-scrub.mp4');
const QUALITY_VIDEO_GITHUB_URL =
  'https://github.com/prodioumar910-ai/Horon-phone-/raw/refs/heads/main/Man_testing_smartphone_water_res%E2%80%A6_0d60a9f9.mp4';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'horon-bamako-2026';
const TOKEN_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  crypto.createHash('sha256').update(`horon-secret-${ADMIN_PASSWORD}`).digest('hex');

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STORE_SEED, null, 2), 'utf8');
  }
}

function readDb(): StoreDatabase {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreDatabase>;
    const isLegacyEnglishSeed =
      parsed.siteConfig?.heroHeadline === 'TECHNOLOGY MEETS ELEGANCE.' &&
      (!Array.isArray(parsed.orders) || parsed.orders.length === 0);

    if (isLegacyEnglishSeed) {
      const freshSeed = structuredClone(DEFAULT_STORE_SEED);
      writeDb(freshSeed);
      return freshSeed;
    }

    const mergedSiteConfig = parsed.siteConfig
      ? { ...DEFAULT_STORE_SEED.siteConfig, ...parsed.siteConfig }
      : DEFAULT_STORE_SEED.siteConfig;

    if (
      Array.isArray(mergedSiteConfig.trustPillars) &&
      mergedSiteConfig.trustPillars.some((tp) => tp.id === 'tp-1')
    ) {
      mergedSiteConfig.trustPillars = mergedSiteConfig.trustPillars.filter(
        (tp) => tp.id !== 'tp-1',
      );
    }

    return {
      products: Array.isArray(parsed.products) ? parsed.products : DEFAULT_STORE_SEED.products,
      brands: Array.isArray(parsed.brands) ? parsed.brands : DEFAULT_STORE_SEED.brands,
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
        : DEFAULT_STORE_SEED.categories,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      siteConfig: mergedSiteConfig,
    };
  } catch {
    return structuredClone(DEFAULT_STORE_SEED);
  }
}

function writeDb(db: StoreDatabase): void {
  ensureStorage();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

function signAdminToken(expiresInMs = 1000 * 60 * 60 * 12): string {
  const payload = JSON.stringify({
    role: 'admin',
    exp: Date.now() + expiresInMs,
  });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: 'Accès non autorisé. Veuillez vous connecter à l’administration.' });
    return;
  }
  next();
}

function deriveAvailability(stock: number, requested?: Product['availability']): Product['availability'] {
  if (requested === 'Pre-Order') return 'Pre-Order';
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 3) return 'Low Stock';
  return 'In Stock';
}

async function startServer(): Promise<void> {
  ensureStorage();
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.use('/uploads', express.static(UPLOADS_DIR));

  // GitHub source MP4 video frame extraction & streaming for instant canvas scroll scrubbing
  let qualityFramesPromise: Promise<string[]> | null = null;
  async function ensureQualityFrames(): Promise<string[]> {
    ensureStorage();
    const existing = fs
      .readdirSync(FRAMES_DIR)
      .filter((f) => /^frame_\d+\.jpg$/.test(f))
      .sort();
    if (existing.length > 0) {
      return existing;
    }

    if (!qualityFramesPromise) {
      qualityFramesPromise = (async () => {
        if (!fs.existsSync(QUALITY_VIDEO_FILE)) {
          const upstream = await fetch(QUALITY_VIDEO_GITHUB_URL, { redirect: 'follow' });
          if (!upstream.ok) {
            throw new Error(`Impossible de charger la vidéo GitHub (${upstream.status})`);
          }
          const buf = Buffer.from(await upstream.arrayBuffer());
          const tmpRaw = `${QUALITY_VIDEO_FILE}.tmp`;
          fs.writeFileSync(tmpRaw, buf);
          fs.renameSync(tmpRaw, QUALITY_VIDEO_FILE);
        }

        await execFileAsync('ffmpeg', [
          '-y',
          '-i',
          QUALITY_VIDEO_FILE,
          '-vf',
          'fps=12',
          '-q:v',
          '4',
          path.join(FRAMES_DIR, 'frame_%03d.jpg'),
        ]);

        return fs
          .readdirSync(FRAMES_DIR)
          .filter((f) => /^frame_\d+\.jpg$/.test(f))
          .sort();
      })().finally(() => {
        qualityFramesPromise = null;
      });
    }
    return qualityFramesPromise;
  }

  app.get('/api/media/quality-frames/meta', async (_req, res) => {
    try {
      const files = await ensureQualityFrames();
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.json({ count: files.length, width: 640, height: 360 });
    } catch (err) {
      console.error('Erreur extraction trames GitHub:', err);
      res.status(502).json({ error: 'Impossible de charger les trames vidéo.' });
    }
  });

  app.get('/api/media/quality-frames/:index', async (req, res) => {
    try {
      const files = await ensureQualityFrames();
      const idx = Math.max(1, Math.min(files.length, parseInt(req.params.index, 10) || 1));
      const fileName = files[idx - 1];
      if (!fileName) {
        res.status(404).end();
        return;
      }
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.sendFile(path.join(FRAMES_DIR, fileName));
    } catch (err) {
      console.error('Erreur lecture trame GitHub:', err);
      res.status(502).end();
    }
  });

  // GitHub source MP4 video proxy transcoded with all-keyframes (-g 1)
  let qualityVideoFetchPromise: Promise<void> | null = null;
  app.get('/api/media/quality-video', async (req, res) => {
    try {
      ensureStorage();
      if (!fs.existsSync(QUALITY_VIDEO_SCRUB_FILE)) {
        if (!qualityVideoFetchPromise) {
          qualityVideoFetchPromise = (async () => {
            if (!fs.existsSync(QUALITY_VIDEO_FILE)) {
              const upstream = await fetch(QUALITY_VIDEO_GITHUB_URL, { redirect: 'follow' });
              if (!upstream.ok) {
                throw new Error(`Impossible de charger la vidéo GitHub (${upstream.status})`);
              }
              const buf = Buffer.from(await upstream.arrayBuffer());
              const tmpRaw = `${QUALITY_VIDEO_FILE}.tmp`;
              fs.writeFileSync(tmpRaw, buf);
              fs.renameSync(tmpRaw, QUALITY_VIDEO_FILE);
            }

            const tmpScrub = `${QUALITY_VIDEO_SCRUB_FILE}.tmp.mp4`;
            try {
              await execFileAsync('ffmpeg', [
                '-y',
                '-i',
                QUALITY_VIDEO_FILE,
                '-c:v',
                'libx264',
                '-profile:v',
                'baseline',
                '-level',
                '3.1',
                '-pix_fmt',
                'yuv420p',
                '-g',
                '1',
                '-bf',
                '0',
                '-preset',
                'veryfast',
                '-crf',
                '20',
                '-movflags',
                '+faststart',
                '-an',
                tmpScrub,
              ]);
              fs.renameSync(tmpScrub, QUALITY_VIDEO_SCRUB_FILE);
            } catch {
              if (fs.existsSync(tmpScrub)) fs.unlinkSync(tmpScrub);
              fs.copyFileSync(QUALITY_VIDEO_FILE, QUALITY_VIDEO_SCRUB_FILE);
            }
          })().finally(() => {
            qualityVideoFetchPromise = null;
          });
        }
        await qualityVideoFetchPromise;
      }

      const fileToServe = fs.existsSync(QUALITY_VIDEO_SCRUB_FILE)
        ? QUALITY_VIDEO_SCRUB_FILE
        : QUALITY_VIDEO_FILE;
      const stat = fs.statSync(fileToServe);
      const fileSize = stat.size;
      const range = req.headers.range;

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      if (range) {
        const match = /bytes=(\d*)-(\d*)/.exec(range);
        const start = match?.[1] ? parseInt(match[1], 10) : 0;
        const end = match?.[2] ? Math.min(parseInt(match[2], 10), fileSize - 1) : fileSize - 1;
        if (start >= fileSize || end < start) {
          res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
          return;
        }
        const chunkSize = end - start + 1;
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', String(chunkSize));
        fs.createReadStream(fileToServe, { start, end }).pipe(res);
      } else {
        res.status(200);
        res.setHeader('Content-Length', String(fileSize));
        fs.createReadStream(fileToServe).pipe(res);
      }
    } catch (err) {
      console.error('Erreur vidéo qualité GitHub:', err);
      res.status(502).json({ error: 'Vidéo indisponible pour le moment.' });
    }
  });

  // Public storefront data (products, brands, categories, public site config)
  app.get('/api/storefront', (_req, res) => {
    const db = readDb();
    res.json({
      products: db.products,
      brands: [...db.brands].sort((a, b) => a.order - b.order),
      categories: [...db.categories].sort((a, b) => a.order - b.order),
      siteConfig: db.siteConfig,
    });
  });

  // Public order submission
  app.post('/api/orders', (req, res) => {
    const {
      customerName,
      customerPhone,
      deliveryLocation,
      preferredContact,
      paymentMethod,
      items,
      notes,
    } = req.body as {
      customerName?: string;
      customerPhone?: string;
      deliveryLocation?: string;
      preferredContact?: Order['preferredContact'];
      paymentMethod?: string;
      items?: Array<{ productId: string; quantity: number }>;
      notes?: string;
    };

    if (!customerName?.trim() || !customerPhone?.trim() || !deliveryLocation?.trim()) {
      res.status(400).json({
        error: 'Le nom, le numéro de téléphone et le lieu de livraison sont obligatoires.',
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Votre panier est vide.' });
      return;
    }

    const db = readDb();
    const resolvedItems: OrderItem[] = [];
    let totalXof = 0;

    for (const line of items) {
      const product = db.products.find((p) => p.id === line.productId);
      if (!product) {
        res.status(404).json({ error: `Produit introuvable : ${line.productId}` });
        return;
      }
      const qty = Math.max(1, Math.floor(Number(line.quantity || 1)));
      if (product.availability !== 'Pre-Order' && product.stock < qty) {
        res.status(400).json({
          error: `Stock insuffisant pour ${product.name}. Disponible : ${product.stock}.`,
        });
        return;
      }

      if (product.availability !== 'Pre-Order') {
        product.stock = Math.max(0, product.stock - qty);
        product.availability = deriveAvailability(product.stock);
      }

      resolvedItems.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        priceXof: product.priceXof,
        quantity: qty,
        imageUrl: product.imageUrl,
      });
      totalXof += product.priceXof * qty;
    }

    const validPayments = db.siteConfig.enabledPaymentMethods;
    const chosenPayment =
      paymentMethod && validPayments.includes(paymentMethod)
        ? paymentMethod
        : validPayments[0] || 'Paiement en boutique — Showroom Bamako';

    const orderNumber = `HP-${new Date().getFullYear()}-${String(1001 + db.orders.length).padStart(4, '0')}`;
    const newOrder: Order = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryLocation: deliveryLocation.trim(),
      preferredContact: preferredContact || 'WhatsApp',
      paymentMethod: chosenPayment,
      items: resolvedItems,
      totalXof,
      status: 'Pending',
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    writeDb(db);

    res.status(201).json({ order: newOrder });
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body as { password?: string };
    if (!password) {
      res.status(400).json({ error: 'Le mot de passe est requis.' });
      return;
    }

    const providedBuf = Buffer.from(password);
    const expectedBuf = Buffer.from(ADMIN_PASSWORD);
    const valid =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    if (!valid) {
      res.status(401).json({ error: 'Mot de passe administrateur invalide.' });
      return;
    }

    res.json({ token: signAdminToken() });
  });

  app.get('/api/admin/verify', requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });

  // Admin Orders
  app.get('/api/admin/orders', requireAdmin, (_req, res) => {
    const db = readDb();
    res.json({ orders: db.orders });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const { status } = req.body as { status?: OrderStatus };
    const allowedStatuses: OrderStatus[] = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Delivered',
      'Cancelled',
    ];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({ error: 'Statut de commande invalide.' });
      return;
    }
    const db = readDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Commande introuvable.' });
      return;
    }
    order.status = status;
    writeDb(db);
    res.json({ order });
  });

  // Admin Products CRUD
  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const body = req.body as Partial<Product>;
    if (!body.name?.trim() || !body.brand?.trim() || !body.category?.trim()) {
      res.status(400).json({ error: 'Le nom du produit, la marque et la catégorie sont requis.' });
      return;
    }
    const priceXof = Math.max(0, Math.round(Number(body.priceXof || 0)));
    const stock = Math.max(0, Math.floor(Number(body.stock || 0)));
    const db = readDb();

    const product: Product = {
      id: `prod-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name.trim(),
      brand: body.brand.trim(),
      category: body.category.trim(),
      productType: body.productType || 'smartphone',
      priceXof,
      stock,
      availability: deriveAvailability(stock, body.availability),
      description: (body.description || '').trim(),
      specs: body.specs || {},
      imageUrl: body.imageUrl?.trim() || '/src/assets/images/horon_iphone_pro_1795008052838.jpg',
      featured: Boolean(body.featured),
      popular: Boolean(body.popular),
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(product);
    writeDb(db);
    res.status(201).json({ product });
  });

  app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Produit introuvable.' });
      return;
    }
    const existing = db.products[idx];
    const body = req.body as Partial<Product>;
    const stock =
      body.stock !== undefined ? Math.max(0, Math.floor(Number(body.stock))) : existing.stock;

    const updated: Product = {
      ...existing,
      ...body,
      id: existing.id,
      priceXof:
        body.priceXof !== undefined
          ? Math.max(0, Math.round(Number(body.priceXof)))
          : existing.priceXof,
      stock,
      availability: deriveAvailability(stock, body.availability ?? existing.availability),
      specs: body.specs ? { ...existing.specs, ...body.specs } : existing.specs,
    };

    db.products[idx] = updated;
    writeDb(db);
    res.json({ product: updated });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const before = db.products.length;
    db.products = db.products.filter((p) => p.id !== req.params.id);
    if (db.products.length === before) {
      res.status(404).json({ error: 'Produit introuvable.' });
      return;
    }
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Brands CRUD
  app.post('/api/admin/brands', requireAdmin, (req, res) => {
    const body = req.body as Partial<BrandItem>;
    if (!body.name?.trim()) {
      res.status(400).json({ error: 'Le nom de la marque est requis.' });
      return;
    }
    const db = readDb();
    const slug = body.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const brand: BrandItem = {
      id: `brand-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name.trim(),
      slug,
      headline: (body.headline || body.name).trim(),
      description: (body.description || '').trim(),
      deviceStyle: body.deviceStyle || 'tecno',
      imageUrl: body.imageUrl?.trim() || '/src/assets/images/horon_tecno_infinix_1795008052857.jpg',
      active: body.active !== undefined ? Boolean(body.active) : true,
      order: db.brands.length + 1,
    };
    db.brands.push(brand);
    writeDb(db);
    res.status(201).json({ brand });
  });

  app.put('/api/admin/brands/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const idx = db.brands.findIndex((b) => b.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Marque introuvable.' });
      return;
    }
    db.brands[idx] = { ...db.brands[idx], ...req.body, id: db.brands[idx].id };
    writeDb(db);
    res.json({ brand: db.brands[idx] });
  });

  app.delete('/api/admin/brands/:id', requireAdmin, (req, res) => {
    const db = readDb();
    db.brands = db.brands.filter((b) => b.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Categories CRUD
  app.post('/api/admin/categories', requireAdmin, (req, res) => {
    const body = req.body as Partial<CategoryItem>;
    if (!body.name?.trim()) {
      res.status(400).json({ error: 'Le nom de la catégorie est requis.' });
      return;
    }
    const db = readDb();
    const cat: CategoryItem = {
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name.trim(),
      slug: body.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
      order: db.categories.length + 1,
    };
    db.categories.push(cat);
    writeDb(db);
    res.status(201).json({ category: cat });
  });

  app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
    const db = readDb();
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Site Config & Homepage Text / WhatsApp / Banners
  app.put('/api/admin/config', requireAdmin, (req, res) => {
    const db = readDb();
    const incoming = req.body as Partial<SiteConfig>;
    db.siteConfig = {
      ...db.siteConfig,
      ...incoming,
      enabledPaymentMethods: Array.isArray(incoming.enabledPaymentMethods)
        ? incoming.enabledPaymentMethods.filter((m) => m.trim().length > 0)
        : db.siteConfig.enabledPaymentMethods,
      trustPillars: Array.isArray(incoming.trustPillars)
        ? incoming.trustPillars
        : db.siteConfig.trustPillars,
    };
    writeDb(db);
    res.json({ siteConfig: db.siteConfig });
  });

  // Admin Image Upload (base64 data URI -> local /uploads/<id>.<ext>)
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const { dataUrl, fileName } = req.body as { dataUrl?: string; fileName?: string };
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: "Données de l'image manquantes." });
      return;
    }

    const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Seuls les formats PNG, JPG ou WebP sont acceptés.' });
      return;
    }

    const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    const baseName = (fileName || 'device')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 24) || 'device';
    const finalName = `${baseName}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    const buffer = Buffer.from(match[2], 'base64');

    if (buffer.byteLength > 8 * 1024 * 1024) {
      res.status(400).json({ error: "L'image dépasse la limite de 8 Mo." });
      return;
    }

    fs.writeFileSync(path.join(UPLOADS_DIR, finalName), buffer);
    res.status(201).json({ imageUrl: `/uploads/${finalName}` });
  });

  const httpServer = http.createServer(app);

  // Serve Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    app.get('/@vite/client', (_req, res) => {
      res.type('application/javascript').send(`
const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url, queryToInject) {
  if (url[0] !== '.' && url[0] !== '/') return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');
}
export class ErrorOverlay {}
`);
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: false,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use('/src/assets', express.static(path.join(distDir, 'src/assets')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`HORON PHONE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start HORON PHONE server:', err);
  process.exit(1);
});
