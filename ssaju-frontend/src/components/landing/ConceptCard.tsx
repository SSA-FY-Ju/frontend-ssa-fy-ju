'use client';

/**\n * 파일 역할: 랜딩 설명 섹션에서 단일 컨셉 카드를 표시하는 재사용 UI 컴포넌트입니다.\n */

interface ConceptCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function ConceptCard({ icon, title, description }: ConceptCardProps) {
  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer transform hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
