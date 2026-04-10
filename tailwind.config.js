/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    'bg-food', 'bg-food-l', 'bg-food-m', 'text-food', 'border-food', 'border-food-m',
    'bg-act',  'bg-act-l',  'bg-act-m',  'text-act',  'border-act',  'border-act-m',
    'bg-feel', 'bg-feel-l', 'bg-feel-m', 'text-feel', 'border-feel', 'border-feel-m',
    'bg-ppl',  'bg-ppl-l',  'bg-ppl-m',  'text-ppl',  'border-ppl',  'border-ppl-m',
    'bg-rtn',  'bg-rtn-l',  'bg-rtn-m',  'text-rtn',  'border-rtn',  'border-rtn-m',
    'bg-cust', 'bg-cust-l', 'bg-cust-m', 'text-cust', 'border-cust', 'border-cust-m',
    'text-txt-m', 'text-txt-l',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FDF6EE',
        bg2: '#F5EDE0',
        card: '#FFFFFF',
        food: { DEFAULT: '#2A9D8F', l: '#E8F7F5', m: '#B2E4DF' },
        act:  { DEFAULT: '#E07C24', l: '#FEF3E8', m: '#FAD5AD' },
        feel: { DEFAULT: '#E05C7A', l: '#FDEDF1', m: '#F5B8C8' },
        ppl:  { DEFAULT: '#3A7DC9', l: '#EAF2FC', m: '#AECFEF' },
        rtn:  { DEFAULT: '#7B61D6', l: '#F0ECFD', m: '#C9BEED' },
        cust: { DEFAULT: '#D4A017', l: '#FDF6E3', m: '#F5DFA0' },
        txt:  { DEFAULT: '#2D2416', m: '#7A6A56', l: '#B5A08A' },
      },
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
        pill: '50px',
      },
      boxShadow: {
        card: '0 4px 14px rgba(0,0,0,0.08)',
        btn: '0 2px 8px rgba(0,0,0,0.08)',
        modal: '0 8px 32px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
}
