# Feature Specification: 라우트 가드 및 비정상 접근 방어

**Feature Branch**: `008-route-guards`  
**Created**: 2026-05-15  
**Priority**: P1 (보안 & 접근성)  
**Status**: Active  

---

## Overview

사용자의 비정상적인 접근(입력 건너뛰기, 세션 조작, 만료된 URL, 권한 없는 접근)을 방어하고 우아하게 복구하는 4가지 라우트 가드 메커니즘입니다.

**Why this Priority**:
- 사용자 데이터 무결성 보호
- 세션 일관성 유지
- **P1**: 안정적인 사용자 경험 제공

---

## Route Guard Strategies

### 1. Step Guard — 미입력 단계 건너뛰기 방어 (FR-076)

**목적**: 사용자가 `/services`, `/result/*`에 직접 접근할 때 필수 입력값(생년월일) 확인

**구현 패턴**:
- `/services`, `/result/**` 라우트에서 sessionStore의 `birthDate` 확인
- 없으면 즉시 `/survey`로 리다이렉트
- 토스트: "먼저 기본 정보를 입력해주세요"

### 2. Storage Validation — 세션 조작 방어 (FR-077)

**목적**: `sessionStorage` 데이터를 Zod 스키마로 검증하여 오염된 데이터 탐지

**검증 필드**:
- `birthDate`: YYYY-MM-DD 형식
- `birthTime`: HH:mm 형식 (기본값: 12:00)

**오염 시 처리**:
- 데이터 자동 초기화
- `/survey`로 리다이렉트
- 토스트: "세션이 만료되었습니다. 다시 시작해주세요"

### 3. 404 Fallback — 만료된 결과 URL 접근 방어 (FR-078)

**목적**: 복사해둔 `/result/timing?id=abc123` URL이 백엔드에서 만료된 경우 우아하게 복구

**처리**:
- API 404 에러 감지
- ExpiredResultModal 표시 ("분석 결과 만료" 안내)
- "새 분석 시작" 버튼 클릭 시 `/survey`로 이동

### 4. Auth Guard — 권한 없는 접근 방어 (FR-079)

**목적**: 비로그인 사용자가 `/my-page`로 직접 접근하는 것을 방지

**처리**:
- `useAuthGuard(true)` 훅으로 authStore 확인
- 로그인 미확인 시 `/`로 리다이렉트
- 루트에서 자연스럽게 로그인 유도

---

## Functional Requirements

| FR | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-076 | Step Guard: 미입력 단계 건너뛰기 방어 | Required |
| FR-077 | Storage Validation: 세션 조작 방어 (Zod 검증) | Required |
| FR-078 | 404 Fallback: 만료된 URL 접근 방어 | Required |
| FR-079 | Auth Guard: 권한 없는 접근 방어 | Required |

---

## Success Criteria

| 기준 | 측정 방법 |
|------|---------|
| S-003 | 비정상 접근 3초 이내 리다이렉트 |
| UX-011 | 리다이렉트 메시지가 사용자를 당황시키지 않음 |

---

## Test Cases

- ✅ **정상**: 입력 → 서비스 선택 → 결과 조회
- ✅ **비정상 1**: `/services` 직접 접근 → `/survey` 리다이렉트
- ✅ **비정상 2**: `/my-page` 직접 접근 (비로그인) → `/` 리다이렉트
- ✅ **비정상 3**: sessionStorage 수정 → `/survey` 리다이렉트
- ✅ **비정상 4**: 만료된 결과 URL → ExpiredResultModal + `/survey`

---

## Implementation Priority

1. **Phase 9-T130**: useSessionRehydration() 구현 (app/layout.tsx 호출)
2. **Phase 9-T131**: useRouteGuard() 구현 (birthDate 검증)
3. **Phase 9-T132**: useAuthGuard() 구현 (로그인 검증)
4. **Phase 9-T133**: ExpiredResultModal 구현
5. **Phase 9-T134**: 모든 페이지에 가드 적용
6. **Phase 9-T135**: E2E 테스트

---

## Dependencies

← 001-landing-pages (입력 단계)  
← 002-social-login (인증 상태)  
← 004~006 (결과 화면)

---

**Updated**: 2026-05-15  
**Version**: 1.0
