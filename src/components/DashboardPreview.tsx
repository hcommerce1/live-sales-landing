'use client';

import { motion } from 'framer-motion';

// Mock data for charts
const salesData = [
  { month: 'Sty', value: 4200 },
  { month: 'Lut', value: 3800 },
  { month: 'Mar', value: 5100 },
  { month: 'Kwi', value: 4600 },
  { month: 'Maj', value: 5800 },
  { month: 'Cze', value: 6200 },
  { month: 'Lip', value: 7100 },
];

const maxValue = Math.max(...salesData.map((d) => d.value));

const kpiCards = [
  { label: 'Sprzedaż dziś', value: '24 580 zł', change: '+12.5%', positive: true },
  { label: 'Zamówienia', value: '156', change: '+8.2%', positive: true },
  { label: 'Średnia wartość', value: '157,56 zł', change: '-2.1%', positive: false },
  { label: 'Konwersja', value: '3.42%', change: '+0.8%', positive: true },
];

const recentOrders = [
  { id: '#12847', customer: 'Jan K.', amount: '459,00 zł', status: 'Wysłane', platform: 'Allegro' },
  { id: '#12846', customer: 'Anna M.', amount: '127,50 zł', status: 'W realizacji', platform: 'Baselinker' },
  { id: '#12845', customer: 'Piotr W.', amount: '892,00 zł', status: 'Opłacone', platform: 'Allegro' },
  { id: '#12844', customer: 'Marta S.', amount: '234,00 zł', status: 'Wysłane', platform: 'APILO' },
];

export default function DashboardPreview() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-600 font-semibold text-sm uppercase tracking-wider"
          >
            Podgląd aplikacji
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Wszystkie dane w jednym miejscu
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600"
          >
            Tak wygląda Twój panel po podłączeniu źródeł danych
          </motion.p>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Browser frame */}
          <div className="bg-gray-800 rounded-t-xl px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 ml-4">
              <div className="bg-gray-700 rounded-md px-4 py-1.5 text-sm text-gray-300 max-w-md">
                app.livesales.pl/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="bg-gray-100 rounded-b-xl p-4 md:p-6 shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">LS</span>
                </div>
                <span className="font-semibold text-gray-900">LiveSales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              {kpiCards.map((kpi, index) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900">{kpi.value}</p>
                  <p className={`text-xs font-medium ${kpi.positive ? 'text-green-600' : 'text-red-500'}`}>
                    {kpi.change} vs wczoraj
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Main chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Sprzedaż</h3>
                  <div className="flex gap-2">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">7 dni</span>
                    <span className="text-xs text-gray-400 px-2 py-1">30 dni</span>
                  </div>
                </div>
                {/* Bar chart */}
                <div className="flex items-end justify-between gap-2 h-40">
                  {salesData.map((data, index) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(data.value / maxValue) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md min-h-[8px]"
                      />
                      <span className="text-xs text-gray-500">{data.month}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pie chart placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Źródła sprzedaży</h3>
                <div className="flex items-center justify-center h-32">
                  {/* Simple donut chart */}
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="45 100" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#4f46e5" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-45" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-75" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                    <span className="text-gray-600">Allegro</span>
                    <span className="ml-auto font-medium">45%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-accent-600" />
                    <span className="text-gray-600">Baselinker</span>
                    <span className="ml-auto font-medium">30%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">APILO</span>
                    <span className="ml-auto font-medium">25%</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent orders table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-4 shadow-sm overflow-hidden"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Ostatnie zamówienia</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">ID</th>
                      <th className="pb-2 font-medium">Klient</th>
                      <th className="pb-2 font-medium">Kwota</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Źródło</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 font-medium text-gray-900">{order.id}</td>
                        <td className="py-2 text-gray-600">{order.customer}</td>
                        <td className="py-2 text-gray-900">{order.amount}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'Wysłane' ? 'bg-green-100 text-green-700' :
                            order.status === 'Opłacone' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">{order.platform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Decorative gradient blur */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl -z-10" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="https://live-sales-2gwm.onrender.com/register"
            className="inline-flex items-center gap-2 bg-gradient-brand text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
          >
            Wypróbuj za darmo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
