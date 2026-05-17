# Feature Specification: 관운 기반 채용 시기 분석

**Feature Branch**: `004-career-timing`  
**Created**: 2026-05-15  
**Priority**: P1 (핵심 분석)  
**Status**: Active  

---

## Overview

사용자가 ChatInput에서 입력한 생년월일/시간을 바탕으로, 상반기(H1) 또는 하반기(H2) 중 언제가 채용 운이 좋은 시기인지 분석받는 경험입니다.

**Why this Priority**:
- 프로젝트의 핵심 기능이며, 다른 모든 분석의 기반
- SajuResult ID를 생성하여 이후 다른 분석들과 연결되는 기초 기능
- **P1**: 가장 빠른 결과 피드백으로 사용자 확신 제공

---

## User Story 3 - 관운 기반 채용 시기 분석

### Acceptance Scenarios

1. **Given** ChatInput에서 생년월일 "1990-10-10", 시간 "14:30" 입력 완료 후 ServiceSelect에서 "관운 분석" 카드를 선택 **When** 분석 시작 **Then** 
   - 고지 문구 "본 사주는 재미로 보는 것이니 참고만 바랍니다"가 페이드 인 오버레이로 강조 표시
   - 정확히 1.5초 후 자동으로 로딩 상태(진행 바)로 전환
   - 3-5초 로딩 후 H1 또는 H2 결과와 신뢰도 프로그레스 바(75% 예시)가 표시, 분석 근거(텍스트) 함께 제시

2. **Given** ChatInput에서 시간을 기본값(12:00)으로 유지한 채 날짜만 입력 **When** 관운 분석 시작 **Then** 시간이 미상인 경우 기본값으로 12:00(정오)이 자동 적용되며 분석 진행

3. **Given** 분석 결과가 표시된 후 **When** 결과 하단의 FeedbackBlock 확인 **Then** 모달 없이 "✦ 좋았어요 / ✧ 아쉬워요" 칩이 인라인으로 표시되어 선택 후 즉시 의견 입력 가능

4. **Given** 사용자가 생년월일 형식이 잘못된 값(예: "10-10-1990")을 입력 **When** "분석하기" 클릭 **Then** "생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)" 메시지 표시, 입력 필드 강조

5. **Given** 사용자가 "분석하기" 버튼 클릭 **When** 고지 문구 "본 사주는 재미로 보는 것이니 참고만 바랍니다"가 화면에 강조 노출 **Then** 별도의 확인 버튼 없이 정확히 1.5초(±50ms) 동안 예쁘게 표시된 후 자동으로 실제 로딩 상태(진행 바)로 자연스럽게 전환됨

---

## Functional Requirements

| FR | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-001 | 생년월일 입력 검증 (YYYY-MM-DD) | Required |
| FR-002 | 시간 입력 검증 (HH:mm, 기본값 12:00) | Required |
| FR-003 | 관운 분석 API 호출 (POST /api/career/timing) | Required |
| FR-004 | 신뢰도 점수 표시 (0-100 범위) | Required |
| FR-005 | 분석 근거 텍스트 제시 | Required |
| FR-006 | API 응답 Zod 검증 | Required |
| FR-026 | 타임아웃 처리 (10초, 재시도 3회) | Required |
| FR-055 | 고지 문구 오버레이 페이드인 | Required |
| FR-056 | 고지 문구 자동 로딩 전환 (1.5초) | Required |

---

## Key Entities

**CareerTimingData**
```
{
  sajuResultId: string,
  birthDate: string (YYYY-MM-DD),
  birthTime: string (HH:mm),
  favoredPeriod: 'H1' | 'H2',
  confidenceScore: number (0-100),
  reasoning: string,
  createdAt: datetime
}
```

---

## Success Criteria

| 기준 | 측정 방법 |
|------|---------|
| S-010 | 3-5초 이내 분석 결과 표시 |
| UX-001 | 고지 문구 타이밍이 부자연스럽지 않음 |
| UX-014 | 신뢰도 점수가 직관적으로 이해 가능 |
| UX-015 | 분석 근거가 사용자에게 설득력 있음 |

---

## Assumptions

- 백엔드가 사주 분석 알고리즘 제공
- 생년월일은 1900~2030년 범위 내
- 신뢰도는 머신러닝 모델 기반

---

## Edge Cases

- **Case 1**: API 타임아웃
  - **Action**: 최대 3회 자동 재시도 후 "분석이 지연되고 있습니다" 메시지
- **Case 2**: 고지 문구 표시 중 사용자 입력
  - **Action**: 입력 무시, 1.5초 후 자동 진행
- **Case 3**: 시간 미상 사용자
  - **Action**: 12:00으로 자동 설정, "시간이 미상입니다" 안내

---

## Dependencies

← 001-landing-pages (생년월일/시간 입력)  
→ 002-social-login (결과 저장)  
→ 005-consultation (추가 분석 진입)

---

**Updated**: 2026-05-15  
**Version**: 1.0
