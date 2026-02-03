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
          50: '#e6f6fc',
          100: '#ccedf9',
          200: '#99dbf3',
          300: '#66c9ed',
          400: '#30abe8', // Main primary
          500: '#2596d1',
          600: '#1d78a7',
          700: '#165a7e',
          800: '#0e3c54',
          900: '#071e2a',
        },
        secondary: {
          50: '#e6f5eb',
          100: '#ccebd7',
          200: '#99d7af',
          300: '#66c387',
          400: '#33af5f',
          500: '#078836', // Main secondary
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
