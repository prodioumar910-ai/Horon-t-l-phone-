import type { Product } from '../types.ts';

/**
 * Identifie la clé unique de série d'un appareil (ex: "iphone 18", "iphone 17", "galaxy s25", "camon 30").
 * Permet de regrouper chaque série en une seule carte sur la page marque et de ne défiler
 * que parmi les variantes de cette même série dans la fiche produit.
 */
export function extractSeriesKey(product: Product): string {
  const name = product.name.toLowerCase();
  const patterns = [
    /iphone\s+\d+/,
    /galaxy\s+s\d+/,
    /galaxy\s+a\d+/,
    /galaxy\s+tab\s+[a-z]\d+/,
    /camon\s+\d+/,
    /zero\s+\d+/,
    /note\s+\d+/,
    /ipad\s+[a-z]+/,
    /redmi\s+pad/,
    /megapad/,
    /xpad/,
    /airpods/,
    /buds\d*/,
  ];
  for (const re of patterns) {
    const match = name.match(re);
    if (match) return `${product.brand.toLowerCase()}::${match[0]}`;
  }
  return `${product.brand.toLowerCase()}::${product.id}`;
}

export function getShortModelLabel(name: string): string {
  return name.split('—')[0].replace(/\s+\d+\s?(?:Go|To|TB|GB)\b/i, '').trim();
}

export function getSeriesCardTitle(product: Product, seriesCount: number): string {
  if (seriesCount <= 1) {
    return product.name;
  }

  const name = product.name;
  const brandPrefix = product.brand === 'XIAOMI / REDMI' ? 'Xiaomi Redmi ' : '';
  const matchers: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
    [/iPhone\s+(\d+)/i, (m) => `Série iPhone ${m[1]}`],
    [/Samsung\s+Galaxy\s+(S\d+|A\d+)/i, (m) => `Série Galaxy ${m[1].toUpperCase()}`],
    [/Tecno\s+(Camon\s+\d+)/i, (m) => `Série Tecno ${m[1]}`],
    [/Infinix\s+(Zero\s+\d+|Note\s+\d+)/i, (m) => `Série Infinix ${m[1]}`],
    [/Redmi\s+(Note\s+\d+)/i, (m) => `Série ${brandPrefix}${m[1]}`],
  ];

  for (const [re, format] of matchers) {
    const m = name.match(re);
    if (m) return format(m);
  }

  return getShortModelLabel(name);
}
