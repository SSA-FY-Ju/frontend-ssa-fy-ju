import type { Metadata } from 'next';

/** 기업 궁합 분석 페이지 SEO 메타데이터 (Constitution XII) */
export const metadata: Metadata = {
  title: '기업 궁합 분석 - SSAju | 사주로 보는 취업 궁합',
  description: '생년월일과 기업명으로 취업 궁합 점수, 직무 매칭, 월별 운세를 확인하세요.',
  openGraph: {
    title: '기업 궁합 분석 - SSAju',
    description: '내 사주와 기업의 궁합은 몇 점일까요?',
    type: 'website',
  },
  twitter: { card: 'summary', title: '기업 궁합 분석 - SSAju' },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
