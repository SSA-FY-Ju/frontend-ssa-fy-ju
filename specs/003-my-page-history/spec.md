# Feature Specification: 마이페이지 및 분석 히스토리 조회

**Feature Branch**: `003-my-page-history`  
**Created**: 2026-05-15  
**Priority**: P1 (분석 기록 관리)  
**Status**: Active  

---

## Overview

로그인한 사용자가 과거에 수행한 모든 분석 기록(관운, 컨설팅, 궁합)을 한눈에 볼 수 있으며, 각 기록을 클릭하면 해당 시점의 분석 결과 화면을 완전히 재현하여 다시 확인할 수 있는 경험입니다.

**Why this Priority**:
- 사용자가 과거 분석 결과를 언제든 참조할 수 있는 핵심 가치
- 분석 이력 관리 및 비교 분석의 기초
- **P1**: 로그인 기능과 함께 결합되어 서비스의 근본적인 가치 제공

---

## User Story 2 - 마이페이지 및 분석 히스토리 조회

### Acceptance Scenarios

1. **Given** 로그인된 사용자가 마이페이지(`/my-page`) 접속 **When** 페이지 로드 **Then** "내 분석 기록" 제목 + 3가지 탭 표시:
   - 관운 분석 기록
   - AI 컨설팅 기록
   - 기업 궁합 기록

2. **Given** 각 탭 선택 **When** 기록 로드 **Then** 카드 형식으로 기록들 표시:
   - 분석 일시 (예: "2026-05-07 14:30")
   - 분석 대상 정보 (예: "1990-10-10 생년월일")
   - 핵심 결과 미리보기 (예: "H1 권장, 신뢰도 85%")
   - 클릭 가능 상태 표시

3. **Given** 기록 카드 클릭 **When** 상세 페이지 전환 **Then** 해당 분석 결과 화면이 그대로 재현됨:
   - 저장된 데이터가 동일한 레이아웃으로 표시
   - 탭 네비게이션(컨설팅의 경우) 동일하게 작동
   - 로딩 과정 없이 즉시(0.1초 이내) 표시

4. **Given** 재현된 분석 결과 화면 **When** 상단 "뒤로 가기" 또는 "히스토리로 돌아가기" 버튼 클릭 **Then** 마이페이지로 복귀

5. **Given** 기록 카드의 "삭제" 아이콘 클릭 **When** 확인 모달 표시 **Then** "정말 삭제하시겠습니까?" 메시지 + "삭제" / "취소" 버튼

6. **Given** 삭제 확인 **When** "삭제" 클릭 **Then** 해당 기록이 마이페이지에서 즉시 제거되고, 백엔드에서도 삭제 확인

7. **Given** 기록이 없을 때 **When** 마이페이지 탭 확인 **Then** "아직 분석 기록이 없습니다. 지금 분석을 시작해보세요!" 메시지 + "분석하기" 버튼 표시

---

## Functional Requirements

| FR | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-017 | 마이페이지 라우트 `/my-page` (로그인 필수) | Required |
| FR-018 | 3가지 탭 (관운/컨설팅/궁합) | Required |
| FR-019 | 기록 카드 그리드 (일시, 정보, 미리보기) | Required |
| FR-020 | 기록 카드 클릭 시 상세 재현 (0.1초 이내) | Required |
| FR-021 | 무한 스크롤 (threshold 0.5) | Required |
| FR-022 | 기록 삭제 버튼 + 확인 모달 | Required |

---

## Key Entities

**AnalysisRecord**
```
{
  id: string,
  userId: string,
  type: 'CAREER' | 'CONSULTATION' | 'COMPANY',
  birthDate: string,
  birthTime: string,
  createdAt: datetime,
  data: {...analysisData},
  preview: string (미리보기 텍스트)
}
```

---

## Success Criteria

| 기준 | 측정 방법 |
|------|---------|
| S-006 | 마이페이지 초기 로드 3초 이내 |
| S-007 | 저장된 분석 결과 즉시 재현 (0.1초 이내) |
| S-015 | 무한 스크롤 threshold 0.5에서 자동 로드 |
| S-016 | 한 번에 20개 기록 표시 |
| UX-008 | 기록 삭제 후 즉시 UI 업데이트 |

---

## Assumptions

- 모든 분석 기록이 백엔드에 저장됨
- 사용자는 자신의 기록만 조회 가능
- 기록 수는 최대 1,000개

---

## Edge Cases

- **Case 1**: 무한 스크롤 중 새 기록 생성
  - **Action**: 새 기록을 목록 맨 위에 추가
- **Case 2**: 기록 삭제 중 다른 탭 전환
  - **Action**: 현재 작업만 완료하고 탭 전환
- **Case 3**: 이전 저장 형식 호환성
  - **Action**: 마이그레이션 또는 "레거시 형식" 안내

---

## Dependencies

← 002-social-login (로그인 필수)  
← 004~006 (분석 결과 저장)

---

**Updated**: 2026-05-15  
**Version**: 1.0
