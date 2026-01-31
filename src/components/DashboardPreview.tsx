'use client';

import { motion } from 'framer-motion';

// Źródła danych
const dataSources = [
  { name: 'Baselinker', status: 'connected', icon: '📦' },
  { name: 'Allegro Ads', status: 'connected', icon: '📊' },
  { name: 'TradeWatch', status: 'pending', icon: '👁️' },
];

// Dostępne kolumny do eksportu
const availableColumns = [
  { name: 'SKU', selected: true },
  { name: 'Nazwa produktu', selected: true },
  { name: 'Sprzedaż (szt)', selected: true },
  { name: 'Przychód', selected: true },
  { name: 'Koszt Ads', selected: true },
  { name: 'Marża %', selected: true },
  { name: 'Stock', selected: false },
  { name: 'Kategoria', selected: false },
];

// Miejsca docelowe eksportu
const exportDestinations = [
  { name: 'Google Sheets', enabled: true, schedule: 'Codziennie o 8:00' },
  { name: 'Email', enabled: true, schedule: 'Poniedziałek, Piątek' },
  { name: 'Webhook', enabled: false, schedule: 'Wyłączone' },
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
            Edytor eksportu
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Wybierz dane, ustaw cel — resztę robimy my
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600"
          >
            Konfigurujesz raz, dane lecą automatycznie do Sheets lub na maila
          </motion.p>
        </div>

        {/* Editor mockup */}
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
                app.livesales.pl/eksport/nowy
              </div>
            </div>
          </div>

          {/* Editor content */}
          <div className="bg-gray-100 rounded-b-xl p-4 md:p-6 shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">LS</span>
                </div>
                <span className="font-semibold text-gray-900">Nowy eksport</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                  Anuluj
                </button>
                <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg font-medium">
                  Zapisz eksport
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Sources panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                  Źródła danych
                </h3>
                <div className="space-y-2">
                  {dataSources.map((source) => (
                    <div
                      key={source.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{source.icon}</span>
                        <span className="font-medium text-gray-900">{source.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        source.status === 'connected'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {source.status === 'connected' ? 'Połączono' : 'Oczekuje'}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  + Dodaj źródło
                </button>
              </motion.div>

              {/* Columns panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                  </svg>
                  Kolumny do eksportu
                </h3>
                <div className="space-y-1">
                  {availableColumns.map((col) => (
                    <label
                      key={col.name}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={col.selected}
                        readOnly
                        className="w-4 h-4 text-primary-600 rounded border-gray-300"
                      />
                      <span className={`text-sm ${col.selected ? 'text-gray-900' : 'text-gray-500'}`}>
                        {col.name}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Export destinations panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Gdzie wysyłać
                </h3>
                <div className="space-y-3">
                  {exportDestinations.map((dest) => (
                    <div
                      key={dest.name}
                      className={`p-3 rounded-lg border-2 ${
                        dest.enabled
                          ? 'border-primary-200 bg-primary-50/50'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${dest.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                          {dest.name}
                        </span>
                        <div className={`w-8 h-5 rounded-full relative ${dest.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${dest.enabled ? 'right-0.5' : 'left-0.5'}`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{dest.schedule}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Flow visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-4 bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  2 źródła aktywne
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">
                  6 kolumn
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg">
                  <span className="w-2 h-2 bg-primary-500 rounded-full" />
                  2 cele aktywne
                </div>
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
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="https://live-sales-2gwm.onrender.com/register"
            className="inline-flex items-center gap-2 bg-gradient-brand text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
          >
            Stwórz pierwszy eksport
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
