# Feature Specification: 만족도 피드백

**Feature Branch**: `007-feedback`  
**Created**: 2026-05-15  
**Priority**: P1 (사용자 피드백)  
**Status**: Active  

---

## Overview

모든 분석 결과 화면에서 사용자가 해당 분석에 대한 만족도를 "좋았어요 / 아쉬워요" 칩 선택과 함께 최대 500자의 텍스트 의견을 제출할 수 있는 인라인 피드백 기능입니다.

**Why this Priority**:
- 사용자 만족도 측정 및 서비스 개선 피드백 수집
- 모든 분석의 마지막 스텝으로 사용자 경험 완성
- **P1**: 품질 관리 및 제품 개선의 핵심 데이터

---

## User Story 6 - 만족도 피드백

### Acceptance Scenarios

1. **Given** 분석 결과 화면 표시 **When** 페이지 스크롤 **Then** 하단에 FeedbackBlock 표시:
   - "이 분석이 도움이 되셨나요?" 질문
   - "✦ 좋았어요" / "✧ 아쉬워요" 칩 (클릭 가능)

2. **Given** 칩 선택 **When** 칩 클릭 **Then** 선택된 칩 강조 표시, 하단에 텍스트 입력 필드 및 카운터(0/500) 표시

3. **Given** 텍스트 입력 **When** 입력 필드에 텍스트 작성 **Then** 실시간 문자 수 카운터 업데이트

4. **Given** 500자 도달 **When** 추가 입력 시도 **Then** 입력 불가, "최대 500자입니다" 메시지 표시

5. **Given** 텍스트 입력 완료 **When** "제출" 버튼 클릭 **Then** "감사합니다! 소중한 의견입니다." 메시지 표시, 피드백 백엔드 저장

6. **Given** 텍스트 없이 칩만 선택 **When** "제출" 클릭 **Then** 피드백만 저장, 완료 메시지

---

## Functional Requirements

| FR | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-009 | 피드백 API 호출 (`POST /api/feedback/satisfaction`) | Required |
| FR-010 | 만족도 선택 (좋았어요/아쉬워요) | Required |
| FR-031 | 텍스트 입력 필드 (최대 500자) | Required |
| FR-032 | 문자 수 카운터 실시간 업데이트 | Required |
| FR-033 | 제출 버튼 상태 관리 (활성/비활성) | Required |

---

## Key Entities

**UserFeedback**
```
{
  id: string,
  userId: string (nullable, 비로그인도 가능),
  sajuResultId: string,
  feedbackType: 'POSITIVE' | 'NEGATIVE',
  comment: string (최대 500자),
  createdAt: datetime
}
```

---

## Success Criteria

| 기준 | 측정 방법 |
|------|---------|
| S-013 | 피드백 제출 성공률 100% |
| UX-004 | 피드백 인터페이스가 부담스럽지 않음 |

---

## Assumptions

- 비로그인 사용자도 피드백 제출 가능
- 피드백은 분석 완료 후에만 표시
- 중복 피드백은 덮어쓰기 (선택사항)

---

## Edge Cases

- **Case 1**: 피드백 제출 중 네트워크 오류
  - **Action**: 재시도 버튼 제공
- **Case 2**: 사용자가 칩 변경
  - **Action**: 이전 선택 취소, 새 선택으로 업데이트
- **Case 3**: 텍스트 복사/붙여넣기로 500자 초과
  - **Action**: 초과분 자동 제거, 안내 메시지

---

## Dependencies

← 004~006 (분석 결과 화면)  
← 002-social-login (선택사항, 비로그인도 가능)

---

**Updated**: 2026-05-15  
**Version**: 1.0
