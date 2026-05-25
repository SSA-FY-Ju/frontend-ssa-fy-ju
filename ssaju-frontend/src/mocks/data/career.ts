/**
 * 커리어 분석 목업 데이터
 */

import type { CareerTimingResult, ConsultationData } from '@/types/api';


export const mockCareerTimingResult: CareerTimingResult = {
  favoredPeriod: '2025년 하반기 (9월~11월)',
  confidenceScore: 87,
  reasoning:
    '일주(日柱) 경금(庚金)이 2025년 을사(乙巳)년 하반기 신금(辛金) 대운과 합을 이루며 관운(官運)이 크게 열립니다. ' +
    '특히 9월부터 11월 사이 재성(財星)과 관성(官星)이 동시에 활성화되어 새로운 직책 획득에 유리한 에너지가 집중됩니다. ' +
    '이 기간에는 적극적인 지원과 네트워킹이 실질적인 성과로 이어질 가능성이 높으며, ' +
    '특히 목(木) 계열 산업(IT·교육·바이오)에서 기회가 두드러집니다. ' +
    '반면 2026년 상반기는 공망(空亡) 영향으로 결실보다 준비에 집중하는 편이 유리합니다.',
};

export const mockConsultationData: ConsultationData = {
  consultationId: 123,
  favoredPeriod: 'H2',
  confidenceScore: 82,
  reasoning:
    '정관(正官) 기운이 명확하여 직업운이 하반기에 집중됩니다. ' +
    '일간 기토(己土)의 수용적 성향이 조직 내 신뢰를 얻는 데 유리하며, ' +
    '하반기 금(金) 에너지의 상승이 실질적인 성과로 이어질 것입니다.',

  strengths: ['신뢰성', '책임감', '세밀함', '분석력', '꼼꼼한 실행력'],
  cautions: ['지나친 신중함으로 결정 지연 위험', '변화에 대한 불안 관리 필요'],

  interviewTips: [
    '체계성과 신뢰성을 강조하는 구체적 사례 준비',
    '팀 협업 경험과 갈등 해결 사례 강조',
    '장기적 목표와 단계적 실행 계획 제시',
    '데이터 기반의 논리적 근거 제시',
  ],

  industries: [
    {
      name: '소프트웨어 개발',
      reason: '일간(己土)의 안정성과 수용적 성향이 체계적인 프로젝트 관리에 적합',
      recommendedRoles: ['백엔드 엔지니어', 'DevOps', '기술 리더'],
    },
    {
      name: '금융·핀테크',
      reason: '꼼꼼함과 책임감이 리스크 관리 및 분석 직무와 맞닿음',
      recommendedRoles: ['리스크 분석가', '데이터 애널리스트', '컴플라이언스'],
    },
    {
      name: '컨설팅·전략',
      reason: '체계적 사고방식과 신뢰 기반 관계 구축이 핵심 역량과 일치',
      recommendedRoles: ['경영 컨설턴트', '전략 기획', '프로젝트 매니저'],
    },
  ],

  sajuProfile: {
    dayMaster: '己',
    dayMasterDescription: '己土(기토) — 수용적이고 꼼꼼한 성향, 신뢰성 높음',
    fiveElements: { '木': 1, '火': 2, '土': 2, '金': 2, '水': 1 },
    fiveElementsAnalysis: '토(土) 기운이 강해 안정성 및 신뢰성 우수. 수(水) 부족으로 창의성 보강이 필요합니다.',
    tenGodDistribution: { '正官': 1, '偏官': 1, '正財': 2, '偏財': 1 },
    keyTenGods: ['正官', '偏官'],
  },

  wealthStyle: {
    incomeSource: '정규직 및 프로젝트 보너스',
    financialAdvice: '안정적 자산 증식 위주로 접근하되 일부 성장 자산 편입 추천',
    investmentTendency: '보수적이나 꾸준함 — 장기 적립식 투자에 유리',
    additionalIncome: '부수 스킬 개발(자격증, 강의)로 부가 수입 창출 가능',
  },

  longTermRoadmap: {
    phase0to2years: {
      goal: '커리어 기초 구축',
      focus: '핵심 업무 역량 강화',
      action: '현 직무에서 깊이 있는 전문성 축적 및 사내 평판 구축',
    },
    phase3to5years: {
      goal: '리더십 역량 개발',
      focus: '팀 관리 및 프로젝트 리딩 경험',
      action: '시니어 직급 승진 추진 및 외부 네트워크 확장',
    },
    ultimateGoal: '기술 리더십 확보',
    goalDescription: '자신의 분야에서 신뢰받는 리더로서 조직과 산업에 기여하는 위치',
  },

  personalBranding: {
    suitColor: '검정색 / 네이비',
    impression: '신뢰감 있고 안정적인 이미지',
    hairAndMakeup: '깔끔하고 정돈된 스타일 — 단정함 강조',
    brandingKeyword: '안정성 · 신뢰 · 정확성',
    taglineForResume: '신뢰받는 엔지니어, 정확한 완성도',
  },

  powerKeywords: {
    keywords: [
      {
        keyword: '책임감 있는',
        element: '土',
        description: '주어진 일을 끝까지 완수하는 능력',
        usageExample: '책임감 있게 프로젝트 마일스톤을 달성한 경험',
        context: '이력서 · 자기소개서 · 면접',
      },
      {
        keyword: '체계적인',
        element: '金',
        description: '프로세스를 정립하고 효율을 높이는 성향',
        usageExample: '체계적인 코드 리뷰 문화를 팀에 정착시킨 사례',
        context: '면접 · 포트폴리오',
      },
      {
        keyword: '신뢰받는',
        element: '土',
        description: '동료와 조직으로부터 일관된 신뢰를 구축하는 능력',
        usageExample: '어려운 프로젝트에서 팀의 핵심 의존 인물 역할 수행',
        context: '추천서 · 레퍼런스 체크',
      },
    ],
    selectionGuide: '본인의 강점을 대표할 3개 키워드를 선정하여 일관되게 사용하세요',
    usageTips: ['면접 자기소개에 자연스럽게 녹여내기', '이력서 각 경험 항목에 키워드 반영'],
    avoidanceTip: '과장하지 않기 — 반드시 실제 사례와 함께 제시하세요',
  },

  mentalCare: {
    stressVulnerability: ['과도한 책임감으로 인한 번아웃', '변화에 대한 불안 및 통제 욕구'],
    rechargeMethod: ['규칙적인 루틴 유지', '자연 속 산책', '신뢰할 수 있는 지인과의 대화'],
    mindsetMantra: '느리지만 확실하게 — 완성도가 곧 경쟁력이다',
    emergencyTactic: '신뢰할 수 있는 멘토와 솔직한 대화로 관점 전환',
  },

  environmentFit: {
    workVibe: '안정적이고 체계적인 조직 문화',
    companySize: '중견기업 이상 — 명확한 체계와 역할 구분이 있는 환경',
    colleagueType: '신뢰할 수 있고 책임감 있는 동료',
    conflictApproach: '차분한 직접 대화를 통한 합의점 모색',
    physicalEnv: '조용하고 집중할 수 있는 독립 업무 공간',
    culturalFit: '투명하고 명확한 가치관을 가진 조직',
  },

  workStyle: {
    preferredCompanyType: '기술 기업 또는 금융·컨설팅 회사',
    leadershipType: '따뜻하고 체계적인 서번트 리더십',
    decisionMaking: '충분한 정보 수집 후 신중하게 결정',
    conflictResolution: '직접 대화와 데이터 기반 합의점 모색',
  },

  relationshipStrategy: {
    socialStyle: '소수의 깊고 신뢰 있는 관계 선호',
    networkingApproach: '신뢰 기반의 점진적 관계 구축 — 양보다 질',
    teamPosition: '팀의 신뢰받는 서포터이자 완성도 담당자 역할',
    conflictResolution: '차분한 커뮤니케이션과 상호 이해 추구',
    careerNetworking: '업계 선배 멘토링 및 스터디 그룹 활용',
  },

  careerTimeline: {
    year: 2026,
    months: {
      March: { type: 'opportunity', description: '새로운 프로젝트 기회 또는 직책 제안' },
      June: { type: 'stable', description: '안정적인 성과 창출 기간' },
      September: { type: 'caution', description: '신중함 필요, 급격한 변화 피할 것' },
    },
    pivotPoints: [
      {
        month: 3,
        type: 'NORMAL',
        score: 58,
        description: '식신(食神) 운이 활성화되며 자기 표현력이 높아집니다. 포트폴리오 정리와 이력서 보완에 집중하세요.',
      },
      {
        month: 6,
        type: 'CAUTION',
        score: 32,
        description: '형충(刑冲)의 기운으로 대인 갈등이 생기기 쉬운 시기입니다. 중요한 협상이나 계약은 7월 이후로 미루세요.',
      },
      {
        month: 9,
        type: 'LUCKY',
        score: 91,
        description: '관성(官星)과 인성(印星)이 합을 이루는 최고의 시기입니다. 적극적인 지원 활동과 네트워킹으로 기회를 잡으세요.',
      },
      {
        month: 10,
        type: 'LUCKY',
        score: 87,
        description: '금(金) 기운이 절정에 달하며 실질적인 결과물이 나오는 달입니다. 면접이나 협상에서 자신감 있는 태도가 성과로 이어집니다.',
      },
      {
        month: 1,
        type: 'NORMAL',
        score: 63,
        description: '새로운 시작의 기운이 있으나 인내가 필요한 시기입니다. 장기적 관점에서 커리어 방향을 재점검할 좋은 시기입니다.',
      },
    ],
    warningMonths: [2, 3, 5, 6, 8, 9],
    warningDescription:
      '5월~6월은 공망(空亡)과 형충(刑冲)이 겹치는 시기로, 충동적인 이직 결정은 후회로 이어질 수 있습니다. ' +
      '8월은 금기(金氣)가 약해져 판단력이 흐려지기 쉬우니 중요한 계약서 서명이나 연봉 협상은 피하는 것이 좋습니다. ' +
      '이 시기에는 준비와 학습에 집중하고, 기회는 9월 이후를 노리세요.',
  },
};
