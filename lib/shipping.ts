/**
 * Shipping integration — RajaOngkir (Komerce) API.
 *
 * The customer picks which courier/service they want from the returned list.
 * Free shipping zeroes the fee when the cart subtotal reaches the threshold.
 */

export const SHIPPING_ORIGIN = "Jakarta";
export const FREE_SHIPPING_THRESHOLD = 250000;
export const DEFAULT_PACKAGE_WEIGHT_GRAMS = 1000;
// Couriers offered to the customer. Colon-separated RajaOngkir courier codes.
export const DEFAULT_COURIERS = "jne:jnt:sicepat";

// Only these couriers are presented to the customer.
export const ALLOWED_COURIERS = ["jne", "jnt", "sicepat"] as const;

/** Normalize RajaOngkir's courier code/name to one of our known keys. */
function normalizeCourierCode(code: string, name: string): string {
  const haystack = `${code} ${name}`.toLowerCase();
  if (haystack.includes("jne")) return "jne";
  if (haystack.includes("sicepat")) return "sicepat";
  // J&T appears as "jnt", "j&t", or "jet"
  if (haystack.includes("jnt") || haystack.includes("j&t") || haystack.includes("jet")) return "jnt";
  return code.toLowerCase();
}

// The "regular" service per courier the customer is allowed to pick.
// JNE → REG, J&T → EZ/REG, SiCepat → REG.
const REGULAR_SERVICE: Record<string, string[]> = {
  jne: ["reg"],
  jnt: ["ez", "reg"],
  sicepat: ["reg", "siunt"],
};

function isRegularService(courierCode: string, service: string): boolean {
  const matches = REGULAR_SERVICE[courierCode];
  if (!matches) return false;
  const s = service.trim().toLowerCase();
  return matches.includes(s);
}

const BASE_URL = "https://rajaongkir.komerce.id/api/v1";

export type ShippingItemInput = {
  name: string;
  value: number;
  weight: number;
  quantity: number;
};

export type ShippingRatesInput = {
  province: string;
  city?: string;
  destinationId?: number;
  weightGrams?: number;
  subtotal?: number;
  couriers?: string;
};

/** A single courier service option the customer can choose. */
export type ShippingRate = {
  courierCode: string;
  courierName: string;
  courierServiceCode: string;
  courierServiceName: string;
  description: string;
  etd: string;
  /** Final fee after free-shipping is applied (0 when freeShipping). */
  fee: number;
  /** The courier's original price before any free-shipping discount. */
  originalFee: number;
  freeShipping: boolean;
};

export type ShippingQuoteInput = {
  province: string;
  city?: string;
  destinationId?: number;
  weightGrams?: number;
  subtotal?: number;
  courierCode?: string;
  courierServiceCode?: string;
};

type RajaOngkirDestination = {
  id?: number | string;
  label?: string;
  subdistrict_name?: string;
  district_name?: string;
  city_name?: string;
  province_name?: string;
  zip_code?: string;
};

type RajaOngkirCost = {
  name?: string;
  code?: string;
  service?: string;
  description?: string;
  cost?: number | string;
  etd?: string;
};

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getApiKey() {
  const key = env("RAJAONGKIR_API_KEY");
  if (!key) throw new Error("RAJAONGKIR_API_KEY is not configured");
  return key;
}

function getOriginId() {
  const id = Number(env("RAJAONGKIR_ORIGIN_ID"));
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(
      "RAJAONGKIR_ORIGIN_ID is not configured. Set it to your Jakarta origin destination/district ID.",
    );
  }
  return id;
}

async function rajaFetch(path: string, init: RequestInit = {}, revalidateSeconds?: number) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      key: getApiKey(),
      ...(init.headers ?? {}),
    },
    // Destination data rarely changes — cache it; quotes stay fresh.
    ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : { cache: "no-store" as const }),
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`RajaOngkir returned non-JSON response (${res.status})`);
  }
  if (!res.ok || json?.meta?.status === false) {
    throw new Error(json?.meta?.message || json?.message || `RajaOngkir error ${res.status}`);
  }
  return json;
}

function dataArray(json: any): any[] {
  return Array.isArray(json?.data) ? json.data : [];
}

function destinationLabel(d: RajaOngkirDestination) {
  if (d.label) return d.label;
  return [d.subdistrict_name, d.district_name, d.city_name, d.province_name, d.zip_code]
    .filter(Boolean)
    .join(", ");
}

const DESTINATION_CACHE_SECONDS = 60 * 60 * 24;

export async function searchDomesticDestinations(search: string, limit = 10) {
  const params = new URLSearchParams({ search, limit: String(limit) });
  const json = await rajaFetch(
    `/destination/domestic-destination?${params.toString()}`,
    {},
    DESTINATION_CACHE_SECONDS,
  );
  return dataArray(json) as RajaOngkirDestination[];
}

async function resolveDestinationId(province: string, city?: string) {
  const query = [city, province].filter(Boolean).join(" ");
  const destinations = await searchDomesticDestinations(query, 10);
  const chosen = destinations[0];
  const id = Number(chosen?.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Alamat tujuan tidak ditemukan untuk "${query}"`);
  }
  return { id, label: destinationLabel(chosen) || query };
}

/**
 * Fetch all available courier services for a destination.
 * Returns a list the customer can choose from, sorted cheapest first.
 */
export async function getShippingRates(input: ShippingRatesInput): Promise<ShippingRate[]> {
  const province = input.province.trim();
  if (!province) throw new Error("Provinsi tujuan wajib diisi");

  const weightGrams = Math.max(input.weightGrams ?? DEFAULT_PACKAGE_WEIGHT_GRAMS, 1);
  const freeShipping = (input.subtotal ?? 0) >= FREE_SHIPPING_THRESHOLD;
  const destination = input.destinationId
    ? { id: input.destinationId, label: [input.city, province].filter(Boolean).join(", ") }
    : await resolveDestinationId(province, input.city);

  const body = new URLSearchParams({
    origin: String(getOriginId()),
    destination: String(destination.id),
    weight: String(weightGrams),
    courier: input.couriers || DEFAULT_COURIERS,
    price: "lowest",
  });

  const json = await rajaFetch("/calculate/domestic-cost", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const costs = dataArray(json) as RajaOngkirCost[];

  const rates: ShippingRate[] = costs
    .map((c) => {
      const originalFee = Number(c.cost);
      const courierCode = normalizeCourierCode((c.code || "").toString(), (c.name || "").toString());
      return {
        courierCode,
        courierName: c.name || courierCode,
        courierServiceCode: c.service || "",
        courierServiceName: c.service || c.description || "REG",
        description: c.description || "",
        etd: c.etd || "",
        originalFee,
        fee: freeShipping ? 0 : originalFee,
        freeShipping,
      };
    })
    .filter(
      (r) =>
        Number.isFinite(r.originalFee) &&
        (ALLOWED_COURIERS as readonly string[]).includes(r.courierCode) &&
        isRegularService(r.courierCode, r.courierServiceCode),
    );

  // Keep only the cheapest regular service per courier — one option each.
  const cheapestPerCourier = new Map<string, ShippingRate>();
  for (const rate of rates) {
    const current = cheapestPerCourier.get(rate.courierCode);
    if (!current || rate.originalFee < current.originalFee) {
      cheapestPerCourier.set(rate.courierCode, rate);
    }
  }

  // Order by our allow-list (JNE, J&T, SiCepat) so the UI is consistent.
  const result = (ALLOWED_COURIERS as readonly string[])
    .map((code) => cheapestPerCourier.get(code))
    .filter((r): r is ShippingRate => Boolean(r));

  if (result.length === 0) {
    throw new Error("Tidak ada layanan pengiriman untuk alamat ini");
  }

  return result;
}

/**
 * Resolve a single shipping quote — used server-side at order creation.
 * Picks the customer's chosen courier/service when provided, else the cheapest.
 */
export async function calculateShippingQuote(input: ShippingQuoteInput): Promise<ShippingRate> {
  const rates = await getShippingRates({
    province: input.province,
    city: input.city,
    destinationId: input.destinationId,
    weightGrams: input.weightGrams,
    subtotal: input.subtotal,
  });

  if (input.courierCode) {
    const match = rates.find(
      (r) =>
        r.courierCode === input.courierCode &&
        (!input.courierServiceCode || r.courierServiceCode === input.courierServiceCode),
    );
    if (match) return match;
  }

  return rates[0];
}
