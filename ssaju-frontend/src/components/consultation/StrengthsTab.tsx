'use client';

/** 강점 탭 (T069) */

interface StrengthsTabProps {
  strengths: string[];
}

export function StrengthsTab({ strengths }: StrengthsTabProps) {
  return (
    <ul className="flex flex-col gap-4">
      {strengths.map((strength, i) => (
        <li
          key={i}
          className="animate-item flex gap-4 items-center"
          style={{
            backdropFilter: 'blur(12px)',
            background: 'rgba(245,158,11,0.05)',
            border: '1px solid rgba(245,158,11,0.18)',
            borderRadius: 20,
            padding: '20px 24px',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* Star icon with glow */}
          <span
            aria-hidden="true"
            style={{
              fontSize: 22,
              flexShrink: 0,
              color: '#fbbf24',
              filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))',
            }}
          >
            ★
          </span>

          <p
            className="text-white font-semibold leading-snug"
            style={{ fontSize: '0.95rem', opacity: 0.95 }}
          >
            {strength}
          </p>
        </li>
      ))}
    </ul>
  );
}
