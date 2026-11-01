/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
  source: 'Open-Meteo';
  attribution: string;
  fetchedAt: string;
}

export interface WeatherLocationResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export async function searchWeatherLocations(query: string): Promise<WeatherLocationResult[]> {
  const url = `/api/weather/geocode?location=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Unable to find that location.');
  }

  const payload: { results: WeatherLocationResult[] } = await res.json();
  return payload.results;
}

export async function fetchOpenMeteoForecast(lat: number, lon: number): Promise<OpenMeteoForecastResponse> {
  const url = `/api/weather/forecast?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&timezone=auto`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || error?.detail || 'Unable to fetch Open-Meteo forecast data.');
  }

  return res.json();
}
