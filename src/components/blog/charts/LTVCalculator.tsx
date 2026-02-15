import { useState } from 'react';
import { motion } from 'framer-motion';

export function LTVCalculator() {
  const [aov, setAov] = useState(200);
  const [purchasesPerYear, setPurchasesPerYear] = useState(3);
  const [customerLifeYears, setCustomerLifeYears] = useState(2);
  const [grossMargin, setGrossMargin] = useState(40);

  const ltv = aov * purchasesPerYear * customerLifeYears;
  const ltvProfit = ltv * (grossMargin / 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="my-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
    >
      <h4 className="text-xl font-bold mb-4 text-gray-800">💰 Kalkulator LTV</h4>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AOV (Średnia wartość zamówienia)
            </label>
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">
              Ile średnio wydaje klient podczas jednego zakupu. Oblicz jako: całkowity przychód ÷ liczba zamówień. Przykład: 100,000 PLN ÷ 500 zamówień = 200 PLN AOV.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="50"
                max="50000"
                step="100"
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-semibold text-purple-700 w-24 text-right">{aov.toLocaleString()} PLN</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zakupy/rok (Purchase Frequency)
            </label>
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">
              Ile razy w ciągu roku klient wraca i robi zakupy. E-commerce: ~2-4x/rok. Subskrypcje: 12x/rok (co miesiąc). Food delivery: 24-52x/rok. B2B: 1-6x/rok.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={purchasesPerYear}
                onChange={(e) => setPurchasesPerYear(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-semibold text-purple-700 w-24 text-right">{purchasesPerYear}x</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lata życia klienta (Customer Lifespan)
            </label>
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">
              Jak długo (w latach) klient pozostaje aktywny i kupuje od Ciebie, zanim odejdzie do konkurencji lub przestanie kupować. E-commerce: 1.5-3 lata. SaaS: 2-5 lat. Retail: 3-7 lat.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={customerLifeYears}
                onChange={(e) => setCustomerLifeYears(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-semibold text-purple-700 w-20 text-right">{customerLifeYears} lat</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marża brutto (Gross Margin %)
            </label>
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">
              Jaki procent z każdej sprzedaży zostaje jako zysk (po odjęciu kosztu towaru/produkcji, ale przed kosztami operacyjnymi). Oblicz: (Przychód - Koszt towaru) ÷ Przychód × 100%. E-commerce: 30-50%. SaaS: 70-90%.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={grossMargin}
                onChange={(e) => setGrossMargin(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-semibold text-purple-700 w-20 text-right">{grossMargin}%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center space-y-4">
          <div className="p-6 bg-white rounded-xl border border-purple-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Lifetime Value (Revenue)</div>
            <div className="text-4xl font-bold text-purple-700">{ltv.toLocaleString('pl-PL', {maximumFractionDigits: 0})} PLN</div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-purple-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">LTV (Profit)</div>
            <div className="text-3xl font-bold text-green-600">{ltvProfit.toLocaleString('pl-PL', {maximumFractionDigits: 0})} PLN</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg text-sm">
            <div className="font-semibold text-blue-800 mb-2">Maksymalny CAC (przy LTV/CAC = 3):</div>
            <div className="text-2xl font-bold text-blue-600">{(ltvProfit / 3).toLocaleString('pl-PL', {maximumFractionDigits: 0})} PLN</div>
            <div className="text-xs text-gray-600 mt-1">
              Możesz wydać do {(ltvProfit / 3).toLocaleString('pl-PL', {maximumFractionDigits: 0})} PLN na pozyskanie klienta
            </div>
          </div>
        </div>
      </div>

      {/* Formula display */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-sm">
        <div className="font-mono text-gray-700">
          LTV = {aov.toLocaleString('pl-PL')} PLN (AOV) × {purchasesPerYear} (zakupy/rok) × {customerLifeYears} (lata) = <span className="font-bold text-purple-700">{ltv.toLocaleString('pl-PL', {maximumFractionDigits: 0})} PLN</span>
        </div>
      </div>
    </motion.div>
  );
}
