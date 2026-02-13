# LiveSales Brand Assets

Kompletna identyfikacja wizualna LiveSales - logo, kolory, wytyczne.

## 📦 Zawartość

```
public/brand/
├── logo-full.svg          # Pełne logo (ikona + tekst)
├── logo-icon.svg          # Sama ikona
├── BRAND_IDENTITY.md      # Szczegółowe wytyczne brandowe
└── README.md              # Ten plik
```

## 🎨 Logo

### Warianty

#### 1. Logo Full (logo-full.svg)
**Kiedy używać:**
- Header strony
- Stopka
- Dokumenty marketingowe
- Prezentacje

**Minimalna szerokość:** 120px

#### 2. Logo Icon (logo-icon.svg)
**Kiedy używać:**
- Aplikacje mobilne
- Favicon (już w `/public/favicon.svg`)
- Social media profile pictures
- Małe przestrzenie (< 100px)

**Minimalna wielkość:** 24×24px

### Kolory Logo

Logo zawiera gradient:
- Start: `#3B82F6` (niebieski)
- End: `#8B5CF6` (fioletowy)
- Kierunek: 135deg (góra-lewo → dół-prawo)

### Zasady użycia

✅ **Można:**
- Używać logo na białym lub ciemnym tle
- Skalować proporcjonalnie
- Używać w materiałach marketingowych
- Używać w social media

❌ **Nie wolno:**
- Zmieniać kolorów gradientu
- Rozciągać nieproporcjonalnie
- Obracać (z wyjątkiem 90°, 180°, 270°)
- Dodawać efektów (cieni, outline)
- Umieszczać na zbyt zajętych tłach
- Używać logo mniejszego niż minimalne rozmiary

### Wolne pole (Clear Space)

Wokół logo zachowaj wolne pole równe **1/4 wysokości logo**.

```
┌─────────────────────┐
│     clear space     │
│  ┌─────────────┐   │
│  │    LOGO     │   │
│  └─────────────┘   │
│     clear space     │
└─────────────────────┘
```

## 🎨 Paleta Kolorów

### Primary

```css
--color-blue:    #3B82F6;
--color-purple:  #8B5CF6;
--gradient:      linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
```

### Secondary

```css
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error:   #EF4444;
--color-info:    #06B6D4;
```

### Neutrals

```css
--color-gray-950: #0F172A;  /* Tekst główny */
--color-gray-600: #475569;  /* Tekst secondary */
--color-gray-400: #94A3B8;  /* Disabled */
--color-gray-100: #F1F5F9;  /* Tło */
--color-white:    #FFFFFF;
```

### Tailwind Config

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'livesales-blue': '#3B82F6',
        'livesales-purple': '#8B5CF6',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      }
    }
  }
}
```

### CSS Variables

```css
:root {
  --brand-blue: #3B82F6;
  --brand-purple: #8B5CF6;
  --brand-gradient: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-purple) 100%);
}

.button-primary {
  background: var(--brand-gradient);
  color: white;
}
```

## 🔤 Typografia

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
```

### Wagi (Font Weights)
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Hierarchia
- H1: 48px / 3rem, Bold (700)
- H2: 36px / 2.25rem, Bold (700)
- H3: 30px / 1.875rem, Semibold (600)
- H4: 24px / 1.5rem, Semibold (600)
- Body: 16px / 1rem, Regular (400)
- Small: 14px / 0.875rem, Regular (400)

## 💅 Komponenty UI

### Przyciski

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  border: 2px solid;
  border-image: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%) 1;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
}
```

### Karty (Cards)

```css
.card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

### Spacing

Używamy skali 4px (zgodnie z Tailwind):
```
4px   → 0.25rem → spacing-1
8px   → 0.5rem  → spacing-2
12px  → 0.75rem → spacing-3
16px  → 1rem    → spacing-4
24px  → 1.5rem  → spacing-6
32px  → 2rem    → spacing-8
48px  → 3rem    → spacing-12
```

## 📱 Ikona Aplikacji (Favicon)

Favicon znajduje się w `/public/favicon.svg` i jest automatycznie używany przez stronę.

Zawiera uproszczoną wersję logo:
- Tło: gradient brand
- Ikona: białe słupki wzrostu
- Rozmiar: 32×32px (skalowalne SVG)

## 🖼️ Przykłady użycia

### W HTML

```html
<!-- Full Logo -->
<img src="/brand/logo-full.svg" alt="LiveSales" width="180">

<!-- Icon Only -->
<img src="/brand/logo-icon.svg" alt="LiveSales" width="48">
```

### W Astro/React

```tsx
import logoFull from '/brand/logo-full.svg';
import logoIcon from '/brand/logo-icon.svg';

function Header() {
  return (
    <header>
      <img src={logoFull} alt="LiveSales" width={180} />
    </header>
  );
}
```

### W CSS (jako tło)

```css
.logo-background {
  background-image: url('/brand/logo-icon.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

## 📄 Licencja

Logo i identyfikacja wizualna LiveSales są własnością LiveSales.
Użycie tylko za zgodą właściciela.

---

**Kontakt:** kontakt@livesales.pl
