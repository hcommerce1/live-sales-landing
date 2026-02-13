# LiveSales - Brand Identity Guide

## Koncepcja
**"Data Pulse"** - dynamiczny, ultra-nowoczesny branding dla platformy analitycznej.
Logo reprezentuje puls danych w czasie rzeczywistym, przepływ informacji i "live" monitoring.

Minimalizm + geometria perfekcyjna + gradient niebieski = innowacja i profesjonalizm.

## 🎨 Paleta Kolorów

### Kolory Główne
- **Navy Blue**: `#1E40AF` - Stabilność, zaufanie, profesjonalizm
- **Sky Blue**: `#3B82F6` - Technologia, innowacja, klarowność
- **Gradient**: `linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)`

### Kolory Dodatkowe
- **Blue Medium**: `#2563EB` - Używany w przejściach gradientu
- **Success Green**: `#10B981`
- **Warning Orange**: `#F59E0B`
- **Error Red**: `#EF4444`
- **Info Cyan**: `#06B6D4`

### Neutralne
- **Gray 950**: `#0F172A` (tekst główny)
- **Gray 600**: `#475569` (tekst secondary)
- **Gray 400**: `#94A3B8` (disabled)
- **Gray 100**: `#F1F5F9` (tła)
- **White**: `#FFFFFF`

## 🎯 Logo - Data Pulse

### Symbolika
Logo przedstawia **falę danych** z węzłami (nodes):
- **Fala**: Ciągły przepływ danych, monitoring w czasie rzeczywistym
- **Węzły**: Punkty danych, pomiary, snapshoty
- **Gradient**: Progresja od ciemnego do jasnego = wzrost i rozwój
- **Akcenty**: Małe kropki sugerują dodatkowe dane "pulsujące" wokół

### Warianty
1. **Full Logo** (`logo-full.svg`) - Logo + wordmark "LiveSales" (260×60px)
2. **Icon Only** (`logo-icon.svg`) - Tylko symbol fali (64×64px)
3. **Favicon** (`favicon.svg`) - Uproszczona wersja na gradientowym tle (32×32px)

### Wersje Kolorystyczne
- **Primary**: Gradient granatowy→niebieski
- **White**: Biała fala na gradientowym/ciemnym tle (favicon)
- **Monochrome**: Czarna wersja dla dokumentów B&W

### Minimalne Rozmiary
- Full logo: min. 160px szerokości
- Icon only: min. 32px × 32px
- Favicon: 16px × 16px (automatycznie skalowalne SVG)

## 📐 Typografia

### Font Family
- **Logo & Headings**: **Outfit** (700) - Geometric display font
- **Body Text**: **Inter** (400, 500, 600) - Clean, readable sans-serif
- **Monospace**: 'Courier New', monospace (dla liczb/kodów)

### Outfit - Charakterystyka
- **Typ**: Geometric display sans-serif
- **Źródło**: Google Fonts (free, SIL Open Font License)
- **Dlaczego**: Ultra nowoczesny, perfekcyjne geometric circles, maksymalny minimalizm
- **Używany przez**: Modern tech startups, SaaS companies
- **Weights używane**:
  - Logo: Bold (700)
  - Headings H1-H2: Bold (700)
  - Headings H3-H6: SemiBold (600)

### Hierarchia Typograficzna
- **H1**: 3rem (48px), Outfit Bold (700)
- **H2**: 2.25rem (36px), Outfit Bold (700)
- **H3**: 1.875rem (30px), Outfit SemiBold (600)
- **H4**: 1.5rem (24px), Outfit SemiBold (600)
- **Body**: 1rem (16px), Inter Regular (400)
- **Small**: 0.875rem (14px), Inter Regular (400)

### Font Loading (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

### CSS Variables
```css
:root {
  --font-logo: 'Outfit', sans-serif;
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
```

## 🎨 Zastosowanie

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 16px;
}

/* Secondary Button */
.btn-secondary {
  background: white;
  border: 2px solid #1E40AF;
  color: #1E40AF;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
}
```

### Cards
- Border: `1px solid #E2E8F0`
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Radius: `0.75rem` (12px)

### Spacing
Używamy skali 4px (Tailwind):
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## 🎨 Gradient Variants

### Primary (domyślny)
```css
background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
```

### Horizontal (dla pasków, headerów)
```css
background: linear-gradient(90deg, #1E40AF 0%, #3B82F6 100%);
```

### Vertical (dla sidebars)
```css
background: linear-gradient(180deg, #1E40AF 0%, #3B82F6 100%);
```

### Radial (dla elementów centralnych)
```css
background: radial-gradient(circle, #1E40AF 0%, #3B82F6 100%);
```

## 📱 Responsive

Logo adaptuje się do różnych rozmiarów ekranu:
- **Desktop (>1024px)**: Full logo z tekstem (260px width)
- **Tablet (768px-1024px)**: Full logo, proporcjonalnie mniejszy
- **Mobile (<768px)**: Icon only w header (48px), full logo w footer

## ♿ Accessibility

- Kontrast tekstu: minimum 4.5:1 (WCAG AA)
- Gradient na białym tle: kontrast > 3:1
- Alt text dla logo: "LiveSales - Analiza i automatyzacja danych"
- Focus states: dodatkowy border + outline
- Outfit font zapewnia świetną czytelność nawet przy małych rozmiarach

## 🚫 Czego unikać

❌ Nie zmieniaj kolorów gradientu
❌ Nie rozciągaj logo nieproporcjonalnie
❌ Nie obracaj logo (wyjątek: 90°, 180°, 270°)
❌ Nie dodawaj efektów (drop shadow, glow, blur)
❌ Nie umieszczaj na zbyt zajętych tłach
❌ Nie używaj logo mniejszego niż minimalne rozmiary
❌ Nie zastępuj Outfit innym fontem w logo

## 📦 Pliki

```
public/
├── favicon.svg              # Favicon (32x32)
└── brand/
    ├── logo-full.svg        # Pełne logo z Outfit (260x60)
    ├── logo-icon.svg        # Sama ikona (64x64)
    ├── BRAND_IDENTITY.md    # Ten dokument
    └── README.md            # Instrukcje użycia
```

## 🎯 Font Pairing Rationale

**Dlaczego Outfit + Inter?**

- **Outfit (logo/headings)**: Ultra geometric, perfect circles, maksymalny modernizm - idealny dla tech brand identity
- **Inter (body)**: Humanist sans-serif, optimized for screens, świetna czytelność długich tekstów
- **Kontrast**: Geometric display (Outfit) + humanist body (Inter) = perfect hierarchy i visual distinction
- **Performance**: Oba fonty dostępne na Google Fonts, optimized for web, fast loading

**Inspiracje**:
- Linear (custom geometric)
- Notion (Graphik)
- Stripe (Söhne)
- NordVPN (Space Grotesk)

LiveSales używa Outfit jako bardziej accessible alternative do custom display fonts.

---

**Wersja:** 3.0 (Data Pulse + Outfit)
**Data aktualizacji:** 2025-02-13
**Font**: Outfit Bold (Google Fonts)
**Kontakt:** kontakt@livesales.pl
