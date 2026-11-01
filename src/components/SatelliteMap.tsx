/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FarmerProfile, Language, NASAObservation } from '../types';
import { Layers, MapPin, Eye, Compass, Info, CloudRain, Droplets, SunMedium } from 'lucide-react';

interface SatelliteMapProps {
  farmers: FarmerProfile[];
  activeFarmer: FarmerProfile;
  onSelectFarmer: (farmer: FarmerProfile) => void;
  language: Language;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  farmers,
  activeFarmer,
  onSelectFarmer,
  language,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'smap' | 'gpm' | 'heat'>('smap');
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const overlayLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [activeFarmer.latitude, activeFarmer.longitude],
      zoom: 6,
      zoomControl: true,
    });

    // Dark high-contrast base map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    overlayLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    map.on('click', (e) => {
      setClickedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pan to active farmer when changed
  useEffect(() => {
    if (mapInstanceRef.current && activeFarmer) {
      mapInstanceRef.current.flyTo([activeFarmer.latitude, activeFarmer.longitude], 8, {
        duration: 1.2,
      });
    }
  }, [activeFarmer]);

  // Render farmer markers and environmental overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !overlayLayerGroupRef.current) return;

    overlayLayerGroupRef.current.clearLayers();

    // 1. Render Environmental Data Overlays
    if (activeOverlay === 'smap') {
      // SMAP Soil Moisture Heat Circles
      farmers.forEach((f) => {
        const moistCircle = L.circle([f.latitude, f.longitude], {
          radius: 45000,
          color: '#10b981',
          fillColor: '#059669',
          fillOpacity: 0.28,
          weight: 1.5,
          dashArray: '4, 4',
        });
        moistCircle.bindTooltip(
          `<strong>NASA SMAP Hydrology</strong><br/>Root-zone saturation estimate for ${f.district}`,
          { permanent: false }
        );
        overlayLayerGroupRef.current?.addLayer(moistCircle);
      });
    } else if (activeOverlay === 'gpm') {
      // GPM Precipitation Footprint
      farmers.forEach((f) => {
        const rainCircle = L.circle([f.latitude, f.longitude], {
          radius: 55000,
          color: '#06b6d4',
          fillColor: '#0891b2',
          fillOpacity: 0.25,
          weight: 1.5,
        });
        rainCircle.bindTooltip(
          `<strong>NASA GPM IMERG Precipitation</strong><br/>Satellite microwave rain-rate footprint for ${f.district}`,
          { permanent: false }
        );
        overlayLayerGroupRef.current?.addLayer(rainCircle);
      });
    } else if (activeOverlay === 'heat') {
      // Land Surface Temperature Thermal Footprint
      farmers.forEach((f) => {
        const heatCircle = L.circle([f.latitude, f.longitude], {
          radius: 50000,
          color: '#f43f5e',
          fillColor: '#e11d48',
          fillOpacity: 0.25,
          weight: 1.5,
        });
        heatCircle.bindTooltip(
          `<strong>NASA MODIS Land Surface Temp</strong><br/>Thermal anomaly band (>34°C)`,
          { permanent: false }
        );
        overlayLayerGroupRef.current?.addLayer(heatCircle);
      });
    }

    // 2. Render Farmer Pins
    farmers.forEach((f) => {
      const isSelected = f.id === activeFarmer.id;

      const markerHtml = `
        <div style="
          width: ${isSelected ? '36px' : '28px'};
          height: ${isSelected ? '36px' : '28px'};
          background-color: ${isSelected ? '#10b981' : '#047857'};
          border: 3px solid ${isSelected ? '#ffffff' : '#a7f3d0'};
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '14px' : '11px'};
          cursor: pointer;
        ">
          🌾
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-farmer-pin',
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([f.latitude, f.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="color: #000; font-family: sans-serif; font-size: 12px; min-width: 170px;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #047857;">${f.name}</h4>
          <p style="margin: 0 0 4px 0;"><strong>Crop:</strong> ${f.crop} (${f.growthStage})</p>
          <p style="margin: 0 0 4px 0;"><strong>Location:</strong> ${f.village}, ${f.district}</p>
          <p style="margin: 0 0 6px 0;"><strong>Soil:</strong> ${f.soilType}</p>
          <span style="display: inline-block; padding: 2px 6px; font-size: 10px; border-radius: 4px; background: ${f.consentForCalls ? '#d1fae5' : '#fee2e2'}; color: ${f.consentForCalls ? '#065f46' : '#991b1b'};">
            ${f.consentForCalls ? 'Calling Consent: Granted' : 'Calling Consent: None'}
          </span>
        </div>
      `);

      marker.on('click', () => {
        onSelectFarmer(f);
      });

      overlayLayerGroupRef.current?.addLayer(marker);
    });
  }, [farmers, activeFarmer, activeOverlay, onSelectFarmer]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Layer Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-display flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            <span>Interactive NASA Geospatial Climate Map</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Displaying registered Indian farms with overlaid NASA SMAP, GPM IMERG, and MODIS observational grids.
          </p>
        </div>

        {/* Environmental Layer Selector Buttons (Requirement 6) */}
        <div data-guide="map-layers" className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#0c1a11] border border-[#1b3d24]">
          <span className="text-[11px] font-semibold text-stone-400 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Layer:
          </span>
          <button
            onClick={() => setActiveOverlay('smap')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeOverlay === 'smap' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-emerald-300" />
            <span>NASA SMAP Soil</span>
          </button>
          <button
            onClick={() => setActiveOverlay('gpm')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeOverlay === 'gpm' ? 'bg-cyan-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
            <span>NASA GPM Rain</span>
          </button>
          <button
            onClick={() => setActiveOverlay('heat')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeOverlay === 'heat' ? 'bg-rose-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5 text-rose-300" />
            <span>MODIS Thermal</span>
          </button>
          <button
            onClick={() => setActiveOverlay('none')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeOverlay === 'none' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            None
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div data-guide="satellite-map" className="rounded-2xl border border-[#1b3d24] overflow-hidden bg-[#0c1a11] shadow-2xl relative h-[540px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Legend Box (Requirement 6) */}
        <div className="absolute bottom-4 left-4 z-10 bg-[#08120a]/95 border border-[#1b3d24] p-3.5 rounded-xl shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5 pb-1 border-b border-[#173620]">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Geospatial Legend & Scale</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-stone-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0"></span>
              <span>Selected Active Farm Pin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-700 border border-emerald-300 shrink-0"></span>
              <span>Registered Farm Location</span>
            </div>
            {activeOverlay === 'smap' && (
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="w-3 h-3 rounded bg-emerald-600/50 border border-emerald-400 shrink-0"></span>
                <span>NASA SMAP 9km Hydrology Grid</span>
              </div>
            )}
            {activeOverlay === 'gpm' && (
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="w-3 h-3 rounded bg-cyan-600/50 border border-cyan-400 shrink-0"></span>
                <span>NASA GPM IMERG Precipitation Band</span>
              </div>
            )}
            {activeOverlay === 'heat' && (
              <div className="flex items-center gap-2 text-rose-300">
                <span className="w-3 h-3 rounded bg-rose-600/50 border border-rose-400 shrink-0"></span>
                <span>MODIS Surface Thermal Footprint</span>
              </div>
            )}
          </div>
        </div>

        {/* Click Coordinate Inspector */}
        {clickedLocation && (
          <div className="absolute top-4 right-4 z-10 bg-[#08120a]/95 border border-emerald-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs text-stone-300 max-w-xs">
            <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Inspected Coordinates</span>
            </div>
            <div className="font-mono text-white text-[11px]">
              {clickedLocation.lat.toFixed(4)}°N, {clickedLocation.lng.toFixed(4)}°E
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              NASA grid cell queryable. To add a farm at this point, use the "Register Farm" modal.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
