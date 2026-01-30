/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Mode Colors
        'cyber-green': '#00ff00',
        'cyber-dark': '#0a0a0a',
        'cyber-gray': '#1a1a1a',
        'cyber-border': '#333333',
        'cyber-accent': '#ff6600',
        'cyber-blue': '#00ccff',
        'cyber-red': '#ff0040',
        
        // Light Mode Colors
        'light-primary': '#2563eb',
        'light-secondary': '#64748b',
        'light-accent': '#f59e0b',
        'light-success': '#10b981',
        'light-warning': '#f59e0b',
        'light-error': '#ef4444',
        'light-bg': '#ffffff',
        'light-surface': '#f8fafc',
        'light-border': '#e2e8f0',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'cyber': ['Orbitron', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 3.5s steps(40, end), blink 1s infinite',
        'terminal-cursor': 'blink 1s infinite',
        'matrix': 'matrix 20s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            textShadow: '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00',
            boxShadow: '0 0 5px #00ff00'
          },
          '100%': { 
            textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
            boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00'
          }
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        }
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 0, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 204, 255, 0.5)',
        'cyber': '0 0 10px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}