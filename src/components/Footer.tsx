export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LS</span>
              </div>
              <span className="font-bold text-xl">LiveSales</span>
            </a>
            <p className="text-gray-400 max-w-sm">
              Jedno miejsce do analizy, porównywania i automatyzacji danych z różnych źródeł.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-2">
              <li><a href="#integracje" className="text-gray-400 hover:text-white transition-colors">Integracje</a></li>
            </ul>
          </div>

          {/* Firma */}
          <div>
            <h4 className="font-semibold mb-4">Firma</h4>
            <ul className="space-y-2">
              <li><a href="#kontakt" className="text-gray-400 hover:text-white transition-colors">Kontakt</a></li>
              <li><a href="/kariera" className="text-gray-400 hover:text-white transition-colors">Kariera</a></li>
            </ul>
          </div>

          {/* Kariera */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              Kariera
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Hiring
              </span>
            </h4>
            <ul className="space-y-2">
              <li><a href="/kariera" className="text-gray-400 hover:text-white transition-colors">Otwarte stanowiska</a></li>
              <li><a href="/kariera#dlaczego-livesales" className="text-gray-400 hover:text-white transition-colors">Dlaczego LiveSales?</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} LiveSales. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
