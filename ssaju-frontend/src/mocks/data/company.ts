/**
 * 기업 궁합 목업 데이터
 */

import type { CompatibilityResult } from '@/types/api';

export const mockCompatibilityResult: CompatibilityResult = {
  sajuResultId: 'mock-saju-result-001',
  companyName: '삼성전자',
  compatibilityScore: 78,
  confidenceLevel: 'HIGH',
  sipShinScore: 82,
  oHangScore: 75,
  jijangGanScore: 70,
  leadershipScore: 85,
  jobMatchCards: [
    {
      jobTitle: '소프트웨어 엔지니어',
      score: 88,
      reason: '화(火) 오행이 강한 사주로 논리적 분석 능력이 뛰어나며, 삼성전자의 DS부문과 높은 시너지를 냅니다.',
      recommendation: '강력 추천',
      isRecommended: true,
    },
    {
      jobTitle: '데이터 사이언티스트',
      score: 81,
      reason: '금(金) 오행의 정밀함과 토(土) 오행의 안정성이 데이터 분석 역할과 잘 맞습니다.',
      recommendation: '추천',
      isRecommended: true,
    },
    {
      jobTitle: 'AI 연구원',
      score: 77,
      reason: '창의적 사고를 나타내는 목(木) 오행이 AI 연구 분야에서 장기적 성장을 지원합니다.',
      recommendation: '추천',
      isRecommended: true,
    },
    {
      jobTitle: '마케터',
      score: 52,
      reason: '사주의 내향적 에너지가 대외 커뮤니케이션 중심 역할과 다소 맞지 않을 수 있습니다.',
      recommendation: '주의',
      isRecommended: false,
    },
  ],
  monthlyForecasts: [
    { month: 1, score: 72, type: 'NORMAL', advice: '내부 역량 강화에 집중하세요.' },
    { month: 2, score: 85, type: 'LUCKY', advice: '면접 성공 가능성이 높습니다.' },
    { month: 3, score: 68, type: 'NORMAL', advice: '차분하게 준비하는 시간입니다.' },
    { month: 4, score: 45, type: 'CAUTION', advice: '조급함을 피하고 장기 전략을 세우세요.' },
    { month: 5, score: 78, type: 'NORMAL', advice: '꾸준한 노력이 빛을 발합니다.' },
    { month: 6, score: 90, type: 'LUCKY', advice: '상반기 최고의 취업 운입니다. 적극 도전하세요!' },
    { month: 7, score: 65, type: 'NORMAL', advice: '자기계발과 네트워킹에 집중하세요.' },
    { month: 8, score: 55, type: 'CAUTION', advice: '건강 관리와 체력 보충이 필요합니다.' },
    { month: 9, score: 80, type: 'LUCKY', advice: '하반기 공채 시즌, 적극적으로 지원하세요.' },
    { month: 10, score: 73, type: 'NORMAL', advice: '꾸준히 진행하면 좋은 결과가 따릅니다.' },
    { month: 11, score: 82, type: 'LUCKY', advice: '최종 합격 소식이 기대되는 달입니다.' },
    { month: 12, score: 60, type: 'NORMAL', advice: '한 해를 정리하며 내년을 준비하세요.' },
  ],
  careerMilestone: {
    shortTerm: '3개월 내 기초 기술 역량 강화 및 포트폴리오 완성. CS 스터디 그룹 참여 권장.',
    midTerm: '3~12개월 삼성전자 주요 공채 및 인턴십 지원. 사내 추천 채용 루트 탐색.',
    longTerm: '1~3년 삼성전자 DS부문 정규직 전환 후 전문성 심화. 사내 AI 센터 이동 목표.',
  },
  recommendation:
    '삼성전자와의 궁합은 매우 좋습니다. 특히 DS부문에서의 성장 가능성이 높으며, 안정적인 환경에서 전문성을 키울 수 있습니다. 2월과 6월에 집중적으로 지원하면 좋은 결과를 기대할 수 있습니다.',
};

export const mockCompanyAutocomplete = {
  suggestions: ['삼성전자', '삼성SDS', '삼성생명', '삼성화재', '삼성증권'],
};
