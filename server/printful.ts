/**
 * Printful Integration Service
 * Handles order fulfillment through Printful's print-on-demand API.
 *
 * When PRINTFUL_API_KEY is set, orders are automatically submitted to Printful
 * for printing and direct shipping to customers.
 *
 * Without the API key, orders are still recorded locally and marked as
 * "not_configured" for fulfillment — ready to be submitted once the key is added.
 *
 * How to get your API key:
 *   1. Log in at https://www.printful.com
 *   2. Go to Settings → API
 *   3. Generate a new token
 *   4. Add it as PRINTFUL_API_KEY in your Replit Secrets
 */

const PRINTFUL_BASE = "https://api.printful.com";

export interface PrintfulRecipient {
  name: string;
  address1: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip?: string;
  email: string;
  phone?: string;
}

export interface PrintfulOrderItem {
  sync_variant_id: number;
  quantity: number;
}

export interface PrintfulOrder {
  id: number;
  status: string;
  shipping: string;
  shipping_service_name: string;
  estimated_delivery_dates: { min: string; max: string };
  shipments: Array<{
    tracking_number: string;
    tracking_url: string;
    carrier: string;
  }>;
}

export interface PrintfulProduct {
  id: number;
  name: string;
  thumbnail: string;
  variants: Array<{
    id: number;
    name: string;
    retail_price: string;
  }>;
}

// ISO 2-letter country code mapping
const COUNTRY_CODES: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  "Canada": "CA",
  "Australia": "AU",
  "Germany": "DE",
  "France": "FR",
  "Sweden": "SE",
  "Norway": "NO",
  "Denmark": "DK",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Switzerland": "CH",
  "Japan": "JP",
  "Singapore": "SG",
  "South Africa": "ZA",
  "Uganda": "UG",
  "Kenya": "KE",
  "Nigeria": "NG",
  "Ghana": "GH",
  "Other": "US",
};

function getCountryCode(countryName: string): string {
  return COUNTRY_CODES[countryName] || "US";
}

function getApiKey(): string | null {
  return process.env.PRINTFUL_API_KEY || null;
}

function isConfigured(): boolean {
  return !!getApiKey();
}

async function printfulRequest<T>(
  method: string,
  endpoint: string,
  body?: object
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: "PRINTFUL_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${PRINTFUL_BASE}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-PF-Language": "en_US",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json() as any;

    if (!res.ok) {
      const message = json?.result || json?.error?.message || `HTTP ${res.status}`;
      return { success: false, error: message };
    }

    return { success: true, data: json.result as T };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

/**
 * Get Printful connection status and store info
 */
export async function getConnectionStatus(): Promise<{
  connected: boolean;
  configured: boolean;
  storeName?: string;
  storeId?: number;
  error?: string;
}> {
  if (!isConfigured()) {
    return { connected: false, configured: false, error: "API key not set" };
  }

  const result = await printfulRequest<any>("GET", "/store");
  if (!result.success) {
    return { connected: false, configured: true, error: result.error };
  }

  return {
    connected: true,
    configured: true,
    storeName: result.data?.name,
    storeId: result.data?.id,
  };
}

/**
 * Get all synced products from Printful store
 */
export async function getSyncedProducts(): Promise<{
  success: boolean;
  products?: Array<{
    id: number;
    name: string;
    thumbnail: string;
    variantCount: number;
    variants: Array<{ id: number; name: string; retailPrice: string }>;
  }>;
  error?: string;
}> {
  if (!isConfigured()) {
    return { success: false, error: "API key not set" };
  }

  const listResult = await printfulRequest<any[]>("GET", "/store/products?limit=50");
  if (!listResult.success) {
    return { success: false, error: listResult.error };
  }

  const products = [];
  for (const item of listResult.data as any[]) {
    const detail = await printfulRequest<any>("GET", `/store/products/${item.id}`);
    if (detail.success) {
      const syncProduct = (detail.data as any).sync_product;
      const syncVariants = (detail.data as any).sync_variants || [];
      products.push({
        id: syncProduct.id,
        name: syncProduct.name,
        thumbnail: syncProduct.thumbnail_url || "",
        variantCount: syncProduct.variants,
        variants: syncVariants.map((v: any) => ({
          id: v.id,
          name: v.name,
          retailPrice: v.retail_price,
        })),
      });
    }
  }

  return { success: true, products };
}

/**
 * Submit an order to Printful for fulfillment.
 * Only items with a printfulSyncVariantId are submitted.
 * Returns the Printful order ID and status if successful.
 */
export async function submitOrderToFulfillment(order: {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  address: string;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    printfulSyncVariantId?: string | null;
  }>;
}): Promise<{
  success: boolean;
  printfulOrderId?: number;
  printfulStatus?: string;
  trackingInfo?: { number: string; carrier: string; estimatedDelivery: string };
  error?: string;
  skipped?: boolean;
}> {
  if (!isConfigured()) {
    console.log(`[Printful] API key not configured — order ${order.id} marked for later submission`);
    return { success: false, error: "API key not configured", skipped: true };
  }

  // Filter only items that have a Printful variant ID linked
  const fulfillableItems = order.items.filter(
    item => item.printfulSyncVariantId && !isNaN(Number(item.printfulSyncVariantId))
  );

  if (fulfillableItems.length === 0) {
    console.log(`[Printful] No Printful-linked variants found in order ${order.id} — skipping fulfillment`);
    return { success: false, error: "No products linked to Printful variants", skipped: true };
  }

  const recipient: PrintfulRecipient = {
    name: order.fullName,
    address1: order.address,
    city: order.city,
    state_code: order.state || undefined,
    country_code: getCountryCode(order.country),
    zip: order.postalCode || undefined,
    email: order.email,
    phone: order.phone || undefined,
  };

  const items: PrintfulOrderItem[] = fulfillableItems.map(item => ({
    sync_variant_id: Number(item.printfulSyncVariantId),
    quantity: item.quantity,
  }));

  const payload = {
    recipient,
    items,
    external_id: order.id,
  };

  console.log(`[Printful] Submitting order ${order.id} with ${items.length} item(s)...`);
  const result = await printfulRequest<PrintfulOrder>("POST", "/orders", payload);

  if (!result.success) {
    console.error(`[Printful] Order submission failed for ${order.id}: ${result.error}`);
    return { success: false, error: result.error };
  }

  const pf = result.data;
  console.log(`[Printful] Order submitted successfully. Printful ID: ${pf.id}, Status: ${pf.status}`);

  // Extract tracking if available
  let trackingInfo;
  if (pf.shipments && pf.shipments.length > 0) {
    const shipment = pf.shipments[0];
    const estMin = pf.estimated_delivery_dates?.min;
    const estMax = pf.estimated_delivery_dates?.max;
    const estDelivery = estMin && estMax
      ? `${new Date(estMin).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(estMax).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : "See tracking link for details";
    trackingInfo = {
      number: shipment.tracking_number,
      carrier: shipment.carrier,
      estimatedDelivery: estDelivery,
    };
  }

  return {
    success: true,
    printfulOrderId: pf.id,
    printfulStatus: pf.status,
    trackingInfo,
  };
}

/**
 * Get status of a Printful order by its Printful ID
 */
export async function getPrintfulOrderStatus(printfulOrderId: string): Promise<{
  success: boolean;
  status?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  error?: string;
}> {
  if (!isConfigured()) {
    return { success: false, error: "API key not configured" };
  }

  const result = await printfulRequest<PrintfulOrder>("GET", `/orders/${printfulOrderId}`);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  const pf = result.data;
  let trackingNumber, carrier, estimatedDelivery;

  if (pf.shipments && pf.shipments.length > 0) {
    trackingNumber = pf.shipments[0].tracking_number;
    carrier = pf.shipments[0].carrier;
  }

  if (pf.estimated_delivery_dates?.min && pf.estimated_delivery_dates?.max) {
    const min = new Date(pf.estimated_delivery_dates.min);
    const max = new Date(pf.estimated_delivery_dates.max);
    estimatedDelivery = `${min.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${max.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }

  return {
    success: true,
    status: pf.status,
    trackingNumber,
    carrier,
    estimatedDelivery,
  };
}

export { isConfigured };
