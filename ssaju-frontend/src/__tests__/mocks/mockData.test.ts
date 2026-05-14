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
import { mockUser, mockAuthStatus } from '@/mocks/data/auth';
import { mockCompatibilityResult, mockCompanyAutocomplete } from '@/mocks/data/company';

describe('mockCareerTimingResult', () => {
  it('필수 필드 존재', () => {
    expect(mockCareerTimingResult.sajuResultId).toBeTruthy();
    expect(mockCareerTimingResult.h1Period).toBeTruthy();
    expect(mockCareerTimingResult.h2Period).toBeTruthy();
  });

  it('신뢰도 점수는 0-100 범위', () => {
    expect(mockCareerTimingResult.h1Confidence).toBeGreaterThanOrEqual(0);
    expect(mockCareerTimingResult.h1Confidence).toBeLessThanOrEqual(100);
    expect(mockCareerTimingResult.h2Confidence).toBeGreaterThanOrEqual(0);
    expect(mockCareerTimingResult.h2Confidence).toBeLessThanOrEqual(100);
  });

  it('recommendation 텍스트 존재', () => {
    expect(typeof mockCareerTimingResult.recommendation).toBe('string');
    expect(mockCareerTimingResult.recommendation.length).toBeGreaterThan(0);
  });
});

describe('mockConsultationData', () => {
  it('필수 필드 존재', () => {
    expect(mockConsultationData.sajuResultId).toBeTruthy();
    expect(mockConsultationData.recommendedIndustries).toBeTruthy();
    expect(mockConsultationData.monthlyForecasts).toHaveLength(12);
  });

  it('CareerTiming과 동일한 sajuResultId 사용', () => {
    expect(mockConsultationData.sajuResultId).toBe(mockCareerTimingResult.sajuResultId);
  });

  it('8개 탭 데이터 모두 존재', () => {
    expect(Array.isArray(mockConsultationData.recommendedIndustries)).toBe(true);
    expect(Array.isArray(mockConsultationData.interviewTips)).toBe(true);
    expect(Array.isArray(mockConsultationData.strengths)).toBe(true);
    expect(mockConsultationData.sajuProfile).toBeDefined();
    expect(mockConsultationData.wealthStyle).toBeDefined();
    expect(mockConsultationData.careerRoadmap).toBeDefined();
    expect(mockConsultationData.branding).toBeDefined();
    expect(Array.isArray(mockConsultationData.monthlyForecasts)).toBe(true);
  });
});

describe('mockUser', () => {
  it('필수 사용자 정보 존재', () => {
    expect(mockUser.userId).toBeTruthy();
    expect(mockUser.name).toBeTruthy();
    expect(['KAKAO', 'GOOGLE']).toContain(mockUser.socialProvider);
  });

  it('이메일 형식 유효', () => {
    expect(mockUser.email).toMatch(/@/);
  });
});

describe('mockAuthStatus', () => {
  it('로그인 상태 true', () => {
    expect(mockAuthStatus.isLoggedIn).toBe(true);
  });

  it('user 객체 포함', () => {
    expect(mockAuthStatus.user).toBeDefined();
    expect(mockAuthStatus.user.userId).toBe(mockUser.userId);
  });
});

describe('mockCompatibilityResult', () => {
  it('필수 필드 존재', () => {
    expect(mockCompatibilityResult.sajuResultId).toBeTruthy();
    expect(mockCompatibilityResult.companyName).toBeTruthy();
  });

  it('궁합 점수는 0-100 범위', () => {
    expect(mockCompatibilityResult.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(mockCompatibilityResult.compatibilityScore).toBeLessThanOrEqual(100);
  });

  it('직무 매칭 카드 배열 존재', () => {
    expect(Array.isArray(mockCompatibilityResult.jobMatchCards)).toBe(true);
    expect(mockCompatibilityResult.jobMatchCards.length).toBeGreaterThan(0);
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
