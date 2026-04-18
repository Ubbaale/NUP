/**
 * Location Service
 * - Geocodes city/country to lat/lng using OpenStreetMap Nominatim (free, no API key)
 * - Fetches landmark images from Wikipedia REST API (free, no API key)
 */

interface GeocodeResult {
  latitude: string;
  longitude: string;
}

interface LandmarkResult {
  imageUrl: string | null;
}

const USER_AGENT = "NUP-Diaspora-Website/1.0 (https://nupdiaspora.org)";

export async function geocodeCity(city: string, country: string): Promise<GeocodeResult | null> {
  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept": "application/json" },
    });
    if (!res.ok) {
      console.warn(`[geocode] Failed for ${city}, ${country}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json() as any[];
    if (!data || data.length === 0) {
      console.warn(`[geocode] No results for ${city}, ${country}`);
      return null;
    }
    return {
      latitude: String(data[0].lat),
      longitude: String(data[0].lon),
    };
  } catch (err: any) {
    console.error(`[geocode] Error for ${city}, ${country}:`, err.message);
    return null;
  }
}

export async function fetchLandmarkImage(city: string, country: string): Promise<LandmarkResult> {
  // Try city page on Wikipedia first
  const candidates = [city, `${city}, ${country}`, country];
  for (const candidate of candidates) {
    try {
      const title = encodeURIComponent(candidate.replace(/\s+/g, "_"));
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, "Accept": "application/json" },
      });
      if (!res.ok) continue;
      const data = await res.json() as any;
      const imageUrl = data?.originalimage?.source || data?.thumbnail?.source;
      if (imageUrl) {
        return { imageUrl };
      }
    } catch {
      // try next candidate
    }
  }
  return { imageUrl: null };
}

export async function enrichChapterLocation(city: string, country: string): Promise<{
  latitude?: string;
  longitude?: string;
  landmarkUrl?: string;
}> {
  const result: { latitude?: string; longitude?: string; landmarkUrl?: string } = {};

  const [geo, landmark] = await Promise.all([
    geocodeCity(city, country),
    fetchLandmarkImage(city, country),
  ]);

  if (geo) {
    result.latitude = geo.latitude;
    result.longitude = geo.longitude;
  }
  if (landmark.imageUrl) {
    result.landmarkUrl = landmark.imageUrl;
  }

  return result;
}
