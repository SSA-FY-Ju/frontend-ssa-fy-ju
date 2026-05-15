# Feature Specification: AI 기반 커리어 컨설팅

**Feature Branch**: `005-consultation`  
**Created**: 2026-05-15  
**Priority**: P1 (주요 분석)  
**Status**: Active  

---

## Overview

사용자가 ChatInput에서 입력한 생년월일/시간을 기반으로, 대규모의 AI 커리어 컨설팅 결과를 **16개의 논리적 페이지(16-Page Carousel)** 형태로 확인하는 경험입니다.

**Why this Priority**:
- 추천 산업, 면접 팁, 사주 프로필, 월별 운세 등 사용자의 커리어 의사결정에 직접 영향
- 높은 가치의 AI 분석 결과 제시 (OpenAI 기반)
- **P1**: 관운 분석 후 자연스러운 다음 스텝

---

## User Story 4 - AI 기반 커리어 컨설팅

### 16-Page Carousel 구성

1. **00 OVERVIEW** — 오늘의 별, 한눈에 보기
2. **01 INDUSTRIES** — 추천 산업
3. **02 STRENGTHS** — 강점
4. **03 INTERVIEW TIPS** — 면접팁
5. **04 CAUTIONS** — 주의사항
6. **05 SAJU PROFILE** — 사주 프로필
7. **06 POWER KEYWORDS** — 파워 키워드
8. **07 PERSONAL BRANDING** — 퍼스널 브랜딩
9. **08 WEALTH STYLE** — 부의운
10. **09 LONG-TERM ROADMAP** — 경력 로드맵
11. **10 WORK STYLE** — 업무 스타일
12. **11 ENVIRONMENT FIT** — 직장 환경
13. **12 RELATIONSHIP STRATEGY** — 관계 전략
14. **13 MENTAL CARE** — 정신 관리
15. **14 CAREER TIMELINE** — 커리어 타임라인
16. **15 FINAL** — 종합 마무리

### Acceptance Scenarios

1. **Given** 관운 분석 결과 화면 **When** "더 알아보기" 또는 "AI 커리어 컨설팅" 버튼 클릭 **Then** CosmosLoader (행성 궤도 SVG 애니메이션) 표시

2. **Given** 15-20초 로딩이 완료 **When** API 응답 수신 **Then** 16개 페이지 카루셀이 표시되며 첫 페이지(00 OVERVIEW)에서 시작

3. **Given** 결과 카루셀이 표시된 상태 **When** 하단의 "다음 →" 버튼 클릭 **Then** 현재 페이지가 Opacity 애니메이션으로 사라지고 다음 페이지가 나타남

4. **Given** 마지막 페이지(15 FINAL) 도달 **When** FeedbackBlock 표시 **Then** "✦ 좋았어요 / ✧ 아쉬워요" 칩이 FINAL 페이지 하단에 표시

---

## Functional Requirements

| FR | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-007 | AI 컨설팅 한 번의 API 호출 (16개 섹션 전체 수신) | Required |
| FR-030 | 16페이지 카루셀 네비게이션 (이전/다음 버튼) | Required |
| FR-058 | CosmosLoader 애니메이션 (행성 궤도 SVG) | Required |
| FR-060 | 페이지 점 인디케이터 (16개) | Required |
| FR-064 | Opacity & Transform 페이지 전환 애니메이션 | Required |
| FR-065 | 월별운세 캘린더 표시 (12개월 또는 격자) | Required |
| FR-027 | 타임아웃 처리 (20초, 재시도 3회) | Required |

---

## Key Entities

**ConsultationData**
```
{
  sajuResultId: string,
  sections: {
    overview: string,
    industries: string[],
    strengths: string[],
    interviewTips: string[],
    ... (13개 섹션)
    monthlyFortune: {
      month: number,
      score: number,
      keywords: string[]
    }[]
  },
  createdAt: datetime
}
```

---

## Success Criteria

| 기준 | 측정 방법 |
|------|---------|
| S-011 | 15-20초 이내 16개 섹션 로드 |
| S-017 | 페이지 전환 애니메이션이 부드러움 |
| UX-002 | 16개 페이지가 과도하지 않음 |
| UX-006 | 모바일에서도 캘린더가 읽기 쉬움 |
| UX-012 | 각 페이지의 콘텐츠가 집중력 유지 |
| UX-013 | 월별운세 캘린더가 직관적 |

---

## Assumptions

- OpenAI API가 16개 섹션 생성 가능
- 각 섹션이 500-1000자 범위
- 월별 운세가 정확하게 계산됨

---

## Edge Cases

- **Case 1**: 로딩 중 20초 초과
  - **Action**: "지연되고 있습니다" 메시지 + 재시도 버튼
- **Case 2**: 페이지 전환 중 새로고침
  - **Action**: 캐시된 데이터로 복구 (Zustand 메모리)
- **Case 3**: 모바일에서 월별 카드 표시
  - **Action**: 3개월×4줄 격자 또는 스크롤 카드

---

## Dependencies

← 004-career-timing (sajuResultId 기반)  
→ 002-social-login (결과 저장)

---

**Updated**: 2026-05-15  
**Version**: 1.0
