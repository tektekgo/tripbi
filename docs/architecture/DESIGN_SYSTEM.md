# TripBi Design System

> **Version:** 1.0
> **Last Updated:** 2026-01-18

## Overview

TripBi's design system is built to be a **sibling to Splitbi**, sharing the teal primary color while establishing its own identity for group travel planning. The system emphasizes:

- **Subtle warm backgrounds** for a welcoming, travel-friendly feel
- **Teal primary** color (shared brand identity with Splitbi)
- **Full dark mode support** for comfortable viewing in any lighting
- **Mobile-first design** with safe area support for notched devices

---

## Colors

### Brand Colors (from Logo)

| Name | Hex | Usage |
|------|-----|-------|
| Teal | `#14B8A6` | Primary brand color, left person + top pin |
| Blue | `#3B82F6` | Airplane pin accent |
| Coral | `#EF5350` | Right person accent |
| Orange | `#F59E0B` | Center pin accent |

### Primary Palette (Teal)

The primary color is teal, matching Splitbi for brand cohesion.

```
primary-50:  #F0FDFA
primary-100: #CCFBF1
primary-200: #99F6E4
primary-300: #5EEAD4
primary-400: #2DD4BF
primary-500: #14B8A6  ← Main brand teal
primary-600: #0D9488
primary-700: #0F766E
primary-800: #115E59
primary-900: #134E4A
primary-950: #042F2E
```

### Surface Colors

#### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `surface-light-DEFAULT` | `#FAFAF9` | Main background (subtle warm) |
| `surface-light-elevated` | `#FFFFFF` | Cards, modals |
| `surface-light-muted` | `#F5F5F4` | Secondary backgrounds |
| `surface-light-border` | `#E7E5E4` | Borders, dividers |

#### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `surface-dark-DEFAULT` | `#0F172A` | Main background (slate-900) |
| `surface-dark-elevated` | `#1E293B` | Cards, modals (slate-800) |
| `surface-dark-muted` | `#334155` | Secondary backgrounds (slate-700) |
| `surface-dark-border` | `#475569` | Borders, dividers (slate-600) |

### Semantic Colors

| Type | Light | Dark | Usage |
|------|-------|------|-------|
| Success | Green scale | Same | Confirmations, completed |
| Warning | Orange scale | Same | Pending, attention needed |
| Error | Coral scale | Same | Errors, destructive actions |
| Info | Blue scale | Same | Informational messages |

---

## Typography

### Font Family

**Inter** is the primary font, chosen for:
- Excellent readability at small sizes
- Variable font support
- Modern, professional aesthetic

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Font Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem | 1rem | Badges, labels |
| `text-sm` | 0.875rem | 1.25rem | Body text, buttons |
| `text-base` | 1rem | 1.5rem | Default body |
| `text-lg` | 1.125rem | 1.75rem | Emphasis |
| `text-xl` | 1.25rem | 1.75rem | Subheadings |
| `text-2xl` | 1.5rem | 2rem | Section headers |
| `text-3xl` | 1.875rem | 2.25rem | Page titles |
| `text-4xl` | 2.25rem | 2.5rem | Hero text |
| `text-5xl` | 3rem | 1.16 | Display |

---

## Component Classes

### Buttons

All buttons include touch target sizing (min 44x44px) for mobile accessibility.

```html
<!-- Primary Button -->
<button class="btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="btn-secondary">Secondary Action</button>

<!-- Outline Button -->
<button class="btn-outline">Outline Style</button>

<!-- Ghost Button -->
<button class="btn-ghost">Ghost Style</button>

<!-- Danger Button -->
<button class="btn-danger">Delete</button>
```

#### Size Variants

```html
<button class="btn btn-sm btn-primary">Small</button>
<button class="btn btn-md btn-primary">Medium (default)</button>
<button class="btn btn-lg btn-primary">Large</button>
```

### Form Inputs

```html
<!-- Standard Input -->
<input type="text" class="input" placeholder="Enter text...">

<!-- Input with Error -->
<input type="text" class="input input-error">
<p class="error-text">This field is required</p>

<!-- With Label -->
<label class="label">Email Address</label>
<input type="email" class="input">
<p class="helper-text">We'll never share your email</p>
```

### Cards

```html
<!-- Static Card -->
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>

<!-- Interactive Card (clickable) -->
<div class="card-interactive">
  <h3>Clickable Card</h3>
  <p>Hover and active states included</p>
</div>
```

### Badges

```html
<span class="badge-primary">Primary</span>
<span class="badge-success">Success</span>
<span class="badge-warning">Warning</span>
<span class="badge-error">Error</span>
<span class="badge-info">Info</span>
```

### Status Indicators

For proposals, bookings, and trip states:

```html
<span class="status-proposed">Proposed</span>
<span class="status-discussing">Discussing</span>
<span class="status-decided">Decided</span>
<span class="status-pending">Pending</span>
<span class="status-confirmed">Confirmed</span>
```

### Avatars

```html
<span class="avatar-sm">JS</span>
<span class="avatar-md">JS</span>
<span class="avatar-lg">JS</span>
```

### Loading Spinners

```html
<div class="spinner-sm"></div>
<div class="spinner-md"></div>
<div class="spinner-lg"></div>
```

---

## Layout Components

### Page Container

```html
<div class="page-container">
  <!-- Full-height background -->
</div>
```

### Content Container

```html
<div class="content-container">
  <!-- max-w-7xl, centered, responsive padding -->
</div>
```

### Page Header

```html
<header class="page-header">
  <div class="content-container">
    <!-- Header content -->
  </div>
</header>
```

### Section

```html
<section class="section">
  <!-- Vertical padding for sections -->
</section>
```

---

## Dark Mode

Dark mode is activated by adding the `dark` class to the `<html>` element:

```html
<html class="dark">
```

All component classes automatically adapt to dark mode. No additional classes needed.

### Implementation

Use the ThemeProvider (to be built) to manage dark mode:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark')

// Check current mode
const isDark = document.documentElement.classList.contains('dark')
```

### Color Adjustments in Dark Mode

- Primary teal is slightly brighter (`primary-400` vs `primary-500`)
- Backgrounds use slate tones instead of warm grays
- Shadows are deeper and more pronounced

---

## Mobile Utilities

### Safe Area Insets

For devices with notches (iPhone X+, Android punch-holes):

```html
<header class="safe-top">Header with notch padding</header>
<footer class="safe-bottom">Footer with home bar padding</footer>

<!-- Horizontal safe areas -->
<div class="safe-x">Left and right padding</div>
<div class="safe-y">Top and bottom padding</div>
```

### Touch Targets

Ensure all interactive elements meet minimum touch target size:

```html
<button class="touch-target">At least 44x44px</button>
```

---

## Utility Classes

### Scrollbar Styling

```html
<!-- Hide scrollbar but keep functionality -->
<div class="no-scrollbar overflow-auto">
  Scrollable content
</div>

<!-- Custom styled scrollbar -->
<div class="custom-scrollbar overflow-auto">
  Scrollable content
</div>
```

### Text Balance

For better typography on headings:

```html
<h1 class="text-balance">Long heading that wraps nicely</h1>
```

---

## Tailwind Classes Reference

### Common Patterns

```html
<!-- Text colors (auto dark mode) -->
<p class="text-secondary-900 dark:text-secondary-50">Primary text</p>
<p class="text-secondary-600 dark:text-secondary-300">Secondary text</p>
<p class="text-secondary-400">Muted text (same in both modes)</p>

<!-- Backgrounds -->
<div class="bg-surface-light dark:bg-surface-dark-DEFAULT">Main bg</div>
<div class="bg-surface-light-elevated dark:bg-surface-dark-elevated">Card bg</div>

<!-- Borders -->
<div class="border border-surface-light-border dark:border-surface-dark-border">
  Bordered element
</div>

<!-- Primary color usage -->
<button class="bg-primary-500 hover:bg-primary-600 text-white">
  Primary button
</button>
<a class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
  Primary link
</a>
```

---

## Relationship to Splitbi

TripBi and Splitbi share:
- **Primary teal color** (`#14B8A6`)
- **Font family** (Inter)
- **Component patterns** (button styles, card shadows)

TripBi differentiates with:
- **Warm neutral backgrounds** (vs pure white/gray in Splitbi)
- **Travel-focused accent colors** (coral, blue, orange from logo)
- **Status system** for proposals and bookings

---

## File References

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Color definitions, font config |
| `src/styles/index.css` | CSS variables, component classes |
| `public/TripBi-svg.svg` | Logo (source of brand colors) |

---

*This design system ensures visual consistency across TripBi while maintaining brand cohesion with the broader Bi Suite family.*
