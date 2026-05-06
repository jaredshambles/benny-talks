/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        food:  { DEFAULT: '#2A9D8F', light: '#E8F7F5' },
        act:   { DEFAULT: '#E07C24', light: '#FEF3E8' },
        feel:  { DEFAULT: '#E05C7A', light: '#FDEDF1' },
        ppl:   { DEFAULT: '#3A7DC9', light: '#EAF2FC' },
        rtn:   { DEFAULT: '#7B61D6', light: '#F0ECFD' },
        cust:  { DEFAULT: '#D4A017', light: '#FDF6E3' },
      },
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
