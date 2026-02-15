import { useState } from 'react';

export function AutomationSavingsCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [hourlyCost, setHourlyCost] = useState(80);
  const [dataSources, setDataSources] = useState(4);
  const [automationCostMonthly, setAutomationCostMonthly] = useState(500);

  const monthlyHoursSaved = hoursPerWeek * 4.33;
  const annualHoursSaved = hoursPerWeek * 52;
  const monthlySavings = monthlyHoursSaved * hourlyCost;
  const annualSavings = annualHoursSaved * hourlyCost;
  const annualAutomationCost = automationCostMonthly * 12;
  const roi = ((annualSavings - annualAutomationCost) / annualAutomationCost) * 100;
  const paybackDays = Math.ceil((automationCostMonthly / monthlySavings) * 30);

  const complexityMultiplier = dataSources > 5 ? 1.4 : dataSources > 3 ? 1.2 : 1.0;
  const errorReductionPercent = Math.min(95, 60 + dataSources * 5);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Kalkulator oszczędności z automatyzacji
      </h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-3 text-gray-700">Twoja sytuacja:</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Godziny na ręczne raporty (tygodniowo)
            </label>
            <input
              type="range"
              min={1}
              max={40}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="text-right text-sm font-semibold text-purple-700">{hoursPerWeek}h / tydzień</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Koszt godziny pracy (PLN)
            </label>
            <input
              type="number"
              min={20}
              max={500}
              value={hourlyCost}
              onChange={(e) => setHourlyCost(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Liczba źródeł danych (platformy, narzędzia)
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={dataSources}
              onChange={(e) => setDataSources(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="text-right text-sm font-semibold text-purple-700">{dataSources} źródeł</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Koszt narzędzia do automatyzacji (PLN/miesiąc)
            </label>
            <input
              type="number"
              min={0}
              max={10000}
              value={automationCostMonthly}
              onChange={(e) => setAutomationCostMonthly(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-lg mb-3 text-gray-700">Twoje oszczędności:</h4>

          <div className="p-3 rounded-lg border bg-green-100 border-green-300 text-green-800">
            <div className="text-sm font-medium">Zaoszczędzony czas (miesięcznie)</div>
            <div className="text-2xl font-bold mt-1">{monthlyHoursSaved.toFixed(0)}h</div>
          </div>

          <div className="p-3 rounded-lg border bg-green-100 border-green-300 text-green-800">
            <div className="text-sm font-medium">Oszczędność finansowa (rocznie)</div>
            <div className="text-2xl font-bold mt-1">{annualSavings.toLocaleString('pl-PL')} PLN</div>
          </div>

          <div className={`p-3 rounded-lg border ${roi > 200 ? 'bg-green-100 border-green-300 text-green-800' : roi > 50 ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
            <div className="text-sm font-medium">ROI automatyzacji</div>
            <div className="text-2xl font-bold mt-1">{roi.toFixed(0)}%</div>
          </div>

          <div className="p-3 rounded-lg border bg-blue-100 border-blue-300 text-blue-800">
            <div className="text-sm font-medium">Zwrot inwestycji po</div>
            <div className="text-2xl font-bold mt-1">{paybackDays} dni</div>
          </div>

          <div className="p-3 rounded-lg border bg-purple-100 border-purple-300 text-purple-800">
            <div className="text-sm font-medium">Redukcja błędów ludzkich</div>
            <div className="text-2xl font-bold mt-1">~{errorReductionPercent}%</div>
          </div>

          <div className="p-3 rounded-lg border bg-orange-100 border-orange-300 text-orange-800">
            <div className="text-sm font-medium">Złożoność integracji</div>
            <div className="text-2xl font-bold mt-1">{complexityMultiplier === 1.0 ? 'Niska' : complexityMultiplier === 1.2 ? 'Średnia' : 'Wysoka'}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Podsumowanie:</span>{' '}
          {roi > 200 ? (
            <span className="text-green-600 font-medium">Automatyzacja zwróci się błyskawicznie! Oszczędzisz {annualHoursSaved}h rocznie i {annualSavings.toLocaleString('pl-PL')} PLN.</span>
          ) : roi > 50 ? (
            <span className="text-yellow-600 font-medium">Dobra inwestycja. Zwrot w ciągu {paybackDays} dni. Warto zacząć od kluczowych procesów.</span>
          ) : (
            <span className="text-red-600 font-medium">Rozważ tańsze rozwiązanie lub zoptymalizuj zakres automatyzacji.</span>
          )}
        </p>
      </div>
    </div>
  );
}
