'use client';

/** 면접팁 탭 (T068) */

interface InterviewTipsTabProps {
  tips: string[];
}

export function InterviewTipsTab({ tips }: InterviewTipsTabProps) {
  return (
    <ul className="flex flex-col gap-4">
      {tips.map((tip, i) => (
        <li
          key={i}
          className="animate-item flex gap-4 items-start"
          style={{
            backdropFilter: 'blur(12px)',
            background: 'rgba(59,130,246,0.05)',
            border: '1px solid rgba(59,130,246,0.18)',
            borderRadius: 20,
            padding: '20px 22px',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* Number badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(59,130,246,0.18)',
              border: '1.5px solid rgba(59,130,246,0.45)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 800 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Tip text */}
          <p className="text-white text-sm leading-relaxed pt-[7px]" style={{ opacity: 0.9 }}>
            {tip}
          </p>
        </li>
      ))}
    </ul>
  );
}
