'use client';

interface ServiceIntroCardProps {
  number: string;
  title: string;
  description: string;
  duration: string;
}

export default function ServiceIntroCard({
  number,
  title,
  description,
  duration,
}: ServiceIntroCardProps) {
  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl font-bold text-blue-400">{number}</span>
        <span className="text-xs text-gray-400 bg-slate-700 px-3 py-1 rounded-full">
          {duration}
        </span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
