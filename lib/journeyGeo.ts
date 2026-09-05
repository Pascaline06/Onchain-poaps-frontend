export type GeoPoint = { lat: number; lon: number; label: string };

const PLACES: Record<string, GeoPoint> = {
  lagos: { lat: 6.5244, lon: 3.3792, label: "Lagos" },
  abuja: { lat: 9.0765, lon: 7.3986, label: "Abuja" },
  accra: { lat: 5.6037, lon: -0.187, label: "Accra" },
  nairobi: { lat: -1.2921, lon: 36.8219, label: "Nairobi" },
  kigali: { lat: -1.9441, lon: 30.0619, label: "Kigali" },
  kampala: { lat: 0.3476, lon: 32.5825, label: "Kampala" },
  "cape town": { lat: -33.9249, lon: 18.4241, label: "Cape Town" },
  johannesburg: { lat: -26.2041, lon: 28.0473, label: "Johannesburg" },
  cairo: { lat: 30.0444, lon: 31.2357, label: "Cairo" },
  london: { lat: 51.5072, lon: -0.1276, label: "London" },
  paris: { lat: 48.8566, lon: 2.3522, label: "Paris" },
  berlin: { lat: 52.52, lon: 13.405, label: "Berlin" },
  lisbon: { lat: 38.7223, lon: -9.1393, label: "Lisbon" },
  amsterdam: { lat: 52.3676, lon: 4.9041, label: "Amsterdam" },
  barcelona: { lat: 41.3874, lon: 2.1686, label: "Barcelona" },
  madrid: { lat: 40.4168, lon: -3.7038, label: "Madrid" },
  rome: { lat: 41.9028, lon: 12.4964, label: "Rome" },
  zurich: { lat: 47.3769, lon: 8.5417, label: "Zurich" },
  istanbul: { lat: 41.0082, lon: 28.9784, label: "Istanbul" },
  dubai: { lat: 25.2048, lon: 55.2708, label: "Dubai" },
  singapore: { lat: 1.3521, lon: 103.8198, label: "Singapore" },
  tokyo: { lat: 35.6762, lon: 139.6503, label: "Tokyo" },
  seoul: { lat: 37.5665, lon: 126.978, label: "Seoul" },
  bangkok: { lat: 13.7563, lon: 100.5018, label: "Bangkok" },
  manila: { lat: 14.5995, lon: 120.9842, label: "Manila" },
  sydney: { lat: -33.8688, lon: 151.2093, label: "Sydney" },
  melbourne: { lat: -37.8136, lon: 144.9631, label: "Melbourne" },
  "new york": { lat: 40.7128, lon: -74.006, label: "New York" },
  nyc: { lat: 40.7128, lon: -74.006, label: "New York" },
  "san francisco": { lat: 37.7749, lon: -122.4194, label: "San Francisco" },
  denver: { lat: 39.7392, lon: -104.9903, label: "Denver" },
  miami: { lat: 25.7617, lon: -80.1918, label: "Miami" },
  austin: { lat: 30.2672, lon: -97.7431, label: "Austin" },
  chicago: { lat: 41.8781, lon: -87.6298, label: "Chicago" },
  toronto: { lat: 43.6532, lon: -79.3832, label: "Toronto" },
  vancouver: { lat: 49.2827, lon: -123.1207, label: "Vancouver" },
  "mexico city": { lat: 19.4326, lon: -99.1332, label: "Mexico City" },
  bogota: { lat: 4.711, lon: -74.0721, label: "Bogota" },
  "rio de janeiro": { lat: -22.9068, lon: -43.1729, label: "Rio de Janeiro" },
  "sao paulo": { lat: -23.5505, lon: -46.6333, label: "Sao Paulo" },
  "buenos aires": { lat: -34.6037, lon: -58.3816, label: "Buenos Aires" },
};

const COUNTRIES: Record<string, GeoPoint> = {
  nigeria: { lat: 9.082, lon: 8.6753, label: "Nigeria" },
  ghana: { lat: 7.9465, lon: -1.0232, label: "Ghana" },
  kenya: { lat: -0.0236, lon: 37.9062, label: "Kenya" },
  "south africa": { lat: -30.5595, lon: 22.9375, label: "South Africa" },
  uk: { lat: 55.3781, lon: -3.436, label: "United Kingdom" },
  "united kingdom": { lat: 55.3781, lon: -3.436, label: "United Kingdom" },
  france: { lat: 46.2276, lon: 2.2137, label: "France" },
  germany: { lat: 51.1657, lon: 10.4515, label: "Germany" },
  portugal: { lat: 39.3999, lon: -8.2245, label: "Portugal" },
  spain: { lat: 40.4637, lon: -3.7492, label: "Spain" },
  italy: { lat: 41.8719, lon: 12.5674, label: "Italy" },
  usa: { lat: 37.0902, lon: -95.7129, label: "United States" },
  "united states": { lat: 37.0902, lon: -95.7129, label: "United States" },
  canada: { lat: 56.1304, lon: -106.3468, label: "Canada" },
  japan: { lat: 36.2048, lon: 138.2529, label: "Japan" },
  korea: { lat: 35.9078, lon: 127.7669, label: "South Korea" },
  "south korea": { lat: 35.9078, lon: 127.7669, label: "South Korea" },
  australia: { lat: -25.2744, lon: 133.7751, label: "Australia" },
  singapore: { lat: 1.3521, lon: 103.8198, label: "Singapore" },
  uae: { lat: 23.4241, lon: 53.8478, label: "UAE" },
  "united arab emirates": { lat: 23.4241, lon: 53.8478, label: "UAE" },
  brazil: { lat: -14.235, lon: -51.9253, label: "Brazil" },
  mexico: { lat: 23.6345, lon: -102.5528, label: "Mexico" },
  colombia: { lat: 4.5709, lon: -74.2973, label: "Colombia" },
  argentina: { lat: -38.4161, lon: -63.6167, label: "Argentina" },
};

export function resolveLocation(value?: string | null): GeoPoint | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9, ]+/g, " ").replace(/\s+/g, " ");
  for (const [key, point] of Object.entries(PLACES)) {
    if (normalized.includes(key)) return point;
  }
  for (const [key, point] of Object.entries(COUNTRIES)) {
    if (normalized.includes(key)) return point;
  }
  return null;
}

export function projectGeo(point: GeoPoint, width = 1000, height = 500) {
  return {
    x: ((point.lon + 180) / 360) * width,
    y: ((90 - point.lat) / 180) * height,
  };
}
