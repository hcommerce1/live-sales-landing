import { useState } from 'react';
import { motion } from 'framer-motion';

export function MetricsCalculator() {
  const [revenue, setRevenue] = useState(100000);
  const [orders, setOrders] = useState(500);
  const [visitors, setVisitors] = useState(10000);
  const [marketingCost, setMarketingCost] = useState(15000);
  const [cogs, setCogs] = useState(60000);

  // Obliczenia
  const aov = revenue / orders;
  const cr = (orders / visitors) * 100;
  const rpv = revenue / visitors;
  const newCustomers = Math.round(orders * 0.7); // Załóżmy 70% to nowi klienci
  const cac = marketingCost / newCustomers;
  const grossProfit = revenue - cogs;
  const grossMargin = (grossProfit / revenue) * 100;
  const roas = revenue / marketingCost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200"
    >
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        🧮 Interaktywny Kalkulator Metryk
      </h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-3 text-gray-700">Twoje dane:</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Przychód (PLN/miesiąc)
            </label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Liczba zamówień
            </label>
            <input
              type="number"
              value={orders}
              onChange={(e) => setOrders(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Odwiedzin (visitors)
            </label>
            <input
              type="number"
              value={visitors}
              onChange={(e) => setVisitors(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Koszt marketingu (PLN)
            </label>
            <input
              type="number"
              value={marketingCost}
              onChange={(e) => setMarketingCost(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COGS - koszt towaru (PLN)
            </label>
            <input
              type="number"
              value={cogs}
              onChange={(e) => setCogs(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg mb-3 text-gray-700">Twoje metryki:</h4>

          <MetricCard
            label="AOV (Average Order Value)"
            value={`${aov.toFixed(2)} PLN`}
            status={aov > 200 ? 'good' : 'warning'}
          />

          <MetricCard
            label="Conversion Rate"
            value={`${cr.toFixed(2)}%`}
            status={cr > 2.5 ? 'good' : cr > 1.5 ? 'warning' : 'bad'}
          />

          <MetricCard
            label="RPV (Revenue Per Visitor)"
            value={`${rpv.toFixed(2)} PLN`}
            status={rpv > 10 ? 'good' : 'warning'}
          />

          <MetricCard
            label="CAC (Customer Acquisition Cost)"
            value={`${cac.toFixed(2)} PLN`}
            status={cac < 100 ? 'good' : cac < 150 ? 'warning' : 'bad'}
          />

          <MetricCard
            label="Gross Margin"
            value={`${grossMargin.toFixed(1)}%`}
            status={grossMargin > 40 ? 'good' : grossMargin > 25 ? 'warning' : 'bad'}
          />

          <MetricCard
            label="ROAS (Return on Ad Spend)"
            value={`${roas.toFixed(1)}x`}
            status={roas > 4 ? 'good' : roas > 2.5 ? 'warning' : 'bad'}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Podsumowanie:</span> {' '}
          {roas > 4 && grossMargin > 40 && cr > 2.5 ? (
            <span className="text-green-600">✅ Świetne wyniki! Twój sklep działa bardzo dobrze.</span>
          ) : roas > 2.5 && grossMargin > 25 ? (
            <span className="text-yellow-600">⚠️ Dobre wyniki, ale jest miejsce na poprawę.</span>
          ) : (
            <span className="text-red-600">🔴 Uwaga! Niektóre metryki wymagają optymalizacji.</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, status }: { label: string; value: string; status: 'good' | 'warning' | 'bad' }) {
  const colors = {
    good: 'bg-green-100 border-green-300 text-green-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    bad: 'bg-red-100 border-red-300 text-red-800'
  };

  const icons = {
    good: '✅',
    warning: '⚠️',
    bad: '🔴'
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[status]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs">{icons[status]}</span>
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
