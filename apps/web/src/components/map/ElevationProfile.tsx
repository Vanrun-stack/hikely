'use client';

/**
 * ElevationProfile — Interactive elevation chart using Recharts.
 * Displays altitude over distance from GPX data.
 */
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Mountain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ElevationPoint {
  distance: number; // km
  elevation: number; // m
}

interface ElevationProfileProps {
  data: ElevationPoint[];
  totalDistance?: number;
  elevationGain?: number;
  elevationLoss?: number;
  altitudeMin?: number;
  altitudeMax?: number;
  className?: string;
  /** Callback when hovering on the chart — send index to highlight on map */
  onHover?: (index: number | null) => void;
}

export function ElevationProfile({
  data,
  totalDistance,
  elevationGain,
  elevationLoss,
  altitudeMin,
  altitudeMax,
  className,
  onHover,
}: ElevationProfileProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const elevations = data.map((p) => p.elevation);
    const min = altitudeMin ?? Math.min(...elevations);
    const max = altitudeMax ?? Math.max(...elevations);
    const dist = totalDistance ?? data[data.length - 1].distance;

    let gain = 0;
    let loss = 0;
    for (let i = 1; i < data.length; i++) {
      const diff = data[i].elevation - data[i - 1].elevation;
      if (diff > 0) gain += diff;
      else loss += Math.abs(diff);
    }

    return {
      min,
      max,
      distance: dist,
      gain: elevationGain ?? Math.round(gain),
      loss: elevationLoss ?? Math.round(loss),
    };
  }, [data, totalDistance, elevationGain, elevationLoss, altitudeMin, altitudeMax]);

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Aucune donnée d&apos;élévation disponible
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Mountain className="w-4 h-4 text-primary" />
          Profil altimétrique
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-emerald-500">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">+{stats.gain} m</span>
              </div>
              <span className="text-xs text-muted-foreground">D+</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-red-500">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">-{stats.loss} m</span>
              </div>
              <span className="text-xs text-muted-foreground">D-</span>
            </div>
            <div>
              <div className="text-sm font-semibold">
                {stats.min} — {stats.max} m
              </div>
              <span className="text-xs text-muted-foreground">Altitude</span>
            </div>
          </div>
        )}

        {/* Chart */}
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={data}
            onMouseMove={(e: any) => {
              if (e?.activeTooltipIndex !== undefined) {
                onHover?.(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => onHover?.(null)}
          >
            <defs>
              <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="distance"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v.toFixed(1)}`}
              className="text-muted-foreground"
              label={{ value: 'km', position: 'insideBottomRight', offset: -5, style: { fontSize: 10 } }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
              className="text-muted-foreground"
              width={45}
              label={{ value: 'm', position: 'insideTopLeft', offset: -5, style: { fontSize: 10 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${Math.round(value)} m`, 'Altitude']}
              labelFormatter={(label) => `${Number(label).toFixed(2)} km`}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fill="url(#elevGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
