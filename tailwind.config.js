/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./frontend/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "outline": "var(--color-outline)",
        "on-primary": "var(--color-on-primary)",
        "on-primary-container": "var(--color-on-primary-container)",
        "error": "var(--color-error)",
        "on-tertiary": "var(--color-on-tertiary)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "tertiary": "var(--color-tertiary)",
        "secondary": "var(--color-secondary)",
        "on-error-container": "var(--color-on-error-container)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "on-secondary": "var(--color-on-secondary)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
        "on-error": "var(--color-on-error)",
        "background": "var(--color-background)",
        "primary-container": "var(--color-primary-container)",
        "on-background": "var(--color-on-background)",
        "surface-variant": "var(--color-surface-variant)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        "surface-container": "var(--color-surface-container)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "outline-variant": "var(--color-outline-variant)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "primary-fixed": "var(--color-primary-fixed)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-bright": "var(--color-surface-bright)",
        "secondary-container": "var(--color-secondary-container)",
        "primary": "var(--color-primary)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "surface-dim": "var(--color-surface-dim)",
        "on-surface": "var(--color-on-surface)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        "error-container": "var(--color-error-container)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "tertiary-container": "var(--color-tertiary-container)",
        "inverse-surface": "var(--color-inverse-surface)",
        "surface-container-low": "var(--color-surface-container-low)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "surface": "var(--color-surface)",
        "surface-tint": "var(--color-surface-tint)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "surface-container-high": "var(--color-surface-container-high)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "inverse-primary": "var(--color-inverse-primary)"
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