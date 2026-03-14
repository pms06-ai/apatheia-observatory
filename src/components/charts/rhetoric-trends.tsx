'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendBucket {
  month: string;
  evidenceCount: number;
  statementCount: number;
}

export function RhetoricTrendsChart({ data }: { data: TrendBucket[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-charcoal-800)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--color-text-faint)', fontSize: 10 }}
            tickFormatter={(v: string) => {
              const [, m] = v.split('-');
              const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return months[parseInt(m)] || v;
            }}
          />
          <YAxis tick={{ fill: 'var(--color-text-faint)', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-line)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={(v) => String(v)}
          />
          <Area
            type="monotone"
            dataKey="evidenceCount"
            name="Evidence"
            stroke="var(--color-gold)"
            fill="var(--color-gold)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="statementCount"
            name="Statements"
            stroke="var(--color-steel)"
            fill="var(--color-steel)"
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
