'use client';

/**\n * 파일 역할: 서비스 선택 화면에서 단일 서비스 카드를 렌더하고 선택 인터랙션을 제공합니다.\n */

import { useState, useRef } from 'react';

interface ServiceCardProps {
  id: string;
  number: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  isSelected?: boolean;
  onClick: () => void;
}

export default function ServiceCard({
  number,
  title,
  description,
  duration,
  icon,
  isSelected = false,
  onClick,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [lightPos, setLightPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLightPos({ x, y });
  };

  const handleMouseLeave = () => {
    setLightPos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative p-7 rounded-2xl backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden min-h-56 flex flex-col justify-between gap-4 ${
        isSelected
          ? 'border border-blue-300 bg-slate-700/30 shadow-2xl shadow-blue-500/25'
          : 'border border-slate-300/10 bg-slate-900/50 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-1'
      }`}
      style={
        {
          '--mx': `${lightPos.x}px`,
          '--my': `${lightPos.y}px`,
        } as React.CSSProperties & {
          '--mx': string;
          '--my': string;
        }
      }
    >
      {/* Radial light effect on mouse move */}
      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(252, 211, 77, 0.15), transparent 60%)',
          opacity: lightPos.x > 0 && lightPos.y > 0 ? 1 : 0,
          left: `calc(var(--mx) - 150px)`,
          top: `calc(var(--my) - 150px)`,
        }}
      />

      {/* Content section */}
      <div className="relative z-10">
        {/* Icon and number */}
        <div className="flex items-start justify-between mb-4">
          <div className={`text-2xl transition-all duration-300 ${
            isSelected ? 'scale-125' : 'scale-100 group-hover:scale-110'
          }`}>
            {icon}
          </div>
          <span className="font-serif italic text-2xl text-yellow-300/50">{number}</span>
        </div>

        {/* Title and description */}
        <h3 className="font-serif text-xl font-semibold text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-300/80">
          {description}
        </p>
      </div>

      {/* Bottom section with duration and arrow */}
      <div className="relative z-10 flex items-center justify-between gap-3 pt-4 border-t border-slate-600/30">
        <span className="text-xs uppercase tracking-wider text-slate-400/60">
          {duration}
        </span>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
          isSelected
            ? 'bg-blue-400/20 text-blue-300'
            : 'bg-yellow-300/10 text-yellow-300/70 group-hover:bg-yellow-300/20 group-hover:text-yellow-300/90'
        }`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
