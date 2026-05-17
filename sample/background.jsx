/* global React */
const { useState, useEffect, useRef } = React;

/* ============== Starry Night background SVG (swirls + impasto) ============== */
window.StarryBackground = function StarryBackground() {
  return (
    <>
      <div className="sky" />
      <svg className="swirls" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="impasto" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="5"/>
            <feDisplacementMap in="SourceGraphic" scale="6"/>
          </filter>
          <radialGradient id="moonGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="1"/>
            <stop offset="40%" stopColor="#fcd34d" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="1"/>
            <stop offset="50%" stopColor="#fcd34d" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Big swirl — central */}
        <g filter="url(#impasto)" style={{ transformOrigin: '800px 400px', animation: 'spin-slow 120s linear infinite' }}>
          <path d="M 600 400 Q 700 250 900 350 Q 1100 450 1000 600 Q 850 750 700 650 Q 500 550 600 400 Z"
                fill="none" stroke="#4a7fb8" strokeWidth="14" strokeLinecap="round" opacity="0.5"/>
          <path d="M 650 400 Q 730 300 880 380 Q 1020 470 950 580 Q 830 690 730 620 Q 580 530 650 400 Z"
                fill="none" stroke="#a5b4fc" strokeWidth="8" strokeLinecap="round" opacity="0.6"/>
          <path d="M 700 410 Q 760 340 850 400 Q 950 470 900 550 Q 820 630 760 580 Q 660 510 700 410 Z"
                fill="none" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
        </g>

        {/* Second swirl — upper right */}
        <g filter="url(#impasto)" style={{ transformOrigin: '1300px 200px', animation: 'spin-slow 90s linear infinite reverse' }}>
          <path d="M 1200 200 Q 1280 120 1380 180 Q 1450 260 1380 320 Q 1280 380 1220 320 Q 1140 260 1200 200 Z"
                fill="none" stroke="#3b6db8" strokeWidth="10" strokeLinecap="round" opacity="0.55"/>
          <path d="M 1240 200 Q 1290 150 1360 200 Q 1410 250 1360 300 Q 1290 340 1250 300 Q 1190 250 1240 200 Z"
                fill="none" stroke="#a5b4fc" strokeWidth="5" strokeLinecap="round" opacity="0.65"/>
        </g>

        {/* Wind streams — horizontal flowing brushstrokes */}
        <g filter="url(#impasto)" opacity="0.4">
          <path d="M 0 100 Q 200 80 400 110 T 800 90 T 1200 100 T 1600 80" fill="none" stroke="#4a7fb8" strokeWidth="6" strokeLinecap="round"/>
          <path d="M 0 180 Q 250 200 500 170 T 900 190 T 1300 175 T 1600 200" fill="none" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round"/>
          <path d="M 0 720 Q 300 700 600 730 T 1100 710 T 1600 730" fill="none" stroke="#1e4490" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 0 800 Q 350 820 700 800 T 1300 810 T 1600 800" fill="none" stroke="#16306b" strokeWidth="10" strokeLinecap="round"/>
        </g>

        {/* Moon glow */}
        <circle cx="1320" cy="180" r="80" fill="url(#moonGrad)" opacity="0.5"/>
        <circle cx="1320" cy="180" r="32" fill="#fcd34d" opacity="0.9"/>

        {/* Star halos */}
        <circle cx="240" cy="160" r="60" fill="url(#starGrad)" opacity="0.4"/>
        <circle cx="240" cy="160" r="14" fill="#fef3c7"/>
        <circle cx="500" cy="240" r="40" fill="url(#starGrad)" opacity="0.35"/>
        <circle cx="500" cy="240" r="8" fill="#fef3c7"/>
        <circle cx="1100" cy="120" r="40" fill="url(#starGrad)" opacity="0.35"/>
        <circle cx="1100" cy="120" r="9" fill="#fef3c7"/>
      </svg>

      <Stars />
      <ShootingStars />
    </>
  );
};

function Stars() {
  const stars = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
        color: Math.random() > 0.65 ? (Math.random() > 0.5 ? 'gold' : 'blue') : ''
      });
    }
    return arr;
  }, []);
  return (
    <div className="stars-layer">
      {stars.map((s, i) => (
        <div key={i} className={`star ${s.color}`} style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`
        }} />
      ))}
    </div>
  );
}

function ShootingStars() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const spawn = () => {
      const id = Math.random();
      const star = {
        id,
        x: 60 + Math.random() * 35,
        y: Math.random() * 40
      };
      setStars(prev => [...prev, star]);
      setTimeout(() => setStars(prev => prev.filter(s => s.id !== id)), 2000);
    };
    spawn();
    const interval = setInterval(spawn, 6500 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="stars-layer">
      {stars.map(s => (
        <div key={s.id} className="shooting-star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          animation: 'shoot 1.8s ease-out forwards'
        }} />
      ))}
    </div>
  );
}

/* ============== Brand mark ============== */
window.Brand = function Brand({ onClick }) {
  return (
    <div className="brand" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <span className="brand-mark">
        <svg viewBox="0 0 32 32" width="28" height="28">
          <defs>
            <radialGradient id="bm" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef3c7"/>
              <stop offset="100%" stopColor="#fcd34d"/>
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="6" fill="url(#bm)"/>
          <circle cx="16" cy="16" r="11" fill="none" stroke="#fcd34d" strokeWidth="0.6" opacity="0.6"/>
          <circle cx="16" cy="16" r="14" fill="none" stroke="#a5b4fc" strokeWidth="0.4" opacity="0.4"/>
          <circle cx="6" cy="8" r="1" fill="#fef3c7"/>
          <circle cx="26" cy="24" r="0.8" fill="#a5b4fc"/>
        </svg>
      </span>
      SSAju
      <span className="brand-sub">사주로 풀어보는 커리어</span>
    </div>
  );
};

Object.assign(window, { StarryBackground: window.StarryBackground, Brand: window.Brand });
