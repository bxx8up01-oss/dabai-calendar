/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(210 20% 98%)',
        foreground: 'hsl(222 20% 14%)',
        card: 'hsl(0 0% 100%)',
        'card-foreground': 'hsl(222 20% 14%)',
        popover: 'hsl(0 0% 100%)',
        'popover-foreground': 'hsl(222 20% 14%)',
        primary: 'hsl(225 70% 55%)',
        'primary-foreground': 'hsl(0 0% 100%)',
        secondary: 'hsl(220 15% 94%)',
        'secondary-foreground': 'hsl(222 20% 14%)',
        muted: 'hsl(220 15% 94%)',
        'muted-foreground': 'hsl(220 10% 45%)',
        accent: 'hsl(220 15% 94%)',
        'accent-foreground': 'hsl(222 20% 14%)',
        destructive: 'hsl(0 84% 60%)',
        'destructive-foreground': 'hsl(0 0% 100%)',
        border: 'hsl(220 13% 90%)',
        input: 'hsl(220 13% 90%)',
        ring: 'hsl(225 70% 55%)',
        success: 'hsl(130 54% 42%)',
        warning: 'hsl(26 90% 49%)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
