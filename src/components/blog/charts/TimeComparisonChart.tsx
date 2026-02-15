import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { task: 'Export danych', manual: 3.0, automated: 0 },
  { task: 'Łączenie źródeł', manual: 2.5, automated: 0 },
  { task: 'Tworzenie raportów', manual: 3.0, automated: 0.1 },
  { task: 'Analiza trendów', manual: 2.0, automated: 0.3 },
  { task: 'Alerty i monitoring', manual: 1.5, automated: 0 },
];

export function TimeComparisonChart() {
  return (
    <div className="my-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h4 className="text-lg font-semibold mb-2 text-gray-800">
        Czas poświęcony na zadania analityczne (godziny/tydzień)
      </h4>
      <p className="text-sm text-gray-500 mb-4">Porównanie: praca ręczna vs automatyzacja</p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="task"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            angle={-25}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Godziny/tydzień', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value: number, name: string) => [
              `${value}h`,
              name === 'manual' ? 'Ręcznie' : 'Automatycznie'
            ]}
          />
          <Legend
            formatter={(value: string) => value === 'manual' ? 'Ręcznie' : 'Automatycznie'}
          />
          <Bar dataKey="manual" fill="#ef4444" radius={[8, 8, 0, 0]} name="manual" />
          <Bar dataKey="automated" fill="#10b981" radius={[8, 8, 0, 0]} name="automated" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-gray-500">
        Średnia oszczędność: <span className="font-semibold text-green-600">~12h tygodniowo</span> (96% redukcji czasu)
      </div>
    </div>
  );
}
