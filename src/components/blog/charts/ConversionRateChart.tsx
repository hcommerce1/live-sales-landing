import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ConversionRateData {
  segment: string;
  rate: number;
  benchmark: 'low' | 'medium' | 'good' | 'excellent';
}

export function ConversionRateChart({ data }: { data: ConversionRateData[] }) {
  const colors = {
    low: '#ef4444',
    medium: '#f59e0b',
    good: '#10b981',
    excellent: '#059669'
  };

  return (
    <div className="my-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">Benchmark Conversion Rate (2026)</h4>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="segment"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value: number) => [`${value}%`, 'CR']}
          />
          <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.benchmark]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.low }}></div>
          <span className="text-gray-600">Niski</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.medium }}></div>
          <span className="text-gray-600">Średni</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.good }}></div>
          <span className="text-gray-600">Dobry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.excellent }}></div>
          <span className="text-gray-600">Świetny</span>
        </div>
      </div>
    </div>
  );
}
