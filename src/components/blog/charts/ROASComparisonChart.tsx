import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ROASData {
  category: string;
  cac: number;
  ltv: number;
  ratio: number;
}

export function ROASComparisonChart({ data }: { data: ROASData[] }) {
  return (
    <div className="my-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">CAC vs LTV według branży</h4>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Wartość (PLN)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value: number, name: string) => {
              if (name === 'ratio') return [value.toFixed(1) + 'x', 'LTV/CAC Ratio'];
              return [value + ' PLN', name === 'cac' ? 'CAC' : 'LTV'];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              if (value === 'cac') return 'CAC (Customer Acquisition Cost)';
              if (value === 'ltv') return 'LTV (Lifetime Value)';
              return 'LTV/CAC Ratio';
            }}
          />
          <Bar dataKey="cac" fill="#ef4444" radius={[8, 8, 0, 0]} />
          <Bar dataKey="ltv" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Ratios display */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {data.map((item) => (
          <div key={item.category} className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-600">{item.category}</div>
            <div className={`text-lg font-bold ${item.ratio >= 4 ? 'text-green-600' : item.ratio >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
              {item.ratio.toFixed(1)}x
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
