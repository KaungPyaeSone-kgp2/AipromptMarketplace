/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  content: [
    "./index.html",
    "./frontend/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "outline": "#52525b",
        "on-primary": "#0a0012",
        "on-primary-container": "#ede9fe",
        "error": "#ef4444",
        "on-tertiary": "#001a12",
        "primary-fixed-dim": "#c4b5fd",
        "tertiary": "#34d399",
        "secondary": "#71717a",
        "on-error-container": "#fca5a5",
        "on-secondary-container": "#a1a1aa",
        "on-secondary": "#09090b",
        "on-primary-fixed-variant": "#5b21b6",
        "on-error": "#1a0000",
        "background": "#09090b",
        "primary-container": "#7c3aed",
        "on-background": "#fafafa",
        "surface-variant": "#18181b",
        "secondary-fixed-dim": "#71717a",
        "on-tertiary-fixed": "#003318",
        "surface-container": "#121215",
        "secondary-fixed": "#a1a1aa",
        "tertiary-fixed-dim": "#6ee7b7",
        "outline-variant": "#27272a",
        "inverse-on-surface": "#09090b",
        "primary-fixed": "#ede9fe",
        "surface-container-lowest": "#09090b",
        "surface-bright": "#18181b",
        "secondary-container": "#27272a",
        "primary": "#a78bfa",
        "on-primary-fixed": "#2e1065",
        "on-tertiary-container": "#bbf7d0",
        "surface-dim": "#0c0c0f",
        "on-surface": "#fafafa",
        "on-tertiary-fixed-variant": "#047857",
        "error-container": "#3b1111",
        "on-secondary-fixed": "#18181b",
        "tertiary-container": "#065f46",
        "inverse-surface": "#fafafa",
        "surface-container-low": "#0f0f12",
        "tertiary-fixed": "#bbf7d0",
        "surface": "#0c0c0f",
        "surface-tint": "#a78bfa",
        "on-secondary-fixed-variant": "#3f3f46",
        "surface-container-highest": "#1e1e22",
        "surface-container-high": "#18181b",
        "on-surface-variant": "#a1a1aa",
        "inverse-primary": "#5b21b6"
      },
      fontFamily: {
        "headline": ["Geist", "sans-serif"],
        "display": ["Geist", "sans-serif"],
        "body": ["Geist", "sans-serif"],
        "label": ["Geist", "sans-serif"]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}