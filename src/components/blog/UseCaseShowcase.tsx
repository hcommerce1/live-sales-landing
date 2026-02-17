import { useState } from 'react';
import { FileText, Search, Image, ShoppingCart, BarChart3 } from 'lucide-react';

const categories = [
  {
    id: 'invoices',
    label: 'Dane i faktury',
    icon: FileText,
    color: 'blue',
    cases: [
      'Pobranie faktur z maila (IMAP) i odczyt OCR-em',
      'Normalizacja danych — "transport" / "dostawa" / "przesyłka" → jedna kategoria',
      'Automatyczny zapis do Google Sheets z podziałem na kontrahentów i miesiące',
      'Podsumowanie: najwyższe koszty, podział na kategorie, trend miesięczny',
    ],
  },
  {
    id: 'competition',
    label: 'Konkurencja',
    icon: Search,
    color: 'orange',
    cases: [
      'Scrapowanie ofert konkurencji — ceny, parametry, dostępność',
      'Monitoring promowanych listingów i zmian cen',
      'Wykrywanie luk cenowych i brakujących parametrów w Twoich ofertach',
      'Eksport do CSV gotowego do analizy lub importu',
    ],
  },
  {
    id: 'images',
    label: 'Zdjęcia i media',
    icon: Image,
    color: 'pink',
    cases: [
      'Hurtowa edycja 200+ zdjęć — dodanie napisów, wymiarów, resize',
      'Usuwanie tła i kompresja (Pillow / OpenCV)',
      'Upload na Cloudinary → automatyczne URL-e do importu',
      'Auto-tagowanie zdjęć z Claude Vision (co jest na zdjęciu)',
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingCart,
    color: 'green',
    cases: [
      'Auto-tworzenie produktów w bazie BaseLinker ze skryptu',
      'Generowanie opisów SEO i tytułów pod Allegro / Amazon',
      'Hurtowa zmiana nazw, kategorii i parametrów',
      'Przygotowanie ofert pod różne marketplace z jednego CSV',
    ],
  },
  {
    id: 'analytics',
    label: 'Analityka',
    icon: BarChart3,
    color: 'violet',
    cases: [
      'Wyciąganie danych z BigQuery / SQL i tworzenie wykresów',
      'Podział sprzedaży na kategorie produktów, dostawy, marże',
      'Generowanie raportów PDF / HTML z wizualizacjami',
      'Odpowiedzi na pytania: "na czym tracimy?", "jak zarobić więcej?"',
    ],
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; tabActive: string; tabHover: string; icon: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   tabActive: 'bg-blue-600 text-white',   tabHover: 'hover:bg-blue-100', icon: 'text-blue-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', tabActive: 'bg-orange-600 text-white', tabHover: 'hover:bg-orange-100', icon: 'text-orange-600' },
  pink:   { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   tabActive: 'bg-pink-600 text-white',   tabHover: 'hover:bg-pink-100', icon: 'text-pink-600' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  tabActive: 'bg-green-600 text-white',  tabHover: 'hover:bg-green-100', icon: 'text-green-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', tabActive: 'bg-violet-600 text-white', tabHover: 'hover:bg-violet-100', icon: 'text-violet-600' },
};

export function UseCaseShowcase() {
  const [activeTab, setActiveTab] = useState('invoices');
  const active = categories.find((c) => c.id === activeTab)!;
  const colors = colorMap[active.color];
  const Icon = active.icon;

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl border-2 border-violet-200">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Co konkretnie AI zrobi za Ciebie?
      </h3>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const isActive = cat.id === activeTab;
          const catColors = colorMap[cat.color];
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? catColors.tabActive
                  : `bg-white border border-gray-200 text-gray-600 ${catColors.tabHover}`
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className={`p-6 rounded-xl border ${colors.bg} ${colors.border}`}>
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-7 h-7 ${colors.icon}`} />
          <h4 className={`text-lg font-semibold ${colors.text}`}>{active.label}</h4>
        </div>
        <ul className="space-y-3">
          {active.cases.map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${colors.tabActive.split(' ')[0]}`}>
                {i + 1}
              </span>
              <span className="text-gray-700 leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Każdy scenariusz to kilka godzin rozmowy z AI — nie kilka tygodni nauki programowania.
      </p>
    </div>
  );
}
