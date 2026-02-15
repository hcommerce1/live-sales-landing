# LiveSales Typography Dictionary / Słownik Typografii

**Wersja / Version:** 1.0
**Data / Date:** 2025-02-13
**Status:** ✅ Active

---

## 📖 O dokumencie / About This Document

### Polski
Ten dokument jest **centralnym słownikiem** mapującym przypadki użycia (use cases) na odpowiednie klasy typograficzne w projekcie LiveSales. Jego cel to:

- **Eliminacja zgadywania** - każdy developer wie dokładnie jaką klasę użyć
- **100% spójność** - wszystkie komponenty używają tego samego systemu
- **Szybszy development** - nie trzeba szukać w CSS, wystarczy sprawdzić tabelę
- **Wsparcie polskich znaków** - ą, ć, ę, ł, ń, ó, ś, ź, ż działają perfekcyjnie
- **Code review** - łatwa weryfikacja poprawności użycia klas

**Jak używać:**
1. Znajdź swój use case w tabeli (np. "główny nagłówek strony")
2. Użyj odpowiedniej klasy (np. `.heading-responsive-hero`)
3. Dodaj tylko layout classes z Tailwind (spacing, alignment, etc.)
4. **NIGDY** nie używaj inline typography (font-size, font-weight, color)

### English
This document is the **central dictionary** mapping use cases to typography classes in the LiveSales project. Its purpose is to:

- **Eliminate guesswork** - every developer knows exactly which class to use
- **100% consistency** - all components use the same system
- **Faster development** - no need to search CSS, just check the table
- **Polish character support** - ą, ć, ę, ł, ń, ó, ś, ź, ż work perfectly
- **Code review** - easy verification of correct class usage

**How to use:**
1. Find your use case in the table (e.g., "main page heading")
2. Use the corresponding class (e.g., `.heading-responsive-hero`)
3. Add only layout classes from Tailwind (spacing, alignment, etc.)
4. **NEVER** use inline typography (font-size, font-weight, color)

---

## 🚀 Szybki Przewodnik / Quick Reference

| Use Case (Polski) | Use Case (English) | Klasa / Class | Przykład / Example |
|---|---|---|---|
| Główny nagłówek strony | Main page heading | `.heading-responsive-hero` | Hero H1 |
| Nagłówek sekcji | Section heading | `.heading-responsive-section` | Features H2 |
| Etykieta sekcji (nad nagłówkiem) | Section eyebrow/label | `.text-eyebrow` | "FUNKCJE" nad H2 |
| Podtytuł sekcji (lead) | Section subtitle/lead | `.text-section-subtitle` | Tekst pod H2 |
| Tytuł karty | Card title | `.card-title` | Tytuł feature card |
| Opis karty | Card description | `.card-description` | Opis w feature card |
| Etykieta formularza | Form label | `.form-label` | Label dla input |
| Pole formularza | Form input | `.form-input` | Input/textarea |
| Link nawigacyjny | Navigation link | `.nav-link` | Link w navbar |
| Tytuł funkcji/benefitu | Feature/benefit title | `.feature-title` | Tytuł małej feature |
| Tekst funkcji/benefitu | Feature/benefit text | `.feature-text` | Opis małej feature |
| Element listy | List item | `.list-item` | Li w ul/ol |
| Nagłówek H1 | Heading H1 | `.heading-xl` | Static large heading |
| Nagłówek H2 | Heading H2 | `.heading-lg` | Static medium heading |
| Nagłówek H3 | Heading H3 | `.heading-md` | Static smaller heading |
| Nagłówek H4 | Heading H4 | `.heading-sm` | Static small heading |
| Body text duży | Large body text | `.body-lg` | 18px paragraph |
| Body text średni | Medium body text | `.body-md` | 16px paragraph |
| Body text mały | Small body text | `.body-sm` | 14px paragraph |
| Mały tekst UI | Small UI text | `.text-ui` | Buttons, badges |
| Caption/metadata | Caption/metadata | `.text-caption` | Image caption |

---

## 📚 Kategorie Szczegółowe / Detailed Categories

### 1️⃣ Nagłówki Stron i Sekcji / Page & Section Headings

#### `.heading-responsive-hero`
**Użyj gdy / Use when:** Główny nagłówek strony (Hero H1)
**Font:** Outfit Bold (700)
**Size:** 36px mobile → 48px tablet → 60px desktop
**Color:** Inherited (usually gray-900)

```tsx
// ✅ DOBRZE / GOOD
<h1 className="heading-responsive-hero tracking-tight">
  Łączność z różnymi źródłami
</h1>

// ❌ ŹLE / BAD
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
  Łączność z różnymi źródłami
</h1>
```

---

#### `.heading-responsive-section`
**Użyj gdy / Use when:** Nagłówek sekcji (Features, Pricing, etc.)
**Font:** Outfit Bold (700)
**Size:** 30px mobile → 36px tablet+
**Color:** Inherited (usually gray-900)

```tsx
// ✅ DOBRZE / GOOD
<h2 className="heading-responsive-section mt-3">
  Kluczowe funkcje LiveSales
</h2>

// ❌ ŹLE / BAD
<h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
  Kluczowe funkcje LiveSales
</h2>
```

---

#### `.text-eyebrow`
**Użyj gdy / Use when:** Mała etykieta NAD nagłówkiem (eyebrow/kicker)
**Font:** Inter SemiBold (600)
**Size:** 14px
**Style:** UPPERCASE, letter-spacing: 0.1em
**Color:** Primary blue

```tsx
// ✅ DOBRZE / GOOD
<span className="text-eyebrow">Funkcje</span>
<h2 className="heading-responsive-section mt-3">Zaawansowana Analiza</h2>

// ❌ ŹLE / BAD
<span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
  Funkcje
</span>
```

---

#### `.text-section-subtitle`
**Użyj gdy / Use when:** Podtytuł/lead POD nagłówkiem sekcji
**Font:** Inter Regular (400)
**Size:** 18px
**Line height:** 1.7
**Color:** Gray-600

```tsx
// ✅ DOBRZE / GOOD
<p className="text-section-subtitle mt-4 max-w-3xl mx-auto">
  Wszystko czego potrzebujesz do zarządzania danymi w jednym miejscu.
</p>

// ❌ ŹLE / BAD
<p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
  Wszystko czego potrzebujesz...
</p>
```

---

### 2️⃣ Karty i Komponenty / Cards & Components

#### `.card-title`
**Użyj gdy / Use when:** Tytuł karty (feature card, pricing card, etc.)
**Font:** Outfit Bold (700)
**Size:** 20px
**Line height:** 1.3
**Color:** Gray-900

```tsx
// ✅ DOBRZE / GOOD
<h3 className="card-title mb-2">
  Współpraca z Allegro
</h3>

// ❌ ŹLE / BAD
<h3 className="text-xl font-bold text-gray-900">
  Współpraca z Allegro
</h3>
```

---

#### `.card-description`
**Użyj gdy / Use when:** Opis w karcie
**Font:** Inter Regular (400)
**Size:** 16px
**Line height:** 1.6
**Color:** Gray-600

```tsx
// ✅ DOBRZE / GOOD
<p className="card-description">
  Automatyczna synchronizacja zamówień i stanów magazynowych.
</p>

// ❌ ŹLE / BAD
<p className="text-base text-gray-600">
  Automatyczna synchronizacja...
</p>
```

---

### 3️⃣ Formularze / Forms

#### `.form-label`
**Użyj gdy / Use when:** Etykieta dla pola formularza
**Font:** Inter Medium (500)
**Size:** 14px
**Display:** Block
**Margin:** 0.5rem bottom
**Color:** Gray-700

```tsx
// ✅ DOBRZE / GOOD
<label htmlFor="email" className="form-label">
  Adres email
</label>

// ❌ ŹLE / BAD
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  Adres email
</label>
```

---

#### `.form-input`
**Użyj gdy / Use when:** Input lub textarea (tylko typografia)
**Font:** Inter Regular (400)
**Size:** 16px
**Line height:** 1.5

**Note:** `.form-input` zawiera tylko typografię. Layout (padding, border, etc.) dodaj z Tailwind.

```tsx
// ✅ DOBRZE / GOOD
<input
  type="email"
  className="form-input w-full px-4 py-3 rounded-xl border border-gray-300"
/>

// ❌ ŹLE / BAD
<input
  type="email"
  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
/>
```

---

### 4️⃣ Nawigacja / Navigation

#### `.nav-link`
**Użyj gdy / Use when:** Link w nawigacji (navbar, footer)
**Font:** Inter Medium (500)
**Size:** 14px
**Color:** Gray-600 → Primary (hover)
**Transition:** 0.2s

```tsx
// ✅ DOBRZE / GOOD
<a href="#features" className="nav-link">
  Funkcje
</a>

// ❌ ŹLE / BAD
<a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary-600">
  Funkcje
</a>
```

---

### 5️⃣ Małe Elementy / Small Elements

#### `.feature-title`
**Użyj gdy / Use when:** Tytuł małego feature/benefitu (nie main card)
**Font:** Outfit SemiBold (600)
**Size:** 18px
**Line height:** 1.4

```tsx
// ✅ DOBRZE / GOOD
<h4 className="feature-title flex items-center gap-2">
  <CheckIcon /> Żadnych limitów
</h4>
```

---

#### `.feature-text`
**Użyj gdy / Use when:** Tekst opisu małego feature
**Font:** Inter Regular (400)
**Size:** 14px
**Line height:** 1.5
**Color:** Gray-600

```tsx
// ✅ DOBRZE / GOOD
<p className="feature-text mt-1">
  Nieograniczona liczba integracji i zapytań.
</p>
```

---

#### `.list-item`
**Użyj gdy / Use when:** Element listy (li w ul/ol)
**Font:** Inter Regular (400)
**Size:** 14px
**Line height:** 1.5
**Color:** Gray-600

```tsx
// ✅ DOBRZE / GOOD
<ul className="space-y-2">
  <li className="list-item flex items-start gap-2">
    <CheckIcon /> Automatyczne eksporty
  </li>
</ul>
```

---

### 6️⃣ Statyczne Nagłówki / Static Headings

Jeśli NIE potrzebujesz responsive sizing, użyj statycznych klas:

- `.heading-xl` - 56px (H1)
- `.heading-lg` - 48px (H2)
- `.heading-md` - 36px (H3)
- `.heading-sm` - 24px (H4)

**Note:** W większości przypadków używaj `.heading-responsive-*` zamiast statycznych.

---

### 7️⃣ Body Text

- `.body-lg` - 18px (large paragraph)
- `.body-md` - 16px (standard paragraph)
- `.body-sm` - 14px (small paragraph)

**Note:** Często łatwiej użyć `.text-section-subtitle`, `.card-description`, etc.

---

### 8️⃣ UI Text

#### `.text-ui`
**Użyj gdy / Use when:** Mały tekst UI (buttons, badges, tooltips)
**Font:** Inter Medium (500)
**Size:** 14px
**Letter spacing:** 0.01em

```tsx
// ✅ DOBRZE / GOOD
<span className="text-ui">
  Nowa funkcja
</span>
```

---

#### `.text-caption`
**Użyj gdy / Use when:** Caption, metadata, copyright
**Font:** Inter Regular (400)
**Size:** 12px
**Line height:** 1.4
**Color:** Gray-600

```tsx
// ✅ DOBRZE / GOOD
<p className="text-caption mt-2">
  © 2025 LiveSales. Wszelkie prawa zastrzeżone.
</p>
```

---

## ✅ Best Practices / Najlepsze Praktyki

### 1. Typografia vs Layout

**✅ DOBRZE / GOOD:**
```tsx
// Typography class + Layout Tailwind
<h1 className="heading-responsive-hero tracking-tight">
<p className="text-section-subtitle mt-4 max-w-3xl mx-auto">
<label className="form-label">
```

**❌ ŹLE / BAD:**
```tsx
// Inline typography
<h1 className="text-5xl font-bold text-gray-900 tracking-tight">
<p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
<label className="text-sm font-medium text-gray-700 block mb-2">
```

**Zasada / Rule:** Typography utility classes dla czcionek/kolorów. Tailwind dla margin/padding/alignment.

---

### 2. Responsive Headings

**✅ DOBRZE / GOOD:**
```tsx
// Używaj .heading-responsive-* dla hero i section headings
<h1 className="heading-responsive-hero">
<h2 className="heading-responsive-section">
```

**❌ ŹLE / BAD:**
```tsx
// Nie duplikuj responsive breakpoints
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
```

---

### 3. Polskie znaki / Polish Characters

**✅ DOBRZE / GOOD:**
```tsx
// System automatycznie obsługuje polskie znaki
<h1 className="heading-responsive-hero">
  Łączność z różnymi źródłami
</h1>
<p className="text-section-subtitle">
  Współpraca z Allegro, Baselinker i więcej.
</p>
```

**Test string:** "Łączność z różnymi źródłami. Współpraca. Żadnych problemów."

Wszystkie utility classes mają wbudowane `font-feature-settings` dla perfekcyjnego renderingu ą, ć, ę, ł, ń, ó, ś, ź, ż.

---

### 4. Layout Classes

**✅ DOBRZE / GOOD:**
```tsx
// Dodawaj layout classes według potrzeb
<h2 className="heading-responsive-section mt-8 text-center">
<p className="card-description max-w-md">
<div className="feature-title mb-4 flex items-center gap-2">
```

Layout classes to:
- Spacing: `mt-*`, `mb-*`, `p-*`, `gap-*`, etc.
- Alignment: `text-center`, `flex`, `items-center`, etc.
- Width: `max-w-*`, `w-full`, etc.
- Display: `flex`, `grid`, `block`, etc.

---

## 🚫 Częste Błędy / Common Mistakes

### ❌ Błąd 1: Inline Typography
```tsx
// ŹLE
className="text-3xl font-bold text-gray-900"

// DOBRZE
className="heading-responsive-section"
```

---

### ❌ Błąd 2: Duplikacja Responsive Breakpoints
```tsx
// ŹLE
className="text-4xl sm:text-5xl lg:text-6xl font-bold"

// DOBRZE
className="heading-responsive-hero"
```

---

### ❌ Błąd 3: Mieszanie Typography z Layout
```tsx
// ŹLE - wszystko inline
className="text-sm font-medium text-gray-700 block mb-2"

// DOBRZE - utility class + layout
className="form-label"  // .form-label ma już display:block i mb-0.5rem
```

---

### ❌ Błąd 4: Używanie Generic Classes dla Specific Use Cases
```tsx
// ŚREDNIO - zbyt generic
<span className="text-sm font-semibold uppercase text-primary-600">
  Funkcje
</span>

// DOBRZE - dedicated class
<span className="text-eyebrow">
  Funkcje
</span>
```

---

## 🔄 Mapowanie Migracji / Migration Mapping

Jeśli refactorujesz stary kod, użyj tej tabeli:

| Stary Pattern / Old Pattern | Nowa Klasa / New Class |
|---|---|
| `text-4xl sm:text-5xl lg:text-6xl font-bold` | `heading-responsive-hero` |
| `text-3xl sm:text-4xl font-bold` | `heading-responsive-section` |
| `text-primary-600 font-semibold text-sm uppercase tracking-wider` | `text-eyebrow` |
| `text-lg text-gray-600` | `text-section-subtitle` |
| `text-xl font-bold` | `card-title` |
| `text-base text-gray-600` | `card-description` |
| `block text-sm font-medium text-gray-700 mb-2` | `form-label` |
| `text-sm font-medium text-gray-600 hover:text-primary-600` | `nav-link` |
| `text-lg font-semibold` | `feature-title` |
| `text-sm text-gray-600` | `feature-text` |

---

## ✅ Checklist Code Review

Podczas code review, sprawdź:

- [ ] **Zero inline typography** - brak `font-size`, `font-weight`, `font-family` inline
- [ ] **Utility classes używane** - wszystkie teksty mają dedykowane klasy
- [ ] **Layout Tailwind OK** - margin, padding, alignment dodane poprawnie
- [ ] **Responsive zachowane** - breakpoints działają (jeśli były)
- [ ] **Polskie znaki testowane** - ą, ć, ę, ł, ń, ó, ś, ź, ż renderują się poprawnie
- [ ] **Kolory z CSS variables** - brak hardcoded HEX (chyba że w Tailwind)
- [ ] **Hover states zachowane** - interactive elements mają hover
- [ ] **Accessibility OK** - focus states, ARIA labels (jeśli były)

---

## 🔧 VS Code Tips

### Szybkie wyszukiwanie / Quick Search

Znajdź komponenty do refactoringu:

```bash
# Znajdź inline font-size
grep -r "text-4xl\|text-3xl\|text-xl" src/components/

# Znajdź inline font-weight
grep -r "font-bold\|font-semibold" src/components/

# Znajdź form labels do refactoringu
grep -r "text-sm font-medium text-gray-700" src/components/
```

### Auto-completion

Jeśli używasz Tailwind IntelliSense, twoje utility classes (`.heading-responsive-hero`, etc.) powinny się automatycznie sugerować.

---

## 📞 FAQ

**Q: Kiedy używać `.heading-responsive-hero` vs `.heading-xl`?**
A: `.heading-responsive-hero` dla hero H1 (responsive sizing). `.heading-xl` dla statycznych large headings.

**Q: Czy mogę łączyć utility classes?**
A: Tak! `className="heading-responsive-hero tracking-tight text-center"` jest OK. Utility class + layout Tailwind.

**Q: Co jeśli potrzebuję custom size?**
A: Najpierw sprawdź czy istniejąca klasa nie pasuje. Jeśli absolutnie potrzebujesz custom, dodaj nową utility class do `global.css` zamiast inline.

**Q: Jak testować polskie znaki?**
A: Użyj test stringa: "Łączność z różnymi źródłami. Współpraca z Allegro. Żadnych problemów z polskimi znakami: ą, ć, ę, ł, ń, ó, ś, ź, ż."

**Q: Co z dark mode?**
A: Obecnie kolory są light mode. Jeśli dodajesz dark mode, użyj CSS variables (już zdefiniowane) zamiast hardcoded colors.

---

## 📚 Powiązane Dokumenty / Related Documents

- [BRAND_IDENTITY.md](../../public/brand/BRAND_IDENTITY.md) - Brand colors, fonts, logo guidelines
- [TYPOGRAPHY_GUIDE.md](./TYPOGRAPHY_GUIDE.md) - Technical implementation guide
- [global.css](./global.css) - Source of truth dla wszystkich utility classes

---

**Wersja:** 1.0
**Ostatnia aktualizacja:** 2025-02-13
**Autor:** LiveSales Dev Team
**Kontakt:** kontakt@livesales.pl
