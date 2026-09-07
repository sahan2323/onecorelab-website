"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ROYAL = "#2563EB";
const NEUTRAL = "#9ca3af";

export function TrafficChart({ data }: { data: { date: string; views: number }[] }) {
  if (data.length === 0) {
    return <EmptyState label="No traffic recorded yet." />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis dataKey="date" fontSize={11} stroke="currentColor" strokeOpacity={0.4} />
        <YAxis fontSize={11} stroke="currentColor" strokeOpacity={0.4} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Line type="monotone" dataKey="views" stroke={ROYAL} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: { month: string; revenue: number; expenses: number }[] }) {
  if (data.length === 0) {
    return <EmptyState label="No financial records yet." />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis dataKey="month" fontSize={11} stroke="currentColor" strokeOpacity={0.4} />
        <YAxis fontSize={11} stroke="currentColor" strokeOpacity={0.4} />
        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="revenue" fill={ROYAL} radius={[4, 4, 0, 0]} name="Revenue" />
        <Bar dataKey="expenses" fill={NEUTRAL} radius={[4, 4, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart({ data }: { data: { category: string; count: number }[] }) {
  if (data.length === 0) {
    return <EmptyState label="No project categories yet." />;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis type="number" fontSize={11} stroke="currentColor" strokeOpacity={0.4} allowDecimals={false} />
        <YAxis type="category" dataKey="category" fontSize={11} width={140} stroke="currentColor" strokeOpacity={0.4} />
        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Bar dataKey="count" fill={ROYAL} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">{label}</div>
  );
}
