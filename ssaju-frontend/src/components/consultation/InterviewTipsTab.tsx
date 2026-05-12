'use client';

/** 면접팁 탭 (T068) */

interface InterviewTipsTabProps {
  tips: string[];
}

export function InterviewTipsTab({ tips }: InterviewTipsTabProps) {
  return (
    <ul className="flex flex-col gap-3">
      {tips.map((tip, i) => (
        <li key={i} className="flex gap-3 bg-night-800 rounded-lg p-4">
          <span className="text-star-500 font-bold text-sm shrink-0">{i + 1}.</span>
          <p className="text-white text-sm leading-relaxed">{tip}</p>
        </li>
      ))}
    </ul>
  );
}
