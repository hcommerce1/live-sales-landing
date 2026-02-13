'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Preset data
const presetData = {
  sources: [
    { id: 'orders', name: 'Zamówienia', description: 'Eksportuj dane zamówień z BaseLinker' },
    { id: 'products', name: 'Produkty', description: 'Eksportuj listę produktów i stanów magazynowych' },
    { id: 'invoices', name: 'Faktury', description: 'Eksportuj dokumenty sprzedaży' },
  ],
  fields: [
    { name: 'order_id', label: 'ID zamówienia' },
    { name: 'sku', label: 'SKU produktu' },
    { name: 'product_name', label: 'Nazwa produktu' },
    { name: 'quantity', label: 'Ilość' },
    { name: 'total_price', label: 'Wartość zamówienia' },
    { name: 'order_status', label: 'Status' },
  ],
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
  exportName: 'Dzienny raport sprzedaży',
  frequencies: [
    { value: '1min', label: '1 min' },
    { value: '5min', label: '5 min' },
    { value: '15min', label: '15 min' },
    { value: '1h', label: '1 godz.' },
    { value: '24h', label: '24 godz.' },
  ],
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
  spreadsheetData: {
    headers: ['A', 'B', 'C', 'D', 'E', 'F'],
    columns: ['ID zamówienia', 'SKU', 'Nazwa produktu', 'Ilość', 'Wartość', 'Status'],
    rows: [
      ['#12847', 'SKU-001', 'Koszulka Premium', '2', '149,00 zł', 'Wysłane'],
      ['#12848', 'SKU-002', 'Bluza Oversize', '1', '289,00 zł', 'W realizacji'],
      ['#12849', 'SKU-003', 'Spodnie Cargo', '3', '357,00 zł', 'Wysłane'],
      ['#12850', 'SKU-001', 'Koszulka Premium', '1', '74,50 zł', 'Nowe'],
      ['#12851', 'SKU-004', 'Czapka Basic', '2', '78,00 zł', 'Wysłane'],
      ['#12852', 'SKU-002', 'Bluza Oversize', '1', '289,00 zł', 'Wysłane'],
    ],
  },
};

const steps = [
  { id: 1, label: 'Dane' },
  { id: 2, label: 'Arkusz' },
  { id: 3, label: 'Zapisz' },
  { id: 4, label: 'Podgląd' },
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

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-20">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
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
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </>
      )}
    </svg>
  );
}

// Checkmark icon
function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// Visibility observer hook for 80% threshold
function useVisibilityObserver(threshold: number = 0.8) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= threshold);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0] }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Google Sheets visualization component
function GoogleSheetsView({
  animate,
  visibleRows
}: {
  animate: boolean;
  visibleRows: number;
}) {
  const { spreadsheetData } = presetData;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Google Sheets Header Bar */}
      <div className="bg-[#1a73e8] px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2z"/>
          </svg>
          <span className="text-white text-sm font-medium">Dzienny raport sprzedaży</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-white/70 text-xs">Ostatnia synchronizacja: teraz</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#f1f3f4] px-3 py-1.5 border-b border-gray-200 flex items-center gap-2">
        <div className="flex items-center gap-1 text-gray-600">
          <span className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded text-gray-500">Arial</span>
          <span className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded text-gray-500">10</span>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[500px]">
          {/* Column Headers (A, B, C, D, E, F) */}
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="w-8 border-r border-b border-gray-200 text-gray-400 font-normal py-1.5"></th>
              {spreadsheetData.headers.map((header) => (
                <th
                  key={header}
                  className="min-w-[80px] border-r border-b border-gray-200 text-gray-400 font-normal py-1.5 text-center"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Column Names */}
            <tr className="bg-blue-50">
              <td className="border-r border-b border-gray-200 text-gray-400 text-center py-2 bg-[#f8f9fa] text-xs">1</td>
              {spreadsheetData.columns.map((col, i) => (
                <td
                  key={i}
                  className="border-r border-b border-gray-200 px-2 py-2 font-semibold text-gray-700 text-xs"
                >
                  {col}
                </td>
              ))}
            </tr>

            {/* Data Rows */}
            {spreadsheetData.rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: animate && rowIndex < visibleRows ? 1 : 0.3,
                  backgroundColor: rowIndex < visibleRows && animate ?
                    (rowIndex === visibleRows - 1 ? '#e8f0fe' : '#ffffff') : '#ffffff'
                }}
                transition={{ duration: 0.3 }}
                className="transition-colors"
              >
                <td className="border-r border-b border-gray-200 text-gray-400 text-center py-2 bg-[#f8f9fa] text-xs">
                  {rowIndex + 2}
                </td>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-r border-b border-gray-200 px-2 py-2 text-gray-600 text-xs"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: animate && rowIndex < visibleRows ? 1 : 0
                      }}
                      transition={{
                        duration: 0.15,
                        delay: cellIndex * 0.05
                      }}
                    >
                      {cell}
                    </motion.span>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="bg-[#f8f9fa] px-3 py-1.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>Arkusz 1</span>
        <span className="font-medium">{visibleRows} / {spreadsheetData.rows.length} wierszy</span>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Visibility observer for 80% threshold
  const { ref: containerRef, isVisible } = useVisibilityObserver(0.8);

  // Step 1 states
  const [selectedSource, setSelectedSource] = useState(-1);
  const [visibleFields, setVisibleFields] = useState<number[]>([]);

  // Step 2 states
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showVerified, setShowVerified] = useState(false);

  // Step 3 states
  const [showNameInput, setShowNameInput] = useState(false);
  const [showFrequency, setShowFrequency] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState(-1);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Step 4 states - Google Sheets
  const [showGoogleSheets, setShowGoogleSheets] = useState(false);
  const [visibleSheetRows, setVisibleSheetRows] = useState(0);

  // Animation tracking refs
  const animationStartRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);
  const completedStepsRef = useRef<Set<string>>(new Set());

  // Typewriter texts
  const urlText = useTypewriter(presetData.sheetUrl, 30, showUrlInput);
  const nameText = useTypewriter(presetData.exportName, 50, showNameInput);

  const resetAnimation = useCallback(() => {
    setCurrentStep(1);
    setIsFinished(false);
    setSelectedSource(-1);
    setVisibleFields([]);
    setShowUrlInput(false);
    setShowVerified(false);
    setShowNameInput(false);
    setShowFrequency(false);
    setSelectedFrequency(-1);
    setShowSaveButton(false);
    setShowGoogleSheets(false);
    setVisibleSheetRows(0);

    // Reset animation tracking
    animationStartRef.current = null;
    pausedAtRef.current = 0;
    completedStepsRef.current.clear();

    setAnimationKey((k) => k + 1);
  }, []);

  // Animation timeline definition
  const animationTimeline = useCallback(() => [
    { id: 'selectSource', delay: 800, action: () => setSelectedSource(0) },
    { id: 'field0', delay: 1500, action: () => setVisibleFields(prev => [...prev, 0]) },
    { id: 'field1', delay: 1850, action: () => setVisibleFields(prev => [...prev, 1]) },
    { id: 'field2', delay: 2200, action: () => setVisibleFields(prev => [...prev, 2]) },
    { id: 'field3', delay: 2550, action: () => setVisibleFields(prev => [...prev, 3]) },
    { id: 'field4', delay: 2900, action: () => setVisibleFields(prev => [...prev, 4]) },
    { id: 'field5', delay: 3250, action: () => setVisibleFields(prev => [...prev, 5]) },
    { id: 'goToStep2', delay: 4200, action: () => { setCurrentStep(2); setShowUrlInput(true); } },
    { id: 'showVerified', delay: 7000, action: () => setShowVerified(true) },
    { id: 'goToStep3', delay: 8000, action: () => { setCurrentStep(3); setShowNameInput(true); } },
    { id: 'showFrequency', delay: 10000, action: () => setShowFrequency(true) },
    { id: 'selectFrequency', delay: 10500, action: () => setSelectedFrequency(2) },
    { id: 'showSaveButton', delay: 11500, action: () => setShowSaveButton(true) },
    { id: 'goToStep4', delay: 12500, action: () => { setCurrentStep(4); setShowGoogleSheets(true); } },
    { id: 'row1', delay: 13000, action: () => setVisibleSheetRows(1) },
    { id: 'row2', delay: 13500, action: () => setVisibleSheetRows(2) },
    { id: 'row3', delay: 14000, action: () => setVisibleSheetRows(3) },
    { id: 'row4', delay: 14500, action: () => setVisibleSheetRows(4) },
    { id: 'row5', delay: 15000, action: () => setVisibleSheetRows(5) },
    { id: 'row6', delay: 15500, action: () => setVisibleSheetRows(6) },
    { id: 'finished', delay: 17000, action: () => setIsFinished(true) },
  ], []);

  // Animation sequence with visibility-based control
  useEffect(() => {
    // Handle reduced motion preference
    if (shouldReduceMotion) {
      setSelectedSource(0);
      setVisibleFields([0, 1, 2, 3, 4, 5]);
      setShowUrlInput(true);
      setShowVerified(true);
      setShowNameInput(true);
      setShowFrequency(true);
      setSelectedFrequency(2);
      setShowSaveButton(true);
      setShowGoogleSheets(true);
      setVisibleSheetRows(6);
      setCurrentStep(4);
      setIsFinished(true);
      return;
    }

    // Don't run animation if not visible (80% threshold)
    if (!isVisible) {
      // Save current elapsed time when pausing
      if (animationStartRef.current !== null) {
        pausedAtRef.current = performance.now() - animationStartRef.current;
      }
      return;
    }

    // Start or resume animation
    const now = performance.now();

    if (animationStartRef.current === null) {
      // First start
      animationStartRef.current = now;
    } else {
      // Resume - adjust start time to account for paused duration
      animationStartRef.current = now - pausedAtRef.current;
    }

    const timers: NodeJS.Timeout[] = [];
    const timeline = animationTimeline();

    timeline.forEach((step) => {
      // Skip already completed steps
      if (completedStepsRef.current.has(step.id)) {
        return;
      }

      const elapsed = now - animationStartRef.current!;
      const remainingDelay = Math.max(0, step.delay - elapsed);

      const timer = setTimeout(() => {
        step.action();
        completedStepsRef.current.add(step.id);
      }, remainingDelay);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [shouldReduceMotion, animationKey, isVisible, animationTimeline]);

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.3,
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
            className="text-eyebrow"
          >
            Zobacz jak to działa
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.05 }}
            className="heading-responsive-section mt-3"
          >
            Konfiguracja w 3 prostych krokach
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="text-section-subtitle mt-4"
          >
            Wybierz dane, podaj arkusz, ustaw harmonogram — gotowe
          </motion.p>
        </div>

        {/* Demo container */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
          className="relative"
        >
          {/* App frame */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header bar */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">LS</span>
                  </div>
                  <span className="font-semibold text-gray-900 hidden sm:block">Nowy eksport</span>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <button
                        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          currentStep > step.id
                            ? 'bg-green-100 text-green-700'
                            : currentStep === step.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            currentStep > step.id
                              ? 'bg-green-500 text-white'
                              : currentStep === step.id
                              ? 'bg-white border-2 border-blue-500 text-blue-600'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {currentStep > step.id ? <CheckIcon className="w-3 h-3" /> : step.id}
                        </span>
                        <span className="hidden sm:inline">{step.label}</span>
                      </button>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-4 sm:w-8 h-0.5 mx-1 ${
                            currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="p-4 sm:p-6 min-h-[420px] bg-gray-50">
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
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Wybierz typ danych</h3>
                      <div className="space-y-2">
                        {presetData.sources.map((source, index) => (
                          <motion.label
                            key={source.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedSource === index
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            animate={selectedSource === index ? { scale: [1, 1.01, 1] } : {}}
                          >
                            <div
                              className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedSource === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                              }`}
                            >
                              {selectedSource === index && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 text-sm">{source.name}</span>
                              <p className="text-xs text-gray-500 mt-0.5">{source.description}</p>
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Pola do eksportu</h3>
                      <div className="space-y-1">
                        {presetData.fields.map((field, index) => (
                          <motion.label
                            key={field.name}
                            initial={{ opacity: 0.4 }}
                            animate={visibleFields.includes(index) ? { opacity: 1 } : { opacity: 0.4 }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <motion.div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                visibleFields.includes(index)
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300 bg-white'
                              }`}
                              animate={visibleFields.includes(index) ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.2 }}
                            >
                              {visibleFields.includes(index) && <CheckIcon className="w-3 h-3 text-white" />}
                            </motion.div>
                            <div>
                              <span className="text-sm text-gray-700">{field.label}</span>
                              <span className="text-xs text-gray-400 ml-2 font-mono">{field.name}</span>
                            </div>
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
                    className="max-w-2xl mx-auto"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Arkusz docelowy</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Wklej link do arkusza Google Sheets, do którego będą eksportowane dane.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">URL arkusza</label>
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              value={urlText}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                              placeholder="https://docs.google.com/spreadsheets/d/..."
                            />
                            {showUrlInput && !showVerified && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-400 animate-pulse" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {showVerified && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                            >
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                <CheckIcon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-green-800 text-sm">Arkusz zweryfikowany</p>
                                <p className="text-xs text-green-600">Masz uprawnienia do zapisu</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-xs text-blue-800">
                            <span className="font-medium">Konto serwisowe: </span>
                            <span className="font-mono">livesales@...iam.gserviceaccount.com</span>
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Udostępnij arkusz temu kontu z uprawnieniami edytora
                          </p>
                        </div>
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
                    className="max-w-2xl mx-auto"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Ustawienia eksportu</h3>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Nazwa eksportu</label>
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              value={nameText}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                              placeholder="np. Dzienny raport sprzedaży"
                            />
                            {showNameInput && !showFrequency && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-400 animate-pulse" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {showFrequency && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                              <label className="block text-xs font-medium text-gray-700 mb-2">Częstotliwość</label>
                              <div className="flex flex-wrap gap-2">
                                {presetData.frequencies.map((freq, index) => (
                                  <motion.button
                                    key={freq.value}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                                      selectedFrequency === index
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                                    animate={selectedFrequency === index ? { scale: [1, 1.05, 1] } : {}}
                                  >
                                    {freq.label}
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {showSaveButton && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="pt-4 border-t border-gray-100"
                            >
                              <motion.button
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                              >
                                <CheckIcon className="w-4 h-4" />
                                Zapisz eksport
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Google Sheets Data Export */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="space-y-4">
                      {/* Success message */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">Eksport uruchomiony!</p>
                          <p className="text-sm text-green-600">
                            Dane są zapisywane do arkusza Google Sheets...
                          </p>
                        </div>
                      </motion.div>

                      {/* Google Sheets visualization */}
                      <GoogleSheetsView
                        animate={showGoogleSheets}
                        visibleRows={visibleSheetRows}
                      />

                      {/* Progress indicator */}
                      {!isFinished && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center justify-center gap-2 text-sm text-gray-500"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                          <span>Synchronizacja w toku... {visibleSheetRows}/{presetData.spreadsheetData.rows.length} wierszy</span>
                        </motion.div>
                      )}

                      {/* Completion message */}
                      {isFinished && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2 text-sm text-green-600"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Synchronizacja zakończona!</span>
                        </motion.div>
                      )}
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
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                              />
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

            {/* Footer bar - navigation */}
            {currentStep < 4 && (
              <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
                    Anuluj
                  </button>
                  <div className="flex items-center gap-3">
                    {currentStep > 1 && (
                      <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                        Wstecz
                      </button>
                    )}
                    <button className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      {currentStep === 3 ? 'Zapisz' : 'Dalej'}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            href="#kontakt"
            className="inline-flex items-center gap-2 bg-gradient-brand text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
          >
            Skontaktuj się z nami
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
