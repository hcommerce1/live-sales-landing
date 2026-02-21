'use client';

import { motion, useReducedMotion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const benefits = [
  {
    title: 'Python & nowoczesny stack',
    description: 'Pracujemy z Python, FastAPI, PostgreSQL i AI/ML. Kod, który ma realne znaczenie biznesowe.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: 'Realny wpływ na produkt',
    description: 'Twoja praca trafia do klientów w dniach, nie miesiącach. Widzisz efekty od razu.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Praca w pełni zdalna',
    description: 'Pracuj skąd chcesz. Liczy się wynik, nie godziny przy biurku.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: 'Mały zespół, duża odpowiedzialność',
    description: 'Bez korporacyjnej biurokracji. Każdy ma głos i wpływ na kierunek produktu.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    title: 'Rozwój i nauka',
    description: 'Budżet szkoleniowy, konferencje, czas na eksperymenty z nowymi technologiami.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: 'Stabilność i przejrzystość',
    description: 'Uczciwe warunki, B2B lub UoP, jasne oczekiwania od pierwszego dnia.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const positions = [
  {
    title: 'Backend Python Developer',
    type: 'Full-time',
    location: 'Zdalnie',
    description: 'Rozwijasz API i pipeline\'y danych. Pracujesz z dużymi zbiorami danych e-commerce, budujesz integracje z platformami sprzedażowymi i narzędzia analityczne.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    title: 'Data Engineer',
    type: 'Full-time',
    location: 'Zdalnie',
    description: 'Projektujesz i utrzymujesz pipeline\'y danych. Dbasz o jakość, niezawodność i skalowalność procesów ETL obsługujących miliony rekordów dziennie.',
    stack: ['Python', 'SQL', 'Airflow', 'dbt', 'BigQuery'],
  },
  {
    title: 'Frontend Developer',
    type: 'Część etatu',
    location: 'Zdalnie',
    description: 'Tworzysz dashboardy i interfejsy analityczne. Wizualizujesz dane w sposób czytelny i użyteczny dla klientów e-commerce.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
  },
];

export default function CareersPage() {
  const shouldReduceMotion = useReducedMotion();

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.4,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 -z-10" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.span
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={transition}
              className="text-eyebrow"
            >
              Kariera
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.05 }}
              className="heading-responsive-hero mt-3 tracking-tight"
            >
              Buduj z nami{' '}
              <span className="text-gradient-brand">przyszłość e-commerce</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="text-section-subtitle mt-6 max-w-2xl mx-auto"
            >
              Tworzymy narzędzia, które pomagają firmom podejmować lepsze decyzje
              na podstawie danych. Szukamy ludzi, którzy chcą mieć na to realny wpływ.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.15 }}
              className="mt-8"
            >
              <a
                href="#stanowiska"
                className="bg-gradient-brand text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25 inline-flex items-center gap-2"
              >
                Zobacz otwarte stanowiska
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dlaczego LiveSales */}
      <section id="dlaczego-livesales" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={transition}
              className="text-eyebrow"
            >
              Dlaczego my
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.05 }}
              className="heading-responsive-section mt-3"
            >
              Co wyróżnia pracę w LiveSales
            </motion.h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="card-title mb-2">{benefit.title}</h3>
                <p className="card-description">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Otwarte stanowiska */}
      <section id="stanowiska" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={transition}
              className="text-eyebrow"
            >
              Otwarte stanowiska
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.05 }}
              className="heading-responsive-section mt-3"
            >
              Dołącz do naszego zespołu
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="text-section-subtitle mt-4"
            >
              Szukamy ludzi z pasją do danych i automatyzacji
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {positions.map((position) => (
              <motion.div
                key={position.title}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow border border-gray-100 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge-primary text-xs">{position.type}</span>
                  <span className="badge-secondary text-xs">{position.location}</span>
                </div>

                <h3 className="card-title mb-2">{position.title}</h3>
                <p className="card-description mb-4 flex-grow">{position.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {position.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <a
                  href={`mailto:kariera@live-sales.pl?subject=Aplikacja: ${position.title}`}
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl font-semibold text-sm bg-gradient-brand text-white hover:opacity-90 transition-opacity"
                >
                  Aplikuj
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={transition}
            className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 sm:p-12 text-center text-white"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Nie widzisz swojego stanowiska?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
              Jeśli masz doświadczenie w pracy z danymi, automatyzacją lub AI — odezwij się.
              Zawsze szukamy utalentowanych ludzi.
            </p>
            <a
              href="mailto:kariera@live-sales.pl?subject=Aplikacja spontaniczna"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              kariera@live-sales.pl
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
