
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  {
    name: "Jan",
    total: 8,
  },
  {
    name: "Fev",
    total: 10,
  },
  {
    name: "Mar",
    total: 12,
  },
  {
    name: "Abr",
    total: 9,
  },
  {
    name: "Mai",
    total: 11,
  },
  {
    name: "Jun",
    total: 15,
  },
  {
    name: "Jul",
    total: 13,
  },
  {
    name: "Ago",
    total: 16,
  },
  {
    name: "Set",
    total: 14,
  },
  {
    name: "Out",
    total: 18,
  },
  {
    name: "Nov",
    total: 16,
  },
  {
    name: "Dez",
    total: 19,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          cursor={false}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value) => [`${value} conteúdos`, 'Total']}
          labelFormatter={(label) => `${label}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
