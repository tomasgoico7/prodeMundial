'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import type { GroupStats } from '@/lib/types';

// Paleta futbolera: celeste, dorado (sol de mayo), césped...
const COLORS = ['#0ea5e9', '#f5a623', '#16a34a', '#ef4444', '#1d4ed8', '#db2777'];

export function ChampionChart({
  distribution,
}: {
  distribution: GroupStats['championDistribution'];
}) {
  if (!distribution.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nadie eligió campeón todavía.
      </p>
    );
  }

  const data = distribution.slice(0, 6).map((d) => ({
    name: d.team.name,
    votes: d.votes,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 8, bottom: 8 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          interval={0}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
