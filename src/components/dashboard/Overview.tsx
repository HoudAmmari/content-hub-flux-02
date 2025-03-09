
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface OverviewProps {
  data?: Array<{
    name: string;
    total: number;
  }>;
}

export function Overview({ data = [] }: OverviewProps) {
  // Se não houver dados fornecidos, use os dados de exemplo
  const chartData = data.length ? data : [
    { name: "Jan", total: 0 },
    { name: "Fev", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Abr", total: 0 },
    { name: "Mai", total: 0 },
    { name: "Jun", total: 0 },
    { name: "Jul", total: 0 },
    { name: "Ago", total: 0 },
    { name: "Set", total: 0 },
    { name: "Out", total: 0 },
    { name: "Nov", total: 0 },
    { name: "Dez", total: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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
