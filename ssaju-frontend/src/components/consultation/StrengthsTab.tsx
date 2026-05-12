'use client';

/** 강점 탭 (T069) */

interface StrengthsTabProps {
  strengths: string[];
}

export function StrengthsTab({ strengths }: StrengthsTabProps) {
  return (
    <ul className="flex flex-col gap-3">
      {strengths.map((strength, i) => (
        <li key={i} className="flex gap-3 bg-night-800 rounded-lg p-4">
          <span className="text-star-500 text-lg shrink-0" aria-hidden="true">★</span>
          <p className="text-white text-sm leading-relaxed">{strength}</p>
        </li>
      ))}
    </ul>
  );
}
