import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * 홈페이지 (/) — 서비스 소개 랜딩 페이지 (T004b)
 */

export const metadata: Metadata = {
  title: 'SSAju - 사주 기반 커리어 컨설팅',
  description: '생년월일로 관운을 분석하여 최적의 취업 시기와 어울리는 기업을 찾아드립니다.',
  openGraph: {
    title: 'SSAju - 사주 기반 커리어 컨설팅',
    description: '생년월일로 관운을 분석하여 최적의 취업 시기와 어울리는 기업을 찾아드립니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SSAju - 사주 기반 커리어 컨설팅',
    description: '생년월일로 관운을 분석하여 최적의 취업 시기와 어울리는 기업을 찾아드립니다.',
  },
};

const SERVICES = [
  {
    href: '/career-timing',
    icon: '⭐',
    title: '관운 기반 채용 시기 분석',
    description: '생년월일과 시간으로 취업 운이 좋은 시기를 분석합니다.',
  },
  {
    href: '/consultation',
    icon: '🤖',
    title: 'AI 기반 커리어 컨설팅',
    description: '사주 기반 추천 산업, 강점, 월별 운세를 AI가 분석합니다.',
  },
  {
    href: '/compatibility',
    icon: '🏢',
    title: '기업 궁합 분석',
    description: '관심 기업과의 사주 궁합을 점수로 확인합니다.',
  },
];

export default function HomePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-night-900 text-white flex flex-col items-center justify-center px-4 py-16">
      {/* 히어로 섹션 */}
      <section className="text-center max-w-2xl mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-star-400">SSAju</h1>
        <p className="text-lg lg:text-xl text-gray-300 mb-8">
          당신의 관운을 분석하여 최적의 커리어 경로를 제시합니다
        </p>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link
            href="/career-timing"
            className="rounded-lg bg-star-500 px-6 py-3 text-night-900 font-semibold hover:bg-star-400 transition-colors"
          >
            관운 분석 시작하기
          </Link>
          <Link
            href="/consultation"
            className="rounded-lg border border-star-500 px-6 py-3 text-star-400 font-semibold hover:bg-night-800 transition-colors"
          >
            AI 컨설팅 받기
          </Link>
        </div>
      </section>

      {/* 서비스 소개 카드 */}
      <section className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6">
        {SERVICES.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            className="rounded-xl border border-night-700 bg-night-800 p-6 hover:border-star-500 transition-colors text-center"
          >
            <div className="text-3xl mb-3">{service.icon}</div>
            <h2 className="text-sm font-semibold text-star-300 mb-2">{service.title}</h2>
            <p className="text-xs text-gray-400">{service.description}</p>
          </Link>
        ))}
      </section>

      {/* 하단 안내 */}
      <p className="mt-16 text-sm text-gray-500 text-center">
        생년월일과 시간을 입력하여 당신의 커리어 타이밍을 분석받으세요
      </p>
    </main>
  );
}
