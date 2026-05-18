'use client';

/**\n * 파일 역할: 서비스 선택 화면에서 단일 서비스 카드를 렌더하고 선택 인터랙션을 제공합니다.\n */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  id: string;
  number: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  index?: number;
  isSelected?: boolean;
  onClick: () => void;
}

export default function ServiceCard({
  id,
  number,
  title,
  description,
  duration,
  icon,
  index = 0,
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
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isSelected ? [1.02, 1.03, 1.02] : [1, 1.01, 1],
        rotate: isSelected ? [0, 0.3, 0] : [0, 0.12, 0],
      }}
      whileHover={{
        scale: isSelected ? 1.04 : 1.028,
        rotate: 0,
        transition: {
          scale: { type: 'spring', stiffness: 260, damping: 22, mass: 0.8 },
          rotate: { duration: 0.3 },
        },
      }}
      transition={{
        opacity: { duration: 0.55, ease: 'easeOut', delay: index * 0.12 },
        y: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 },
        scale: { type: 'spring', stiffness: 260, damping: 22, mass: 0.8 },
        rotate: { duration: 0.3 },
      }}
      className={`group relative min-h-56 cursor-pointer overflow-hidden rounded-3xl p-7 backdrop-blur-xl transition-[box-shadow,background-color] duration-150 flex flex-col justify-between gap-4 ${
        isSelected
          ? 'bg-gradient-to-br from-slate-900/95 via-indigo-950/85 to-slate-950/95 shadow-[0_24px_60px_rgba(244,114,182,0.34)]'
          : 'bg-gradient-to-br from-slate-900/85 via-indigo-950/50 to-slate-950/85 hover:shadow-[0_20px_52px_rgba(244,114,182,0.2)]'
      }`}
      aria-label={`${title} 카드`}
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
        className="absolute pointer-events-none transition-opacity duration-150"
        style={{
          width: '380px',
          height: '320px',
          background:
            'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(125, 211, 252, 0.22), transparent 62%)',
          opacity: lightPos.x > 0 && lightPos.y > 0 ? 1 : 0,
          left: 'calc(var(--mx) - 160px)',
          top: 'calc(var(--my) - 160px)',
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          opacity: isSelected ? [0.72, 0.96, 0.74] : [0.22, 0.38, 0.22],
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(115deg, rgba(251,113,133,0.20) 0%, rgba(244,114,182,0.16) 35%, rgba(196,181,253,0.16) 100%)',
          backgroundSize: '200% 200%',
        }}
      />

      <motion.div
        className="pointer-events-none absolute -left-20 -top-16 h-44 w-44 rounded-full bg-indigo-300/20 blur-3xl"
        animate={{
          x: [0, 18, -10, 0],
          y: [0, -14, 8, 0],
          scale: [0.95, 1.08, 0.96, 0.95],
          opacity: [0.22, 0.48, 0.24, 0.22],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: Number(number) * 0.4,
        }}
      />

      <motion.div
        className="pointer-events-none absolute -top-14 -right-10 h-40 w-40 rounded-full bg-rose-300/20 blur-3xl"
        animate={{
          x: [0, -14, 6, 0],
          y: [0, 8, -10, 0],
          scale: [1, 1.08, 0.96, 1],
          opacity: isSelected ? [0.5, 0.8, 0.55, 0.5] : [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content section */}
      <div className="relative z-10">
        {/* Icon and number */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`text-2xl transition-all duration-150 ${
              isSelected
                ? 'scale-125 drop-shadow-[0_0_14px_rgba(251,113,133,0.65)]'
                : 'scale-100 group-hover:scale-105'
            }`}
          >
            {icon}
          </div>
          <span
            className={`font-serif text-2xl italic transition-all duration-150 ${
              isSelected ? 'text-rose-100' : 'text-rose-100/70 group-hover:text-rose-100'
            }`}
          >
            {number}
          </span>
        </div>

        {/* Title and description */}
        <h3 className="mb-2 font-serif text-[22px] font-semibold tracking-tight text-slate-100">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-200/80">{description}</p>
      </div>

      {/* Bottom section with duration and arrow */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-t border-slate-300/15 pt-4">
        <span className="text-xs uppercase tracking-[0.16em] text-slate-300/65">{duration}</span>
        <motion.div
          whileHover={{ rotate: -8, x: 1 }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ${
            isSelected
              ? 'bg-rose-300/25 text-rose-100'
              : 'bg-rose-200/15 text-rose-100/80 group-hover:bg-rose-300/25 group-hover:text-rose-100'
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
      <span className="sr-only">{id}</span>
    </motion.div>
  );
}
