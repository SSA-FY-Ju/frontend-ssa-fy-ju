/* global React */
const { useState, useEffect } = React;

/* ============== Mock data — used since we don't have a live backend ============== */
window.MOCK = {
  timing: {
    favoredPeriod: 'H2',
    confidenceScore: 82,
    reasoning: '정관(正官)이 강하고 현재 대운이 하반기와 궁합하여 7월~10월에 좋은 기회가 많을 것으로 보입니다. 특히 9월의 별자리 흐름이 가장 안정적이며, 면접관의 평가가 호의적으로 나올 가능성이 높습니다.'
  },
  consultation: {
    industries: [
      { name: '금융/핀테크', reason: '오행 金 강세로 재무·분석 직군 적성', recommendedRoles: ['재무분석가', '리스크 관리자', '핀테크 PM'] },
      { name: 'IT/소프트웨어', reason: '오행 水 분포로 논리력·구조화 강함', recommendedRoles: ['백엔드 개발자', '데이터 엔지니어', '시스템 설계자'] },
      { name: '컨설팅/전략', reason: '정관 기운으로 분석·통찰력 우수', recommendedRoles: ['전략 컨설턴트', '비즈니스 애널리스트'] }
    ],
    interviewTips: [
      '일관성 있는 자기소개 — 정관 특성을 살린 신뢰감 있는 톤으로',
      '데이터 기반 성과 사례 — 숫자와 결과로 증명하기',
      '팀 협력 능력 — 갈등 해결 사례를 구체적으로'
    ],
    strengths: ['분석력과 논리성', '책임감 있는 업무 추진', '원칙을 지키는 신뢰성', '체계적인 사고 구조'],
    favoredPeriod: 'H2',
    confidenceScore: 85,
    reasoning: '정관 기운과 오행 균형이 안정적이며, 하반기 대운과의 궁합이 매우 우수합니다.',
    sajuProfile: {
      dayMaster: '丙',
      dayMasterDescription: '리더십과 추진력이 강한 태양의 기운. 창의적 사고와 외향적 매력을 가집니다.',
      fiveElements: { '木': 2, '火': 3, '土': 1, '金': 2, '水': 2 },
      fiveElementsAnalysis: '火가 다소 과해 성급할 수 있습니다. 水를 보충하면 차분함과 깊이가 더해질 것입니다.',
      tenGodDistribution: { '正官': 1, '偏官': 1, '正財': 2, '偏財': 1, '食神': 1, '傷官': 1, '正印': 1 },
      keyTenGods: ['正官', '正財']
    },
    cautions: ['상반기 급격한 결정 지양', '인간관계에서 신중함 필요', '7월에 충돌 가능성 — 휴식 권장'],
    wealthStyle: {
      incomeSource: '정규직 중심 + 부업으로 다원화된 수입 구조',
      financialAdvice: '안정적 자산 운용. 장기 투자에 강한 성향',
      investmentTendency: '보수적이나 기회 발굴에 민첩',
      additionalIncome: '전문성을 활용한 자문료·강의 수익 가능'
    },
    longTermRoadmap: {
      phase0to2years: { goal: '기본 역량 확립', focus: '업무 습숙과 신뢰 구축', action: '주요 프로젝트에 적극 참여' },
      phase3to5years: { goal: '리더십 개발', focus: '팀 관리 경험 축적', action: '중간 관리자 역할 수행' },
      ultimateGoal: '최고경영진(Executive) 진출',
      goalDescription: '35세까지 임원 반열 진입 가능성 높음'
    },
    personalBranding: {
      suitColor: '진청색 또는 짙은 회색',
      impression: '신뢰감 있고 전문적인 이미지',
      hairAndMakeup: '정돈되고 깔끔한 스타일',
      brandingKeyword: '정직함, 추진력, 신뢰',
      taglineForResume: '"신뢰로 시작하여 성과로 증명하는 리더"'
    },
    powerKeywords: {
      keywords: [
        { keyword: '조직력', element: '金', description: '체계적 구조화 능력', usageExample: '"팀의 조직력을 바탕으로 프로젝트 성공"', context: '면접·자기소개서·포트폴리오' },
        { keyword: '추진력', element: '火', description: '목표 달성의 강한 의지', usageExample: '"추진력 있게 목표를 달성한 사례"', context: '행동 기반 면접' },
        { keyword: '균형감', element: '水', description: '논리와 직관의 조화', usageExample: '"데이터와 직관을 균형 있게 활용"', context: '전략 직군 면접' }
      ],
      selectionGuide: '최대 3개 키워드만 선택하여 일관성 있게 포장하세요',
      usageTips: ['자기소개서 주제문에 1회 이상 포함', '면접 답변에서 구체적 사례와 함께', '포트폴리오 요약에서 강조'],
      avoidanceTip: '너무 많은 키워드를 나열하면 신뢰성 저하'
    },
    mentalCare: {
      stressVulnerability: ['인간관계 스트레스 (갈등 처리에 민감)', '불안정한 환경에서 불안감 가중'],
      rechargeMethod: ['명상 및 산책 (자연 속에서 재충전)', '읽기 및 학습', '규칙적인 운동'],
      mindsetMantra: '"모든 것은 과정이다. 현재에 집중하자."',
      emergencyTactic: '스트레스 상황 시 하루 쉬고 객관적 거리두기'
    },
    environmentFit: {
      workVibe: '체계적이고 안정적인 조직 문화',
      companySize: '중견기업 이상 (500명 이상)',
      colleagueType: '전문성 높고 책임감 있는 동료',
      conflictApproach: '대화와 원칙 기반 해결',
      physicalEnv: '조용하고 집중할 수 있는 업무 공간',
      culturalFit: '성과 중심, 투명한 평가 시스템'
    },
    workStyle: {
      preferredCompanyType: '대기업, 공기업, 금융사',
      leadershipType: '계획 기반·목표 중심의 리더',
      decisionMaking: '데이터 분석 후 신중한 결정',
      conflictResolution: '규칙과 원칙 우선, 공정한 처리'
    },
    relationshipStrategy: {
      socialStyle: '신뢰 기반의 깊은 인간관계',
      networkingApproach: '의도적 네트워킹보다 자연스러운 관계 형성',
      teamPosition: '중추 역할 (허브)',
      conflictResolution: '직접 대화와 명확한 의사소통',
      careerNetworking: '동료의 추천과 평판이 매우 중요'
    },
    careerTimeline: {
      year: 2026,
      // Real API returns object form: { "January": { type, description } }
      months: {
        January: { type: '적극기', score: 9, description: '면접 기회가 많은 시기' },
        March: { type: '좋음', score: 7, description: '자기 개발에 전념할 수 있는 시기' },
        August: { type: '기회기', score: 8, description: '네트워킹을 통해 기회를 잡을 수 있는 시기' },
        November: { type: '성장기', score: 8, description: '업무 성과가 두드러지는 시기' }
      },
      pivotPoints: [
        { month: 'January', type: '적극기', score: 9, description: '면접 기회가 많은 시기' },
        { month: 'August', type: '기회기', score: 8, description: '네트워킹을 통해 기회를 잡을 수 있는 시기' }
      ],
      warningMonths: ['April', 'September'],
      warningDescription: '다소 어려운 결정을 해야 할 시기'
    },
    analysisSummary: '丙 일간 · 오행 火·水 균형 · 정관·정재 기운 기반 | 2026년 12개월 타임라인 + 관운 분석 (H2)'
  },
  compatibility: {
    compatibilityScore: 78,
    confidenceLevel: 'HIGH',
    reasoning: '사용자의 정관(正官) 기운과 기업 설립일의 오행(金/水)이 강한 상호보완적 시너지를 냅니다. 체계적 조직 문화와 본인의 안정 추구 성향이 잘 맞아떨어집니다.',
    scoreBreakdown: { tenGodCompatibility: 82, fiveElementsMatch: 75, hiddenStemAlignment: 76, leadershipFit: 80 },
    roleCompatibility: [
      { roleName: '제조 관리자', score: 85, reason: '조직력 강점과 정확히 매치', recommendation: '즉시 지원 권장' },
      { roleName: '공급망 담당자', score: 78, reason: '체계성 우수하나 유연성 보완 필요', recommendation: '관련 경험 어필 시 유리' },
      { roleName: 'R&D 리더', score: 72, reason: '관리형 리더십에 가까움', recommendation: '실무 경력 축적 후 매니징 롤 추천' }
    ],
    synergies: ['정관 기운이 회사의 체계적 조직 문화와 부합', '오행 金 분포가 제조·IT 산업 특성과 일치', '지장간 분석 결과 장기 근속 시 안정성 매우 높음'],
    cautions: ['회사의 급격한 조직 개편 시 적응 스트레스 예상', '상반기보다 하반기에 뚜렷한 성과 기대'],
    monthlyForecast: [
      { month: 1, score: 35, type: 'CAUTION', label: '주의', advice: '신입 채용 지원 자제', details: '기운 전환기' },
      { month: 3, score: 95, type: 'LUCKY', label: '최고조', advice: '집중적으로 지원 권장', details: '정관 기운 정점' },
      { month: 6, score: 88, type: 'LUCKY', label: '매우 높음', advice: '중요 면접 일정 잡기 좋음', details: '오행 균형 최적' },
      { month: 9, score: 82, type: 'LUCKY', label: '높음', advice: '하반기 채용에 유리', details: '안정적 기운' },
      { month: 11, score: 65, type: 'NORMAL', label: '보통', advice: '꾸준히 지원', details: '평이한 흐름' }
    ],
    careerMilestones: {
      immediate: { period: '1-3개월', action: '집중 채용 기간 대비 지원', expectedOutcome: '서류 및 1차 면접 통과 가능성 80% 이상' },
      shortTerm: { period: '3-12개월', action: '신규 팀 적응 및 업무 프로세스 파악', expectedOutcome: '조기 적응 및 팀 내 핵심 실무자 신뢰 구축' },
      mediumTerm: { period: '1-3년', action: '주요 프로젝트 주도 및 성과 창출', expectedOutcome: '빠른 인사고과 인정·조기 진급 기회 확보' }
    }
  }
};

/* ============== Cosmos loader ============== */
window.CosmosLoader = function CosmosLoader({ message, sub }) {
  return (
    <div className="loader-cosmos fade-in-up">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lg" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fef3c7"/>
            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g style={{ transformOrigin: '100px 100px', animation: 'spin-slow 8s linear infinite' }}>
          <circle cx="100" cy="100" r="60" fill="none" stroke="#a5b4fc" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.6"/>
          <circle cx="100" cy="40" r="3" fill="#fcd34d"/>
        </g>
        <g style={{ transformOrigin: '100px 100px', animation: 'spin-slow 12s linear infinite reverse' }}>
          <circle cx="100" cy="100" r="80" fill="none" stroke="#fcd34d" strokeWidth="0.4" strokeDasharray="3 6" opacity="0.4"/>
          <circle cx="100" cy="20" r="2" fill="#fef3c7"/>
          <circle cx="180" cy="100" r="2" fill="#a5b4fc"/>
        </g>
        <circle cx="100" cy="100" r="20" fill="url(#lg)"/>
        <circle cx="100" cy="100" r="8" fill="#fcd34d">
          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <p>{message || '별을 펼치는 중이에요...'}</p>
      <span className="sub">{sub || 'READING THE STARS'}</span>
    </div>
  );
};

Object.assign(window, { MOCK: window.MOCK, CosmosLoader: window.CosmosLoader });
