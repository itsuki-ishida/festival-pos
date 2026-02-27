'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type SalesChartProps = {
  data: {
    hour: number;
    sales: number;
    orders: number;
  }[];
};

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: `${item.hour}時`,
  }));

  if (data.every((d) => d.sales === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `¥${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value) => [`¥${Number(value).toLocaleString()}`, '売上']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
