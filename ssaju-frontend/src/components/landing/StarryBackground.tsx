'use client';

/**
 * 파일 역할: 랜딩 배경의 별/유성 애니메이션을 Canvas로 렌더합니다.
 * DOM 노드 200개 → canvas 1개, React 리렌더 없음.
 */

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  offset: number;
  period: number;
  r: number;
  g: number;
  b: number;
}

interface ShootingStar {
  startX: number;
  startY: number;
  t: number;
}

const STAR_COUNT = 200;

// 유성 이동 벡터 (CSS: translate(-280px, 120px) 와 동일)
const SHOOT_DX = -280;
const SHOOT_DY = 120;
const SHOOT_MAG = Math.sqrt(SHOOT_DX * SHOOT_DX + SHOOT_DY * SHOOT_DY);
// 꼬리는 이동 반대 방향
const TAIL_DIR_X = -SHOOT_DX / SHOOT_MAG;
const TAIL_DIR_Y = -SHOOT_DY / SHOOT_MAG;
const TAIL_LEN = 120;

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    // 별 데이터 생성 (한 번만)
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
      const rand = Math.random();
      let r = 255, g = 255, b = 255;
      if (rand > 0.85)      { r = 224; g = 230; b = 255; } // gold  (#e0e6ff)
      else if (rand > 0.65) { r = 168; g = 216; b = 255; } // blue  (#a8d8ff)
      else if (rand > 0.45) { r = 216; g = 184; b = 255; } // purple(#d8b8ff)
      return {
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,
        offset: Math.random() * Math.PI * 2,
        period: 2.5 + Math.random() * 2,
        r, g, b,
      };
    });

    const shoots: ShootingStar[] = [];
    let lastShoot = 0;
    let nextDelay = 3000 + Math.random() * 2000;
    let animId: number;
    let prevTime = 0;

    const frame = (now: number) => {
      const dt = prevTime ? Math.min((now - prevTime) / 1000, 0.05) : 0;
      prevTime = now;

      ctx.clearRect(0, 0, w, h);

      // 별 그리기
      for (const s of stars) {
        const cycle = (Math.sin(now / (s.period * 1000) * Math.PI * 2 + s.offset) + 1) / 2;
        ctx.globalAlpha = 0.4 + cycle * 0.6;
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.size * (0.8 + cycle * 0.35), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // 유성 생성
      if (now - lastShoot > nextDelay) {
        lastShoot = now;
        nextDelay = 3000 + Math.random() * 2000;
        shoots.push({
          startX: (0.6 + Math.random() * 0.35) * w,
          startY: Math.random() * 0.4 * h,
          t: 0,
        });
      }

      // 유성 그리기
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        s.t += dt / 1.8;
        if (s.t >= 1) { shoots.splice(i, 1); continue; }

        const opacity = s.t < 0.08
          ? s.t / 0.08
          : s.t > 0.7
          ? (1 - s.t) / 0.3
          : 1;

        const x = s.startX + SHOOT_DX * s.t;
        const y = s.startY + SHOOT_DY * s.t;
        const tx = x + TAIL_DIR_X * TAIL_LEN;
        const ty = y + TAIL_DIR_Y * TAIL_LEN;

        // 꼬리
        const grad = ctx.createLinearGradient(x, y, tx, ty);
        grad.addColorStop(0, `rgba(224,230,255,${(opacity * 0.8).toFixed(2)})`);
        grad.addColorStop(1, 'rgba(224,230,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // 헤드
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#e0e6ff';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
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

      <canvas
        ref={canvasRef}
        className="stars-layer"
      />
    </>
  );
}
