/**
 * Mock 데이터 구조 테스트
 *
 * 커버리지 대상:
 * - src/mocks/data/career.ts
 * - src/mocks/data/auth.ts
 * - src/mocks/data/company.ts
 *
 * 목적: 목업 데이터가 API 타입 계약을 만족하는지 검증
 */

import { mockCareerTimingResult, mockConsultationData } from '@/mocks/data/career';
import { mockUser } from '@/mocks/data/auth';
import { mockCompatibilityResult, mockCompanyAutocomplete } from '@/mocks/data/company';

describe('mockCareerTimingResult', () => {
  it('필수 필드 존재', () => {
    expect(mockCareerTimingResult.favoredPeriod).toBeTruthy();
    expect(typeof mockCareerTimingResult.confidenceScore).toBe('number');
    expect(mockCareerTimingResult.reasoning).toBeTruthy();
  });

  it('신뢰도 점수는 0-100 범위', () => {
    expect(mockCareerTimingResult.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(mockCareerTimingResult.confidenceScore).toBeLessThanOrEqual(100);
  });

  it('reasoning 텍스트 존재', () => {
    expect(typeof mockCareerTimingResult.reasoning).toBe('string');
    expect(mockCareerTimingResult.reasoning.length).toBeGreaterThan(0);
  });
});

describe('mockConsultationData', () => {
  it('필수 필드 존재', () => {
    expect(mockConsultationData.analysisSummary).toBeTruthy();
    expect(Array.isArray(mockConsultationData.pivotPoints)).toBe(true);
    expect(Array.isArray(mockConsultationData.warningMonths)).toBe(true);
    expect(mockConsultationData.warningDescription).toBeTruthy();
  });

  it('pivotPoints 각 항목에 필수 필드 존재', () => {
    mockConsultationData.pivotPoints.forEach((pt) => {
      expect(pt.month).toBeTruthy();
      expect(typeof pt.score).toBe('number');
      expect(pt.description).toBeTruthy();
    });
  });
});

describe('mockUser', () => {
  it('필수 사용자 정보 존재', () => {
    expect(mockUser.userId).toBeTruthy();
    expect(mockUser.name).toBeTruthy();
    expect(mockUser.email).toBeTruthy();
  });

  it('이메일 형식 유효', () => {
    expect(mockUser.email).toMatch(/@/);
  });
});


describe('mockCompatibilityResult', () => {
  it('시너지/안정성 점수 0-100 범위', () => {
    expect(mockCompatibilityResult.potentialSynergy).toBeGreaterThanOrEqual(0);
    expect(mockCompatibilityResult.potentialSynergy).toBeLessThanOrEqual(100);
    expect(mockCompatibilityResult.longTermStability).toBeGreaterThanOrEqual(0);
    expect(mockCompatibilityResult.longTermStability).toBeLessThanOrEqual(100);
  });

  it('actionableStrategy 필드 존재', () => {
    expect(Array.isArray(mockCompatibilityResult.actionableStrategy.interviewKeywords)).toBe(true);
    expect(mockCompatibilityResult.actionableStrategy.weaknessDefense).toBeTruthy();
    expect(Array.isArray(mockCompatibilityResult.actionableStrategy.bestTiming.luckyDays)).toBe(true);
  });
});

describe('mockCompanyAutocomplete', () => {
  it('suggestions 배열 존재', () => {
    expect(Array.isArray(mockCompanyAutocomplete.suggestions)).toBe(true);
  });

  it('최소 1개 이상의 자동완성 제안', () => {
    expect(mockCompanyAutocomplete.suggestions.length).toBeGreaterThan(0);
  });
});
