import type { Metadata } from 'next';

/** AI 커리어 컨설팅 페이지 SEO 메타데이터 (Constitution XII) */
export const metadata: Metadata = {
  title: 'AI 커리어 컨설팅 - SSAju | 사주 기반 맞춤 커리어 분석',
  description: '생년월일로 추천 산업, 면접팁, 강점, 월별 운세 등 8가지 커리어 컨설팅을 받아보세요.',
  openGraph: {
    title: 'AI 커리어 컨설팅 - SSAju',
    description: '사주로 알아보는 나만의 커리어 방향성',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'AI 커리어 컨설팅 - SSAju' },
};

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
