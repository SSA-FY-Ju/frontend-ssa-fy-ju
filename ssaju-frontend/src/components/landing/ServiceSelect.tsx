'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ServiceCard from './ServiceCard';
import { useSessionStore } from '@/stores/sessionStore';

interface ServiceSelectProps {
  birthDate: string;
  birthTime: string;
  onGoBack: () => void;
}

const services = [
  {
    id: 'CAREER_TIMING',
    number: '01',
    title: '관운 분석',
    description: '당신의 취업운을 읽습니다',
    duration: '3-5초',
    icon: '⭐',
  },
  {
    id: 'CONSULTATION',
    number: '02',
    title: 'AI 커리어 컨설팅',
    description: '개인화된 커리어 조언',
    duration: '15-20초',
    icon: '💬',
  },
  {
    id: 'COMPATIBILITY',
    number: '03',
    title: '기업 궁합 분석',
    description: '기업과의 궁합도 측정',
    duration: '5-8초',
    icon: '🏢',
  },
  {
    id: 'FEEDBACK',
    number: '04',
    title: '만족도 피드백',
    description: '서비스 피드백 제출',
    duration: '1-2초',
    icon: '📝',
  },
];

export default function ServiceSelect({
  birthDate,
  birthTime,
  onGoBack,
}: ServiceSelectProps) {
  const router = useRouter();
  const { setSajuData } = useSessionStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);

    // Store saju data in session
    setSajuData({
      birthDate,
      birthTime,
      selectedService: serviceId,
    });

    // Navigate based on service
    const routes: Record<string, string> = {
      CAREER_TIMING: '/career-timing',
      CONSULTATION: '/consultation',
      COMPATIBILITY: '/compatibility',
      FEEDBACK: '/feedback',
    };

    setTimeout(() => {
      router.push(routes[serviceId] || '/');
    }, 300);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-8 border-b border-slate-700">
        <button
          onClick={onGoBack}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors mb-6"
        >
          ← 처음으로
        </button>

        <div className="text-xs text-purple-400 font-semibold tracking-widest mb-2">
          STEP 02 · 서비스 선택
        </div>
        <h1 className="text-4xl font-bold text-white">어떤 별자리부터 보여드릴까요?</h1>

        {/* Display birth info */}
        <div className="mt-6 flex gap-4 flex-wrap">
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-600/30">
            <p className="text-sm text-yellow-300">
              <span className="font-semibold">{formatDateKorean(birthDate)}</span>
              <span className="text-yellow-400/70 ml-2">{birthTime}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              {...service}
              isSelected={selectedService === service.id}
              onClick={() => handleServiceClick(service.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDateKorean(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}
