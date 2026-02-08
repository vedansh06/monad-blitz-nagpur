
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        gold: {
          50: 'hsl(var(--gold-50))',
          100: 'hsl(var(--gold-100))',
          200: 'hsl(var(--gold-200))',
          300: 'hsl(var(--gold-300))',
          400: 'hsl(var(--gold-400))',
          500: 'hsl(var(--gold-500))',
          600: 'hsl(var(--gold-600))',
          700: 'hsl(var(--gold-700))',
          800: 'hsl(var(--gold-800))',
          900: 'hsl(var(--gold-900))',
        },
        charcoal: {
          50: 'hsl(var(--charcoal-50))',
          100: 'hsl(var(--charcoal-100))',
          200: 'hsl(var(--charcoal-200))',
          300: 'hsl(var(--charcoal-300))',
          400: 'hsl(var(--charcoal-400))',
          500: 'hsl(var(--charcoal-500))',
          600: 'hsl(var(--charcoal-600))',
          700: 'hsl(var(--charcoal-700))',
          800: 'hsl(var(--charcoal-800))',
          900: 'hsl(var(--charcoal-900))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        "accordion-down": {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        "accordion-up": {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        "golden-pulse": {
          "0%, 100%": {
            opacity: "0.8",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.02)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
            opacity: "0.3",
          },
          "50%": {
            opacity: "0.8",
          },
          "100%": {
            backgroundPosition: "200% 0",
            opacity: "0.3",
          },
        },
        "golden-float": {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-8px) rotate(1deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "golden-pulse": "golden-pulse 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "golden-float": "golden-float 8s ease-in-out infinite",
      },
      backgroundImage: {
        'gradient-golden': 'linear-gradient(135deg, hsl(var(--gold-400)) 0%, hsl(var(--gold-600)) 100%)',
        'gradient-golden-dark': 'linear-gradient(135deg, hsl(var(--gold-600)) 0%, hsl(var(--gold-800)) 100%)',
        'gradient-charcoal': 'linear-gradient(180deg, hsl(var(--charcoal-600)) 0%, hsl(var(--charcoal-800)) 100%)',
        'gradient-golden-card': 'linear-gradient(145deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 20, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)',
        'gradient-golden-button': 'linear-gradient(135deg, hsl(var(--gold-500)) 0%, hsl(var(--gold-700)) 100%)',
        'gradient-golden-shimmer': 'linear-gradient(110deg, transparent 25%, rgba(255, 215, 0, 0.25) 50%, transparent 75%)',
        'gradient-progress-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
      },
      boxShadow: {
        'golden-glow': '0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.1)',
        'golden-inner': 'inset 0 2px 4px rgba(255, 215, 0, 0.1)',
        'charcoal-deep': '0 10px 40px rgba(0, 0, 0, 0.6)',
        'golden-border': '0 0 0 1px rgba(255, 215, 0, 0.2)',
        'progress-glow': '0 0 15px rgba(255, 215, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
      },
      borderColor: {
        'golden-border': 'rgba(255, 215, 0, 0.2)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
