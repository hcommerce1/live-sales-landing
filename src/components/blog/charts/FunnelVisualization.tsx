import { motion } from 'framer-motion';

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  metric?: string;
}

export function FunnelVisualization({ stages, rpv }: { stages: FunnelStage[]; rpv: number }) {
  const maxValue = Math.max(...stages.map(s => s.value));

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <h4 className="text-lg font-semibold mb-6 text-gray-800">Lejek konwersji (Funnel)</h4>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100;
          const isRevenue = stage.metric === 'PLN';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative"
            >
              {/* Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                className={`h-16 rounded-lg flex items-center px-4 ${
                  isRevenue
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : index === 0
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                }`}
                style={{ minWidth: '20%' }}
              >
                <div className="flex items-center justify-between w-full text-white">
                  <div>
                    <div className="font-semibold text-sm">{stage.name}</div>
                    <div className="text-xs opacity-90">
                      {stage.percentage.toFixed(1)}% {index === 0 ? 'start' : 'z poprzedniego'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {stage.value.toLocaleString('pl-PL')} {stage.metric || ''}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Connector arrow */}
              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="text-gray-400 text-2xl">↓</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* RPV highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: stages.length * 0.1 + 0.5 }}
        className="mt-6 p-4 bg-white rounded-lg border-2 border-yellow-400"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Revenue Per Visitor (RPV)</div>
            <div className="text-xs text-gray-500 mt-1">
              Każdy odwiedzający = średnio {rpv.toFixed(2)} PLN przychodu
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{rpv.toFixed(2)} PLN</div>
        </div>
      </motion.div>
    </div>
  );
}
