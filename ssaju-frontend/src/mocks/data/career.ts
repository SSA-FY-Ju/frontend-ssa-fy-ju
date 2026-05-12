/**
 * 커리어 분석 목업 데이터
 */

import type { CareerTimingResult, ConsultationData } from '@/types/api';

export const mockCareerTimingResult: CareerTimingResult = {
  sajuResultId: 'mock-saju-result-001',
  h1Period: '2025년 상반기',
  h2Period: '2026년 하반기',
  h1Confidence: 82,
  h2Confidence: 65,
  recommendation:
    '귀하의 사주를 분석한 결과, 2025년 상반기가 취업 활동에 가장 유리한 시기입니다.',
};

export const mockConsultationData: ConsultationData = {
  sajuResultId: 'mock-saju-result-001',

  // 탭1: 추천산업
  recommendedIndustries: [
    {
      industryName: 'IT/소프트웨어',
      reason: '분석적 사고와 창의성을 결합한 업무 환경이 적합합니다.',
      recommendedRoles: ['프로덕트 매니저', '데이터 사이언티스트', '백엔드 개발자'],
    },
    {
      industryName: '핀테크',
      reason: '금융과 기술의 결합 분야에서 높은 성장 가능성이 있습니다.',
      recommendedRoles: ['금융 데이터 분석가', '리스크 매니저'],
    },
  ],

  // 탭2: 면접팁
  interviewTips: [
    '구체적인 수치와 성과를 중심으로 경험을 설명하세요.',
    '팀 협업 사례를 강조하면 좋은 인상을 줄 수 있습니다.',
    '회사의 최근 이슈나 제품에 대한 사전 조사가 필수입니다.',
    '논리적인 문제 해결 과정을 단계별로 설명하세요.',
    '자신의 약점을 인정하되, 개선 노력을 함께 언급하세요.',
  ],

  // 탭3: 강점
  strengths: [
    '분석적 사고력 — 복잡한 문제를 체계적으로 분해하는 능력',
    '창의적 문제 해결 — 기존 방식에 얽매이지 않는 접근',
    '리더십 잠재력 — 팀을 이끌고 방향을 제시하는 역량',
    '빠른 학습 능력 — 새로운 기술과 환경에 빠르게 적응',
  ],

  // 탭4: 사주프로필
  sajuProfile: {
    dayMaster: '丙',
    personality: '태양처럼 밝고 에너지가 넘치는 성격으로, 주변을 따뜻하게 하는 리더십이 있습니다.',
    oHangDistribution: { 木: 2, 火: 3, 土: 1, 金: 2, 水: 1 },
    sipShinDistribution: { 편관: 2, 정관: 1, 편재: 2, 정재: 1, 식신: 1 },
  },

  // 탭5: 부의운
  wealthStyle: {
    incomeSource: '기술 기반 직종 또는 컨설팅 업무에서 주요 수입 창출이 유리합니다.',
    financialAdvice: '안정적 월급 외 부업을 통한 수입 다각화를 권장합니다.',
    investmentStyle: '중장기 성장주 투자에 적합하며, 단기 투기는 피하세요.',
    additionalIncome: '프리랜서 프로젝트나 온라인 강의를 통한 추가 수입이 가능합니다.',
  },

  // 탭6: 경력로드맵
  careerRoadmap: {
    shortTerm: '0-2년: 핵심 기술 스킬 심화 및 포트폴리오 구축. AWS/GCP 자격증 취득 권장.',
    midTerm: '3-5년: 팀 리드 또는 시니어 포지션으로 성장. 도메인 전문성 확립.',
    longTerm: '최종 목표: CTO 또는 기술 기반 창업. 자신만의 제품/서비스 개발.',
  },

  // 탭7: 브랜딩
  branding: {
    suitColor: '네이비 블루 또는 차콜 그레이 — 신뢰감과 전문성을 강조',
    imageStyle: '클린하고 정돈된 이미지, 미니멀한 액세서리',
    hairMakeup: '단정하고 자연스러운 스타일, 지나친 화장은 피할 것',
    powerKeywords: ['전략적', '혁신적', '신뢰할 수 있는', '성과 중심', '협력적'],
  },

  // 탭8: 월별운세
  monthlyForecasts: [
    { month: 1, score: 72, type: 'NORMAL', advice: '새로운 시작에 집중하세요.' },
    { month: 2, score: 85, type: 'LUCKY', advice: '대인관계가 풀리는 시기입니다.' },
    { month: 3, score: 90, type: 'LUCKY', advice: '취업 활동에 최적의 시기입니다.' },
    { month: 4, score: 65, type: 'NORMAL', advice: '꼼꼼한 준비가 필요합니다.' },
    { month: 5, score: 45, type: 'CAUTION', advice: '중요한 결정은 미루세요.' },
    { month: 6, score: 78, type: 'NORMAL', advice: '협업 프로젝트에 집중하세요.' },
    { month: 7, score: 88, type: 'LUCKY', advice: '커리어 도약의 기회가 옵니다.' },
    { month: 8, score: 55, type: 'CAUTION', advice: '건강 관리에 신경 쓰세요.' },
    { month: 9, score: 82, type: 'LUCKY', advice: '네트워킹에 집중할 시기입니다.' },
    { month: 10, score: 70, type: 'NORMAL', advice: '꾸준한 노력이 빛을 발합니다.' },
    { month: 11, score: 75, type: 'NORMAL', advice: '연말 목표를 점검하세요.' },
    { month: 12, score: 68, type: 'NORMAL', advice: '내년을 위한 준비를 시작하세요.' },
  ],
};
