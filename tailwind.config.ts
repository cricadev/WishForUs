import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './utils/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#292521',
        ember: '#d9644a',
        blush: '#f7ddd5',
        linen: '#fbf7f2',
        sage: '#8fae98',
        fern: '#41695a',
        tide: '#6d95a8',
        cream: '#fffdf8'
      },
      boxShadow: {
        soft: '0 16px 40px rgba(41, 37, 33, 0.08)'
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji'
        ]
      }
    }
  },
  plugins: []
}
