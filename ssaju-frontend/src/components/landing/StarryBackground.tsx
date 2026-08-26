'use client';

/**
 * 파일 역할: 랜딩 배경(밤하늘 그라디언트·은하·별)을 렌더하고 별똥별을 주기적으로 띄웁니다.
 *
 * 별을 canvas 대신 CSS background-image(data URI SVG)로 그리는 이유 — 세 번의 실측 결과:
 *
 * 1) canvas: JS 실행 후에야 내용이 생겨 글씨보다 한참 늦게 나타났다
 *    (3440x1440/CPU4x 필름스트립: 글씨 6.4s, 별 10.2s)
 * 2) <circle> 200개: 서버 HTML 에 실려 즉시 보이지만 DOM 이 130 -> 335 로 늘어
 *    모바일 styleLayout 268ms -> 444ms(+66%), FCP +289ms
 * 3) <path> 20개 + preserveAspectRatio="slice": 노드는 줄었지만 좁은 화면에서
 *    별의 80%가 화면 밖으로 밀려났다(305px 화면에서 별 분포 -599~893)
 *
 * 그래서 타일 SVG 를 background-image 로 반복시킨다.
 * - DOM 노드 1개
 * - background-size 가 고정 px 이라 화면 비율과 무관하게 원이 찌그러지지 않는다
 * - 화면이 커지면 타일이 더 깔려 별 밀도가 일정하게 유지된다
 * - CSS 로 그려지므로 글씨와 같은 시점에 보인다
 *
 * 시드를 고정한 이유: 서버와 클라이언트가 같은 마크업을 내야 하이드레이션이 깨지지 않는다.
 */

import { useEffect, useRef } from 'react';

/** 타일 한 변의 px. 크게 잡아야 반복 패턴이 눈에 띄지 않는다. */
const TILE = 900;
/** 타일당 별 개수 — 기존 canvas 밀도(1280x720 에 200개)를 맞춘 값 */
const STARS_PER_TILE = 176;

const STAR_COLORS = ['#ffffff', '#e0e6ff', '#a8d8ff', '#d8b8ff'] as const;
/** 같은 색·같은 투명도끼리 <path> 하나로 합치기 위해 투명도를 5단계로 양자화한다 */
const OPACITY_STEPS = [0.35, 0.5, 0.65, 0.8, 0.95] as const;

/** mulberry32 — 고정 시드 PRNG */
function createRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 별 타일 SVG 를 만들어 CSS background-image 로 쓸 data URI 로 반환한다 */
const STAR_TILE_URL: string = (() => {
  const rand = createRandom(20260826);
  const buckets = new Map<string, string[]>();

  for (let i = 0; i < STARS_PER_TILE; i++) {
    const tint = rand();
    const color = STAR_COLORS[tint > 0.85 ? 1 : tint > 0.65 ? 2 : tint > 0.45 ? 3 : 0];
    const r = Math.round((rand() * 2 + 0.5) * 10) / 10;
    // 타일 경계에서 원이 잘리지 않도록 반지름만큼 안쪽에 배치한다
    const x = Math.round((r + rand() * (TILE - r * 2)) * 10) / 10;
    const y = Math.round((r + rand() * (TILE - r * 2)) * 10) / 10;
    const opacity =
      OPACITY_STEPS[Math.min(OPACITY_STEPS.length - 1, Math.floor(rand() * OPACITY_STEPS.length))];

    // 원 하나를 호 두 개로 그린다 (path 로 합치기 위해)
    const d = `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
    const key = `${color}|${opacity}`;
    const list = buckets.get(key);
    if (list) list.push(d);
    else buckets.set(key, [d]);
  }

  const paths = [...buckets.entries()]
    .map(([key, ds]) => {
      const [color, opacity] = key.split('|');
      return `<path d="${ds.join('')}" fill="${color}" opacity="${opacity}"/>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

export default function StarryBackground() {
  const shootContainerRef = useRef<HTMLDivElement>(null);

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

      {/* 별 — CSS 배경이라 글씨와 같은 시점에 보이고 DOM 노드는 1개다 */}
      <div
        className="stars-layer"
        aria-hidden="true"
        style={{ backgroundImage: STAR_TILE_URL, backgroundSize: `${TILE}px ${TILE}px` }}
      />

      <div ref={shootContainerRef} className="stars-layer" />
    </>
  );
}
