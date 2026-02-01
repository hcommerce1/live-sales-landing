'use client';

import { motion, useReducedMotion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const tiers = [
  {
    name: 'Free / Trial',
    description: 'Na start',
    features: [
      'Podstawowe dashboardy',
      'Do 3 integracji',
      'Eksport CSV',
      'Wsparcie email',
    ],
    cta: 'Zacznij za darmo',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Dla rosnących zespołów',
    features: [
      'Zaawansowane dashboardy',
      'Nielimitowane integracje',
      'Alerty real-time',
      'Automatyzacje',
      'Priorytetowe wsparcie',
    ],
    cta: 'Wybierz Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Rozwiązania dedykowane',
    features: [
      'Wszystko z Pro',
      'Dedykowana infrastruktura',
      'SLA i wsparcie 24/7',
      'Custom integracje',
      'Onboarding i szkolenia',
    ],
    cta: 'Skontaktuj się',
    highlighted: false,
  },
];

export default function Pricing() {
  const shouldReduceMotion = useReducedMotion();

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.4,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <section id="cennik" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={transition}
            className="text-primary-600 font-semibold text-sm uppercase tracking-wider"
          >
            Cennik
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.05 }}
            className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Prosty i przejrzysty
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="mt-4 text-lg text-gray-600"
          >
            Wybierz plan dopasowany do Twoich potrzeb
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : index * 0.05 }}
              className={`relative rounded-2xl p-8 ${
                tier.highlighted
                  ? 'bg-gradient-brand text-white shadow-2xl shadow-primary-500/30 md:scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-primary-600 text-sm font-bold px-4 py-1 rounded-full shadow">
                  Najpopularniejszy
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {tier.name}
                </h3>
                <p className={tier.highlighted ? 'text-white/80' : 'text-gray-500'}>
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${tier.highlighted ? 'text-white' : 'text-primary-600'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className={tier.highlighted ? 'text-white/90' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#kontakt"
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-white text-primary-600 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          className="text-center text-gray-500 mt-12"
        >
          Szczegółowe ceny i warunki przedstawimy po kontakcie — dopasujemy ofertę do Twoich potrzeb.
        </motion.p>
      </div>
    </section>
  );
}
