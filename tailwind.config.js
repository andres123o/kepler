/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 3s ease-out',
        'slide-up': 'slideUp 3s ease-out',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 20s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '20%': { opacity: '0.65', transform: 'scale(1.05)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
          '80%': { opacity: '0.6', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0.15' },
          '25%': { transform: 'translateY(-30px) translateX(20px) scale(1.1)', opacity: '0.25' },
          '50%': { transform: 'translateY(-50px) translateX(-10px) scale(1.2)', opacity: '0.2' },
          '75%': { transform: 'translateY(-20px) translateX(15px) scale(1.05)', opacity: '0.25' },
        },
      }
    },
  },
  plugins: [],
}