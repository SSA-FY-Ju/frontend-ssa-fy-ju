/**
 * formatters 유틸리티 테스트
 *
 * 커버리지 대상: src/services/utils/formatters.ts (0% → 100%)
 */

import {
  formatDateKo,
  formatTimestamp,
  parseBirthDateTime,
  formatConfidenceScore,
  formatAnalysisType,
  formatSatisfaction,
  formatCharCount,
} from '@/services/utils/formatters';

describe('formatDateKo', () => {
  it('유효한 ISO 날짜를 한국어 형식으로 변환', () => {
    expect(formatDateKo('2024-01-15')).toBe('2024년 1월 15일');
  });

  it('두 자리 월/일도 올바르게 변환', () => {
    expect(formatDateKo('1990-10-10')).toBe('1990년 10월 10일');
  });

  it('잘못된 날짜 문자열은 원본 반환', () => {
    expect(formatDateKo('invalid-date')).toBe('invalid-date');
  });

  it('빈 문자열은 원본 반환', () => {
    expect(formatDateKo('')).toBe('');
  });
});

describe('formatTimestamp', () => {
  it('Unix 타임스탬프를 날짜+시간 형식으로 변환', () => {
    // 2024-11-15 00:00:00 UTC를 기준으로 변환
    const ts = new Date('2024-11-15T00:00:00.000Z').getTime();
    const result = formatTimestamp(ts);
    // 타임존에 따라 결과가 달라질 수 있으므로 형식만 검증
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('0 타임스탬프도 포맷 가능', () => {
    const result = formatTimestamp(0);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe('parseBirthDateTime', () => {
  it('유효한 날짜와 시간 파싱', () => {
    expect(parseBirthDateTime('1990-10-10', '14:30')).toEqual({
      birthDate: '1990-10-10',
      birthTime: '14:30',
    });
  });

  it('시간 미입력 시 기본값 12:00 적용', () => {
    expect(parseBirthDateTime('1990-10-10')).toEqual({
      birthDate: '1990-10-10',
      birthTime: '12:00',
    });
  });

  it('잘못된 날짜 형식은 빈 문자열 반환', () => {
    expect(parseBirthDateTime('10-10-1990', '14:30')).toEqual({
      birthDate: '',
      birthTime: '14:30',
    });
  });

  it('잘못된 시간 형식은 기본값 12:00 적용', () => {
    expect(parseBirthDateTime('1990-10-10', '25:00')).toEqual({
      birthDate: '1990-10-10',
      birthTime: '12:00',
    });
  });

  it('경계값 시간 00:00 유효', () => {
    expect(parseBirthDateTime('1990-10-10', '00:00')).toEqual({
      birthDate: '1990-10-10',
      birthTime: '00:00',
    });
  });

  it('경계값 시간 23:59 유효', () => {
    expect(parseBirthDateTime('1990-10-10', '23:59')).toEqual({
      birthDate: '1990-10-10',
      birthTime: '23:59',
    });
  });
});

describe('formatConfidenceScore', () => {
  it('정수 점수 포맷', () => {
    expect(formatConfidenceScore(85)).toBe('85%');
  });

  it('소수점 점수 반올림', () => {
    expect(formatConfidenceScore(84.6)).toBe('85%');
  });

  it('0점 포맷', () => {
    expect(formatConfidenceScore(0)).toBe('0%');
  });

  it('100점 포맷', () => {
    expect(formatConfidenceScore(100)).toBe('100%');
  });
});

describe('formatAnalysisType', () => {
  it('CAREER_TIMING → 관운 분석', () => {
    expect(formatAnalysisType('CAREER_TIMING')).toBe('관운 분석');
  });

  it('CONSULTATION → AI 컨설팅', () => {
    expect(formatAnalysisType('CONSULTATION')).toBe('AI 컨설팅');
  });

  it('COMPATIBILITY → 기업 궁합', () => {
    expect(formatAnalysisType('COMPATIBILITY')).toBe('기업 궁합');
  });
});

describe('formatSatisfaction', () => {
  it('SATISFIED → 만족함', () => {
    expect(formatSatisfaction('SATISFIED')).toBe('만족함');
  });

  it('UNSATISFIED → 만족하지 않음', () => {
    expect(formatSatisfaction('UNSATISFIED')).toBe('만족하지 않음');
  });
});

describe('formatCharCount', () => {
  it('현재 글자 수와 최대 글자 수 포맷', () => {
    expect(formatCharCount(120, 500)).toBe('120 / 500');
  });

  it('0자 입력 상태 포맷', () => {
    expect(formatCharCount(0, 500)).toBe('0 / 500');
  });

  it('최대에 도달한 상태 포맷', () => {
    expect(formatCharCount(500, 500)).toBe('500 / 500');
  });
});
