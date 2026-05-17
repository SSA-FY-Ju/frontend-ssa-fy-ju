'use client';

/**\n * 파일 역할: 랜딩 배경의 별/유성 애니메이션을 생성하고 렌더합니다.\n */

import { useState, useEffect } from 'react';

export default function StarryBackground() {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; duration: number; color: string }>>([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      const rand = Math.random();
      let color = '';
      if (rand > 0.85) color = 'gold';
      else if (rand > 0.65) color = 'blue';
      else if (rand > 0.45) color = 'purple';

      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2,
        color,
      });
    }
    setStars(arr);
  }, []);

  useEffect(() => {
    const spawn = () => {
      const id = Math.random();
      const star = {
        id,
        x: 60 + Math.random() * 35,
        y: Math.random() * 40,
      };
      setShootingStars((prev) => [...prev, star]);
      setTimeout(() => setShootingStars((prev) => prev.filter((s) => s.id !== id)), 2000);
    };
    spawn();
    const interval = setInterval(spawn, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
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

        {/* Rotating galaxy spiral */}
        <g style={{ transformOrigin: '800px 450px', animation: 'galaxy-spin 200s linear infinite' }}>
          <path
            d="M 800 450 Q 900 350 950 300 Q 1000 250 1050 200 Q 1100 150 1120 100"
            fill="none"
            stroke="#6450c8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.12"
          />
          <path
            d="M 800 450 Q 700 350 650 300 Q 600 250 550 200 Q 500 150 480 100"
            fill="none"
            stroke="#6450c8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.12"
          />
          <path
            d="M 800 450 Q 900 550 950 600 Q 1000 650 1050 700 Q 1100 750 1120 800"
            fill="none"
            stroke="#8b7fbf"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.1"
          />
          <path
            d="M 800 450 Q 700 550 650 600 Q 600 650 550 700 Q 500 750 480 800"
            fill="none"
            stroke="#8b7fbf"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.1"
          />
        </g>

        {/* Nebula clouds */}
        <circle cx="300" cy="200" r="200" fill="url(#nebula)" opacity="0.6" />
        <circle cx="1300" cy="700" r="250" fill="url(#galaxyCore)" opacity="0.5" />
        <circle cx="800" cy="450" r="180" fill="url(#galaxyCore)" opacity="0.3" />

        {/* Subtle wave lines */}
        <g opacity="0.08" style={{ animation: 'wave-drift 25s ease-in-out infinite' }}>
          <path d="M 0 300 Q 400 280 800 300 T 1600 300" fill="none" stroke="#a8d8ff" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 600 Q 400 620 800 600 T 1600 600" fill="none" stroke="#d8b8ff" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>

      <div className="stars-layer">
        {stars.map((s, i) => (
          <div
            key={i}
            className={`star ${s.color}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="stars-layer">
        {shootingStars.map((s) => (
          <div
            key={s.id}
            className="shooting-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              animation: 'shoot 1.8s ease-out forwards',
            }}
          />
        ))}
      </div>
    </>
  );
}
