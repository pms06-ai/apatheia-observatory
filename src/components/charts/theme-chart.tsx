'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ThemeChartProps {
  data: { name: string; count: number }[];
}

const COLORS = [
  '#d8b46f', '#b87d52', '#b56c5d', '#8f9aa3', '#c2cad0',
  '#59626d', '#5b8a9a', '#90b08e', '#ca7b6a', '#d4a017',
];

export function ThemeChart({ data }: ThemeChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.slice(0, 10)}
          layout="vertical"
          margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 11, fill: '#b9b1a5' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#242424',
              border: '1px solid rgba(188,176,155,0.2)',
              borderRadius: 6,
              fontSize: 12,
              color: '#f4efe4',
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.slice(0, 10).map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
