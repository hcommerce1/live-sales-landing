# LiveSales Typography System

Kompletny system typografii z pełną obsługą polskich znaków (ą, ć, ę, ł, ń, ó, ś, ź, ż).

## 📦 Fonty

### Outfit (Display/Logo/Headings)
- **Typ**: Geometric Display Sans-Serif
- **Źródło**: Google Fonts (free)
- **Weights**: 600 (SemiBold), 700 (Bold), 900 (Black)
- **Użycie**: Logo, nagłówki H1-H6, przyciski, UI elements
- **Charakter**: Ultra nowoczesny, geometryczny, minimalistyczny

### Inter (Body Text)
- **Typ**: Humanist Sans-Serif
- **Źródło**: Google Fonts (free)
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold)
- **Użycie**: Body text, paragrafy, opisy, UI text
- **Charakter**: Czytelny, neutralny, optymalizowany dla ekranów

### Polskie znaki
Oba fonty mają **pełne wsparcie** dla Latin Extended, w tym:
- Polskie litery: ą, ć, ę, ł, ń, ó, ś, ź, ż, Ą, Ć, Ę, Ł, Ń, Ó, Ś, Ź, Ż
- Automatyczne kerning i ligatury
- Optymalizacja renderingu dla diakrytyków

---

## 🎨 Klasy Utility

### Font Families

```html
<!-- Display font (Outfit) - dla nagłówków -->
<h1 class="font-display">Nagłówek z Outfit</h1>

<!-- Body font (Inter) - dla tekstu -->
<p class="font-body">Tekst z Inter</p>

<!-- Monospace - dla kodu/liczb -->
<code class="font-mono">const value = 123;</code>
```

### Preset Heading Styles

```html
<!-- Extra Large Heading (56px) -->
<h1 class="heading-xl">Analiza danych w czasie rzeczywistym</h1>

<!-- Large Heading (48px) -->
<h1 class="heading-lg">LiveSales Platform</h1>

<!-- Medium Heading (36px) -->
<h2 class="heading-md">Główne funkcje</h2>

<!-- Small Heading (24px) -->
<h3 class="heading-sm">Automatyzacja procesów</h3>
```

### Preset Body Styles

```html
<!-- Large Body (18px) -->
<p class="body-lg">
  Większy tekst dla lead paragrafów i ważnych informacji.
</p>

<!-- Medium Body (16px) - Default -->
<p class="body-md">
  Standardowy tekst dla większości contentu na stronie.
</p>

<!-- Small Body (14px) -->
<p class="body-sm">
  Mniejszy tekst dla dodatkowych informacji.
</p>
```

### UI & Special Text

```html
<!-- UI Text - dla buttonów, labels, navigation -->
<button class="text-ui">Zaloguj się</button>

<!-- Caption - dla podpisów, metadanych -->
<span class="text-caption">Ostatnia aktualizacja: 13.02.2025</span>

<!-- Gradient Text -->
<h1 class="text-gradient-brand">LiveSales</h1>
```

---

## 🎯 Przykłady Użycia

### Hero Section

```astro
---
// src/components/Hero.astro
---

<section class="py-20">
  <h1 class="heading-xl text-center mb-6">
    Analiza danych w <span class="text-gradient-brand">czasie rzeczywistym</span>
  </h1>

  <p class="body-lg text-center text-gray-600 max-w-2xl mx-auto mb-8">
    Jedno miejsce do analizy, porównywania i automatyzacji danych z różnych źródeł.
  </p>

  <div class="flex gap-4 justify-center">
    <button class="btn-primary">Rozpocznij za darmo</button>
    <button class="btn-secondary">Zobacz demo</button>
  </div>
</section>
```

### Features Section

```astro
<section class="py-16">
  <h2 class="heading-md text-center mb-12">
    Kluczowe <span class="text-gradient-brand">funkcje</span>
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="card">
      <h3 class="heading-sm mb-4">Gotowe dashboardy</h3>
      <p class="body-md text-gray-600">
        Analizuj dane w czasie rzeczywistym z intuicyjnych dashboardów.
      </p>
    </div>

    <div class="card">
      <h3 class="heading-sm mb-4">Automatyzacja</h3>
      <p class="body-md text-gray-600">
        Oszczędzaj czas dzięki automatycznym exportom i alertom.
      </p>
    </div>

    <div class="card">
      <h3 class="heading-sm mb-4">Integracje</h3>
      <p class="body-md text-gray-600">
        Łącz dane z Allegro, Baselinker, Excel i wielu innych źródeł.
      </p>
    </div>
  </div>
</section>
```

### Form with Polish Characters

```astro
<form class="max-w-md mx-auto">
  <label class="block mb-6">
    <span class="text-ui text-gray-700 mb-2 block">Imię i nazwisko</span>
    <input
      type="text"
      placeholder="Jan Kowalski"
      class="w-full px-4 py-3 border border-gray-300 rounded-lg font-body focus:outline-none focus:border-navy-700"
    />
  </label>

  <label class="block mb-6">
    <span class="text-ui text-gray-700 mb-2 block">Adres e-mail</span>
    <input
      type="email"
      placeholder="jan@przykład.pl"
      class="w-full px-4 py-3 border border-gray-300 rounded-lg font-body focus:outline-none focus:border-navy-700"
    />
  </label>

  <label class="block mb-6">
    <span class="text-ui text-gray-700 mb-2 block">Wiadomość</span>
    <textarea
      rows="4"
      placeholder="Twoja wiadomość..."
      class="w-full px-4 py-3 border border-gray-300 rounded-lg font-body focus:outline-none focus:border-navy-700"
    ></textarea>
  </label>

  <button type="submit" class="btn-primary w-full">
    Wyślij wiadomość
  </button>
</form>
```

---

## 🎨 Komponenty z Brand Styling

### Primary Button

```html
<button class="btn-primary">
  Rozpocznij teraz
</button>

<!-- Wynik: -->
<!-- Outfit Bold, gradient background, white text -->
```

### Secondary Button

```html
<button class="btn-secondary">
  Dowiedz się więcej
</button>

<!-- Wynik: -->
<!-- Outfit SemiBold, white bg, navy border -->
```

### Ghost Button

```html
<button class="btn-ghost">
  Zobacz więcej
</button>

<!-- Wynik: -->
<!-- Outfit SemiBold, gradient text, transparent bg -->
```

### Card

```html
<div class="card">
  <h3 class="heading-sm mb-3">Dashboard Analytics</h3>
  <p class="body-md text-gray-600">
    Kompleksowa analiza sprzedaży z różnych kanałów.
  </p>
</div>
```

### Badge

```html
<span class="badge-primary">Nowe</span>
<span class="badge-secondary">Pro</span>
```

---

## 📱 Responsive Typography

System automatycznie skaluje się na różnych urządzeniach:

```html
<!-- Mobile: 36px, Tablet: 42px, Desktop: 48px -->
<h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
  Responsive Heading
</h1>

<!-- Mobile: 16px, Desktop: 18px -->
<p class="text-base lg:text-lg font-body">
  Responsive body text
</p>
```

---

## 🔧 Tailwind Utilities

### Custom CSS Variables

```css
/* Dostępne w @theme */
--font-family-display: 'Outfit', sans-serif;
--font-family-sans: 'Inter', sans-serif;
--font-family-mono: 'Courier New', monospace;

--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-black: 900;
```

### Używanie w custom CSS

```css
.custom-heading {
  font-family: var(--font-family-display);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## ✅ Best Practices

### 1. Zawsze używaj preset classes

❌ **Źle:**
```html
<h1 style="font-family: Outfit; font-size: 48px; font-weight: 700;">
  Nagłówek
</h1>
```

✅ **Dobrze:**
```html
<h1 class="heading-lg">
  Nagłówek
</h1>
```

### 2. Zachowaj hierarchię fontów

❌ **Źle:**
```html
<p class="font-display">Body text z Outfit</p> <!-- Outfit tylko dla headings -->
```

✅ **Dobrze:**
```html
<h2 class="font-display">Nagłówek z Outfit</h2>
<p class="font-body">Body text z Inter</p>
```

### 3. Używaj semantic HTML

❌ **Źle:**
```html
<div class="heading-lg">Nagłówek</div>
```

✅ **Dobrze:**
```html
<h1 class="heading-lg">Nagłówek</h1>
```

### 4. Polskie znaki - nie potrzebujesz nic robić!

✅ **Działa out-of-the-box:**
```html
<h1 class="heading-lg">
  Łączność z różnymi źródłami danych
</h1>
<p class="body-md">
  Współpraca z Allegro, Baselinker i innymi platformami sprzedażowymi.
</p>
```

---

## 🚀 Przyszła rozbudowa

### Dodawanie nowych komponentów

```astro
---
// src/components/NewFeature.astro
---

<section class="py-16">
  <!-- Używaj istniejących klas -->
  <h2 class="heading-md mb-8">Nowa funkcja</h2>

  <div class="grid gap-6">
    <div class="card">
      <h3 class="heading-sm mb-4">Feature 1</h3>
      <p class="body-md text-gray-600">Opis...</p>
    </div>
  </div>
</section>
```

### Dodawanie nowych stylów

```css
/* W src/styles/global.css */

@layer components {
  .new-component {
    @apply font-display font-bold text-2xl;
    /* Zawsze używaj CSS variables i Tailwind utilities */
  }
}
```

---

## 📚 Cheat Sheet

| Element | Class | Font | Size | Weight |
|---------|-------|------|------|--------|
| Logo | `font-display font-bold` | Outfit | Custom | 700 |
| H1 Hero | `heading-xl` | Outfit | 56px | 700 |
| H1 | `heading-lg` | Outfit | 48px | 700 |
| H2 | `heading-md` | Outfit | 36px | 700 |
| H3 | `heading-sm` | Outfit | 24px | 600 |
| Lead text | `body-lg` | Inter | 18px | 400 |
| Body | `body-md` | Inter | 16px | 400 |
| Small text | `body-sm` | Inter | 14px | 400 |
| UI text | `text-ui` | Inter | 14px | 500 |
| Caption | `text-caption` | Inter | 12px | 400 |
| Button | `btn-primary` | Outfit | 16px | 600 |
| Code | `font-mono` | Mono | Inherit | 400 |

---

## 🔍 Debugging

### Sprawdź czy fonty się załadowały

```javascript
// W konsoli przeglądarki:
document.fonts.check('1em Outfit'); // true jeśli załadowany
document.fonts.check('1em Inter');  // true jeśli załadowany
```

### Sprawdź computed styles

```javascript
// Prawy przycisk myszy → Inspect → Computed
// Szukaj: font-family, font-weight
```

---

## 📞 Wsparcie

Pytania? Zobacz:
- [public/brand/BRAND_IDENTITY.md](../../public/brand/BRAND_IDENTITY.md) - Wytyczne brandowe
- [src/styles/global.css](./global.css) - Implementacja CSS
- [src/layouts/Layout.astro](../layouts/Layout.astro) - Font loading

---

**Ostatnia aktualizacja:** 2025-02-13
**Wersja:** 1.0
