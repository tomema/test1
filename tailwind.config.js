const colors = require('tailwindcss/colors')

module.exports = {
  mode: "jit",
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
    './pages/**/*.{js,jsx,ts,tsx,vue}',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      white: colors.white,
      gray: colors.gray,
      green: colors.green,
      blue: colors.sky,
      red: colors.rose,
      pink: colors.fuchsia,
      black: colors.black,
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  corePlugins: {
    resize: true
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        light: {
          'primary' : '#A78BFA',           /* Primary color */
          'primary-focus' : '#8B5CF6',     /* Primary color - focused */
          'primary-content' : '#ffffff',   /* Foreground content color to use on primary color */

          'secondary' : '#FCA5A5',         /* Secondary color */
          'secondary-focus' : '#F87171',   /* Secondary color - focused */
          'secondary-content' : '#ffffff', /* Foreground content color to use on secondary color */

          'accent' : '#6EE7B7',            /* Accent color */
          'accent-focus' : '#34D399',      /* Accent color - focused */
          'accent-content' : '#1f2937',    /* Foreground content color to use on accent color */

          'neutral' : '#3d4451',           /* Neutral color */
          'neutral-focus' : '#2a2e37',     /* Neutral color - focused */
          'neutral-content' : '#ffffff',   /* Foreground content color to use on neutral color */

          'base-100' : '#ffffff',          /* Base color of page, used for blank backgrounds */
          'base-200' : '#ECF0F1',          /* Base color, a little darker */
          'base-300' : '#BDC3C7',          /* Base color, even more darker */
          'base-content' : '#1f2937',      /* Foreground content color to use on base color */

          'info' : '#b9d5fd',              /* Info */
          'success' : '#059669',           /* Success */
          'warning' : '#F59E0B',           /* Warning */
          'error' : '#EF4444',             /* Error */
        },
        dark: {
          'primary' : '#1b2d48',           /* Primary color */
          'primary-focus' : '#2c456b',     /* Primary color - focused */
          'primary-content' : '#dfdfdf',   /* Foreground content color to use on primary color */

          'secondary' : '#7F1D1D',         /* Secondary color */
          'secondary-focus' : '#991B1B',   /* Secondary color - focused */
          'secondary-content' : '#dfdfdf', /* Foreground content color to use on secondary color */

          'accent' : '#064E3B',            /* Accent color */
          'accent-focus' : '#065F46',      /* Accent color - focused */
          'accent-content' : '#dfdfdf',    /* Foreground content color to use on accent color */

          'neutral' : '#171626',           /* Neutral color */
          'neutral-focus' : '#2a2e37',     /* Neutral color - focused */
          'neutral-content' : '#dfdfdf',   /* Foreground content color to use on neutral color */

          'base-100' : '#10171e',          /* Base color of page, used for blank backgrounds */
          'base-200' : '#0e141b',          /* Base color, a little darker */
          'base-300' : '#0c1218',          /* Base color, even more darker */
          'base-content' : '#dfdfdf',      /* Foreground content color to use on base color */

          'info' : '#3F88C5',              /* Info */
          'success' : '#064E3B',           /* Success */
          'warning' : '#D97706',           /* Warning */
          'error' : '#831843',             /* Error */
        }
      }
    ]
  }
}
