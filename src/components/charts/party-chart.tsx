'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PartyChartProps {
  data: { party: string; actors: number; evidence: number }[];
}

const PARTY_COLORS: Record<string, string> = {
  Democrat: '#5b8a9a',
  Republican: '#ca7b6a',
  Independent: '#8f9aa3',
  'Foreign government': '#59626d',
};

export function PartyChart({ data }: PartyChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="evidence"
            nameKey="party"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell
                key={d.party}
                fill={PARTY_COLORS[d.party] ?? '#59626d'}
                fillOpacity={0.8}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#242424',
              border: '1px solid rgba(188,176,155,0.2)',
              borderRadius: 6,
              fontSize: 12,
              color: '#f4efe4',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#b9b1a5' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
