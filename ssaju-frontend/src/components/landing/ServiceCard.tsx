'use client';

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
      className={`relative p-6 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl shadow-blue-500/50'
          : 'border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30'
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
      {/* Light effect background */}
      {lightPos.x > 0 && lightPos.y > 0 && (
        <div
          className="absolute pointer-events-none opacity-30"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
            left: `calc(var(--mx) - 150px)`,
            top: `calc(var(--my) - 150px)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl font-bold text-blue-400">{number}</div>
          <div className="text-3xl">{icon}</div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-600">
          <span className="text-xs text-gray-500">예상 소요 시간</span>
          <span className="text-sm font-semibold text-blue-300">{duration}</span>
        </div>
      </div>
    </div>
  );
}
