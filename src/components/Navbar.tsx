'use client';

import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const navigation = [
  { name: 'Integracje', href: '#integracje' },
  { name: 'Jak to działa', href: '#jak-to-dziala' },
  { name: 'Edytor', href: '#edytor' },
  { name: 'Połączenia', href: '#polaczenia' },
  { name: 'Blog', href: '/blog' },
  { name: 'Kontakt', href: '#kontakt' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LS</span>
          </div>
          <span className="font-bold text-xl text-gray-900">LiveSales</span>
        </a>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                item.name === 'Kontakt'
                  ? 'text-primary-600 hover:text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 text-gray-600"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Otwórz menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <DialogPanel
              as={motion.div}
              initial={{ x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
              transition={{
                type: shouldReduceMotion ? 'tween' : 'spring',
                damping: 30,
                stiffness: 300,
                duration: shouldReduceMotion ? 0.15 : undefined
              }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white px-6 py-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">LS</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">LiveSales</span>
                </a>
                <button
                  type="button"
                  className="p-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Zamknij menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-8 flow-root">
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-3 text-base font-medium transition-colors ${
                        item.name === 'Kontakt'
                          ? 'text-primary-600 hover:text-primary-700'
                          : 'text-gray-900 hover:text-primary-600'
                      }`}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </DialogPanel>
          </Dialog>
        )}
      </AnimatePresence>
    </header>
  );
}
