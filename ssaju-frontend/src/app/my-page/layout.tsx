import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '내 분석 기록 - SSAju | 마이페이지',
  description:
    '과거 관운 분석, AI 컨설팅, 기업 궁합 분석 기록을 조회하고 결과를 다시 확인하세요.',
  openGraph: {
    title: '내 분석 기록 - SSAju',
    description: '나의 사주 분석 히스토리',
    type: 'website',
  },
  twitter: { card: 'summary', title: '내 분석 기록 - SSAju' },
};

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
