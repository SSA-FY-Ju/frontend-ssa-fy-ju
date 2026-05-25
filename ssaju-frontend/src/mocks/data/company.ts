/**
 * 기업 궁합 목업 데이터
 */

import type { CompatibilityResult } from '@/types/api';

export const mockCompatibilityResult: CompatibilityResult = {
  compatibilityId: 1,
  compatibilityScore: 78,
  targetRoleAnalysis: {
    matchScore: 85,
    synergy: '백엔드 개발의 금(金) 기운과 사용자의 수(水) 기운이 상생 관계로 최적 조합입니다.',
    warning: '지나친 체계화로 창의성이 제약될 가능성이 있습니다.',
  },
  fiveElements: {
    userDistribution: { '木': 1, '火': 2, '土': 2, '金': 2, '水': 1 },
    companyDistribution: { '木': 0, '火': 1, '土': 3, '金': 2, '水': 2 },
    synergyDescription: '기업의 안정적 기운(土)과 사용자의 신뢰성(土)이 일치하여 문화 적응성이 우수합니다.',
  },
  analysisBreakdown: {
    characterMatch: 82,
    potentialSynergy: 75,
    longTermStability: 78,
  },
  expectedInterviewQuestions: [
    { question: '팀 문화에 어떻게 적응하시겠습니까?', intent: '협업 능력 평가' },
    { question: '체계적인 업무 프로세스를 어떻게 평가하시나요?', intent: '업무 방식 적합성 확인' },
    { question: '어려운 기술적 문제를 어떻게 해결한 경험이 있나요?', intent: '문제 해결 능력 검증' },
  ],
  roleCompatibility: [
    { roleName: '백엔드 엔지니어', score: 85, reason: '기술력과 책임감이 강화되는 포지션입니다.', tag: '추천' },
    { roleName: 'DevOps', score: 72, reason: '체계적 사고가 인프라 관리에 적합합니다.', tag: '보통' },
    { roleName: '기술 리더', score: 68, reason: '장기적 성장으로 리더십 역량을 발휘할 수 있습니다.', tag: '보통' },
  ],
  monthlyForecast: [
    { month: 3, score: 80, status: 'LUCKY', advice: '입사 시기로 최적입니다. 적극적으로 도전하세요.' },
    { month: 4, score: 60, status: 'NORMAL', advice: '안정적인 적응 기간입니다.' },
    { month: 5, score: 70, status: 'LUCKY', advice: '성과를 보여줄 좋은 기회입니다.' },
    { month: 6, score: 50, status: 'CAUTION', advice: '신중하게 관계를 쌓아나가세요.' },
    { month: 9, score: 40, status: 'CAUTION', advice: '급격한 변화보다는 안정을 유지하세요.' },
  ],
  cautions: [
    '조직 문화의 급격한 변화에 유의하세요.',
    '자율성 부족 시 스트레스가 쌓일 수 있습니다.',
  ],
};

export const mockCompanyAutocomplete = {
  suggestions: ['삼성전자', '삼성SDS', '삼성생명', '삼성화재', '삼성증권'],
};
