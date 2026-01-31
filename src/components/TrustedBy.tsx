'use client';

import { motion } from 'framer-motion';

const partners = [
  {
    name: 'Baselinker',
    logo: '/images/baselinker.png',
    description: 'Synchronizacja zamówień i produktów',
  },
  {
    name: 'Allegro',
    logo: '/images/allegro.png',
    description: 'Dane sprzedażowe i koszty Ads',
  },
  {
    name: 'APILO',
    logo: '/images/apilo.webp',
    description: 'Import danych o wysyłkach',
  },
  {
    name: 'SellAssist',
    logo: '/images/sellassist.jpg',
    description: 'Integracja z systemem sprzedaży',
  },
  {
    name: 'TradeWatch',
    logo: '/images/tradewatch.jfif',
    description: 'Monitoring cen konkurencji',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function TrustedBy() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-600 font-semibold text-sm uppercase tracking-wider"
          >
            Integracje
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Łączymy się z Twoimi narzędziami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600"
          >
            Pobieramy dane bezpośrednio z platform, z których już korzystasz
          </motion.p>
        </div>

        {/* Partners grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              className="group bg-gray-50 hover:bg-white rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary-100"
            >
              <div className="w-full h-16 flex items-center justify-center mb-4">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-14 max-w-full object-contain grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{partner.name}</h3>
              <p className="text-sm text-gray-500">{partner.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* More integrations coming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500">
            Więcej integracji w drodze —{' '}
            <a href="#kontakt" className="text-primary-600 hover:text-primary-700 font-medium">
              powiedz nam czego potrzebujesz
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
