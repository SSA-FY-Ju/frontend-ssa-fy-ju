/**
 * 입력 검증 유틸리티 테스트
 */

import {
  birthDateSchema,
  birthTimeSchema,
  companyNameSchema,
  satisfactionSchema,
  feedbackContentSchema,
  validateForm,
  careerTimingFormSchema,
} from '@/services/utils/validation';

describe('birthDateSchema', () => {
  it('유효한 날짜를 허용한다', () => {
    expect(birthDateSchema.safeParse('1990-05-15').success).toBe(true);
  });

  it('YYYY-MM-DD 형식이 아니면 실패한다', () => {
    expect(birthDateSchema.safeParse('1990/05/15').success).toBe(false);
    expect(birthDateSchema.safeParse('19900515').success).toBe(false);
  });

  it('미래 날짜는 실패한다', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    expect(birthDateSchema.safeParse(futureDateStr).success).toBe(false);
  });

  it('유효하지 않은 날짜는 실패한다', () => {
    expect(birthDateSchema.safeParse('1990-13-01').success).toBe(false);
  });
});

describe('birthTimeSchema', () => {
  it('유효한 시간을 허용한다', () => {
    expect(birthTimeSchema.safeParse('14:30').success).toBe(true);
    expect(birthTimeSchema.safeParse('00:00').success).toBe(true);
    expect(birthTimeSchema.safeParse('23:59').success).toBe(true);
  });

  it('미입력 시 12:00으로 기본값 설정', () => {
    const result = birthTimeSchema.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('12:00');
  });

  it('빈 문자열은 12:00으로 변환', () => {
    const result = birthTimeSchema.safeParse('');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('12:00');
  });
});

describe('companyNameSchema', () => {
  it('유효한 기업명을 허용한다', () => {
    expect(companyNameSchema.safeParse('삼성전자').success).toBe(true);
  });

  it('빈 문자열은 실패한다', () => {
    expect(companyNameSchema.safeParse('').success).toBe(false);
  });

  it('100자 초과는 실패한다', () => {
    expect(companyNameSchema.safeParse('a'.repeat(101)).success).toBe(false);
  });

  it('HTML 특수문자를 이스케이프한다', () => {
    const result = companyNameSchema.safeParse('<script>alert(1)</script>');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toContain('<script>');
      expect(result.data).toContain('&lt;script&gt;');
    }
  });
});

describe('satisfactionSchema', () => {
  it('SATISFIED를 허용한다', () => {
    expect(satisfactionSchema.safeParse('SATISFIED').success).toBe(true);
  });

  it('UNSATISFIED를 허용한다', () => {
    expect(satisfactionSchema.safeParse('UNSATISFIED').success).toBe(true);
  });

  it('유효하지 않은 값은 실패한다', () => {
    expect(satisfactionSchema.safeParse('NEUTRAL').success).toBe(false);
  });
});

describe('feedbackContentSchema', () => {
  it('500자 이하를 허용한다', () => {
    expect(feedbackContentSchema.safeParse('좋습니다').success).toBe(true);
  });

  it('500자 초과는 실패한다', () => {
    expect(feedbackContentSchema.safeParse('a'.repeat(501)).success).toBe(false);
  });

  it('미입력 허용', () => {
    expect(feedbackContentSchema.safeParse(undefined).success).toBe(true);
  });
});

describe('validateForm', () => {
  it('유효한 데이터는 success: true 반환', () => {
    const result = validateForm(careerTimingFormSchema, {
      birthDate: '1990-05-15',
      birthTime: '14:30',
    });
    expect(result.success).toBe(true);
  });

  it('유효하지 않은 데이터는 에러 반환', () => {
    const result = validateForm(careerTimingFormSchema, {
      birthDate: 'invalid-date',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toHaveProperty('birthDate');
    }
  });
});
