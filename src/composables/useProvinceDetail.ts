import { ref } from "vue";
import {
  mockProvinces,
  mockProvinceAttractions,
  mockWeather,
} from "@/data/mockProvinces";

export type Place = {
  id: string | number;
  name: string;
  province: string;
  category: string;
  discovery: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  tags: string[];
  featured?: boolean;
  location?:
    | string
    | {
        type?: string;
        coordinates?: [number, number];
      }
    | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

export type ProvinceApi = {
  id: number;
  nameEn: string;
  nameKh: string;
  description: string | null;
  mainImageUrl: string | null;
};

export type AttractionApi = {
  id: string;
  provinceId: number;
  nameEn: string;
  nameKh: string | null;
  category: string | null;
  description: string | null;
  location:
    | string
    | {
        type?: string;
        coordinates?: [number, number];
      }
    | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  isHiddenGem: boolean;
  averageRating: number | string;
  reviewCount: number | string;
  imageUrl?: string | null;
  heroImage?: string | null;
};

export type WeatherApi = {
  id: string;
  provinceId: number;
  tempCelsius: number | string | null;
  conditionText: string | null;
  iconUrl: string | null;
  lastUpdated: string | null;
};

export type WeatherAlertApi = {
  id: string;
  provinceId: number;
  alertType: string | null;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

const API_BASE = "http://localhost:3000";
const FALLBACK_IMAGE =
  "https://www.asiakingtravel.com/cuploads/files/royalpalace-att-b.jpg";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeProvince(raw: any): ProvinceApi | null {
  if (!raw) return null;

  const id = Number(raw.id ?? raw.province_id ?? raw.provinceId);
  const nameEn = String(raw.nameEn ?? raw.name_en ?? raw.name ?? "");

  if (!id || !nameEn) return null;

  return {
    id,
    nameEn,
    nameKh: String(raw.nameKh ?? raw.name_kh ?? ""),
    description: raw.description ?? null,
    mainImageUrl: raw.mainImageUrl ?? raw.main_image_url ?? null,
  };
}

function normalizeAttraction(raw: any): AttractionApi | null {
  if (!raw) return null;

  const id = String(raw.id ?? raw.attraction_id ?? "");
  if (!id) return null;

  return {
    id,
    provinceId: Number(raw.provinceId ?? raw.province_id ?? 0),
    nameEn: String(raw.nameEn ?? raw.name_en ?? raw.name ?? ""),
    nameKh: raw.nameKh ?? raw.name_kh ?? null,
    category: raw.category ?? raw.main_category ?? null,
    description: raw.description ?? null,
    location: raw.location ?? raw.address ?? null,
    latitude: raw.latitude ?? raw.lat ?? null,
    longitude: raw.longitude ?? raw.lng ?? null,
    isHiddenGem: Boolean(raw.isHiddenGem ?? raw.is_hidden_gem ?? false),
    averageRating: raw.averageRating ?? raw.average_rating ?? raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? raw.review_count ?? 0,
    imageUrl: raw.imageUrl ?? raw.image_url ?? null,
    heroImage: raw.heroImage ?? raw.hero_image ?? null,
  };
}

function mapAttractionToPlace(
  attraction: AttractionApi,
  province: ProvinceApi,
  index: number,
): Place {
  const category = attraction.category || "Cultural";
  const rating = Number(attraction.averageRating || 0);
  const reviews = Number(attraction.reviewCount || 0);
  const discovery = reviews > 0 ? "Most popular" : "Hidden gems";

  return {
    id: attraction.id,
    name: attraction.nameEn,
    province: province.nameEn,
    category,
    discovery,
    rating,
    reviews,
    description: attraction.description || "No description available yet.",
    image:
      attraction.heroImage ||
      attraction.imageUrl ||
      province.mainImageUrl ||
      FALLBACK_IMAGE,
    tags: [category, discovery],
    featured: index === 0,
    location: attraction.location,
    latitude: attraction.latitude ?? null,
    longitude: attraction.longitude ?? null,
  };
}

export function useProvinceDetail() {
  const backendProvinceId = ref<number | null>(null);
  const backendProvince = ref<ProvinceApi | null>(null);
  const allPlaces = ref<Place[]>([]);
  const weather = ref<WeatherApi | null>(null);
  const weatherAlerts = ref<WeatherAlertApi[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref("");

  async function loadProvinceDetail(slug: string) {
    isLoading.value = true;
    errorMessage.value = "";
    backendProvinceId.value = null;
    backendProvince.value = null;
    allPlaces.value = [];
    weather.value = null;
    weatherAlerts.value = [];

    try {
      let provinces: ProvinceApi[] = [];
      let usesMockData = false;

      try {
        const provincesResponse = await fetch(`${API_BASE}/api/provinces`, {
          signal: AbortSignal.timeout(5000),
        });

        if (!provincesResponse.ok) {
          throw new Error("Failed to load provinces.");
        }

        const provincesData = await provincesResponse.json();
        const rawProvinces = Array.isArray(provincesData)
          ? provincesData
          : (provincesData?.provinces ?? provincesData?.data ?? []);

        provinces = rawProvinces
          .map(normalizeProvince)
          .filter(Boolean) as ProvinceApi[];
      } catch {
        provinces = mockProvinces as unknown as ProvinceApi[];
        usesMockData = true;
      }

      const matchedProvince = provinces.find(
        (province) => toSlug(province.nameEn) === slug,
      );

      const fallbackProvince =
        matchedProvince ||
        normalizeProvince(
          mockProvinces.find((province) => toSlug(province.nameEn) === slug),
        );

      if (!fallbackProvince) {
        throw new Error("Province not found.");
      }

      backendProvinceId.value = fallbackProvince.id;
      backendProvince.value = fallbackProvince;

      let attractions: AttractionApi[] = [];

      try {
        const attractionsResponse = await fetch(
          `${API_BASE}/api/attractions/province/${fallbackProvince.id}`,
          { signal: AbortSignal.timeout(5000) },
        );

        if (attractionsResponse.ok) {
          const attractionsData = await attractionsResponse.json();
          const rawAttractions =
            attractionsData?.attractions ??
            attractionsData?.data ??
            attractionsData;

          attractions = Array.isArray(rawAttractions)
            ? (rawAttractions
                .map(normalizeAttraction)
                .filter(Boolean) as AttractionApi[])
            : [];
        }
      } catch {
        // use fallback below
      }

      if (attractions.length === 0) {
        console.log("Using mock attractions fallback");

        const mockData =
          mockProvinceAttractions[
            fallbackProvince.id as keyof typeof mockProvinceAttractions
          ];

        attractions = (mockData || [])
          .map((item: any) => normalizeAttraction(item))
          .filter(Boolean) as AttractionApi[];

        usesMockData = true;
      }

      if (attractions.length > 0) {
        allPlaces.value = attractions.map((attraction, index) =>
          mapAttractionToPlace(attraction, fallbackProvince, index),
        );

        console.log("Backend attractions length:", attractions.length);
        console.log("All places shown length:", allPlaces.value.length);
        console.log("Backend attractions data:", attractions);
      } else {
        allPlaces.value = [];
        console.log("No backend attractions found");
      }

      try {
        const weatherResponse = await fetch(
          `${API_BASE}/api/weather/${fallbackProvince.id}`,
          { signal: AbortSignal.timeout(5000) },
        );

        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          weather.value = weatherData.weather || null;
          weatherAlerts.value = weatherData.alerts || [];
        } else {
          weather.value = mockWeather as WeatherApi;
        }
      } catch {
        weather.value = mockWeather as WeatherApi;
        weatherAlerts.value = [];
      }

      if (usesMockData) {
        errorMessage.value = "Note: Using sample data (backend unavailable)";
      }
    } catch (error) {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Failed to load province detail.";
      allPlaces.value = [];
      weather.value = null;
      weatherAlerts.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    backendProvinceId,
    backendProvince,
    allPlaces,
    weather,
    weatherAlerts,
    isLoading,
    errorMessage,
    loadProvinceDetail,
  };
}
