'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Preset data
const presetData = {
  sources: [
    { name: 'Zamówienia', icon: '📦', selected: false },
    { name: 'Produkty', icon: '🏷️', selected: false },
    { name: 'Faktury', icon: '📄', selected: false },
  ],
  fields: [
    'SKU',
    'Nazwa produktu',
    'Wartość zamówienia',
    'Status',
    'Data utworzenia',
  ],
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1aBcD...',
  exportName: 'Dzienny raport sprzedaży',
  frequency: 'Codziennie o 8:00',
  kpis: {
    orders: 1247,
    revenue: 89450,
    avgCart: 71.69,
    items: 3891,
  },
  topProducts: [
    { name: 'Koszulka Premium', sales: 342, revenue: '12,450 zł' },
    { name: 'Bluza Oversize', sales: 289, revenue: '11,560 zł' },
    { name: 'Spodnie Cargo', sales: 201, revenue: '8,040 zł' },
  ],
  chartData: [20, 35, 45, 30, 55, 70, 65, 80, 75, 90, 85, 95],
};

const steps = [
  { id: 1, label: 'Dane' },
  { id: 2, label: 'Arkusz' },
  { id: 3, label: 'Zapisz' },
  { id: 4, label: 'Dashboard' },
];

// Typewriter hook
function useTypewriter(text: string, speed: number = 50, start: boolean = false) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!start) {
      setDisplayText('');
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, start]);

  return displayText;
}

// Counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress >= 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration, start]);

  return count;
}

// Mini chart component
function MiniChart({ data, animate }: { data: number[]; animate: boolean }) {
  const max = Math.max(...data);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (v / max) * 80,
  }));

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-24">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {animate && (
        <>
          <motion.path
            d={`${pathD} L 100 100 L 0 100 Z`}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d={pathD}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </>
      )}
    </svg>
  );
}

export default function DashboardPreview() {
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Step 1 states
  const [selectedSource, setSelectedSource] = useState(-1);
  const [visibleFields, setVisibleFields] = useState<number[]>([]);

  // Step 2 states
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showVerified, setShowVerified] = useState(false);

  // Step 3 states
  const [showNameInput, setShowNameInput] = useState(false);
  const [showFrequency, setShowFrequency] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Step 4 states
  const [showDashboard, setShowDashboard] = useState(false);

  // Typewriter texts
  const urlText = useTypewriter(presetData.sheetUrl, 40, showUrlInput);
  const nameText = useTypewriter(presetData.exportName, 60, showNameInput);

  // Counter values
  const ordersCount = useCounter(presetData.kpis.orders, 2000, showDashboard);
  const revenueCount = useCounter(presetData.kpis.revenue, 2000, showDashboard);
  const avgCartCount = useCounter(Math.floor(presetData.kpis.avgCart * 100), 2000, showDashboard);

  const resetAnimation = useCallback(() => {
    setCurrentStep(1);
    setIsFinished(false);
    setSelectedSource(-1);
    setVisibleFields([]);
    setShowUrlInput(false);
    setShowVerified(false);
    setShowNameInput(false);
    setShowFrequency(false);
    setShowSaveButton(false);
    setShowDashboard(false);
    setAnimationKey(k => k + 1);
  }, []);

  // Animation sequence
  useEffect(() => {
    if (shouldReduceMotion) {
      // Skip animations for reduced motion
      setSelectedSource(0);
      setVisibleFields([0, 1, 2, 3, 4]);
      setShowUrlInput(true);
      setShowVerified(true);
      setShowNameInput(true);
      setShowFrequency(true);
      setShowSaveButton(true);
      setShowDashboard(true);
      setCurrentStep(4);
      setIsFinished(true);
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    // Step 1: Select source and fields
    timers.push(setTimeout(() => setSelectedSource(0), 800));
    presetData.fields.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisibleFields(prev => [...prev, i]);
      }, 1500 + i * 400));
    });

    // Step 2: Sheet URL
    timers.push(setTimeout(() => {
      setCurrentStep(2);
      setShowUrlInput(true);
    }, 4000));
    timers.push(setTimeout(() => setShowVerified(true), 6500));

    // Step 3: Save
    timers.push(setTimeout(() => {
      setCurrentStep(3);
      setShowNameInput(true);
    }, 7500));
    timers.push(setTimeout(() => setShowFrequency(true), 9500));
    timers.push(setTimeout(() => setShowSaveButton(true), 10500));

    // Step 4: Dashboard
    timers.push(setTimeout(() => {
      setCurrentStep(4);
      setShowDashboard(true);
    }, 11500));
    timers.push(setTimeout(() => setIsFinished(true), 15000));

    return () => timers.forEach(clearTimeout);
  }, [shouldReduceMotion, animationKey]);

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.4,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <section id="edytor" className="py-24 bg-gray-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={transition}
            className="text-primary-600 font-semibold text-sm uppercase tracking-wider"
          >
            Zobacz jak to działa
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.05 }}
            className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Od danych do dashboardu w 3 krokach
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="mt-4 text-lg text-gray-600"
          >
            Wybierasz dane, podajesz arkusz, zapisujesz — i gotowe
          </motion.p>
        </div>

        {/* Demo container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
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

          {/* Content area */}
          <div className="bg-white rounded-b-xl shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 ${
                      currentStep >= step.id ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        currentStep > step.id
                          ? 'bg-primary-600 text-white'
                          : currentStep === step.id
                          ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-600'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > step.id ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className="hidden sm:block text-sm font-medium">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-12 lg:w-24 h-0.5 mx-2 transition-colors ${
                        currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* Step 1: Select data */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    {/* Sources */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                        </svg>
                        Wybierz źródło danych
                      </h3>
                      <div className="space-y-2">
                        {presetData.sources.map((source, index) => (
                          <motion.div
                            key={source.name}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedSource === index
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                            animate={selectedSource === index ? { scale: [1, 1.02, 1] } : {}}
                          >
                            <span className="text-2xl">{source.icon}</span>
                            <span className="font-medium text-gray-900">{source.name}</span>
                            {selectedSource === index && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                              >
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Fields */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Pola do eksportu
                      </h3>
                      <div className="space-y-2">
                        {presetData.fields.map((field, index) => (
                          <motion.label
                            key={field}
                            initial={{ opacity: 0, x: 10 }}
                            animate={visibleFields.includes(index) ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 cursor-pointer"
                          >
                            <motion.div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                visibleFields.includes(index)
                                  ? 'border-primary-600 bg-primary-600'
                                  : 'border-gray-300'
                              }`}
                              animate={visibleFields.includes(index) ? { scale: [1, 1.2, 1] } : {}}
                            >
                              {visibleFields.includes(index) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </motion.div>
                            <span className="text-gray-700">{field}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Sheet config */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-xl mx-auto"
                  >
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Podaj URL arkusza Google Sheets
                    </h3>

                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={urlText}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-mono text-sm focus:outline-none"
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                        {showUrlInput && !showVerified && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-400 animate-pulse" />
                        )}
                      </div>

                      <AnimatePresence>
                        {showVerified && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
                          >
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-green-800">Arkusz zweryfikowany</p>
                              <p className="text-sm text-green-600">Uprawnienia poprawne</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Konto serwisowe:</strong> livesales@livesales.iam.gserviceaccount.com
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Udostępnij arkusz temu kontu z uprawnieniami edytora
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Save */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-xl mx-auto"
                  >
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Zapisz eksport
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nazwa eksportu
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={nameText}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:outline-none"
                            placeholder="np. Dzienny raport sprzedaży"
                          />
                          {showNameInput && !showFrequency && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-400 animate-pulse" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {showFrequency && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Częstotliwość
                            </label>
                            <div className="px-4 py-3 rounded-xl border-2 border-primary-500 bg-primary-50 text-gray-700 flex items-center justify-between">
                              <span>{presetData.frequency}</span>
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {showSaveButton && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full mt-4 bg-gradient-brand text-white py-4 rounded-xl font-semibold text-lg"
                          >
                            <motion.span
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="flex items-center justify-center gap-2"
                            >
                              Zapisz eksport
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </motion.span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Dashboard */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
                      >
                        <p className="text-sm text-blue-100">Zamówienia</p>
                        <p className="text-2xl font-bold">{ordersCount.toLocaleString('pl-PL')}</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white"
                      >
                        <p className="text-sm text-green-100">Sprzedaż</p>
                        <p className="text-2xl font-bold">{revenueCount.toLocaleString('pl-PL')} zł</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
                      >
                        <p className="text-sm text-purple-100">Średni koszyk</p>
                        <p className="text-2xl font-bold">{(avgCartCount / 100).toFixed(2)} zł</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white"
                      >
                        <p className="text-sm text-orange-100">Sprzedane szt.</p>
                        <p className="text-2xl font-bold">{Math.floor(ordersCount * 3.12).toLocaleString('pl-PL')}</p>
                      </motion.div>
                    </div>

                    {/* Chart and Table */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-900 mb-3">Sprzedaż w czasie</h4>
                        <MiniChart data={presetData.chartData} animate={showDashboard} />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-900 mb-3">Top produkty</h4>
                        <div className="space-y-2">
                          {presetData.topProducts.map((product, index) => (
                            <motion.div
                              key={product.name}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className="flex items-center justify-between p-2 bg-white rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                <span className="text-sm text-gray-700">{product.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{product.revenue}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Restart button */}
                    <AnimatePresence>
                      {isFinished && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 text-center"
                        >
                          <button
                            onClick={resetAnimation}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Obejrzyj ponownie
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Decorative gradient blur */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl -z-10" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="text-center mt-12"
        >
          <a
            href="https://live-sales-2gwm.onrender.com/register"
            className="inline-flex items-center gap-2 bg-gradient-brand text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
          >
            Stwórz swój pierwszy eksport
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
