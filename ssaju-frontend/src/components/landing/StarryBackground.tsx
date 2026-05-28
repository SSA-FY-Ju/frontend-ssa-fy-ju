'use client';

/**
 * 파일 역할: 랜딩 배경의 별을 Canvas에 한 번만 그리고, 별똥별은 CSS 애니메이션으로 렌더합니다.
 * - 별: 정적 canvas, rAF 루프 없음
 * - 별똥별: DOM 직접 조작 + CSS animation (React 리렌더 없음)
 */

import { useEffect, useRef } from 'react';

const STAR_COUNT = 200;

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shootContainerRef = useRef<HTMLDivElement>(null);

  // 별 — 한 번만 그리고 종료
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars = Array.from({ length: STAR_COUNT }, () => {
      const rand = Math.random();
      let r = 255, g = 255, b = 255;
      if (rand > 0.85)      { r = 224; g = 230; b = 255; }
      else if (rand > 0.65) { r = 168; g = 216; b = 255; }
      else if (rand > 0.45) { r = 216; g = 184; b = 255; }
      return {
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,
        opacity: 0.3 + Math.random() * 0.65,
        r, g, b,
      };
    });

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  // 별똥별 — DOM 직접 조작, React 상태 없음
  useEffect(() => {
    const container = shootContainerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const spawn = () => {
      const el = document.createElement('div');
      el.className = 'shooting-star';
      el.style.left = `${60 + Math.random() * 35}%`;
      el.style.top = `${Math.random() * 40}%`;
      el.style.animation = 'shoot 1.8s ease-out forwards';
      container.appendChild(el);
      setTimeout(() => el.remove(), 2000);

      timeoutId = setTimeout(spawn, 3000 + Math.random() * 2000);
    };

    spawn();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <div className="sky" />
      <svg
        className="swirls"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d8b8ff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#6450c8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#2d3b7f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebula" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a8d8ff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#2d3b7f" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g style={{ transformOrigin: '800px 450px', animation: 'galaxy-spin 200s linear infinite', willChange: 'transform' }}>
          <path d="M 800 450 Q 900 350 950 300 Q 1000 250 1050 200 Q 1100 150 1120 100" fill="none" stroke="#6450c8" strokeWidth="3" strokeLinecap="round" opacity="0.12" />
          <path d="M 800 450 Q 700 350 650 300 Q 600 250 550 200 Q 500 150 480 100" fill="none" stroke="#6450c8" strokeWidth="3" strokeLinecap="round" opacity="0.12" />
          <path d="M 800 450 Q 900 550 950 600 Q 1000 650 1050 700 Q 1100 750 1120 800" fill="none" stroke="#8b7fbf" strokeWidth="2" strokeLinecap="round" opacity="0.1" />
          <path d="M 800 450 Q 700 550 650 600 Q 600 650 550 700 Q 500 750 480 800" fill="none" stroke="#8b7fbf" strokeWidth="2" strokeLinecap="round" opacity="0.1" />
        </g>

        <circle cx="300" cy="200" r="200" fill="url(#nebula)" opacity="0.6" />
        <circle cx="1300" cy="700" r="250" fill="url(#galaxyCore)" opacity="0.5" />
        <circle cx="800" cy="450" r="180" fill="url(#galaxyCore)" opacity="0.3" />

        <g opacity="0.08" style={{ animation: 'wave-drift 25s ease-in-out infinite' }}>
          <path d="M 0 300 Q 400 280 800 300 T 1600 300" fill="none" stroke="#a8d8ff" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 600 Q 400 620 800 600 T 1600 600" fill="none" stroke="#d8b8ff" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>

      <canvas ref={canvasRef} className="stars-layer" />
      <div ref={shootContainerRef} className="stars-layer" />
    </>
  );
}
