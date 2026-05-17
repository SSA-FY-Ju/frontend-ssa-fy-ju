import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

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

export default function HomePage(): React.ReactElement {
  return <LandingPage />;
}

