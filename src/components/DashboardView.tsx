/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  SunMedium, 
  Droplets, 
  CloudRain, 
  Sprout, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  PhoneCall, 
  Sparkles, 
  Sliders, 
  Info, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wind,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { FarmerProfile, Language, NASAObservation, RiskAssessment, WeatherForecastSummary } from '../types';
import { getT } from '../services/i18n';
import { generateHistoricalSeries } from '../services/nasaService';
import { fetchOpenMeteoForecast, searchWeatherLocations, WeatherLocationResult } from '../services/openMeteoService';

interface DashboardViewProps {
  farmer: FarmerProfile;
  observation: NASAObservation;
  assessment: RiskAssessment;
  language: Language;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onOpenCallingModal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  farmer,
  observation,
  assessment,
  language,
  onRefreshData,
  isRefreshing,
  onOpenCallingModal,
  onNavigateToTab,
}) => {
  const t = getT(language);
  const [chartMetric, setChartMetric] = useState<'temp' | 'rain' | 'moisture' | 'ndvi'>('temp');
  const [showLimitations, setShowLimitations] = useState(false);
  const [weather, setWeather] = useState<WeatherForecastSummary | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState({
    farmerId: farmer.id,
    label: `${farmer.village}, ${farmer.district}, ${farmer.state}`,
    latitude: farmer.latitude,
    longitude: farmer.longitude,
  });
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<WeatherLocationResult[]>([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState<string | null>(null);
  const activeWeatherLocation = weatherLocation.farmerId === farmer.id
    ? weatherLocation
    : {
      farmerId: farmer.id,
      label: `${farmer.village}, ${farmer.district}, ${farmer.state}`,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
    };

  useEffect(() => {
    let active = true;
    const loadWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      try {
        const forecast = await fetchOpenMeteoForecast(activeWeatherLocation.latitude, activeWeatherLocation.longitude);
        if (!active) return;
        setWeather(forecast);
      } catch (err: any) {
        if (!active) return;
        setWeatherError(err?.message || 'Unable to fetch live weather data.');
        setWeather(null);
      } finally {
        if (active) {
          setWeatherLoading(false);
        }
      }
    };

    loadWeather();
    return () => {
      active = false;
    };
  }, [activeWeatherLocation.latitude, activeWeatherLocation.longitude]);

  const handleWeatherLocationSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = locationQuery.trim();
    if (!query) {
      setLocationSearchError(language === 'hi' ? 'शहर, राज्य या देश का नाम दर्ज करें।' : 'Enter a city, state, or country.');
      setLocationResults([]);
      return;
    }

    setLocationSearchLoading(true);
    setLocationSearchError(null);
    setLocationResults([]);
    try {
      const results = await searchWeatherLocations(query);
      setLocationResults(results);
    } catch (error) {
      setLocationSearchError(error instanceof Error ? error.message : 'Unable to find that location.');
    } finally {
      setLocationSearchLoading(false);
    }
  };

  const selectWeatherLocation = (location: WeatherLocationResult) => {
    setWeatherLocation({
      farmerId: farmer.id,
      label: [...new Set([location.name, location.admin1, location.country].filter(Boolean))].join(', '),
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setLocationQuery('');
    setLocationResults([]);
    setLocationSearchError(null);
  };

  const historicalData = React.useMemo(() => {
    return generateHistoricalSeries(observation, 14);
  }, [observation]);

  const weatherCodeLabel = (code: number) => {
    const map: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mostly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Freezing drizzle',
      57: 'Heavy freezing drizzle',
      61: 'Light rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Freezing rain',
      67: 'Heavy freezing rain',
      71: 'Light snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Rain showers',
      81: 'Heavy showers',
      82: 'Violent showers',
      85: 'Snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm + hail',
      99: 'Severe thunderstorm'
    };
    return map[code] || 'Weather update';
  };

  const weatherSummaryText = weather ? weatherCodeLabel(weather.current?.weather_code ?? 0) : 'Live weather';

  const riskBadgeColor = (level: string) => {
    if (level === 'HIGH') return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
    if (level === 'MEDIUM') return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
  };

  return (
    <div data-guide="dashboard-observations" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner: Farm Profile & Action Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d2114] via-[#0f2818] to-[#0a170e] border border-[#1d4727] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
                {farmer.district}, {farmer.state}
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-500" />
                {farmer.latitude.toFixed(4)}°N, {farmer.longitude.toFixed(4)}°E ({farmer.village})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {farmer.name}'s Farm
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-300 mt-3">
              <div>
                <span className="text-stone-400">{t.crop}: </span>
                <span className="font-semibold text-emerald-300">{farmer.crop}</span>
              </div>
              <div>
                <span className="text-stone-400">{t.stage}: </span>
                <span className="font-semibold text-amber-300">{farmer.growthStage}</span>
              </div>
              <div>
                <span className="text-stone-400">{t.area}: </span>
                <span className="font-semibold text-white">{farmer.farmArea} {farmer.areaUnit}</span>
              </div>
              <div>
                <span className="text-stone-400">{t.soil}: </span>
                <span className="font-semibold text-white">{farmer.soilType}</span>
              </div>
              <div>
                <span className="text-stone-400">Irrigation: </span>
                <span className="font-semibold text-white">{farmer.irrigationMethod}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-xl bg-[#132c1b] hover:bg-[#1a3823] border border-[#234d2c] text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Re-query NASA POWER and SMAP satellite endpoints"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRefreshing ? 'Fetching NASA...' : 'Refresh NASA Feeds'}</span>
            </button>

            <button
              onClick={onOpenCallingModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/70 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कॉल सेंटर खोलें' : 'Open Call Center'}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('advisor')}
              className="px-3.5 py-2.5 rounded-xl bg-[#142818] hover:bg-[#1c3822] border border-[#244c2c] text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'सलाहकार' : 'Ask AI'}</span>
            </button>
          </div>
        </div>

        {/* Satellite Provenance Ribbon */}
        <div className="mt-4 pt-3 border-t border-[#183921] flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>
              <strong>NASA Data Source:</strong> {observation.dataSource}
            </span>
            <span className="text-emerald-400/80 font-mono">({observation.dataQuality})</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Obs Date: <strong>{observation.date}</strong></span>
            <button
              onClick={() => setShowLimitations(!showLimitations)}
              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3 h-3" />
              <span>{showLimitations ? 'Hide Limitations' : 'Dataset Limitations'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Dataset Limitations Note (Requirement 4) */}
        {showLimitations && (
          <div className="mt-3 p-3 rounded-xl bg-[#09150d] border border-emerald-500/30 text-xs text-stone-300 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              NASA Earth Science Dataset Specifications & Known Limitations:
            </div>
            {observation.datasetLimitations.map((lim, i) => (
              <p key={i} className="text-stone-400 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-emerald-500">
                {lim}
              </p>
            ))}
          </div>
        )}
      </div>

      <div data-guide="weather" className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183921]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <SunMedium className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-bold">Live Weather</div>
              <h3 className="text-base font-bold text-white font-display">{activeWeatherLocation.label}</h3>
            </div>
          </div>

          <div className="text-xs text-stone-400 text-right">
            <div className="font-semibold text-stone-300">
              {weatherLoading ? 'Updating forecast...' : weather ? `${weatherSummaryText}` : 'Weather unavailable'}
            </div>
            <div>{weather ? new Date(weather.current.time).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' }) : 'Open-Meteo'}</div>
          </div>
        </div>

        <form onSubmit={handleWeatherLocationSearch} className="mt-4">
          <label htmlFor="weather-location" className="sr-only">
            {language === 'hi' ? 'शहर, राज्य या देश खोजें' : 'Search city, state, or country'}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="weather-location"
              type="search"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
              placeholder={language === 'hi' ? 'दुनिया में शहर, राज्य या देश खोजें' : 'Search any city, state, or country worldwide'}
              className="min-w-0 flex-1 rounded-xl border border-[#234d2c] bg-[#09150d] px-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={locationSearchLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/70 bg-emerald-950/70 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/70 disabled:cursor-wait disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {locationSearchLoading
                ? (language === 'hi' ? 'खोज रहे हैं...' : 'Searching...')
                : (language === 'hi' ? 'मौसम खोजें' : 'Find weather')}
            </button>
          </div>
          {locationSearchError && (
            <p role="alert" className="mt-2 text-sm text-amber-300">{locationSearchError}</p>
          )}
          {locationResults.length > 0 && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {locationResults.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => selectWeatherLocation(location)}
                  className="rounded-xl border border-[#234d2c] bg-[#0a180f] px-3 py-2 text-left text-sm text-stone-200 hover:border-emerald-500/60 hover:bg-[#102318]"
                >
                  <span className="block font-semibold text-white">{location.name}</span>
                  <span className="text-xs text-stone-400">
                    {[...new Set([location.admin1, location.admin2, location.country].filter(Boolean))].join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>

        {weatherLoading ? (
          <div className="mt-4 flex items-center justify-center gap-2 py-8 text-sm text-stone-300">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            Fetching live forecast from Open-Meteo...
          </div>
        ) : weatherError ? (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-sm text-amber-200">
            {weatherError}. Please check the farm location or retry later.
          </div>
        ) : weather ? (
          <>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl bg-[#0a180f] border border-[#1b3d24] p-3">
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>Current</span>
                  <SunMedium className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white font-display">{weather.current.temperature_2m.toFixed(1)}°C</div>
                <div className="text-[10px] text-stone-400">Feels like {weather.current.apparent_temperature.toFixed(1)}°C</div>
              </div>

              <div className="rounded-xl bg-[#0a180f] border border-[#1b3d24] p-3">
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>Humidity</span>
                  <Droplets className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white font-display">{weather.current.relative_humidity_2m.toFixed(0)}%</div>
                <div className="text-[10px] text-stone-400">Moisture level</div>
              </div>

              <div className="rounded-xl bg-[#0a180f] border border-[#1b3d24] p-3">
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>Precipitation</span>
                  <CloudRain className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white font-display">{weather.current.precipitation.toFixed(1)} mm</div>
                <div className="text-[10px] text-stone-400">Current rain rate</div>
              </div>

              <div className="rounded-xl bg-[#0a180f] border border-[#1b3d24] p-3">
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>Wind</span>
                  <Wind className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-black text-white font-display">{weather.current.wind_speed_10m.toFixed(1)} km/h</div>
                <div className="text-[10px] text-stone-400">10m wind speed</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 mb-3">7-day forecast</div>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
                {weather.daily.time.map((day, idx) => {
                  const maxTemp = weather.daily.temperature_2m_max[idx];
                  const minTemp = weather.daily.temperature_2m_min[idx];
                  const precipitation = weather.daily.precipitation_sum[idx];
                  const code = weather.daily.weather_code[idx];

                  return (
                    <div key={day} className="rounded-xl bg-[#0a180f] border border-[#183921] p-2.5 text-center">
                      <div className="text-[10px] text-stone-400 font-semibold">{new Date(day).toLocaleDateString([], { weekday: 'short' })}</div>
                      <div className="mt-2 flex justify-center text-emerald-300">
                        {code === 0 || code === 1 ? <SunMedium className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
                      </div>
                      <div className="mt-1 text-[10px] text-stone-300">{weatherCodeLabel(code)}</div>
                      <div className="mt-2 text-sm font-bold text-white">{maxTemp.toFixed(0)}° / {minTemp.toFixed(0)}°</div>
                      <div className="text-[10px] text-cyan-300">Rain {precipitation.toFixed(1)} mm</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        <div className="mt-4 text-[10px] text-stone-400">
          Weather data by Open-Meteo.com. Location search ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-emerald-300 underline">
            OpenStreetMap contributors
          </a>.
        </div>
      </div>

      {/* Environmental Observation Metrics Grid (Requirement 4 & 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Max Temp */}
        <div className="rounded-xl bg-[#0c1a11] border border-[#1b3d24] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>{t.tempMax}</span>
            <SunMedium className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-display">
              {observation.temperatureMax.toFixed(1)}°C
            </div>
            <div className="text-[10px] text-stone-400">Min: {observation.temperatureMin.toFixed(1)}°C (NASA POWER)</div>
          </div>
          <div className="w-full bg-[#14281a] h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${observation.temperatureMax > 34 ? 'bg-rose-500' : 'bg-amber-400'}`}
              style={{ width: `${Math.min(100, (observation.temperatureMax / 45) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: 24h Rainfall */}
        <div className="rounded-xl bg-[#0c1a11] border border-[#1b3d24] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>{t.precipitation}</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-display">
              {observation.precipitation24h.toFixed(1)} <span className="text-xs font-normal text-stone-400">mm</span>
            </div>
            <div className="text-[10px] text-stone-400">7d: {observation.precipitation7d.toFixed(1)} mm (NASA GPM)</div>
          </div>
          <div className="w-full bg-[#14281a] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400"
              style={{ width: `${Math.min(100, (observation.precipitation24h / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Root-Zone Moisture */}
        <div className="rounded-xl bg-[#0c1a11] border border-[#1b3d24] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Root-Zone Soil</span>
            <Droplets className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-display">
              {(observation.rootZoneSoilMoisture * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-stone-400">Surface: {(observation.surfaceSoilMoisture * 100).toFixed(0)}% (SMAP L4)</div>
          </div>
          <div className="w-full bg-[#14281a] h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${observation.rootZoneSoilMoisture < 0.25 ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, observation.rootZoneSoilMoisture * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Relative Humidity */}
        <div className="rounded-xl bg-[#0c1a11] border border-[#1b3d24] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Rel Humidity</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-display">
              {observation.relativeHumidity.toFixed(0)}%
            </div>
            <div className="text-[10px] text-stone-400">Dew: {observation.dewPoint.toFixed(1)}°C (RH2M)</div>
          </div>
          <div className="w-full bg-[#14281a] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-400"
              style={{ width: `${Math.min(100, observation.relativeHumidity)}%` }}
            />
          </div>
        </div>

        {/* Metric 5: Solar Radiation */}
        <div className="rounded-xl bg-[#0c1a11] border border-[#1b3d24] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>{t.solarRad}</span>
            <SunMedium className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-display">
              {observation.solarRadiation.toFixed(1)} <span className="text-[11px] font-normal text-stone-400">MJ/m²</span>
            </div>
            <div className="text-[10px] text-stone-400">VPD: {observation.vaporPressureDeficit.toFixed(2)} kPa</div>
          </div>
          <div className="w-full bg-[#14281a] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400"
              style={{ width: `${Math.min(100, (observation.solarRadiation / 28) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 6: MODIS NDVI */}
        <div className="rounded-xl bg-[#0c1a11] border border-[#1b3d24] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Vegetation (NDVI)</span>
            <Sprout className="w-4 h-4 text-lime-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-display">
              {observation.ndvi.toFixed(2)}
            </div>
            <div className="text-[10px] text-stone-400">MODIS 16-Day (MOD13A2)</div>
          </div>
          <div className="w-full bg-[#14281a] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-lime-400"
              style={{ width: `${Math.min(100, observation.ndvi * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Climate Risk Engine vs Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Comprehensive Agrometeorological Risk Assessment */}
        <div className="lg:col-span-7 space-y-4">
          <div data-guide="dashboard-risk" className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#183921]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">
                  {t.riskTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Overall Severity:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskBadgeColor(assessment.overallRiskLevel)}`}>
                  {assessment.overallRiskLevel === 'HIGH' ? t.high : assessment.overallRiskLevel === 'MEDIUM' ? t.medium : t.low} ({assessment.overallScore}/100)
                </span>
              </div>
            </div>

            {/* 5 Risk Factors Breakdown */}
            <div className="divide-y divide-[#152e1c] mt-2">
              {/* Factor 1: Heat Stress */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${assessment.factors.heatStress.level === 'HIGH' ? 'bg-rose-500' : assessment.factors.heatStress.level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs font-bold text-white">{assessment.factors.heatStress.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskBadgeColor(assessment.factors.heatStress.level)}`}>
                    {assessment.factors.heatStress.level} ({assessment.factors.heatStress.score}%)
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed pl-4">
                  {assessment.factors.heatStress.impactSummary}
                </p>
                <div className="text-[10px] text-stone-400 pl-4 mt-0.5 font-mono">
                  {assessment.factors.heatStress.metricValue} • {assessment.factors.heatStress.thresholdValue}
                </div>
              </div>

              {/* Factor 2: Drought Risk */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${assessment.factors.droughtRisk.level === 'HIGH' ? 'bg-rose-500' : assessment.factors.droughtRisk.level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs font-bold text-white">{assessment.factors.droughtRisk.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskBadgeColor(assessment.factors.droughtRisk.level)}`}>
                    {assessment.factors.droughtRisk.level} ({assessment.factors.droughtRisk.score}%)
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed pl-4">
                  {assessment.factors.droughtRisk.impactSummary}
                </p>
                <div className="text-[10px] text-stone-400 pl-4 mt-0.5 font-mono">
                  {assessment.factors.droughtRisk.metricValue} • {assessment.factors.droughtRisk.thresholdValue}
                </div>
              </div>

              {/* Factor 3: Excess Rain */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${assessment.factors.excessRainfall.level === 'HIGH' ? 'bg-rose-500' : assessment.factors.excessRainfall.level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs font-bold text-white">{assessment.factors.excessRainfall.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskBadgeColor(assessment.factors.excessRainfall.level)}`}>
                    {assessment.factors.excessRainfall.level} ({assessment.factors.excessRainfall.score}%)
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed pl-4">
                  {assessment.factors.excessRainfall.impactSummary}
                </p>
                <div className="text-[10px] text-stone-400 pl-4 mt-0.5 font-mono">
                  {assessment.factors.excessRainfall.metricValue} • {assessment.factors.excessRainfall.thresholdValue}
                </div>
              </div>

              {/* Factor 4: Pest & Fungal */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${assessment.factors.pestDiseaseFungal.level === 'HIGH' ? 'bg-rose-500' : assessment.factors.pestDiseaseFungal.level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs font-bold text-white">{assessment.factors.pestDiseaseFungal.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskBadgeColor(assessment.factors.pestDiseaseFungal.level)}`}>
                    {assessment.factors.pestDiseaseFungal.level} ({assessment.factors.pestDiseaseFungal.score}%)
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed pl-4">
                  {assessment.factors.pestDiseaseFungal.impactSummary}
                </p>
                <div className="text-[10px] text-stone-400 pl-4 mt-0.5 font-mono">
                  {assessment.factors.pestDiseaseFungal.metricValue} • {assessment.factors.pestDiseaseFungal.thresholdValue}
                </div>
              </div>
            </div>

            {/* Audit Trail & Transparent Scientific Formula (Requirement 7) */}
            <div className="mt-4 pt-3 border-t border-[#183921]">
              <div className="text-[11px] font-semibold text-stone-400 mb-2">Scientific Audit Trail & Rule Log:</div>
              <div className="space-y-1.5">
                {assessment.auditTrail.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#08120a] border border-[#142d1a] text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-stone-300">
                    <div>
                      <span className="text-emerald-400 font-mono font-semibold">{item.ruleTriggered}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 shrink-0">
                      {item.datasetUsed}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-2 italic">
                {assessment.uncertaintyNotes}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Personalized Actionable Farming Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <div data-guide="historical-climate" className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#183921]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white font-display">
                  {language === 'hi' ? 'अनुकूलन कार्ययोजना एवं सिफारिशें' : 'Personalized Farming Recommendations'}
                </h3>
              </div>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800/50">
                Crop-Specific: {farmer.crop}
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {assessment.recommendedActions.map((act, index) => (
                <div 
                  key={index}
                  className="p-3.5 rounded-xl bg-[#112316] border border-[#1f452a] hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                      {act.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      act.urgency === 'IMMEDIATE' 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        : act.urgency === 'NEXT_48_HOURS'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {act.urgency.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-200 font-medium leading-relaxed">
                    {language === 'hi' ? act.actionHi : act.actionEn}
                  </p>
                  {language === 'hi' && (
                    <p className="text-[11px] text-stone-400 mt-1 italic">
                      EN: {act.actionEn}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* AI Advisor Prompt Launcher */}
            <div className="mt-4 pt-3 border-t border-[#183921]">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 to-[#0e2616] border border-emerald-600/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Need Customized Advice?</div>
                  <div className="text-[10px] text-emerald-300/80">Ask our Gemini agronomist about fertilizers, spray timing, or market alerts.</div>
                </div>
                <button
                  onClick={() => onNavigateToTab('advisor')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Ask Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Climate Analytics Section (Requirement 5 & 12) */}
      <div className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183921]">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              {language === 'hi' ? 'नासा ऐतिहासिक जलवायु प्रवृत्तियाँ (14 दिवस)' : 'NASA 14-Day Historical Climate Trends'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Continuously calibrated daily observations from NASA POWER and GPM IMERG satellites.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#08120a] border border-[#16311d]">
            <button
              onClick={() => setChartMetric('temp')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartMetric === 'temp' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setChartMetric('rain')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartMetric === 'rain' ? 'bg-cyan-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Precipitation
            </button>
            <button
              onClick={() => setChartMetric('moisture')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartMetric === 'moisture' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Soil Moisture
            </button>
            <button
              onClick={() => setChartMetric('ndvi')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartMetric === 'ndvi' ? 'bg-lime-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              MODIS NDVI
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'rain' ? (
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#173620" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} unit=" mm" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09150d', borderColor: '#1f452a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="precipitation" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Daily Rain (mm)" />
              </BarChart>
            ) : (
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMoist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#173620" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis 
                  stroke="#6b7280" 
                  tick={{ fontSize: 11 }} 
                  unit={chartMetric === 'temp' ? '°C' : chartMetric === 'moisture' ? '' : ''} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09150d', borderColor: '#1f452a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                {chartMetric === 'temp' && (
                  <>
                    <Area type="monotone" dataKey="tempMax" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" name="Max Temp (°C)" />
                    <Area type="monotone" dataKey="tempMin" stroke="#38bdf8" strokeWidth={2} fillOpacity={0} fill="transparent" name="Min Temp (°C)" />
                  </>
                )}
                {chartMetric === 'moisture' && (
                  <Area type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMoist)" name="Root-Zone Moisture" />
                )}
                {chartMetric === 'ndvi' && (
                  <Area type="monotone" dataKey="ndvi" stroke="#84cc16" strokeWidth={2} fillOpacity={1} fill="url(#colorNdvi)" name="NDVI Index" />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
