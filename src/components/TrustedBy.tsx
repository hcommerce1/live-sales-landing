'use client';

import { motion, useReducedMotion } from 'framer-motion';

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

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function TrustedBy() {
  const shouldReduceMotion = useReducedMotion();

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.4,
    ease: [0.25, 0.1, 0.25, 1],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3 },
    },
  };

  return (
    <section id="integracje" className="py-20 bg-white bg-subtle-pattern">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={transition}
            className="text-eyebrow"
          >
            Integracje
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.05 }}
            className="heading-responsive-section mt-3"
          >
            Łączymy się z Twoimi narzędziami
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="text-section-subtitle mt-4"
          >
            Pobieramy dane bezpośrednio z platform, z których już korzystasz
          </motion.p>
        </div>

        {/* Partners grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              className="group bg-gray-50 hover:bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary-100"
            >
              <div className="w-full h-16 flex items-center justify-center mb-4">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-14 max-w-full object-contain grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
              <h3 className="feature-title mb-1">{partner.name}</h3>
              <p className="text-sm text-gray-500">{partner.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
