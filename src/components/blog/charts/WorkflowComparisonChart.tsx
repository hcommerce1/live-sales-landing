import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { task: 'Analiza faktur (50 szt)', manual: 240, ai: 15 },
  { task: 'Scrapowanie konkurencji', manual: 480, ai: 30 },
  { task: 'Hurtowa edycja zdjęć (200)', manual: 360, ai: 20 },
  { task: 'Tworzenie ofert BaseLinker', manual: 180, ai: 10 },
  { task: 'Raport z BigQuery', manual: 120, ai: 5 },
  { task: 'Import CSV do marketplace', manual: 90, ai: 5 },
];

const totalManual = data.reduce((sum, d) => sum + d.manual, 0);
const totalAi = data.reduce((sum, d) => sum + d.ai, 0);
const savingsPercent = Math.round((1 - totalAi / totalManual) * 100);

function formatMinutes(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${min} min`;
}

export function WorkflowComparisonChart() {
  return (
    <div className="my-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h4 className="text-lg font-semibold mb-2 text-gray-800">
        Czas na typowe zadania e-commerce: ręcznie vs z AI
      </h4>
      <p className="text-sm text-gray-500 mb-4">Porównanie w minutach — realne scenariusze</p>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Minuty', position: 'insideBottomRight', offset: -5, fill: '#6b7280' }}
          />
          <YAxis
            type="category"
            dataKey="task"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={180}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value: number, name: string) => [
              formatMinutes(value),
              name === 'manual' ? 'Ręcznie' : 'Z AI'
            ]}
          />
          <Legend
            formatter={(value: string) => value === 'manual' ? 'Ręcznie' : 'Z AI (Claude Code)'}
          />
          <Bar dataKey="manual" fill="#ef4444" radius={[0, 8, 8, 0]} name="manual" />
          <Bar dataKey="ai" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="ai" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs text-red-600 font-medium">Ręcznie</div>
          <div className="text-lg font-bold text-red-700">{formatMinutes(totalManual)}</div>
        </div>
        <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
          <div className="text-xs text-violet-600 font-medium">Z AI</div>
          <div className="text-lg font-bold text-violet-700">{formatMinutes(totalAi)}</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs text-green-600 font-medium">Oszczędność</div>
          <div className="text-lg font-bold text-green-700">{savingsPercent}%</div>
        </div>
      </div>
    </div>
  );
}
