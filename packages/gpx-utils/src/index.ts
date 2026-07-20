// ─── Hikely GPX Utils ────────────────────────────────────────────────────────

export interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
}

export interface GpxWaypoint extends GpxPoint {
  name?: string;
  desc?: string;
  sym?: string;
}

export interface GpxTrack {
  name?: string;
  points: GpxPoint[];
}

export interface GpxData {
  name?: string;
  description?: string;
  creator?: string;
  tracks: GpxTrack[];
  waypoints: GpxWaypoint[];
}

export interface ElevationProfile {
  distances: number[];   // km from start
  elevations: number[];  // metres
}

export interface GpxStats {
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  altitudeMinM: number;
  altitudeMaxM: number;
  durationMin?: number;
  elevationProfile: ElevationProfile;
}

/**
 * Parse a GPX XML string and extract tracks and waypoints.
 */
export function parseGpx(xmlString: string): GpxData {
  const trackRegex = /<trkpt\s+lat="([\d.-]+)"\s+lon="([\d.-]+)"[^>]*>([\s\S]*?)<\/trkpt>/g;
  const eleRegex = /<ele>([\d.-]+)<\/ele>/;
  const timeRegex = /<time>([^<]+)<\/time>/;

  const points: GpxPoint[] = [];
  let match: RegExpExecArray | null;

  while ((match = trackRegex.exec(xmlString)) !== null) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const inner = match[3];
    const eleMatch = eleRegex.exec(inner);
    const timeMatch = timeRegex.exec(inner);
    points.push({
      lat,
      lon,
      ele: eleMatch ? parseFloat(eleMatch[1]) : undefined,
      time: timeMatch ? timeMatch[1] : undefined,
    });
  }

  const nameMatch = /<name>([^<]+)<\/name>/.exec(xmlString);
  const descMatch = /<desc>([^<]+)<\/desc>/.exec(xmlString);

  return {
    name: nameMatch ? nameMatch[1] : undefined,
    description: descMatch ? descMatch[1] : undefined,
    tracks: [{ points }],
    waypoints: [],
  };
}

/**
 * Compute distance between two GPS points using the Haversine formula (in km).
 */
function haversine(p1: GpxPoint, p2: GpxPoint): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Compute GPX statistics from parsed GPX data.
 */
export function computeGpxStats(gpx: GpxData): GpxStats {
  const points = gpx.tracks.flatMap((t) => t.points);
  if (points.length === 0) {
    return {
      distanceKm: 0,
      elevationGainM: 0,
      elevationLossM: 0,
      altitudeMinM: 0,
      altitudeMaxM: 0,
      elevationProfile: { distances: [], elevations: [] },
    };
  }

  let distanceKm = 0;
  let elevationGainM = 0;
  let elevationLossM = 0;
  const elevations = points.filter((p) => p.ele !== undefined).map((p) => p.ele as number);
  const altitudeMinM = elevations.length ? Math.min(...elevations) : 0;
  const altitudeMaxM = elevations.length ? Math.max(...elevations) : 0;

  const profileDistances: number[] = [0];
  const profileElevations: number[] = [points[0].ele ?? 0];

  for (let i = 1; i < points.length; i++) {
    const d = haversine(points[i - 1], points[i]);
    distanceKm += d;

    const prevEle = points[i - 1].ele ?? 0;
    const curEle = points[i].ele ?? 0;
    const diff = curEle - prevEle;
    if (diff > 0) elevationGainM += diff;
    else elevationLossM += Math.abs(diff);

    profileDistances.push(Math.round(distanceKm * 1000) / 1000);
    profileElevations.push(curEle);
  }

  return {
    distanceKm: Math.round(distanceKm * 1000) / 1000,
    elevationGainM: Math.round(elevationGainM),
    elevationLossM: Math.round(elevationLossM),
    altitudeMinM: Math.round(altitudeMinM),
    altitudeMaxM: Math.round(altitudeMaxM),
    elevationProfile: { distances: profileDistances, elevations: profileElevations },
  };
}

/**
 * Simplify a GPS track using the Ramer-Douglas-Peucker algorithm.
 */
export function simplifyTrack(points: GpxPoint[], tolerance = 0.0001): GpxPoint[] {
  if (points.length <= 2) return points;

  const perpendicularDistance = (point: GpxPoint, lineStart: GpxPoint, lineEnd: GpxPoint): number => {
    const dx = lineEnd.lon - lineStart.lon;
    const dy = lineEnd.lat - lineStart.lat;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return 0;
    return Math.abs(dy * point.lon - dx * point.lat + lineEnd.lon * lineStart.lat - lineEnd.lat * lineStart.lon) / mag;
  };

  let maxDist = 0;
  let maxIndex = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { maxDist = d; maxIndex = i; }
  }

  if (maxDist > tolerance) {
    const left = simplifyTrack(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyTrack(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[points.length - 1]];
}
