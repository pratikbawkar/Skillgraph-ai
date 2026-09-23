import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          dark: '#4338ca',
          light: '#e0e7ff',
        },
        role: {
          cloud: '#0ea5e9',
          devops: '#f59e0b',
          python: '#10b981',
        },
      },
    },
  },
  plugins: [],
};

export default config;
