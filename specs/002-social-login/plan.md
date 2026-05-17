# Implementation Plan: 소셜 로그인 및 회원 관리

**Feature**: 002-social-login  
**Phase**: Phase 1 (Authentication & Persistence)  
**Created**: 2026-05-15  
**Status**: Ready for Implementation  

---

## Executive Summary

Kakao 및 Google OAuth를 통한 소셜 로그인 구현으로 사용자가 분석 결과를 영구적으로 저장하고, 마이페이지에서 히스토리를 관리할 수 있는 기반을 제공합니다.

### Key Metrics
- **OAuth Flow Completion**: 100%
- **Token Security**: HttpOnly Cookie (XSS 방지)
- **Result Save Success Rate**: > 99%

---

## Technical Context

### Architecture Overview

```
Auth Flow:
1. Header "로그인" 버튼 클릭
2. Modal: Kakao/Google 선택
3. OAuth Popup (외부 제공자)
4. Callback: /api/auth/callback
5. Token → HttpOnly Cookie (서버)
6. authStore 업데이트 → UI 렌더링

Result Save Flow:
1. 분석 완료 후 결과 페이지
2. "이 결과 저장하기" 버튼 (로그인 사용자만)
3. POST /api/result/save
4. 백엔드 저장 → "저장 완료" 토스트
5. /my-page에서 즉시 조회 가능
```

### Key Technologies & Constraints

| 항목 | 선택 | 이유 |
|------|------|------|
| OAuth | Kakao + Google | 국내/글로벌 커버 |
| Token Storage | HttpOnly Cookie | XSS 방지 |
| State Management | Zustand (authStore) | Constitution IV |
| Callback Handler | Next.js API Route | 서버 토큰 관리 |

### Data Model

#### AuthState (Zustand)

```typescript
{
  isLoggedIn: boolean;
  user: {
    id: string;
    provider: 'KAKAO' | 'GOOGLE';
    email: string;
    name: string;
    profileImage?: string;
  } | null;
  loginModal: {
    isOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
  };
}
```

---

## Implementation Phases

### Phase 1: OAuth Setup (2 days)

**Goal**: Kakao/Google OAuth 통합

**Tasks**:
1. Kakao/Google 개발자 계정 설정 (이미 완료라 가정)
2. OAuth Redirect URI 설정
3. /api/auth/callback 엔드포인트
4. Token → HttpOnly Cookie 저장
5. 에러 처리 (permission denied, network error)

**Acceptance Criteria**:
- ✅ Kakao OAuth 팝업 열림
- ✅ Google OAuth 팝업 열림
- ✅ Callback 성공 시 홈으로 리다이렉트
- ✅ HttpOnly Cookie에 토큰 저장

---

### Phase 2: UI & State Management (1.5 days)

**Goal**: 로그인 UI 및 상태 관리

**Tasks**:
1. LoginModal 컴포넌트 (Kakao/Google 버튼)
2. Header 상태 변경 (비로그인 → "프로필" 메뉴)
3. authStore 초기화 (쿠키에서 토큰 읽기)
4. 프로필 메뉴 (로그아웃, 내 분석)
5. 토큰 만료 시 자동 로그아웃

**Acceptance Criteria**:
- ✅ LoginModal 렌더링
- ✅ 로그인 후 Header 변경
- ✅ 프로필 메뉴 클릭 → 드롭다운
- ✅ 로그아웃 기능

---

### Phase 3: Result Save Integration (1.5 days)

**Goal**: 분석 결과 저장 기능

**Tasks**:
1. 결과 페이지에 "이 결과 저장하기" 버튼 (로그인 사용자만)
2. 비로그인 안내 메시지 (결과 페이지 하단)
3. POST /api/result/save 호출
4. 저장 완료 토스트
5. 재시도 로직 (최대 3회)

**Acceptance Criteria**:
- ✅ 로그인 사용자: 저장 버튼 활성화
- ✅ 비로그인 사용자: 안내 메시지 + 로그인 유도
- ✅ 저장 성공 시 토스트 표시

---

## Success Criteria

| 기준 ID | 측정 기준 | 목표값 | 검증 방법 |
|---------|---------|------|---------|
| S-005 | 로그인 완료 후 헤더 업데이트 | < 2초 | Lighthouse |
| S-006 | 결과 저장 성공률 | > 99% | E2E 테스트 |
| S-008 | HttpOnly 쿠키 보안 | 토큰 XSS 방지 | DevTools 검증 |

---

## Testing Strategy

### Unit Tests

```typescript
- authStore initialization
- loginModal open/close
- OAuth callback handling
- Result save API call
```

### E2E Tests

```typescript
- Complete OAuth flow
- Result save flow
- Auto-logout on token expiry
```

---

## Risk Management

| Risk | Mitigation |
|------|-----------|
| OAuth 권한 거부 | 명확한 에러 메시지 + 재시도 |
| 토큰 만료 | 자동 로그아웃 + 재로그인 유도 |
| 결과 저장 실패 | 재시도 로직 (최대 3회) |

---

## File Structure

### New Files

```
src/components/auth/
├── LoginModal.tsx
├── ProfileMenu.tsx
└── SaveResultButton.tsx

src/app/api/auth/
├── callback/route.ts
└── logout/route.ts

src/stores/
├── authStore.ts (NEW)
```

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1 (OAuth Setup) | 2 days | Ready |
| Phase 2 (UI & State) | 1.5 days | Ready |
| Phase 3 (Save Integration) | 1.5 days | Ready |
| **Total** | **5 days** | **On Track** |

---

**Plan Version**: 1.0  
**Status**: Ready for Implementation
