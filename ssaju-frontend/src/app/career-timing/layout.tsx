import type { Metadata } from 'next';

/** 관운 분석 페이지 SEO 메타데이터 (Constitution XII) */
export const metadata: Metadata = {
  title: '관운 분석 - SSAju | 사주 기반 채용 시기 분석',
  description: '생년월일과 시간으로 채용 운이 좋은 상반기/하반기를 분석합니다.',
  openGraph: {
    title: '관운 분석 - SSAju',
    description: '생년월일과 시간으로 채용 운이 좋은 시기를 알아보세요.',
    type: 'website',
  },
  twitter: { card: 'summary', title: '관운 분석 - SSAju' },
};

export default function CareerTimingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
