'use client';

/**
 * HikeMap — MapLibre GL JS integration with 3D terrain, multiple basemaps,
 * and GPX trace rendering.
 *
 * Basemaps:
 * - OpenStreetMap (default)
 * - Satellite (Esri World Imagery)
 * - Topo (OpenTopoMap)
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Mountain, Maximize2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Basemap Definitions ─────────────────────────────────────────

const BASEMAPS = {
  osm: {
    label: 'Carte',
    icon: '🗺️',
    style: {
      version: 8 as const,
      sources: {
        osm: {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster' as const,
          source: 'osm',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  satellite: {
    label: 'Satellite',
    icon: '🛰️',
    style: {
      version: 8 as const,
      sources: {
        esri: {
          type: 'raster' as const,
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '© Esri',
          maxzoom: 18,
        },
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster' as const,
          source: 'esri',
          minzoom: 0,
          maxzoom: 18,
        },
      ],
    },
  },
  topo: {
    label: 'Topo',
    icon: '📐',
    style: {
      version: 8 as const,
      sources: {
        topo: {
          type: 'raster' as const,
          tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenTopoMap',
          maxzoom: 17,
        },
      },
      layers: [
        {
          id: 'topo-layer',
          type: 'raster' as const,
          source: 'topo',
          minzoom: 0,
          maxzoom: 17,
        },
      ],
    },
  },
};

type BasemapKey = keyof typeof BASEMAPS;

// ─── Types ───────────────────────────────────────────────────────

interface GeoJSONTrace {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  properties?: Record<string, any>;
}

interface HikeMapProps {
  /** GeoJSON trace to render on the map */
  trace?: GeoJSONTrace;
  /** Initial center [lng, lat] */
  center?: [number, number];
  /** Initial zoom level */
  zoom?: number;
  /** Show 3D terrain */
  terrain3D?: boolean;
  /** Map height class */
  className?: string;
  /** Callback when map is ready */
  onMapReady?: (map: maplibregl.Map) => void;
}

export function HikeMap({
  trace,
  center = [2.3488, 46.6034], // Center of France
  zoom = 5.5,
  terrain3D = true,
  className,
  onMapReady,
}: HikeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapKey>('osm');
  const [showBasemapPicker, setShowBasemapPicker] = useState(false);
  const [is3DEnabled, setIs3DEnabled] = useState(terrain3D);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ─── Initialize Map ──────────────────────────────────────────

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAPS[currentBasemap].style as any,
      center,
      zoom,
      pitch: is3DEnabled ? 45 : 0,
      bearing: 0,
      antialias: true,
      attributionControl: false,
    });

    // Add controls
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 200 }), 'bottom-left');
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    mapRef.current = map;

    map.on('load', () => {
      // Add terrain if 3D is enabled
      if (is3DEnabled) {
        addTerrain(map);
      }

      // Add trace if provided
      if (trace) {
        addTrace(map, trace);
      }

      onMapReady?.(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Add 3D Terrain ──────────────────────────────────────────

  const addTerrain = useCallback((map: maplibregl.Map) => {
    if (!map.getSource('terrain-source')) {
      map.addSource('terrain-source', {
        type: 'raster-dem',
        tiles: [
          'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15,
      });

      map.setTerrain({ source: 'terrain-source', exaggeration: 1.3 });

      // Sky layer for realism
      map.addLayer({
        id: 'sky',
        type: 'sky' as any,
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0, 0],
          'sky-atmosphere-sun-intensity': 15,
        } as any,
      });
    }
  }, []);

  // ─── Add GPX Trace ───────────────────────────────────────────

  const addTrace = useCallback(
    (map: maplibregl.Map, traceData: GeoJSONTrace) => {
      const sourceId = 'hike-trace';

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(
          traceData as any
        );
        return;
      }

      map.addSource(sourceId, {
        type: 'geojson',
        data: traceData as any,
      });

      // Outer glow
      map.addLayer({
        id: 'trace-glow',
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#22c55e',
          'line-width': 8,
          'line-blur': 4,
          'line-opacity': 0.3,
        },
      });

      // Main line
      map.addLayer({
        id: 'trace-line',
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#16a34a',
          'line-width': 3,
          'line-opacity': 0.9,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Fit bounds to trace
      const coords = traceData.geometry.coordinates;
      if (coords.length > 0) {
        const bounds = coords.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new maplibregl.LngLatBounds(
            coords[0] as [number, number],
            coords[0] as [number, number]
          )
        );
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
      }
    },
    []
  );

  // ─── Switch Basemap ──────────────────────────────────────────

  const switchBasemap = useCallback((key: BasemapKey) => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(BASEMAPS[key].style as any);
    setCurrentBasemap(key);
    setShowBasemapPicker(false);

    map.once('style.load', () => {
      if (is3DEnabled) addTerrain(map);
      if (trace) addTrace(map, trace);
    });
  }, [is3DEnabled, trace, addTerrain, addTrace]);

  // ─── Toggle 3D ───────────────────────────────────────────────

  const toggle3D = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (is3DEnabled) {
      map.setTerrain(null);
      map.easeTo({ pitch: 0 });
    } else {
      addTerrain(map);
      map.easeTo({ pitch: 45 });
    }
    setIs3DEnabled(!is3DEnabled);
  }, [is3DEnabled, addTerrain]);

  // ─── Geolocate ───────────────────────────────────────────────

  const geolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 13,
          duration: 2000,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  // ─── Fullscreen ──────────────────────────────────────────────

  const toggleFullscreen = useCallback(() => {
    if (!mapContainer.current) return;
    if (!document.fullscreenElement) {
      mapContainer.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div className={cn('relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden', className)}>
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Custom controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* Basemap picker */}
        <div className="relative">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-md bg-card/90 backdrop-blur-sm hover:bg-card"
            onClick={() => setShowBasemapPicker(!showBasemapPicker)}
          >
            <Layers className="w-4 h-4 mr-1.5" />
            {BASEMAPS[currentBasemap].label}
          </Button>

          {showBasemapPicker && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
              {(Object.keys(BASEMAPS) as BasemapKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => switchBasemap(key)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2',
                    key === currentBasemap && 'bg-primary/10 text-primary font-medium'
                  )}
                >
                  <span>{BASEMAPS[key].icon}</span>
                  {BASEMAPS[key].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3D toggle */}
        <Button
          size="sm"
          variant="secondary"
          className={cn(
            'shadow-md bg-card/90 backdrop-blur-sm hover:bg-card',
            is3DEnabled && 'ring-2 ring-primary'
          )}
          onClick={toggle3D}
        >
          <Mountain className="w-4 h-4 mr-1.5" />
          3D
        </Button>
      </div>

      {/* Bottom-right controls */}
      <div className="absolute bottom-3 right-3 z-10 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="shadow-md bg-card/90 backdrop-blur-sm hover:bg-card w-8 h-8"
          onClick={geolocate}
        >
          <LocateFixed className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="shadow-md bg-card/90 backdrop-blur-sm hover:bg-card w-8 h-8"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
