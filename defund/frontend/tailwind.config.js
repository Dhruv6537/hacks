/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'defund': {
                    'bg': '#0B0F0C',
                    'bg-light': '#121816',
                    'neon': '#B6F35C',
                    'neon-dim': '#4ADE80',
                    'glass': 'rgba(255,255,255,0.05)',
                    'glass-border': 'rgba(182,243,92,0.2)',
                }
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            backdropBlur: {
                'xl': '24px',
            },
            boxShadow: {
                'neon': '0 0 20px rgba(182,243,92,0.4)',
                'neon-strong': '0 0 40px rgba(182,243,92,0.6)',
                'glass': '0 8px 32px rgba(0,0,0,0.3)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
