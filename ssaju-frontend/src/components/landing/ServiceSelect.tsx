'use client';

/**\n * 파일 역할: 사용자가 분석 서비스를 선택하고 해당 서비스 페이지로 이동하도록 처리합니다.\n */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ServiceCard from './ServiceCard';
import { useSessionStore } from '@/stores/sessionStore';

interface ServiceSelectProps {
  birthDate: string;
  birthTime: string;
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
];

export default function ServiceSelect({ birthDate, birthTime }: ServiceSelectProps) {
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
    <div className="w-screen h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Service Cards Grid */}
      <div className="flex-1 px-6 py-8 flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-9 h-fit">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              {...service}
              index={i}
              isSelected={selectedService === service.id}
              onClick={() => handleServiceClick(service.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
