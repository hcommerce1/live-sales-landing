# 📚 Przewodnik pisania blogów

## 🎯 Ten przewodnik zawiera wszystko czego potrzebujesz do pisania profesjonalnych blogów

**Status:** ✅ Gotowe do produkcji
**Stack:** patrz `package.json` (Astro + React + Recharts + KaTeX + Lucide Icons)

---

## 📋 Stack technologiczny

> Aktualne wersje zawsze sprawdzaj w `package.json`. Poniżej główne technologie:

```yaml
Framework: Astro (SSR na Vercel)
Treści: Astro Content Collections + Zod
MDX: @astrojs/mdx
Pluginy: remark-math + rehype-katex
React: (komponenty klienckie)
Wykresy: Recharts
Matematyka: KaTeX (jakość LaTeX)
Ikony: Lucide React ⭐
Animacje: Framer Motion
Style: Tailwind CSS
Hosting: Vercel
```

---

## ⚠️ ZASADA DATY (pubDate)

**pubDate ZAWSZE = data faktycznego dodania posta (dziś).**

- NIE ustawiaj daty z przyszłości — build się nie powiedzie (walidacja Zod w `config.ts`)
- NIE zgaduj daty — użyj dzisiejszej
- Posty z przyszłą datą nie pokażą się na stronie (`filterPublished` w `blogUtils.ts` je odrzuci)
- Format: `YYYY-MM-DD` (np. dzisiejsza data)

---

## ⛔ ZAKAZ: Nie dodawaj CTA / sekcji promocyjnych do blogów!

**Blog NIE MOŻE zawierać:**
- Sekcji "Gotowy na automatyzację?", "Skontaktuj się", "Umów konsultację" itp.
- Bloków CTA (Call To Action) promujących LiveSales
- Przycisków/linków typu "Wypróbuj za darmo", "Umów się na rozmowę"
- Jakichkolwiek sekcji marketingowych/sprzedażowych

**Dlaczego?**
Szablon bloga (`src/pages/blog/[...slug].astro`) automatycznie dodaje ujednoliconą sekcję kontaktową i formularz subskrypcji po treści artykułu. Dodawanie CTA w treści MDX powoduje duplikację i brak kontroli nad wyglądem.

**Jedyne dozwolone CTA** to te w szablonie strony — NIE w plikach `.mdx`.

---

## ZASADY PISANIA TREŚCI (OBOWIĄZKOWE)

### 1 blog = 1 konkretny problem

**Każdy blog odpowiada na JEDNO pytanie użytkownika.** Nie rób artykułów-worków, które próbują pokryć wszystko naraz.

**NIE rób tak:**
```
Tytuł: "Co AI potrafi w e-commerce"
Treść: faktury + scraping + zdjęcia + marketplace + analityka + BigQuery
→ Zbyt szeroki. Pasuje do każdego zapytania = nie pasuje do żadnego.
```

**Rób tak:**
```
Tytuł: "Jak zmienić napis na 200 zdjęciach produktowych w 5 minut"
Treść: konkretny problem → narzędzia → krok po kroku → gotowy skrypt
→ Wąski temat. Kto szuka tego problemu, znajduje dokładną odpowiedź.
```

### Zasada "szukający znajdzie"

Zanim napiszesz blog, zadaj sobie pytanie: **"Co ktoś wpisze w Google, żeby trafić na ten artykuł?"**

Jeśli odpowiedź brzmi "cokolwiek związanego z e-commerce" — temat jest za szeroki. Zawęź.

Przykłady dobrych tematów (wąskich, konkretnych):
- "Jak zrobić hurtowy OCR faktur PDF w Pythonie"
- "Jak scrapować ceny konkurencji z Allegro"
- "Jak dodać napisy na zdjęcia produktów skryptem"
- "Jak wygenerować 500 opisów SEO przez API OpenAI"
- "Jak policzyć realną marżę po prowizjach Allegro"

Przykłady złych tematów (za szerokich):
- "Co AI potrafi w e-commerce"
- "Wszystko co musisz wiedzieć o automatyzacji"
- "Kompletny przewodnik po AI dla sprzedawców"

### Bez lania wody

- **Nie zaczynaj od filozofii.** Czytelnik ma problem — daj mu rozwiązanie.
- **Nie pisz "dlaczego to ważne" przez 3 akapity.** Max 2 zdania kontekstu, potem mięso.
- **Nie powtarzaj tego samego innymi słowami.** Napisz raz, dobrze. Idź dalej.
- **Nie pisz ogólników.** "AI oszczędza czas" — to nic nie mówi. "Skrypt przetwarza 200 zdjęć w 5 minut zamiast 7 godzin w Photoshopie" — to mówi.
- **Nie dawaj cytatów motywacyjnych.** To blog techniczny, nie LinkedIn.

### Struktura treści (każdy blog)

```
1. Problem (2-3 zdania) — co boli, dlaczego szukasz
2. Rozwiązanie (bulk) — co konkretnie zrobisz, jakie narzędzia
3. Krok po kroku — instrukcja z kodem/promptami/screenshotami
4. Wynik — co dostajesz na końcu (z przykładem)
5. Pułapki — na co uważać, czego nie robi
```

### Weryfikacja treści

- **Nie wymyślaj scenariuszy.** Opisuj to, co faktycznie przetestowałeś i działa.
- **Podawaj realne ograniczenia.** AI nie jest idealne — pisz co NIE działa.
- **Nie obiecuj cudów.** "300 zł zastępuje analityka za 10 000" to clickbait. Pisz uczciwie.
- **Kod musi działać.** Każdy snippet, skrypt, prompt — przetestowany. Nie generuj kodu "na oko".

### Spójność hero/intro z treścią (OBOWIĄZKOWE)

**Hero section, blockquote i karty podsumowujące MUSZĄ odzwierciedlać faktyczny proces opisany w artykule.**

- Jeśli artykuł opisuje 3-etapowy proces (np. maile → OpenAI → Claude Code), hero też musi pokazywać 3 etapy — nie upraszczaj do jednego
- Cytaty/blockquote muszą być zgodne z prawdą — jeśli użytkownik nie "powiedział Claude'owi" jako jedyny krok, nie pisz tego tak
- Karty podsumowujące (grid w hero) muszą odpowiadać faktycznym krokom, nie ogólnikom
- **Po każdej zmianie w sekcji "jak to zbudowałem" / procesie — sprawdź czy hero nadal pasuje**
- Podawaj realne koszty i liczby (np. "$80 za 3000 dokumentów"), nie zaokrąglaj do "AI przetworzyło dane"

### Jak ocenić czy blog jest gotowy

Zadaj 3 pytania:
1. **Czy ktoś po przeczytaniu może od razu coś zrobić?** (nie "wie więcej", ale ZROBI)
2. **Czy tytuł dokładnie opisuje co jest w środku?** (nie clickbait)
3. **Czy mogę usunąć jakąś sekcję i artykuł dalej ma sens?** (jeśli tak — usuń ją)

---

## Checklist przed pisaniem

- [ ] Temat jest WĄSKI — odpowiada na jedno konkretne pytanie
- [ ] Tytuł mówi dokładnie co czytelnik dostanie
- [ ] Masz przetestowane rozwiązanie (nie piszesz z głowy)
- [ ] Sprawdź czy temat jest unikalny (nie duplikuje istniejącego bloga)
- [ ] Zdefiniuj grupę docelową
- [ ] Wybierz 3-5 słów kluczowych (SEO)
- [ ] Przygotuj dane/przykłady/statystyki
- [ ] Zaplanuj interaktywne elementy (kalkulatory, wykresy) — TYLKO jeśli dodają wartość
- [ ] Przygotuj obrazy/zrzuty ekranu (jeśli potrzebne)

---

## 🎨 Dobre praktyki UI/UX

### 1. ✅ ZAWSZE używaj jasnych tła

**✅ TAK:**
```jsx
<div className="bg-white p-6 rounded-xl">
  <h3 className="text-gray-900">Łatwo czytać!</h3>
  <p className="text-gray-700">Treść</p>
</div>
```

**❌ NIE:**
```jsx
<div className="bg-gray-800 p-6">
  <h3 className="text-gray-600">Trudno czytać!</h3>
</div>
```

**Zasada:** Jasne tło + ciemny tekst = czytelność!

---

### 2. ✅ WAŻNE: Odstępy i typografia (`.prose-blog`)

**Klasa `.prose-blog` w `global.css` automatycznie nadaje dobre odstępy KAŻDEMU blogowi** — nie musisz dodawać `leading-*` ani `mb-*` do zwykłego tekstu. Style bazowe działają na paragrafach, nagłówkach, listach, cytatach i blokach kodu.

**Wartości bazowe (z CSS):**
| Element | Interlinia | Margines górny | Margines dolny |
|---------|------------|----------------|----------------|
| `p` (paragraf) | 1.8 | — | 1.5rem (24px) |
| `h2` (nagłówek) | 1.3 | 3.5rem (56px) | 1.25rem (20px) |
| `h3` (podtytuł) | 1.35 | 2.5rem (40px) | 1rem (16px) |
| `h4` (mały tytuł) | 1.4 | 2rem (32px) | 0.75rem (12px) |
| `li` (element listy) | 1.8 | — | 0.5rem (8px) |
| `blockquote` (cytat) | 1.8 | 2rem | 2rem |
| `hr` (separator) | — | 3rem | 3rem |

**Kiedy pisać czysty Markdown (bez klas Tailwind):**
- Paragrafy, nagłówki, listy, cytaty — `.prose-blog` ogarnia automatycznie
- NIE musisz dodawać `leading-loose` ani `mb-6` — to już jest w CSS

**Kiedy dodawać klasy Tailwind:**
- Własne boxy/karty: `bg-white p-6 rounded-xl` itp.
- Layouty grid/flex: `gap-4`, `space-y-4`
- Specjalnie wyróżniony tekst: `leading-loose` jeśli chcesz jeszcze większą interlinię

**Przykład — czysty Markdown z dobrymi odstępami (zero klas!):**
```markdown
## Sekcja główna

Tekst paragrafu. Automatycznie dostaje interlinię 1.8 i margines dolny 24px.
Nie musisz dodawać żadnych klas.

### Podsekcja

Kolejny paragraf z dobrymi odstępami.

- Element listy 1
- Element listy 2
- Element listy 3
```

**Zasada:** `.prose-blog` daje bazę typograficzną. Klasy Tailwind dodawaj **tylko** do własnych komponentów (boxy, karty, gradienty).

---

### 3. ✅ Ikony Lucide zamiast emoji

**❌ ŹLE — emoji:**
```markdown
## 📊 Metryki sprzedażowe
```

**✅ DOBRZE — Lucide Icons:**
```jsx
import { ShoppingCart } from 'lucide-react';

## <ShoppingCart className="inline w-8 h-8 mr-2 text-blue-600" /> Metryki sprzedażowe
```

**Popularne ikony:**
- `TrendingUp` — wzrost, metryki, sukces
- `Calculator` — kalkulatory, obliczenia
- `DollarSign` — pieniądze, przychód, cennik
- `Users` — klienci, użytkownicy, odbiorcy
- `Target` — cele, konwersje, KPI
- `ShoppingCart` — e-commerce, sprzedaż
- `PieChart` — analityka, dashboardy, dane
- `Package` — produkty, zapasy, magazyn
- `Clock` — czas, wydajność, szybkość

**Instalacja:**
```bash
npm install lucide-react
```

**Import:**
```jsx
import { Ikona1, Ikona2, Ikona3 } from 'lucide-react';
```

**Przeglądaj wszystkie:** https://lucide.dev/icons

---

### 4. ✅ Sekcje wizualne

#### Sekcja powitalna (na początku bloga)
```jsx
<div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-12 border border-blue-100">
  <h2 className="text-3xl font-bold mb-4 text-gray-900">
    Dlaczego to ważne?
  </h2>

  <blockquote className="border-l-4 border-blue-600 pl-6 my-6 text-lg italic text-gray-700">
    "Cytat od eksperta"
  </blockquote>

  <div className="grid md:grid-cols-2 gap-4">
    <!-- Karty z korzyściami -->
  </div>
</div>
```

#### Karty informacyjne
```jsx
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <div className="flex items-start gap-3">
    <Ikona className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Tytuł</h3>
      <p className="text-sm text-gray-600">Opis</p>
    </div>
  </div>
</div>
```

#### Boxy alertów (kolorowe)
```jsx
// Informacja (niebieski)
<div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
  <h4 className="font-semibold flex items-center gap-2">
    <InfoIcon className="w-5 h-5 text-blue-600" />
    Informacja
  </h4>
  <p className="text-gray-700 mt-2">Treść</p>
</div>

// Sukces (zielony)
<div className="bg-green-50 p-6 rounded-xl border border-green-200">
  ...
</div>

// Ostrzeżenie (żółty)
<div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-300">
  ...
</div>

// Błąd (czerwony)
<div className="bg-red-50 p-6 rounded-xl border border-red-200">
  ...
</div>
```

---

### 5. ✅ Tabele — zawsze stylowane!

**❌ Zwykły markdown:**
```markdown
| Kolumna 1 | Kolumna 2 |
|-----------|-----------|
| Dane      | Dane      |
```

**✅ Stylowana tabela:**
```jsx
<div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
  <table className="min-w-full">
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
      <tr>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
          Nagłówek 1
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
          Nagłówek 2
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 font-medium text-gray-900">Dane 1</td>
        <td className="px-6 py-4 text-gray-700">Dane 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Wskazówka:** Koloruj wyniki w kolumnach (zielony = dobrze, czerwony = źle)

---

## 🔢 Formuły matematyczne (KaTeX)

### Podstawy

**W tekście (inline):**
```markdown
Wzór: $CR = \frac{A}{B} \times 100\%$
```

**Blok (wycentrowany):**
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
\text{Formuła tutaj}
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
Mniejsze-równe:  \leq
```

**Dokumentacja:** https://katex.org/docs/supported.html

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
- `client:load` — ładuj natychmiast (widoczne od razu, ważne)
- `client:visible` — ładuj gdy widoczne (niżej na stronie, wykresy)
- `client:idle` — ładuj gdy przeglądarka jest wolna (mniej ważne)

### Szablon wykresu słupkowego

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
const KOLORY = {
  glowny: '#3b82f6',      // blue-500
  sukces: '#10b981',       // green-500
  ostrzezenie: '#f59e0b',  // yellow-500
  blad: '#ef4444',         // red-500
  fioletowy: '#8b5cf6',    // purple-500
};
```

---

## 🎮 Interaktywne kalkulatory

### Szablon prostego kalkulatora

```jsx
import { useState } from 'react';

export function ProstyKalkulator() {
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

### W MDX — pamiętaj o `client:load`!

```jsx
import { ProstyKalkulator } from '@components/blog/ProstyKalkulator';

<ProstyKalkulator client:load />
```

---

## 📝 Szablon bloga (kopiuj-wklej)

```mdx
---
title: "Główny tytuł < 60 znaków (SEO)"
description: "Meta description 150-160 znaków ze słowami kluczowymi"
pubDate: YYYY-MM-DD  # ← DZISIEJSZA data! Nie przyszła!
lang: pl
category: guide
featured: true
tags: ['tag1', 'tag2', 'tag3']
calculators: ['roi', 'custom']
---

import { Calculator, TrendingUp, Users, Target } from 'lucide-react';
import { MojWykres } from '@components/blog/charts/MojWykres';
import { MojKalkulator } from '@components/blog/MojKalkulator';

<!-- ========== SEKCJA POWITALNA ========== -->
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
          <h3 className="font-semibold text-gray-900 mb-1">Korzyść 1</h3>
          <p className="text-sm text-gray-600">Opis</p>
        </div>
      </div>
    </div>

    <!-- Powtórz dla innych korzyści -->
  </div>
</div>

---

<!-- ========== SEKCJA 1 ========== -->
## <TrendingUp className="inline w-8 h-8 mr-2 text-blue-600" /> Sekcja 1

### Podsekcja 1.1

<div className="bg-white p-6 rounded-xl border-l-4 border-blue-600 shadow-sm mb-6">
  <h4 className="font-semibold text-lg mb-3 text-gray-900">Wzór:</h4>

$$
\text{Formuła} = \frac{A}{B} \times 100\%
$$
</div>

**Przykład obliczenia:**
- Wartość A: 250
- Wartość B: 10 000

$$
\text{Wynik} = \frac{250}{10{,}000} \times 100\% = 2.5\%
$$

<!-- Wykres -->
<MojWykres client:visible data={[...]} />

<!-- Box ze wskazówkami -->
<div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-6">
  <h4 className="font-semibold flex items-center gap-2">
    <Target className="w-5 h-5 text-blue-600" />
    Jak poprawić:
  </h4>
  <ul className="space-y-2 text-gray-700 mt-3">
    <li className="flex items-start gap-2">
      <span className="text-green-600 font-bold">✓</span>
      <span>Wskazówka 1</span>
    </li>
    <!-- Więcej wskazówek -->
  </ul>
</div>

---

<!-- ========== INTERAKTYWNY KALKULATOR ========== -->
## <Calculator className="inline w-8 h-8 mr-2 text-purple-600" /> Wypróbuj kalkulator!

<MojKalkulator client:load />

---

<!-- ========== PODSUMOWANIE ========== -->
## <Target className="inline w-8 h-8 mr-2 text-green-600" /> Podsumowanie

<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
  <h3 className="text-2xl font-bold mb-6 text-gray-900">Plan działania:</h3>

  <!-- Konkretne kroki -->
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-lg">
      <div className="font-semibold text-gray-900 mb-1">Krok 1:</div>
      <div className="text-gray-700 text-sm">Opis</div>
    </div>
    <!-- Więcej kroków -->
  </div>
</div>

<!-- ⛔ NIE DODAWAJ CTA / sekcji promocyjnych! Szablon strony dodaje je automatycznie. -->
```

---

## ✅ Checklist przed publikacją

### Treść
- [ ] `pubDate` = dzisiejsza data (NIE przyszła!)
- [ ] Tytuł < 60 znaków (SEO)
- [ ] Opis 150-160 znaków ze słowami kluczowymi
- [ ] 3-5 trafnych tagów
- [ ] Minimum 1500 słów
- [ ] Wszystkie linki działają
- [ ] Sprawdzenie pisowni (brak literówek)
- [ ] Fakty zweryfikowane (nie fake news!)

### Formuły (KaTeX)
- [ ] Wszystkie wzory renderują się poprawnie
- [ ] Użyto `\text{}` dla tekstu w formułach
- [ ] Wzory w kolorowych boxach (czytelność)
- [ ] Przykłady z konkretnymi liczbami

### Wykresy (Recharts)
- [ ] `client:visible` lub `client:load` na WSZYSTKICH
- [ ] Responsywne (dostosowane do mobile)
- [ ] Kolory spójne z designem
- [ ] Tooltips działają
- [ ] Etykiety czytelne

### Kalkulatory
- [ ] `client:load` (zawsze!)
- [ ] Wszystkie pola mają etykiety
- [ ] Walidacja (min/max)
- [ ] Aktualizacje w czasie rzeczywistym
- [ ] Obsługa błędów

### UI/UX
- [ ] ✅ Ikony Lucide (NIE emoji!)
- [ ] ✅ Jasne tła (czytelność!)
- [ ] ✅ Wystarczający kontrast (WCAG AA)
- [ ] ⛔ BRAK sekcji CTA/promocyjnych w treści MDX (szablon dodaje je automatycznie!)
- [ ] Sekcje wizualnie oddzielone
- [ ] Spójne kolory
- [ ] Responsywność (mobile-first)

### Wydajność
- [ ] Build bez błędów
- [ ] Wynik Lighthouse > 90
- [ ] Obrazy zoptymalizowane
- [ ] Komponenty klienckie tylko gdy potrzebne

### Dostępność
- [ ] Tekst alternatywny dla obrazów
- [ ] Hierarchia nagłówków (H2 → H3 → H4)
- [ ] Etykiety ARIA
- [ ] Nawigacja klawiaturą
- [ ] Przyjazne dla czytników ekranu

---

## 🚨 Częste błędy — UNIKAJ!

### 1. ❌ Znaki < > w tabelach markdown

**Problem:**
```markdown
| Czas  | Wartość |
|-------|---------|
| <24h  | 100     |  <!-- BŁĄD! -->
```

**Rozwiązanie:**
```markdown
| Czas     | Wartość |
|----------|---------|
| &lt;24h  | 100     |  <!-- Poprawnie! -->
```

### 2. ❌ Brak dyrektywy client na komponentach React

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

### 4. ❌ Sekcje CTA / promocyjne w treści bloga

**Problem:**
```jsx
{/* ========== CTA ========== */}
<div className="bg-gradient-to-r from-blue-600 to-purple-600 ...">
  <h3>Gotowy na automatyzację?</h3>
  <a href="#kontakt">Umów konsultację →</a>
</div>
```

**Rozwiązanie:** NIE dodawaj tego! Szablon strony (`[...slug].astro`) automatycznie wstawia sekcję kontaktową i formularz subskrypcji. Treść MDX powinna zawierać TYLKO merytoryczną zawartość artykułu.

### 5. ❌ Za dużo emoji

**Problem:**
```markdown
## 🎉🎊🎈 Sukces! 🚀✨💪🔥
```

**Rozwiązanie:**
```jsx
import { TrendingUp } from 'lucide-react';

## <TrendingUp className="inline w-8 h-8 text-green-600" /> Sukces
```

---

## 🎨 Paleta kolorów (Tailwind)

### Tła (sekcje)
```
Powitalna:    bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
Sukces:       bg-gradient-to-br from-green-50 to-emerald-50
Ostrzeżenie:  bg-yellow-50
Informacja:   bg-blue-50
Błąd:         bg-red-50
Białe:        bg-white (najczęściej używane!)
```

### Kolory tekstu
```
Nagłówek:       text-gray-900  (ciemny)
Treść:          text-gray-700  (normalny)
Subtelny:       text-gray-600  (subtelny)
Wyciszony:      text-gray-500  (wyciszony)
Zastępczy:      text-gray-400  (placeholder)
```

### Kolory obramowań
```
Domyślny:     border-gray-200
Główny:       border-blue-200
Sukces:       border-green-200
Ostrzeżenie:  border-yellow-300  (mocniejszy!)
Błąd:         border-red-200
```

### Kolory akcentów (ikony, wyróżnienia)
```
Niebieski:  text-blue-600
Zielony:    text-green-600
Fioletowy:  text-purple-600
Pomarańcz:  text-orange-600
Różowy:     text-pink-600
```

---

## 📐 Odstępy (Tailwind)

### Padding (wewnętrzny)
```
Mały:     p-4  (16px)
Średni:   p-6  (24px)
Duży:     p-8  (32px)
Bardzo:   p-12 (48px)
```

### Odstępy (gap)
```
Karty:    gap-4  (16px)
Sekcje:   gap-6  (24px)
Duże:     gap-8  (32px)
```

### Zaokrąglenia narożników
```
Małe:     rounded-lg  (8px)
Średnie:  rounded-xl  (12px)
Duże:     rounded-2xl (16px)
```

---

## 🚀 Szybki start (nowy blog)

1. **Skopiuj szablon z tego przewodnika**
2. **Zaktualizuj frontmatter**
3. **Dodaj swoją treść:**
   - Używaj jasnych tła
   - Ikony Lucide zamiast emoji
   - Formuły w boxach
   - `client:*` na komponentach
4. **Testuj lokalnie:**
   ```bash
   npm run dev
   # http://localhost:4321/pl/blog/pl/twoj-blog
   ```
5. **Przejdź przez checklist**
6. **Publikuj!**

---

## 📚 Zasoby

**Ikony Lucide:** https://lucide.dev/icons
**Recharts:** https://recharts.org/en-US/examples
**KaTeX:** https://katex.org/docs/supported.html
**Tailwind:** https://tailwindcss.com/docs

---

## ✨ Wzorcowa implementacja

Zobacz: `src/content/blog/pl/kluczowe-metryki-ecommerce-v2.mdx`

**Co robi dobrze:**
- ✅ Ikony Lucide
- ✅ Jasne tła
- ✅ Formuły w boxach
- ✅ Dyrektywy client
- ✅ Responsywny design
- ✅ Spójne kolory
- ✅ Wyraźne sekcje

**Użyj jako szablon!**

---

**Status:** ✅ Gotowe do użycia
**Historię zmian** sprawdzaj w `git log -- BLOG_GUIDE.md`
