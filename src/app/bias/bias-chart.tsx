'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface MediaActor {
  id: string;
  name: string;
  type: string;
  biasRating: number;
  reliabilityScore: number;
}

export function BiasScatterChart({ data }: { data: MediaActor[] }) {
  const outlets = data.filter((d) => d.type === 'outlet');
  const journalists = data.filter((d) => d.type === 'journalist');

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-charcoal-800)" />
          <XAxis
            type="number"
            dataKey="biasRating"
            domain={[-1, 1]}
            tickCount={7}
            tick={{ fill: 'var(--color-text-faint)', fontSize: 10 }}
            label={{ value: 'Political Lean', position: 'bottom', fill: 'var(--color-text-faint)', fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="reliabilityScore"
            domain={[0, 1]}
            tick={{ fill: 'var(--color-text-faint)', fontSize: 10 }}
            label={{ value: 'Reliability', angle: -90, position: 'insideLeft', fill: 'var(--color-text-faint)', fontSize: 11 }}
          />
          <ReferenceLine x={0} stroke="var(--color-charcoal-500)" strokeDasharray="3 3" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as MediaActor;
              return (
                <div className="rounded-lg border border-line bg-bg-elevated p-3 shadow-lg">
                  <p className="text-sm font-medium text-text-primary">{d.name}</p>
                  <p className="text-xs text-text-faint">
                    Bias: {d.biasRating > 0 ? '+' : ''}{d.biasRating.toFixed(2)}
                  </p>
                  <p className="text-xs text-text-faint">
                    Reliability: {Math.round(d.reliabilityScore * 100)}%
                  </p>
                </div>
              );
            }}
          />
          {outlets.length > 0 && (
            <Scatter name="Outlets" data={outlets} fill="var(--color-steel)" />
          )}
          {journalists.length > 0 && (
            <Scatter name="Journalists" data={journalists} fill="var(--color-bronze)" />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
