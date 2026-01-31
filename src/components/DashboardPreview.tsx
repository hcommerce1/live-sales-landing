'use client';

import { motion } from 'framer-motion';

// Mock data - problemy do rozwiązania
const alerts = [
  { type: 'warning', message: 'Bluza Nike Air - brak stocku, 47 sprzedaży/tydzień', category: 'Braki' },
  { type: 'danger', message: 'Koszulka Adidas - marża spadła do 3.2% (Ads +340%)', category: 'Marża' },
  { type: 'info', message: 'Buty New Balance - wzrost sprzedaży +127% w 7 dni', category: 'Trend' },
];

// Mock data - produkty z problemami
const problemProducts = [
  {
    name: 'Koszulka Adidas Originals',
    sku: 'ADI-001',
    sales: '234 szt',
    revenue: '23 400 zł',
    margin: '3.2%',
    marginStatus: 'danger',
    issue: 'Allegro Ads zjada marżę',
    adsCost: '890 zł',
  },
  {
    name: 'Bluza Nike Air Max',
    sku: 'NIK-042',
    sales: '47 szt',
    revenue: '14 100 zł',
    margin: '18.4%',
    marginStatus: 'success',
    issue: 'Brak stocku od 2 dni',
    adsCost: '120 zł',
  },
  {
    name: 'Spodnie Puma Essential',
    sku: 'PUM-019',
    sales: '3 szt',
    revenue: '450 zł',
    margin: '12.1%',
    marginStatus: 'warning',
    issue: 'Słaba rotacja (89 dni bez zmian)',
    adsCost: '45 zł',
  },
];

// Mock data - kategorie
const categories = [
  { name: 'Koszulki', products: 142, margin: '14.2%', trend: 'up', issues: 3 },
  { name: 'Bluzy', products: 89, margin: '19.8%', trend: 'down', issues: 7 },
  { name: 'Buty', products: 234, margin: '11.3%', trend: 'up', issues: 2 },
  { name: 'Akcesoria', products: 67, margin: '24.1%', trend: 'stable', issues: 0 },
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
            Widzisz co jest nie tak, nie tylko co się zmieniło
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600"
          >
            Kontrola na poziomie produktu, aukcji i kategorii — z kosztami Allegro Ads w marży
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
                app.livesales.pl/problemy
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
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Ostatnia aktualizacja:</span>
                <span className="text-gray-900 font-medium">2 min temu</span>
              </div>
            </div>

            {/* Alerts bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 mb-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="font-semibold text-gray-900">3 problemy wymagają uwagi</span>
              </div>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 text-sm p-2 rounded-lg ${
                      alert.type === 'danger' ? 'bg-red-50 text-red-700' :
                      alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      alert.type === 'danger' ? 'bg-red-100' :
                      alert.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {alert.category}
                    </span>
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Products with problems */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Produkty z problemami</h3>
                  <span className="text-xs text-gray-500">Marża z Allegro Ads</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium">Produkt</th>
                        <th className="pb-2 font-medium">Sprzedaż</th>
                        <th className="pb-2 font-medium">Ads</th>
                        <th className="pb-2 font-medium">Marża</th>
                        <th className="pb-2 font-medium">Problem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problemProducts.map((product) => (
                        <tr key={product.sku} className="border-b border-gray-50 last:border-0">
                          <td className="py-3">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-400">{product.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 text-gray-600">{product.sales}</td>
                          <td className="py-3 text-gray-600">{product.adsCost}</td>
                          <td className="py-3">
                            <span className={`font-semibold ${
                              product.marginStatus === 'danger' ? 'text-red-600' :
                              product.marginStatus === 'warning' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {product.margin}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.marginStatus === 'danger' ? 'bg-red-100 text-red-700' :
                              product.marginStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {product.issue}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Categories overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Kategorie</h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.products} produktów</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-900">{cat.margin}</span>
                          {cat.trend === 'up' && (
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          )}
                          {cat.trend === 'down' && (
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          )}
                        </div>
                        {cat.issues > 0 && (
                          <p className="text-xs text-red-500">{cat.issues} problemów</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
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
          transition={{ delay: 0.6 }}
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
