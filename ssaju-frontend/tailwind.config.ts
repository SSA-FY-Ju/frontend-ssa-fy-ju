import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 밤 테마 (Night theme)
        night: {
          900: '#0a0e27', // 깊은 밤색 (배경)
          800: '#1a1f3a', // 어두운 밤색
          700: '#2a3050', // 중간 밤색
        },
        // 별 테마 (Star theme)
        star: {
          500: '#ffd700', // 진한 황금색 (메인 강조)
          400: '#ffed4e', // 밝은 황금색 (서브 강조)
          300: '#fff8a8', // 아주 밝은 황금색 (라이트)
        },
      },
      fontFamily: {
        body: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        // 반응형 폰트 크기
        // 데스크톱 (1024px 이상)
        'xs': ['12px', { lineHeight: '1.5' }], // desktop: 12px
        'sm': ['14px', { lineHeight: '1.5' }], // desktop: 14px
        'base': ['16px', { lineHeight: '1.5' }], // desktop: 16px
        'lg': ['18px', { lineHeight: '1.6' }], // desktop: 18px
        'xl': ['20px', { lineHeight: '1.6' }], // desktop: 20px
        '2xl': ['24px', { lineHeight: '1.7' }], // desktop: 24px
        '3xl': ['28px', { lineHeight: '1.8' }], // desktop: 28px
        '4xl': ['32px', { lineHeight: '1.8' }], // desktop: 32px
      },
      spacing: {
        // 일관된 간격 체계
        'xs': '0.25rem', // 4px
        'sm': '0.5rem', // 8px
        'md': '1rem', // 16px
        'lg': '1.5rem', // 24px
        'xl': '2rem', // 32px
        '2xl': '2.5rem', // 40px
        '3xl': '3rem', // 48px
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up-subtle': 'slideUpSubtle 0.3s ease-out',
        'pulse-star': 'pulseStar 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUpSubtle: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseStar: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      screens: {
        'xs': '360px',   // 모바일 최소
        'sm': '640px',   // 모바일/태블릿
        'md': '768px',   // 태블릿
        'lg': '1024px',  // 데스크톱 최소 (plan.md 기준)
        'xl': '1280px',  // 데스크톱 와이드
        '2xl': '1536px', // 초대형 스크린
      },
    },
  },
  plugins: [],
};

export default config;
