import type {
  CareerTimingResult,
  ConsultationData,
  CompatibilityResult,
  MyPageData,
  MyPageAnalysisSummary,
} from '@/types/api';

export const mockCareerTimingResult: CareerTimingResult = {
  analysisId: 1001,
  favoredPeriod: '2026년 상반기',
  confidenceScore: 82,
  reasoning: '2026년 상반기에 관운(官運)이 강하게 들어와 이직·승진에 유리한 흐름입니다.',
};

export const mockConsultationData: ConsultationData = {
  consultationId: 2001,
  industries: [
    { name: 'IT/소프트웨어', reason: '분석적 사고와 논리력이 강점으로 작용합니다.', recommendedRoles: ['백엔드 개발자', '데이터 엔지니어'] },
  ],
  interviewTips: ['구체적인 성과 수치를 제시하세요.', '팀워크 경험을 강조하세요.'],
  strengths: ['논리적 사고', '책임감', '꾸준함'],
  cautions: ['과도한 완벽주의를 경계하세요.'],
  favoredPeriod: 'H1',
  confidenceScore: 78,
  reasoning: '일간이 강하고 식신이 발달하여 전문성을 살리는 커리어가 유리합니다.',
  sajuProfile: {
    dayMaster: '갑목(甲木)',
    dayMasterDescription: '곧고 정직한 리더형 성향입니다.',
    fiveElements: { 목: 2, 화: 1, 토: 1, 금: 2, 수: 2 },
    fiveElementsAnalysis: '금(金) 기운이 강해 원칙과 결단력이 돋보입니다.',
    tenGodDistribution: { 비견: 1, 식신: 2, 정관: 1 },
    keyTenGods: ['식신', '정관'],
  },
  wealthStyle: {
    incomeSource: '전문직 급여 소득',
    financialAdvice: '안정형 자산 배분을 권장합니다.',
    investmentTendency: '보수적',
    additionalIncome: '사이드 프로젝트를 통한 부수입',
  },
  longTermRoadmap: {
    phase0to2years: { goal: '전문성 확보', focus: '핵심 기술 역량 강화', action: '자격증 취득 및 프로젝트 리딩' },
    phase3to5years: { goal: '리더십 전환', focus: '팀 관리 경험 축적', action: '사내 리더 포지션 지원' },
    ultimateGoal: '기술 조직의 리더',
    goalDescription: '기술과 조직 관리 역량을 겸비한 리더로 성장합니다.',
  },
  personalBranding: {
    suitColor: '네이비',
    impression: '신뢰감 있는 전문가',
    hairAndMakeup: '단정한 스타일',
    brandingKeyword: '신뢰와 전문성',
    taglineForResume: '문제를 끝까지 해결하는 개발자',
  },
  powerKeywords: {
    keywords: [
      { keyword: '책임감', element: '금', description: '맡은 일을 끝까지 완수하는 성향', usageExample: '이력서 자기소개', context: '면접' },
    ],
    selectionGuide: '상황에 맞는 키워드를 1-2개만 선택하세요.',
    usageTips: ['구체적 사례와 함께 사용하세요.'],
    avoidanceTip: '과도한 겸손 표현은 피하세요.',
  },
  mentalCare: {
    stressVulnerability: ['완벽주의로 인한 번아웃'],
    rechargeMethod: ['혼자만의 시간', '규칙적인 운동'],
    mindsetMantra: '완벽보다 완료가 먼저다.',
    emergencyTactic: '5분간 심호흡 후 우선순위 재정리',
  },
  environmentFit: {
    workVibe: '차분하고 체계적인 분위기',
    companySize: '중견~대기업',
    colleagueType: '전문성을 존중하는 동료',
    conflictApproach: '데이터 기반 논리적 설득',
    physicalEnv: '독립된 업무 공간 선호',
    culturalFit: '수평적이되 체계적인 조직 문화',
  },
  workStyle: {
    preferredCompanyType: '안정적인 중견기업',
    leadershipType: '서번트 리더십',
    decisionMaking: '데이터 기반 신중한 결정',
    conflictResolution: '중재를 통한 합의 도출',
  },
  relationshipStrategy: {
    socialStyle: '소수의 깊은 관계 선호',
    networkingApproach: '실무 중심의 네트워킹',
    teamPosition: '신뢰받는 실무 리더',
    conflictResolution: '경청 후 논리적 제안',
    careerNetworking: '컨퍼런스·스터디 그룹 참여',
  },
  careerTimeline: {
    year: 2026,
    months: {
      '1': { type: 'NORMAL', description: '평이한 흐름' },
      '5': { type: 'LUCKY', description: '이직·이동에 유리' },
    },
    pivotPoints: [{ month: 5, type: 'LUCKY', score: 88, description: '관운 최고조' }],
    warningMonths: [9],
    warningDescription: '9월은 신중한 의사결정이 필요합니다.',
  },
  analysisSummary: '2026년 상반기 이직·승진 운이 강한 해입니다.',
};

export const mockCompatibilityResult: CompatibilityResult = {
  analysisId: 3001,
  requestContext: { companyName: '네이버', targetRole: { category: 'TECH_BACKEND', detailName: '백엔드 개발자' } },
  compatibilityScore: 84,
  summary: '전반적으로 궁합이 좋으며 특히 기술 조직 문화와 잘 맞습니다.',
  targetRoleAnalysis: {
    matchScore: 88,
    synergy: '체계적인 업무 스타일이 백엔드 직무와 잘 맞습니다.',
    warning: '초반 온보딩 기간의 조급함을 경계하세요.',
  },
  fiveElements: {
    userDistribution: { 목: 2, 화: 1, 토: 1, 금: 2, 수: 2 },
    companyDistribution: { 목: 1, 화: 2, 토: 3, 금: 2, 수: 0 },
    synergyDescription: '토(土) 기운이 강한 기업으로, 안정적인 협업이 기대됩니다.',
  },
  analysisBreakdown: {
    characterMatch: 82,
    potentialSynergy: 85,
    longTermStability: 86,
  },
  actionableStrategy: {
    interviewKeywords: ['책임감', '문제해결력'],
    weaknessDefense: '완벽주의 성향은 꼼꼼함으로 재해석해 어필하세요.',
    bestTiming: { luckyDays: ['화요일', '목요일'], preferredTime: '오전 10시~12시' },
  },
  expectedInterviewQuestions: [
    { question: '가장 어려웠던 프로젝트 경험은?', intent: '문제해결 능력 검증' },
  ],
  roleCompatibility: [
    { roleName: '백엔드 개발자', score: 88, reason: '체계적 사고와 직무 궁합이 높습니다.', tag: '추천' },
    { roleName: '프론트엔드 개발자', score: 65, reason: '창의성보다 안정성 지향적입니다.' },
  ],
  monthlyForecast: [
    { month: 5, score: 90, status: 'LUCKY', advice: '입사·이직 제안에 적극 응하세요.' },
    { month: 9, score: 40, status: 'CAUTION', advice: '중요한 계약은 신중히 검토하세요.' },
  ],
  cautions: ['초반 3개월은 성급한 의사결정을 피하세요.'],
};

function summary(
  id: number,
  type: MyPageAnalysisSummary['type'],
  daysAgo: number,
): MyPageAnalysisSummary {
  const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return {
    id,
    type,
    birthDate: '1998-05-01',
    createdAt,
    favoredPeriod: type === 'TIMING' ? '2026년 상반기' : undefined,
    confidenceScore: type === 'TIMING' ? 82 : undefined,
  };
}

export const mockMyPageAnalyses: MyPageAnalysisSummary[] = [
  summary(1, 'TIMING', 1),
  summary(2, 'CONSULTATION', 3),
  summary(3, 'COMPATIBILITY', 5),
  summary(4, 'TIMING', 10),
];

export function buildMyPageData(analyses: MyPageAnalysisSummary[]): MyPageData {
  return {
    profile: {
      id: 1,
      name: '홍길동',
      email: 'user@example.com',
      createdAt: '2025-01-01T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
    },
    analyses,
    pagination: { page: 0, size: 1000, total: analyses.length, totalPages: 1 },
  };
}

/**
 * useHistoryDetail이 소비하는 실제 백엔드 응답 형태.
 * AnalysisRecord 타입 정의와 달리 careerFortuneDetail/consultationDetail/
 * compatibilityDetail 필드에 실 데이터가 담겨 온다 (my-page/[id]/page.tsx의
 * extractData 참고).
 */
export function buildAnalysisRecordResponse(
  type: 'TIMING' | 'CONSULTATION' | 'COMPATIBILITY',
): Record<string, unknown> {
  const base = { recordId: '1', userId: 'u1', createdAt: Date.now() };
  if (type === 'TIMING') return { ...base, careerFortuneDetail: mockCareerTimingResult };
  if (type === 'CONSULTATION') return { ...base, consultationDetail: mockConsultationData };
  return { ...base, compatibilityDetail: mockCompatibilityResult };
}
