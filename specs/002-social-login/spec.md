# Feature Specification: 소셜 로그인 및 회원 관리

**Feature Branch**: `002-social-login`  
**Created**: 2026-05-15  
**Priority**: P1 (분석 결과 저장의 기반)  
**Status**: Active  

---

## Overview

사용자가 카카오 또는 구글 소셜 로그인을 통해 계정을 연결하고, 분석 결과를 영구적으로 저장하여 나중에 다시 확인할 수 있는 경험입니다.

**Why this Priority**:
- 분석 결과 저장 및 히스토리 조회의 핵심 기반
- 사용자가 분석 결과의 영속성을 기대하는 필수 기능
- **P1**: 마이페이지 기능의 전제 조건

---

## User Story 1 - 소셜 로그인 및 회원 관리

### Acceptance Scenarios

1. **Given** 비로그인 상태 사용자 **When** 헤더의 "로그인" 버튼 클릭 **Then** "카카오로 계속하기" 또는 "구글로 계속하기" 옵션 표시

2. **Given** 카카오 로그인 선택 **When** 카카오 인증 팝업에서 승인 **Then** 팝업 닫히고 사용자가 자동으로 로그인됨, 헤더에 "프로필" 또는 "내 분석" 메뉴로 변경

3. **Given** 로그인된 상태 **When** 분석 완료 후 결과 화면 **Then** 결과 하단에 "이 결과 저장하기" 버튼 활성화되어 클릭 시 분석 기록이 백엔드에 저장

4. **Given** 비로그인 상태 분석 진행 **When** 분석 결과 표시 **Then** "결과를 저장하려면 로그인해주세요" 안내문과 "로그인하기" 버튼 표시

5. **Given** 로그인 후 결과 저장 **When** "저장 완료" 메시지 표시 **Then** 해당 분석 기록이 마이페이지에서 즉시 조회 가능

6. **Given** 비로그인 상태 분석 완료 후 페이지 하단에서 휘발성 경고 메시지 확인 **When** 소셜 로그인 버튼(카카오/구글) 클릭하여 인증 완료 **Then** 현재 분석 결과가 백엔드에 자동으로 저장되고 "분석 결과가 저장되었습니다" 메시지 표시, 마이페이지에서 즉시 조회 가능

---

## Functional Requirements

| FR | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-011 | 헤더 로그인 버튼 (비로그인 상태) | Required |
| FR-012 | 카카오/구글 OAuth 팝업 | Required |
| FR-013 | OAuth 콜백 처리 및 토큰 저장 (HttpOnly Cookie) | Required |
| FR-014 | 로그인 후 헤더 상태 변경 (프로필/내 분석 메뉴) | Required |
| FR-015 | 분석 결과 저장 버튼 (로그인 사용자만) | Required |
| FR-016 | 비로그인 사용자 분석 결과 저장 유도 메시지 | Required |

---

## Key Entities

**User**
```
{
  id: string (UUID),
  provider: 'KAKAO' | 'GOOGLE',
  email: string,
  name: string,
  profileImage: string (optional),
  createdAt: datetime,
  lastLoginAt: datetime
}
```

**SajuResult** (확장)
```
{
  id: string (UUID),
  userId: string (nullable, 비로그인 사용자는 null),
  isSaved: boolean,
  savedAt: datetime (nullable),
  ...analysisData
}
```

---

## Success Criteria

| 기준 | 측정 방법 |
|------|---------|
| S-005 | 로그인 완료 후 2초 이내 헤더 업데이트 |
| S-006 | 로그인 사용자의 분석 결과 저장 성공률 100% |
| S-008 | HttpOnly 쿠키로 토큰 저장 (XSS 방지) |
| UX-002 | 로그인 흐름이 비직관적이지 않음 |

---

## Assumptions

- OAuth 제공자 (카카오, 구글)와 백엔드 통합 완료
- HttpOnly 쿠키 설정 가능 (HTTPS)
- 사용자는 소셜 계정 1개만 보유

---

## Edge Cases

- **Case 1**: OAuth 토큰 만료
  - **Action**: 자동 로그아웃, "다시 로그인해주세요" 메시지
- **Case 2**: 분석 결과 저장 중 네트워크 오류
  - **Action**: 재시도 버튼 제공, 최대 3회 재시도
- **Case 3**: 동일 이메일로 카카오/구글 중복 가입
  - **Action**: 기존 계정으로 병합 또는 선택 화면

---

## Dependencies

← 001-landing-pages (ChatInput에서 생성된 sajuResultId)  
→ 003-my-page-history (저장된 결과 조회)  
→ 004~007 (분석 결과 저장)

---

**Updated**: 2026-05-15  
**Version**: 1.0
