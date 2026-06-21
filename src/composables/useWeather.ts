import { ref } from 'vue'

// ─── WMO weather interpretation codes ────────────────────────────────────────
// https://open-meteo.com/en/docs#weathervariables
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear Sky',           icon: '☀️' },
  1:  { label: 'Mainly Clear',        icon: '🌤️' },
  2:  { label: 'Partly Cloudy',       icon: '⛅' },
  3:  { label: 'Overcast',            icon: '☁️' },
  45: { label: 'Foggy',               icon: '🌫️' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle',       icon: '🌦️' },
  53: { label: 'Moderate Drizzle',    icon: '🌦️' },
  55: { label: 'Dense Drizzle',       icon: '🌧️' },
  61: { label: 'Slight Rain',         icon: '🌧️' },
  63: { label: 'Moderate Rain',       icon: '🌧️' },
  65: { label: 'Heavy Rain',          icon: '🌧️' },
  71: { label: 'Slight Snow',         icon: '🌨️' },
  73: { label: 'Moderate Snow',       icon: '❄️' },
  75: { label: 'Heavy Snow',          icon: '❄️' },
  77: { label: 'Snow Grains',         icon: '🌨️' },
  80: { label: 'Slight Showers',      icon: '🌦️' },
  81: { label: 'Moderate Showers',    icon: '🌧️' },
  82: { label: 'Violent Showers',     icon: '🌧️' },
  85: { label: 'Slight Snow Showers', icon: '🌨️' },
  86: { label: 'Heavy Snow Showers',  icon: '❄️' },
  95: { label: 'Thunderstorm',        icon: '⛈️' },
  96: { label: 'Thunderstorm w/ Hail',icon: '⛈️' },
  99: { label: 'Thunderstorm w/ Hail',icon: '⛈️' },
}

export interface DayWeather {
  date:       string    // ISO yyyy-MM-dd
  dateLabel:  string    // e.g. "Dec 20"
  dayLabel:   string    // e.g. "Day 1"
  icon:       string
  condition:  string
  tempMax:    number    // °C
  tempMin:    number    // °C
  rain:       number    // mm
  wind:       number    // km/h
  uv:         number
  sunrise:    string    // "06:23"
  sunset:     string    // "17:55"
  humidity:   number    // %
}

export interface WeatherOptions {
  lat:       number
  lng:       number
  startDate: string   // yyyy-MM-dd
  days:      number   // trip duration in days (max 16 via Open-Meteo forecast)
  timezone?: string   // default 'Asia/Phnom_Penh'
}

export function useWeather() {
  const forecast = ref<DayWeather[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  const fetch = async (opts: WeatherOptions) => {
    loading.value  = true
    error.value    = null
    forecast.value = []

    const { lat, lng, startDate, days, timezone = 'Asia/Phnom_Penh' } = opts

    try {
      const forecastDays = Math.min(days + 2, 16)

      const url = new URL('https://api.open-meteo.com/v1/forecast')
      url.searchParams.set('latitude',     String(lat))
      url.searchParams.set('longitude',    String(lng))
      url.searchParams.set('timezone',     timezone)
      url.searchParams.set('forecast_days', String(forecastDays))
      url.searchParams.set('daily', [
        'weathercode',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'windspeed_10m_max',
        'uv_index_max',
        'sunrise',
        'sunset',
        'precipitation_probability_max',
      ].join(','))

      const res  = await window.fetch(url.toString())
      if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`)
      const data = await res.json()

      const { daily } = data
      const start = new Date(startDate)

      const result: DayWeather[] = []

      for (let d = 0; d < days; d++) {
        const tripDate = new Date(start)
        tripDate.setDate(start.getDate() + d)
        const iso  = tripDate.toISOString().split('T')[0]
        const idx  = (daily.time as string[]).indexOf(iso)

        if (idx === -1) {
          // Outside forecast window — use a seasonal baseline for Cambodia
          result.push(buildFallback(tripDate, d))
          continue
        }

        const code = daily.weathercode[idx] as number
        const meta = WMO_CODES[code] ?? { label: 'Unknown', icon: '🌤️' }

        const sunriseRaw: string = daily.sunrise?.[idx] ?? ''
        const sunsetRaw:  string = daily.sunset?.[idx]  ?? ''

        result.push({
          date:      iso,
          dateLabel: tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dayLabel:  `Day ${d + 1}`,
          icon:      meta.icon,
          condition: meta.label,
          tempMax:   Math.round(daily.temperature_2m_max[idx]        ?? 32),
          tempMin:   Math.round(daily.temperature_2m_min[idx]        ?? 24),
          rain:      Math.round((daily.precipitation_sum[idx]        ?? 0)  * 10) / 10,
          wind:      Math.round(daily.windspeed_10m_max[idx]         ?? 12),
          uv:        Math.round(daily.uv_index_max[idx]              ?? 8),
          humidity:  Math.round(daily.precipitation_probability_max?.[idx] ?? 60),
          sunrise:   sunriseRaw ? sunriseRaw.split('T')[1]?.slice(0, 5) : '06:10',
          sunset:    sunsetRaw  ? sunsetRaw .split('T')[1]?.slice(0, 5) : '17:50',
        })
      }

      forecast.value = result
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load weather'
      console.error('[useWeather]', e)
      // Still populate with fallback so UI doesn't break
      const start = new Date(startDate)
      forecast.value = Array.from({ length: days }, (_, d) => {
        const dt = new Date(start); dt.setDate(start.getDate() + d)
        return buildFallback(dt, d)
      })
    } finally {
      loading.value = false
    }
  }

  return { forecast, loading, error, fetch }
}

// ─── Seasonal baseline for Cambodia (used when date is beyond forecast window) ─
function buildFallback(date: Date, dayIndex: number): DayWeather {
  const month = date.getMonth() + 1  // 1-12
  // Dry season Nov-Apr: hot & sunny. Wet season May-Oct: rainy.
  const isDry = month <= 4 || month >= 11
  return {
    date:      date.toISOString().split('T')[0],
    dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dayLabel:  `Day ${dayIndex + 1}`,
    icon:      isDry ? '☀️' : '🌧️',
    condition: isDry ? 'Clear Sky (seasonal estimate)' : 'Showers (seasonal estimate)',
    tempMax:   isDry ? 33 : 30,
    tempMin:   isDry ? 24 : 25,
    rain:      isDry ? 0  : 8,
    wind:      12,
    uv:        9,
    humidity:  isDry ? 55 : 80,
    sunrise:   '06:10',
    sunset:    '17:50',
  }
}