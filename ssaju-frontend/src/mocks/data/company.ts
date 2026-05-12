/**
 * 기업 궁합 목업 데이터
 */

import type { CompatibilityResult } from '@/types/api';

export const mockCompatibilityResult: CompatibilityResult = {
  sajuResultId: 'mock-saju-result-001',
  companyName: '삼성전자',
  compatibilityScore: 78,
  cultureFit: 72,
  careerGrowthScore: 85,
  jobTypeMatch: '소프트웨어 엔지니어, 데이터 사이언티스트 직무와 높은 궁합',
  matchedJobPositions: ['소프트웨어 엔지니어', '데이터 사이언티스트', 'AI 연구원'],
  recommendation:
    '삼성전자와의 궁합은 매우 좋습니다. 특히 DS부문에서의 성장 가능성이 높으며, 안정적인 환경에서 전문성을 키울 수 있습니다.',
};

export const mockCompanyAutocomplete = {
  suggestions: ['삼성전자', '삼성SDS', '삼성생명', '삼성화재', '삼성증권'],
};
