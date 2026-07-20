/**
 * GPX/KML Parser & Analyzer — Client-side GPS processing with Turf.js
 *
 * Parses GPX/KML files, smooths traces, generates elevation profiles,
 * and calculates distance/D+/D- automatically.
 */
import * as turf from '@turf/turf';

// ─── Types ───────────────────────────────────────────────────────

export interface TrackPoint {
  lat: number;
  lng: number;
  ele: number;
  time?: string;
}

export interface ParsedTrack {
  name: string;
  description?: string;
  points: TrackPoint[];
  geojson: GeoJSON.Feature<GeoJSON.LineString>;
}

export interface TrackStats {
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  altitudeMinM: number;
  altitudeMaxM: number;
  durationMin: number | null;
  elevationProfile: { distance: number; elevation: number }[];
}

// ─── GPX Parser ──────────────────────────────────────────────────

/**
 * Parse a GPX file string into track data.
 * Supports both <trk>/<trkseg>/<trkpt> and <rte>/<rtept> formats.
 */
export function parseGPX(gpxString: string): ParsedTrack {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxString, 'application/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Fichier GPX invalide');
  }

  // Get track name
  const nameEl = doc.querySelector('trk > name') ?? doc.querySelector('rte > name');
  const name = nameEl?.textContent ?? 'Trace sans nom';

  const descEl = doc.querySelector('trk > desc') ?? doc.querySelector('rte > desc');
  const description = descEl?.textContent ?? undefined;

  // Extract track points
  let pointEls = doc.querySelectorAll('trkpt');
  if (pointEls.length === 0) {
    pointEls = doc.querySelectorAll('rtept');
  }

  if (pointEls.length === 0) {
    throw new Error('Aucun point GPS trouvé dans le fichier');
  }

  const points: TrackPoint[] = Array.from(pointEls).map((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') ?? '0');
    const lng = parseFloat(pt.getAttribute('lon') ?? '0');
    const eleEl = pt.querySelector('ele');
    const timeEl = pt.querySelector('time');

    return {
      lat,
      lng,
      ele: eleEl ? parseFloat(eleEl.textContent ?? '0') : 0,
      time: timeEl?.textContent ?? undefined,
    };
  });

  const coordinates = points.map((p) => [p.lng, p.lat, p.ele]);
  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: { name, description },
  };

  return { name, description, points, geojson };
}

// ─── KML Parser ──────────────────────────────────────────────────

/**
 * Parse a KML file string into track data.
 */
export function parseKML(kmlString: string): ParsedTrack {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlString, 'application/xml');

  const nameEl = doc.querySelector('Placemark > name');
  const name = nameEl?.textContent ?? 'Trace KML';

  const coordsEl = doc.querySelector('coordinates');
  if (!coordsEl?.textContent) {
    throw new Error('Aucune coordonnée trouvée dans le fichier KML');
  }

  const points: TrackPoint[] = coordsEl.textContent
    .trim()
    .split(/\s+/)
    .filter((line) => line.includes(','))
    .map((line) => {
      const [lng, lat, ele] = line.split(',').map(Number);
      return { lat, lng, ele: ele ?? 0 };
    });

  const coordinates = points.map((p) => [p.lng, p.lat, p.ele]);
  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties: { name },
  };

  return { name, points, geojson };
}

// ─── Auto-detect & parse ─────────────────────────────────────────

export function parseTrackFile(content: string, filename: string): ParsedTrack {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'kml') return parseKML(content);
  return parseGPX(content);
}

// ─── Smooth trace ────────────────────────────────────────────────

/**
 * Smooth a GPS trace using Douglas-Peucker simplification.
 * Removes noise while preserving shape.
 * @param track - Parsed track data
 * @param tolerance - Simplification tolerance in km (default: 0.01 = 10m)
 */
export function smoothTrace(track: ParsedTrack, tolerance = 0.01): ParsedTrack {
  const simplified = turf.simplify(track.geojson, {
    tolerance,
    highQuality: true,
  });

  const newPoints: TrackPoint[] = simplified.geometry.coordinates.map(
    ([lng, lat, ele]) => ({
      lat,
      lng,
      ele: ele ?? 0,
    })
  );

  return {
    ...track,
    points: newPoints,
    geojson: simplified as GeoJSON.Feature<GeoJSON.LineString>,
  };
}

// ─── Calculate stats ─────────────────────────────────────────────

/**
 * Calculate comprehensive stats from a parsed track.
 * Uses Turf.js for precise distance calculations.
 */
export function calculateTrackStats(track: ParsedTrack): TrackStats {
  const { points, geojson } = track;

  if (points.length < 2) {
    return {
      distanceKm: 0,
      elevationGainM: 0,
      elevationLossM: 0,
      altitudeMinM: points[0]?.ele ?? 0,
      altitudeMaxM: points[0]?.ele ?? 0,
      durationMin: null,
      elevationProfile: [],
    };
  }

  // Total distance via Turf.js (geodesic)
  const distanceKm = turf.length(geojson, { units: 'kilometers' });

  // Elevation stats with smoothing (3-point moving average to reduce noise)
  const smoothedEle = points.map((p, i) => {
    if (i === 0 || i === points.length - 1) return p.ele;
    return (points[i - 1].ele + p.ele + points[i + 1].ele) / 3;
  });

  let elevationGainM = 0;
  let elevationLossM = 0;
  let altitudeMinM = smoothedEle[0];
  let altitudeMaxM = smoothedEle[0];

  // Threshold to filter GPS noise (ignore changes < 2m)
  const THRESHOLD = 2;

  for (let i = 1; i < smoothedEle.length; i++) {
    const diff = smoothedEle[i] - smoothedEle[i - 1];
    if (diff > THRESHOLD) elevationGainM += diff;
    if (diff < -THRESHOLD) elevationLossM += Math.abs(diff);
    altitudeMinM = Math.min(altitudeMinM, smoothedEle[i]);
    altitudeMaxM = Math.max(altitudeMaxM, smoothedEle[i]);
  }

  // Duration from timestamps
  let durationMin: number | null = null;
  if (points[0].time && points[points.length - 1].time) {
    const start = new Date(points[0].time!).getTime();
    const end = new Date(points[points.length - 1].time!).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      durationMin = Math.round((end - start) / 60000);
    }
  }

  // Elevation profile (sample every ~100m for performance)
  const profilePoints = Math.min(points.length, 500);
  const step = Math.max(1, Math.floor(points.length / profilePoints));
  const elevationProfile: { distance: number; elevation: number }[] = [];

  let cumulativeDistance = 0;
  elevationProfile.push({ distance: 0, elevation: Math.round(smoothedEle[0]) });

  for (let i = step; i < points.length; i += step) {
    const from = turf.point([points[i - step].lng, points[i - step].lat]);
    const to = turf.point([points[i].lng, points[i].lat]);
    cumulativeDistance += turf.distance(from, to, { units: 'kilometers' });

    elevationProfile.push({
      distance: Math.round(cumulativeDistance * 100) / 100,
      elevation: Math.round(smoothedEle[i]),
    });
  }

  // Ensure last point is included
  if (elevationProfile[elevationProfile.length - 1].distance < distanceKm * 0.98) {
    elevationProfile.push({
      distance: Math.round(distanceKm * 100) / 100,
      elevation: Math.round(smoothedEle[smoothedEle.length - 1]),
    });
  }

  return {
    distanceKm: Math.round(distanceKm * 1000) / 1000,
    elevationGainM: Math.round(elevationGainM),
    elevationLossM: Math.round(elevationLossM),
    altitudeMinM: Math.round(altitudeMinM),
    altitudeMaxM: Math.round(altitudeMaxM),
    durationMin,
    elevationProfile,
  };
}

// ─── File reader helper ──────────────────────────────────────────

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}
