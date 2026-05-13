/**
 * 날짜/시간 파싱 및 표시 유틸리티 (date-fns 활용)
 */

import { format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 한국어 형식으로 포맷
 * 예: "2024-01-15" → "2024년 1월 15일"
 */
export function formatDateKo(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'yyyy년 M월 d일', { locale: ko });
  } catch {
    // 파싱 실패 시 원본 문자열 그대로 반환 — UI 렌더링 차단 불필요
    return dateStr;
  }
}

/**
 * Unix 타임스탬프를 날짜+시간 형식으로 포맷
 * 예: 1700000000000 → "2024-11-14 22:13"
 */
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    if (!isValid(date)) return '';
    return format(date, 'yyyy-MM-dd HH:mm');
  } catch {
    // 잘못된 타임스탬프 — 빈 문자열로 안전하게 폴백
    return '';
  }
}

/**
 * 날짜+시간 문자열을 API 요청 형식으로 파싱
 * 입력: "1990-05-15", "14:30"
 * 출력: { birthDate: "1990-05-15", birthTime: "14:30" }
 */
export function parseBirthDateTime(
  dateStr: string,
  timeStr: string = '12:00',
): { birthDate: string; birthTime: string } {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  return {
    birthDate: dateRegex.test(dateStr) ? dateStr : '',
    birthTime: timeRegex.test(timeStr) ? timeStr : '12:00',
  };
}

/**
 * 신뢰도 점수(0-100)를 퍼센트 문자열로 변환
 * 예: 85 → "85%"
 */
export function formatConfidenceScore(score: number): string {
  return `${Math.round(score)}%`;
}

/**
 * 분석 타입을 한국어로 변환
 */
export function formatAnalysisType(
  type: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY',
): string {
  const labels = {
    CAREER_TIMING: '관운 분석',
    CONSULTATION: 'AI 컨설팅',
    COMPATIBILITY: '기업 궁합',
  };
  return labels[type];
}

/**
 * 숫자를 1-5 별점 텍스트로 변환
 */
export function formatSatisfaction(status: 'SATISFIED' | 'UNSATISFIED'): string {
  return status === 'SATISFIED' ? '만족함' : '만족하지 않음';
}

/**
 * 피드백 글자 수 표시
 * 예: (120, 500) → "120 / 500"
 */
export function formatCharCount(current: number, max: number): string {
  return `${current} / ${max}`;
}
