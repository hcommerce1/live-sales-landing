# 📚 Blog Writing Guide - Production Best Practices 2026

## 🎯 Ten przewodnik zawiera wszystko czego potrzebujesz do pisania profesjonalnych blogów

**Ostatnia aktualizacja:** 2026-02-15
**Status:** ✅ Production-ready
**Stack:** Astro 5.17 + React 19 + Recharts + KaTeX + Lucide Icons

---

## 📋 Stack Technologiczny

```yaml
Framework: Astro 5.17
Content: Astro Content Collections + Zod
MDX: @astrojs/mdx
Plugins: remark-math + rehype-katex
React: React 19 (client components)
Charts: Recharts
Math: KaTeX (LaTeX-quality)
Icons: Lucide React ⭐
Animations: Framer Motion
Styling: Tailwind CSS 4.1
Hosting: Vercel
```

---

## ✅ Checklist przed pisaniem

- [ ] Sprawdź czy temat jest unikalny
- [ ] Zdefiniuj target audience
- [ ] Wybierz 3-5 słów kluczowych (SEO)
- [ ] Przygotuj dane/przykłady/statystyki
- [ ] Zaplanuj interaktywne elementy (kalkulatory, wykresy)
- [ ] Przygotuj obrazy/screenshots (jeśli potrzebne)

---

## 🎨 UI/UX Best Practices

### 1. ✅ ZAWSZE używaj jasnych tła

**✅ DO:**
```jsx
<div className="bg-white p-6 rounded-xl">
  <h3 className="text-gray-900">Łatwo czytać!</h3>
  <p className="text-gray-700">Content</p>
</div>
```

**❌ DON'T:**
```jsx
<div className="bg-gray-800 p-6">
  <h3 className="text-gray-600">Trudno czytać!</h3>
</div>
```

**Zasada:** Jasne tło + ciemny tekst = czytelność!

---

### 2. ✅ WAŻNE: Zwiększone odstępy między liniami

**Dla lepszej czytelności używamy:**
- `leading-loose` (line-height: 1.75) zamiast `leading-relaxed` (1.625)
- Większe marginesy między paragrafami: `mb-6`
- Więcej przestrzeni między sekcjami: headingi z większymi `mt-` i `mb-`

**Przykład paragrafów:**
```jsx
<p className="text-gray-700 leading-loose mb-6">
  Polski tekst potrzebuje większych odstępów między liniami dla komfortu czytania.
</p>
```

**W layout blogów stosujemy:**
- `prose-p:leading-loose prose-p:mb-6` - paragrafy
- `prose-li:leading-loose prose-li:my-3` - listy
- `prose-h2:mt-20 prose-h2:mb-8` - H2 headingi (80px + 32px = duża separacja!)
- `prose-h3:mt-16 prose-h3:mb-6` - H3 headingi (64px + 24px)
- `prose-h4:mt-10 prose-h4:mb-5` - H4 headingi (40px + 20px)

---

### 3. ✅ Ikony Lucide zamiast emoji

**❌ ŹLLE - Emoji:**
```markdown
## 📊 Metryki sprzedażowe
```

**✅ DOBRZE - Lucide Icons:**
```jsx
import { ShoppingCart } from 'lucide-react';

## <ShoppingCart className="inline w-8 h-8 mr-2 text-blue-600" /> Metryki sprzedażowe
```

**Popularne ikony:**
- `TrendingUp` - wzrost, metryki, success
- `Calculator` - kalkulatory, obliczenia
- `DollarSign` - pieniądze, przychód, pricing
- `Users` - klienci, użytkownicy, audience
- `Target` - cele, konwersje, KPIs
- `ShoppingCart` - e-commerce, sprzedaż
- `PieChart` - analityka, dashboardy, data
- `Package` - produkty, zapasy, inventory
- `Clock` - czas, performance, speed

**Instalacja:**
```bash
npm install lucide-react
```

**Import:**
```jsx
import { Icon1, Icon2, Icon3 } from 'lucide-react';
```

**Browse wszystkie:** https://lucide.dev/icons

---

### 4. ✅ Wizualne sekcje

#### Hero Section (na początku bloga)
```jsx
<div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-12 border border-blue-100">
  <h2 className="text-3xl font-bold mb-4 text-gray-900">
    Dlaczego to ważne?
  </h2>

  <blockquote className="border-l-4 border-blue-600 pl-6 my-6 text-lg italic text-gray-700">
    "Cytat od eksperta"
  </blockquote>

  <div className="grid md:grid-cols-2 gap-4">
    <!-- Value proposition cards -->
  </div>
</div>
```

#### Info Cards
```jsx
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <div className="flex items-start gap-3">
    <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Tytuł</h3>
      <p className="text-sm text-gray-600">Opis</p>
    </div>
  </div>
</div>
```

#### Alert Boxes (kolorowe)
```jsx
// Info (niebieski)
<div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
  <h4 className="font-semibold flex items-center gap-2">
    <InfoIcon className="w-5 h-5 text-blue-600" />
    Informacja
  </h4>
  <p className="text-gray-700 mt-2">Content</p>
</div>

// Success (zielony)
<div className="bg-green-50 p-6 rounded-xl border border-green-200">
  ...
</div>

// Warning (żółty)
<div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-300">
  ...
</div>

// Error (czerwony)
<div className="bg-red-50 p-6 rounded-xl border border-red-200">
  ...
</div>
```

---

### 5. ✅ Tabele - zawsze stylowane!

**❌ Zwykły markdown:**
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data     | Data     |
```

**✅ Stylowana tabela:**
```jsx
<div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
  <table className="min-w-full">
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
      <tr>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
          Header 1
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
          Header 2
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 font-medium text-gray-900">Data 1</td>
        <td className="px-6 py-4 text-gray-700">Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Tip:** Color-code results w kolumnach (zielony = dobry, czerwony = zły)

---

## 🔢 Formuły Matematyczne (KaTeX)

### Podstawy

**Inline (w tekście):**
```markdown
Wzór: $CR = \frac{A}{B} \times 100\%$
```

**Block (wycentrowany):**
```markdown
$$
CR = \frac{\text{Liczba transakcji}}{\text{Liczba odwiedzin}} \times 100\%
$$
```

### ✅ ZAWSZE w kolorowym boxie!

```jsx
<div className="bg-white p-6 rounded-xl border-l-4 border-blue-600 shadow-sm mb-6">
  <h4 className="font-semibold text-lg mb-3 text-gray-900">Wzór:</h4>

$$
\text{Formula here}
$$

  <div className="mt-4 text-sm text-gray-700">
    <strong>Przykład:</strong>
    <!-- Konkretny przykład z liczbami -->
  </div>
</div>
```

### Częste wzory LaTeX

```latex
Ułamek:          \frac{licznik}{mianownik}
Mnożenie:        a \times b
Tekst:           \text{jakiś tekst}
Indeks dolny:    x_{\text{subscript}}
Indeks górny:    x^2
Większe:         > lub \gt
Mniejsze:        < lub \lt
Większe-równe:   \geq
Mniejsze-równe:   \leq
```

**Docs:** https://katex.org/docs/supported.html

---

## 📊 Wykresy (Recharts)

### ⚠️ WAŻNE: Zawsze dodawaj `client:visible` lub `client:load`!

```jsx
<ConversionRateChart
  client:visible
  data={...}
/>
```

**Kiedy używać:**
- `client:load` - ładuj natychmiast (above fold, ważne)
- `client:visible` - ładuj gdy widoczne (below fold, wykresy)
- `client:idle` - ładuj gdy browser idle (nice-to-have)

### Bar Chart Template

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h4 className="text-lg font-semibold mb-4 text-gray-800">Tytuł wykresu</h4>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis
        dataKey="name"
        tick={{ fill: '#6b7280', fontSize: 12 }}
      />
      <YAxis
        tick={{ fill: '#6b7280', fontSize: 12 }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}
      />
      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

### Kolory spójne z designem

```javascript
const COLORS = {
  primary: '#3b82f6',    // blue-500
  success: '#10b981',    // green-500
  warning: '#f59e0b',    // yellow-500
  danger: '#ef4444',     // red-500
  purple: '#8b5cf6',     // purple-500
};
```

---

## 🎮 Interaktywne Kalkulatory

### Template prostego kalkulatora

```jsx
import { useState } from 'react';

export function SimpleCalculator() {
  const [value, setValue] = useState(100);

  // Obliczenia
  const result = value * 1.2;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
      <h4 className="font-semibold text-lg mb-4">Kalkulator</h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wartość wejściowa:
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="text-sm text-gray-600">Wynik:</div>
        <div className="text-3xl font-bold text-purple-700">
          {result.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
```

### W MDX - pamiętaj o `client:load`!

```jsx
import { SimpleCalculator } from '@components/blog/SimpleCalculator';

<SimpleCalculator client:load />
```

---

## 📝 Template Bloga (copy-paste)

```mdx
---
title: "Główny tytuł < 60 znaków (SEO)"
description: "Meta description 150-160 znaków z keywords"
pubDate: 2026-02-XX
lang: pl
category: guide
featured: true
tags: ['tag1', 'tag2', 'tag3']
calculators: ['roi', 'custom']
---

import { Calculator, TrendingUp, Users, Target } from 'lucide-react';
import { MyChart } from '@components/blog/charts/MyChart';
import { MyCalculator } from '@components/blog/MyCalculator';

<!-- ========== HERO SECTION ========== -->
<div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-12 border border-blue-100">
  <h2 className="text-3xl font-bold mb-4 text-gray-900">
    Dlaczego to ważne?
  </h2>

  <blockquote className="border-l-4 border-blue-600 pl-6 my-6 text-lg italic text-gray-700">
    "Cytat od eksperta lub statystyka"
  </blockquote>

  <div className="grid md:grid-cols-2 gap-4">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Benefit 1</h3>
          <p className="text-sm text-gray-600">Description</p>
        </div>
      </div>
    </div>

    <!-- Repeat for other benefits -->
  </div>
</div>

---

<!-- ========== SEKCJA 1 ========== -->
## <TrendingUp className="inline w-8 h-8 mr-2 text-blue-600" /> Sekcja 1

### Podsekcja 1.1

<div className="bg-white p-6 rounded-xl border-l-4 border-blue-600 shadow-sm mb-6">
  <h4 className="font-semibold text-lg mb-3 text-gray-900">Wzór:</h4>

$$
\text{Formula} = \frac{A}{B} \times 100\%
$$
</div>

**Przykład obliczenia:**
- Input A: 250
- Input B: 10,000

$$
\text{Result} = \frac{250}{10{,}000} \times 100\% = 2.5\%
$$

<!-- Wykres -->
<MyChart client:visible data={[...]} />

<!-- Tips box -->
<div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-6">
  <h4 className="font-semibold flex items-center gap-2">
    <Target className="w-5 h-5 text-blue-600" />
    Jak poprawić:
  </h4>
  <ul className="space-y-2 text-gray-700 mt-3">
    <li className="flex items-start gap-2">
      <span className="text-green-600 font-bold">✓</span>
      <span>Tip 1</span>
    </li>
    <!-- More tips -->
  </ul>
</div>

---

<!-- ========== INTERAKTYWNY KALKULATOR ========== -->
## <Calculator className="inline w-8 h-8 mr-2 text-purple-600" /> Wypróbuj kalkulator!

<MyCalculator client:load />

---

<!-- ========== PODSUMOWANIE ========== -->
## <Target className="inline w-8 h-8 mr-2 text-green-600" /> Podsumowanie

<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
  <h3 className="text-2xl font-bold mb-6 text-gray-900">Action Plan:</h3>

  <!-- Konkretne kroki -->
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-lg">
      <div className="font-semibold text-gray-900 mb-1">Krok 1:</div>
      <div className="text-gray-700 text-sm">Description</div>
    </div>
    <!-- More steps -->
  </div>
</div>

---

<!-- ========== CTA ========== -->
<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
  <h3 className="text-3xl font-bold mb-4">Następne kroki</h3>

  <div className="grid md:grid-cols-2 gap-4 mb-6">
    <div className="flex items-start gap-3">
      <span className="text-2xl">✅</span>
      <span>Feature 1</span>
    </div>
    <!-- More features -->
  </div>

  <a
    href="#kontakt"
    className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg"
  >
    Call to Action →
  </a>
</div>
```

---

## ✅ Checklist przed publikacją

### Content
- [ ] Tytuł < 60 znaków (SEO)
- [ ] Description 150-160 znaków z keywords
- [ ] 3-5 relevantnych tagów
- [ ] Minimum 1500 słów
- [ ] Wszystkie linki działają
- [ ] Spell check (brak literówek)
- [ ] Fakty zweryfikowane (nie fake news!)

### Formuły (KaTeX)
- [ ] Wszystkie wzory renderują się poprawnie
- [ ] Użyto `\text{}` dla tekstu w formułach
- [ ] Wzory w kolorowych boxach (czytelność)
- [ ] Przykłady z konkretnymi liczbami

### Wykresy (Recharts)
- [ ] `client:visible` lub `client:load` na WSZYSTKICH
- [ ] Responsive (mobile-friendly)
- [ ] Kolory spójne z designem
- [ ] Tooltips działają
- [ ] Labels czytelne

### Kalkulatory
- [ ] `client:load` (zawsze!)
- [ ] Wszystkie inputs mają labels
- [ ] Validation (min/max)
- [ ] Real-time updates
- [ ] Error handling

### UI/UX
- [ ] ✅ Lucide icons (NIE emoji!)
- [ ] ✅ Jasne tła (czytelność!)
- [ ] ✅ Wystarczający kontrast (WCAG AA)
- [ ] Sekcje wizualnie oddzielone
- [ ] Spójne kolory
- [ ] Responsive (mobile-first)

### Performance
- [ ] Build bez błędów
- [ ] Lighthouse score > 90
- [ ] Images zoptymalizowane
- [ ] Client components tylko gdy potrzebne

### Accessibility
- [ ] Alt text dla obrazów
- [ ] Heading hierarchy (H2 → H3 → H4)
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader friendly

---

## 🚨 Częste błędy - UNIKAJ!

### 1. ❌ Znaki < > w markdown tables

**Problem:**
```markdown
| Time | Value |
|------|-------|
| <24h | 100   |  <!-- ERROR! -->
```

**Rozwiązanie:**
```markdown
| Time | Value |
|------|-------|
| &lt;24h | 100 |  <!-- Correct! -->
```

### 2. ❌ Brak client directive na React components

**Problem:**
```jsx
<Calculator data={...} />  <!-- Nie zadziała! -->
```

**Rozwiązanie:**
```jsx
<Calculator client:load data={...} />  <!-- Działa! -->
```

### 3. ❌ Ciemne tła (niska czytelność)

**Problem:**
```jsx
<div className="bg-gray-800">
  <p className="text-gray-600">Trudno czytać!</p>
</div>
```

**Rozwiązanie:**
```jsx
<div className="bg-white">
  <p className="text-gray-900">Łatwo czytać!</p>
</div>
```

### 4. ❌ Za dużo emoji

**Problem:**
```markdown
## 🎉🎊🎈 Success! 🚀✨💪🔥
```

**Rozwiązanie:**
```jsx
import { TrendingUp } from 'lucide-react';

## <TrendingUp className="inline w-8 h-8 text-green-600" /> Success
```

---

## 🎨 Paleta Kolorów (Tailwind)

### Backgrounds (sekcje)
```
Hero:     bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
Success:  bg-gradient-to-br from-green-50 to-emerald-50
Warning:  bg-yellow-50
Info:     bg-blue-50
Error:    bg-red-50
White:    bg-white (najczęściej używany!)
```

### Text Colors
```
Heading:     text-gray-900  (ciemny)
Body:        text-gray-700  (normalny)
Subtle:      text-gray-600  (subtelny)
Muted:       text-gray-500  (wyciszony)
Placeholder: text-gray-400  (placeholder)
```

### Border Colors
```
Default:  border-gray-200
Primary:  border-blue-200
Success:  border-green-200
Warning:  border-yellow-300  (mocniejszy!)
Error:    border-red-200
```

### Accent Colors (icons, highlights)
```
Blue:    text-blue-600
Green:   text-green-600
Purple:  text-purple-600
Orange:  text-orange-600
Pink:    text-pink-600
```

---

## 📐 Spacing (Tailwind)

### Padding
```
Small:   p-4  (16px)
Medium:  p-6  (24px)
Large:   p-8  (32px)
XLarge:  p-12 (48px)
```

### Gaps
```
Cards:    gap-4  (16px)
Sections: gap-6  (24px)
Large:    gap-8  (32px)
```

### Rounded Corners
```
Small:  rounded-lg  (8px)
Medium: rounded-xl  (12px)
Large:  rounded-2xl (16px)
```

---

## 🚀 Quick Start (nowy blog)

1. **Skopiuj template z tego przewodnika**
2. **Zaktualizuj frontmatter**
3. **Dodaj swój content:**
   - Używaj jasnych tła
   - Lucide icons zamiast emoji
   - Formuły w boxach
   - `client:*` na komponentach
4. **Test lokalnie:**
   ```bash
   npm run dev
   # http://localhost:4321/pl/blog/pl/twoj-blog
   ```
5. **Przejdź przez checklist**
6. **Publish!**

---

## 📚 Zasoby

**Lucide Icons:** https://lucide.dev/icons
**Recharts:** https://recharts.org/en-US/examples
**KaTeX:** https://katex.org/docs/supported.html
**Tailwind:** https://tailwindcss.com/docs

---

## ✨ Reference Implementation

Zobacz: `src/content/blog/pl/kluczowe-metryki-ecommerce-v2.mdx`

**Co robi dobrze:**
- ✅ Lucide icons
- ✅ Jasne tła
- ✅ Formuły w boxach
- ✅ Client directives
- ✅ Responsive design
- ✅ Spójne kolory
- ✅ Wyraźne sekcje

**Użyj jako template!**

---

**Wersja:** 2.0 Production
**Data:** 2026-02-15
**Status:** ✅ Gotowe do użycia
