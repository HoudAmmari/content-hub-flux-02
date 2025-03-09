
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ContentMetricsProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function ContentMetrics({ data }: ContentMetricsProps) {
  // Se não houver dados fornecidos ou o array estiver vazio, use os dados de exemplo
  const chartData = data && data.length ? data : [
    { name: "Vídeos Curtos", value: 0, color: "#3B82F6" },
    { name: "Blog", value: 0, color: "#10B981" },
    { name: "LinkedIn", value: 0, color: "#6366F1" },
    { name: "YouTube", value: 0, color: "#F43F5E" },
  ];

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} conteúdos`, '']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
