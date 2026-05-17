'use client';

interface BrandProps {
  onClick?: () => void;
}

export default function Brand({ onClick }: BrandProps) {
  return (
    <div className="brand" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <span className="brand-mark">
        <svg viewBox="0 0 32 32" width="28" height="28">
          <defs>
            <radialGradient id="bm" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fcd34d" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="6" fill="url(#bm)" />
          <circle cx="16" cy="16" r="11" fill="none" stroke="#fcd34d" strokeWidth="0.6" opacity="0.6" />
          <circle cx="16" cy="16" r="14" fill="none" stroke="#a5b4fc" strokeWidth="0.4" opacity="0.4" />
          <circle cx="6" cy="8" r="1" fill="#fef3c7" />
          <circle cx="26" cy="24" r="0.8" fill="#a5b4fc" />
        </svg>
      </span>
      SSAju
      <span className="brand-sub">사주로 풀어보는 커리어</span>
    </div>
  );
}
