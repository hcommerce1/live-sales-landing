'use client';

import { motion } from 'framer-motion';

const companies = [
  { name: 'Baselinker', logo: '/images/baselinker.png' },
  { name: 'APILO', logo: '/images/apilo.webp' },
  { name: 'SellAssist', logo: '/images/sellassist.jpg' },
  { name: 'TradeWatch', logo: '/images/tradewatch.jfif' },
  { name: 'Allegro', logo: '/images/allegro.png' },
];

export default function TrustedBy() {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 mb-8"
        >
          Integrujemy się z platformami, z których korzystasz
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16"
        >
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center justify-center"
            >
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                />
              ) : (
                <span className="text-xl md:text-2xl font-bold text-gray-300 hover:text-gray-500 transition-colors">
                  {company.name}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
