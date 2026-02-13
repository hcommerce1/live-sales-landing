'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'Marża liczona do grosza',
    description: 'Prawdziwa rentowność każdego produktu i zamówienia',
    items: [
      'Koszty Allegro Ads per produkt',
      'Prowizje, wysyłka, zwroty',
      'Marża per SKU i aukcja',
      'Porównanie kanałów',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-green-600',
    highlight: true,
  },
  {
    title: 'Produkty słabo rotujące',
    description: 'Znajdź to, co zalega i obciąża magazyn',
    items: [
      'Ranking najsłabszej sprzedaży',
      'Dni bez transakcji',
      'Wartość zamrożonego stocku',
      'Rekomendacje promocji',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
      </svg>
    ),
    gradient: 'from-orange-500 to-red-500',
    highlight: false,
  },
  {
    title: 'Braki w bestsellerach',
    description: 'Alert gdy kończy się stock na topowych produktach',
    items: [
      'Top sprzedaży vs dostępność',
      'Przewidywanie braków',
      'Alert przed wyczerpaniem',
      'Utracona sprzedaż (estymacja)',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    gradient: 'from-yellow-500 to-amber-500',
    highlight: false,
  },
  {
    title: 'Nagłe zmiany',
    description: 'Wykrywaj anomalie w wolumenie i marży',
    items: [
      'Skoki i spadki sprzedaży',
      'Zmiany marży powyżej progu',
      'Porównanie do poprzedniego okresu',
      'Alerty na Telegram/Slack',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-600',
    highlight: false,
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

export default function Features() {
  return (
    <section id="funkcje" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-eyebrow"
          >
            Gdzie patrzeć
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-responsive-section mt-3"
          >
            4 miejsca, które decydują o zysku
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-section-subtitle mt-4"
          >
            To tutaj tracisz lub zarabiasz pieniądze. My to monitorujemy za Ciebie.
          </motion.p>
        </div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`group bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 ${
                feature.highlight ? 'border-primary-200 ring-2 ring-primary-100' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>

                <div className="flex-1">
                  {/* Content */}
                  <h3 className="card-title mb-2">
                    {feature.title}
                    {feature.highlight && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                        Kluczowe
                      </span>
                    )}
                  </h3>
                  <p className="card-description mb-4">
                    {feature.description}
                  </p>

                  {/* Items */}
                  <ul className="grid grid-cols-2 gap-2">
                    {feature.items.map((item) => (
                      <li key={item} className="list-item flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
