# 2. UI/UX Guidelines

This document defines the design system, layout structure, and component styling rules for the IMAS frontend. It is extracted from KTUN OBIS and LMS visual references.

## 1. Brand Colors

| Token       | Hex       | Usage                                     |
|-------------|-----------|-------------------------------------------|
| `navy`      | `#003366` | Primary background (sidebar, header)      |
| `red`       | `#C8102E` | Accent actions, errors, important badges  |
| `gold`      | `#FFD200` | Highlights, notifications, CTAs           |
| `white`     | `#FFFFFF` | Cards, content backgrounds                |
| `gray-50`   | `#F8FAFC` | Table row hover, page background           |
| `gray-200`  | `#E2E8F0` | Borders, dividers                         |
| `gray-500`  | `#64748B` | Muted text                                |
| `gray-900`  | `#0F172A` | Main text                                 |

## 2. Typography

- **Font family:** System sans-serif stack: `"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- **Base size:** `16px` (`text-base`).
- **Headings:** Bold, with 1.2 line-height. Use `text-xl`, `text-2xl`, `text-3xl`.
- **Small text:** `text-sm` for table cells, `text-xs` for labels/help.

## 3. Spacing

- Use a 4px spacing scale: `0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem`.
- **Page padding:** `p-6`.
- **Card padding:** `p-6` or `p-4`.
- **Button padding:** `px-4 py-2`.
- **Table cell padding:** `px-4 py-3`.

## 4. Layout Structure

### Login Page (split-screen)

- **Left half (60% width):** KTUN branding, logo, image, dark navy background with red/gold accents.
- **Right half (40% width):** White card with form fields (email, password), submit button (red or gold), forgot password link.

### Authenticated Layout

- **Sidebar (fixed 256px wide):** Dark navy background. Contains logo, navigation links with icons, user info at bottom.
- **Topbar (64px height):** White background with page title, notification bell, user avatar.
- **Content area:** Light gray background (`gray-50`), padding `p-6`.

## 5. Tailwind Configuration

Create `tailwind.config.js` with these custom colors and spacing.

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#003366',
        red: '#C8102E',
        gold: '#FFD200',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

## 6. Component Patterns

### Buttons

- **Primary:** Solid navy background, white text, hover: navy-700.
- **Danger:** Solid red background, white text.
- **Success:** Solid gold background, navy text.
- **Outline:** White background, navy border, navy text.

### Inputs

- **Label:** `text-sm font-medium text-gray-700`.
- **Input field:** `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy`.
- **Error text:** `mt-1 text-sm text-red`.

### Tables

- **Header:** `bg-navy text-white`, uppercase text‑xs.
- **Rows:** Alternate white and `gray-50`, hover `gray-100`.
- **Actions:** Icons or small buttons aligned right.

### Modals

- **Overlay:** Fixed inset‑0 bg‑black/50.
- **Panel:** `bg-white rounded-lg p-6 max-w-md w-full`.

### Tabs

- **Active:** `border-b-2 border-navy text-navy`.
- **Inactive:** `border-b-2 border-transparent text-gray-500`.

### Toasts

- **Success:** green background, white text.
- **Error:** red background, white text.

## 7. Accessibility

- Maintain contrast ratio ≥ 4.5:1 for text.
- Focus states visible: `focus:ring-2 focus:ring-navy`.
- All form inputs have labels.

## 8. Icons

Use `lucide-react` for consistent iconography (sidebar, actions, notifications).