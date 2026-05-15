# Feature Specification: 기업 궁합 분석

**Feature Branch**: `006-company-compatibility`  
**Created**: 2026-05-15  
**Priority**: P2 (부가 분석)  
**Status**: Active  

---

## Overview

사용자가 ChatInput에서 입력한 생년월일/시간을 기반으로, 특정 기업의 설립일/시간과의 궁합 점수 및 직무별 매칭도를 분석받는 경험입니다.

**Why this Priority**:
- 취업 준비생이 특정 회사 지원 전 실제 적합성을 판단하는 데 도움
- 기업 정보 자동 조회 실패 시 수동 입력 폴백 제공
- **P2**: 선택적 부가 기능

---

## User Story 5 - 기업 궁합 분석

### Acceptance Scenarios

1. **Given** ServiceSelect에서 "기업 궁합 분석" 카드 선택 **When** 화면 전환 **Then** "기업을 검색해주세요" 입력 필드 + 자동완성 드롭다운 표시

2. **Given** 기업명 입력 **When** 자동완성 목록 표시 **Then** 기업명 + 설립일 매칭 정보 표시

3. **Given** 기업 선택 **When** 설립일이 자동 입력 **Then** 필요 시 수동 수정 가능, "분석하기" 버튼 활성화

4. **Given** "분석하기" 클릭 **When** 5-8초 로딩 **Then** 궁합 점수(0-100) + 직무별 매칭 카드 그리드 표시

5. **Given** 기업 정보 자동 조회 실패 **When** 폴백 UI 표시 **Then** 설립일 수동 입력 필드 표시

---

## Functional Requirements

| FR | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-008 | 기업 정보 조회 (설립일 포함) | Required |
| FR-029 | 기업명 자동완성 (`POST /api/company/autocomplete`) | Required |
| FR-028 | 타임아웃 처리 (5초 자동완성, 8초 분석) | Required |

---

## Key Entities

**CompatibilityData**
```
{
  sajuResultId: string,
  companyName: string,
  companyEstablishedDate: string,
  compatibilityScore: number (0-100),
  jobMatching: {
    jobTitle: string,
    matchScore: number
  }[],
  monthlyFortune: {...},
  createdAt: datetime
}
```

---

## Success Criteria

| 기준 | 측정 방법 |
|------|---------|
| S-012 | 5-8초 이내 궁합 점수 표시 |
| UX-003 | 기업명 자동완성이 정확함 |

---

## Assumptions

- 공공데이터 API 제공 (기업 설립일)
- 기업명이 유일함

---

## Edge Cases

- **Case 1**: 기업이 없을 때
  - **Action**: 수동 설립일 입력
- **Case 2**: 설립일이 미상일 때
  - **Action**: 기본값 설정, 안내 메시지

---

## Dependencies

← 001-landing-pages (생년월일/시간)  
→ 002-social-login (결과 저장)

---

**Updated**: 2026-05-15  
**Version**: 1.0
