import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2b8cee',
          50: '#e6f4fd',
          100: '#cce9fb',
          200: '#99d3f7',
          300: '#66bdf3',
          400: '#2b8cee',
          500: '#2279d6',
          600: '#1a60ab',
          700: '#134880',
          800: '#0d3055',
          900: '#06182b',
        },
        secondary: {
          50: '#e6f5eb',
          100: '#ccebd7',
          200: '#99d7af',
          300: '#66c387',
          400: '#33af5f',
          500: '#078836',
          600: '#066d2b',
          700: '#055220',
          800: '#033716',
          900: '#021b0b',
        },
        success: {
          50: '#e6f5eb',
          500: '#078836',
          600: '#066d2b',
        },
        warning: {
          50: '#fef9e6',
          400: '#f5c542',
          500: '#f0b429',
          600: '#d9a323',
        },
        error: {
          50: '#fde8e8',
          500: '#dc2626',
          600: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
