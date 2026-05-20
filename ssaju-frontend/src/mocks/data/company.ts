/**
 * 기업 궁합 목업 데이터
 */

import type { CompatibilityResult } from '@/types/api';

export const mockCompatibilityResult: CompatibilityResult = {
  potentialSynergy: 78,
  longTermStability: 82,
  actionableStrategy: {
    interviewKeywords: ['데이터 분석', '협업', '성장 마인드셋', '문제 해결', 'AI 활용'],
    weaknessDefense: '완벽주의 성향이 강한 편이지만, 이를 높은 품질 기준과 꼼꼼한 검토 능력으로 전환하여 팀의 신뢰도를 높이는 방향으로 어필하세요.',
    bestTiming: {
      luckyDays: ['2월 중순 (음력 1월)', '6월 초 (하반기 공채 시즌)', '9월 말 (추분 이후)'],
    },
  },
};

export const mockCompanyAutocomplete = {
  suggestions: ['삼성전자', '삼성SDS', '삼성생명', '삼성화재', '삼성증권'],
};
