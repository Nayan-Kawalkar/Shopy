// Wholesale (mandi) prices for the Articles tab.
// Live data: Agmarknet's "Current daily price of various commodities from various markets" on
// data.gov.in, used when EXPO_PUBLIC_DATA_GOV_API_KEY is set (free key: sign up at data.gov.in).
// Otherwise, or when that API fails, it returns built-in sample prices marked as samples.
// (No React Native imports, so this file also runs in Node.)
const dataGovKey = process.env.EXPO_PUBLIC_DATA_GOV_API_KEY;
const AGMARKNET_RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

export interface Commodity {
  label: string;
  agmarknetName: string; // exact commodity name in Agmarknet
  match: RegExp; // how it's mentioned in headlines
}

export const COMMODITIES: Commodity[] = [
  { label: "Tomato", agmarknetName: "Tomato", match: /\btomato(es)?\b/i },
  { label: "Onion", agmarknetName: "Onion", match: /\bonions?\b/i },
  { label: "Potato", agmarknetName: "Potato", match: /\bpotato(es)?\b/i },
  // "Foodgrain" headlines are mostly about wheat and rice.
  { label: "Wheat", agmarknetName: "Wheat", match: /\b(wheat|foodgrains?)\b/i },
  { label: "Rice", agmarknetName: "Rice", match: /\b(rice|paddy|foodgrains?)\b/i },
  { label: "Groundnut", agmarknetName: "Groundnut", match: /\bgroundnuts?\b|\bpeanuts?\b/i },
  { label: "Mango", agmarknetName: "Mango", match: /\bmangoe?s?\b/i },
  { label: "Banana", agmarknetName: "Banana", match: /\bbananas?\b/i },
  { label: "Cotton", agmarknetName: "Cotton", match: /\bcotton\b/i },
  { label: "Soyabean", agmarknetName: "Soyabean", match: /\bsoy(a)?bean\w*|\bsoy\b/i },
];

export interface PriceRow {
  market: string;
  district: string;
  state: string;
  variety: string | null;
  // Rupees per quintal (100 kg), as mandis report them.
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string | null; // ISO date of arrival, when known
  // Map position of the market town, when known (see MARKET_COORDINATES).
  latitude?: number;
  longitude?: number;
}

// Market towns we can place on the map (geocoded once with OpenStreetMap Nominatim).
// Live Agmarknet rows from other markets still appear in the price list, just not on the map.
const MARKET_COORDINATES: Record<string, [number, number]> = {
  pimpalgaon: [20.1634, 73.9851],
  kolar: [13.1367, 78.1337],
  madanapalle: [13.5558, 78.5015],
  lasalgaon: [20.1427, 74.2378],
  pune: [18.5214, 73.8545],
  agra: [27.1753, 78.0098],
  arambagh: [22.8766, 87.7909],
  indore: [22.7204, 75.8682],
  khanna: [30.7006, 76.2221],
  karnal: [29.6803, 76.9896],
  burdwan: [23.2496, 87.8682],
  bardhaman: [23.2496, 87.8682],
  junagadh: [21.522, 70.4582],
  rajkot: [22.3053, 70.8028],
  ratnagiri: [16.9934, 73.2954],
  vashi: [19.0632, 72.9988],
  jalgaon: [21.0101, 75.5696],
  theni: [10.0108, 77.481],
  adilabad: [19.6759, 78.534],
  latur: [18.3982, 76.5626],
};

// Matches "Vashi (APMC)" or "Lasalgaon(Niphad)" to their town by the first word.
function withCoordinates(row: PriceRow): PriceRow {
  const town = row.market.toLowerCase().match(/[a-z]+/)?.[0] ?? "";
  const coordinates = MARKET_COORDINATES[town];
  return coordinates ? { ...row, latitude: coordinates[0], longitude: coordinates[1] } : row;
}

export interface PriceResult {
  source: "live" | "sample";
  rows: PriceRow[];
}

// Commodities whose names appear in the given headlines, in COMMODITIES order.
export function commoditiesInNews(headlines: string[]): Commodity[] {
  return COMMODITIES.filter((c) => headlines.some((title) => c.match.test(title)));
}

// Field names differ in case/format between data.gov.in resources ("modal_price", "Modal_x0020_Price"),
// so look them up loosely.
function field(record: Record<string, unknown>, name: string): string {
  const wanted = name.replace(/[^a-z]/gi, "").toLowerCase();
  for (const [key, value] of Object.entries(record)) {
    if (key.replace(/_x0020_/g, "").replace(/[^a-z]/gi, "").toLowerCase() === wanted) return String(value ?? "");
  }
  return "";
}

const toNumber = (text: string) => Number(text.replace(/,/g, ""));

// "01/10/2026" (dd/mm/yyyy) -> "2026-10-01"
const toIsoDate = (text: string) => {
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

export function parseAgmarknet(text: string): PriceRow[] {
  const json = JSON.parse(text) as { records?: Record<string, unknown>[] };
  return (json.records ?? [])
    .map((r) => ({
      market: field(r, "market"),
      district: field(r, "district"),
      state: field(r, "state"),
      variety: field(r, "variety") || null,
      minPrice: toNumber(field(r, "min_price")),
      maxPrice: toNumber(field(r, "max_price")),
      modalPrice: toNumber(field(r, "modal_price")),
      date: toIsoDate(field(r, "arrival_date")),
    }))
    .filter((row) => row.market && Number.isFinite(row.modalPrice) && row.modalPrice > 0)
    .map(withCoordinates)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

async function fetchLive(commodity: Commodity, key: string): Promise<PriceRow[]> {
  const params = new URLSearchParams({
    "api-key": key,
    format: "json",
    limit: "20",
    "filters[commodity]": commodity.agmarknetName,
  });
  const response = await fetch(`https://api.data.gov.in/resource/${AGMARKNET_RESOURCE}?${params}`);
  if (!response.ok) throw new Error(`data.gov.in responded ${response.status}`);
  return parseAgmarknet(await response.text());
}

// Illustrative wholesale prices (₹/quintal) used when live data isn't available. Not real quotes.
const SAMPLE_PRICES: Record<string, Omit<PriceRow, "date">[]> = {
  Tomato: [
    { market: "Pimpalgaon", district: "Nashik", state: "Maharashtra", variety: "Hybrid", minPrice: 1200, maxPrice: 2400, modalPrice: 1800 },
    { market: "Kolar", district: "Kolar", state: "Karnataka", variety: "Local", minPrice: 1000, maxPrice: 2000, modalPrice: 1500 },
    { market: "Madanapalle", district: "Chittoor", state: "Andhra Pradesh", variety: "Hybrid", minPrice: 1400, maxPrice: 2600, modalPrice: 2000 },
  ],
  Onion: [
    { market: "Lasalgaon", district: "Nashik", state: "Maharashtra", variety: "Red", minPrice: 2200, maxPrice: 3000, modalPrice: 2600 },
    { market: "Pune", district: "Pune", state: "Maharashtra", variety: "Local", minPrice: 2000, maxPrice: 2800, modalPrice: 2400 },
  ],
  Potato: [
    { market: "Agra", district: "Agra", state: "Uttar Pradesh", variety: "Desi", minPrice: 1100, maxPrice: 1500, modalPrice: 1300 },
    { market: "Arambagh", district: "Hooghly", state: "West Bengal", variety: "Jyoti", minPrice: 1000, maxPrice: 1400, modalPrice: 1200 },
  ],
  Wheat: [
    { market: "Indore", district: "Indore", state: "Madhya Pradesh", variety: "Sharbati", minPrice: 2450, maxPrice: 2800, modalPrice: 2650 },
    { market: "Khanna", district: "Ludhiana", state: "Punjab", variety: "Dara", minPrice: 2400, maxPrice: 2500, modalPrice: 2450 },
  ],
  Rice: [
    { market: "Karnal", district: "Karnal", state: "Haryana", variety: "Common", minPrice: 2200, maxPrice: 2500, modalPrice: 2320 },
    { market: "Burdwan", district: "Purba Bardhaman", state: "West Bengal", variety: "Common", minPrice: 2100, maxPrice: 2400, modalPrice: 2250 },
  ],
  Groundnut: [
    { market: "Junagadh", district: "Junagadh", state: "Gujarat", variety: "Bold", minPrice: 5600, maxPrice: 6800, modalPrice: 6200 },
    { market: "Rajkot", district: "Rajkot", state: "Gujarat", variety: "Java", minPrice: 5800, maxPrice: 7000, modalPrice: 6400 },
  ],
  Mango: [
    { market: "Ratnagiri", district: "Ratnagiri", state: "Maharashtra", variety: "Alphonso", minPrice: 8000, maxPrice: 15000, modalPrice: 11000 },
    { market: "Vashi (APMC)", district: "Thane", state: "Maharashtra", variety: "Alphonso", minPrice: 9000, maxPrice: 16000, modalPrice: 12000 },
  ],
  Banana: [
    { market: "Jalgaon", district: "Jalgaon", state: "Maharashtra", variety: "Robusta", minPrice: 1200, maxPrice: 1800, modalPrice: 1500 },
    { market: "Theni", district: "Theni", state: "Tamil Nadu", variety: "Poovan", minPrice: 1500, maxPrice: 2200, modalPrice: 1800 },
  ],
  Cotton: [
    { market: "Rajkot", district: "Rajkot", state: "Gujarat", variety: "Shankar-6", minPrice: 6800, maxPrice: 7600, modalPrice: 7200 },
    { market: "Adilabad", district: "Adilabad", state: "Telangana", variety: "Medium staple", minPrice: 6600, maxPrice: 7300, modalPrice: 7000 },
  ],
  Soyabean: [
    { market: "Latur", district: "Latur", state: "Maharashtra", variety: "Yellow", minPrice: 4300, maxPrice: 4800, modalPrice: 4600 },
    { market: "Indore", district: "Indore", state: "Madhya Pradesh", variety: "Yellow", minPrice: 4200, maxPrice: 4700, modalPrice: 4500 },
  ],
};

export function samplePrices(commodity: Commodity): PriceRow[] {
  return (SAMPLE_PRICES[commodity.label] ?? []).map((row) => withCoordinates({ ...row, date: null }));
}

// Live prices when possible, otherwise sample prices.
export async function getPrices(commodity: Commodity): Promise<PriceResult> {
  if (dataGovKey) {
    try {
      const rows = await fetchLive(commodity, dataGovKey);
      if (rows.length > 0) return { source: "live", rows };
    } catch (error) {
      console.warn(`Live ${commodity.label} prices unavailable, showing sample prices:`, error);
    }
  }
  return { source: "sample", rows: samplePrices(commodity) };
}
