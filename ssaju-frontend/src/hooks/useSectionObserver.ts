'use client';

/**
 * 섹션 진입 감지 훅 (T065b)
 *
 * 기능:
 * - 8개 섹션 DOM ref를 IntersectionObserver로 감시 (threshold=0.3)
 * - 섹션이 30% 진입 시 isVisible 플래그 true (한 번 재생 후 유지)
 * - 현재 뷰포트의 주요 섹션 index 반환 → SectionNavigator 활성화에 사용
 * - prefers-reduced-motion 감지 시 모든 섹션 즉시 표시 (애니메이션 생략)
 *
 * 설계:
 * - 마운트 시 이미 뷰포트 안에 있는 섹션은 즉시 표시 (300ms 딜레이 없음)
 * - ref 콜백을 useMemo로 안정화해 불필요한 Observer 재생성 방지
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const SECTION_COUNT = 8;

export function useSectionObserver() {
  const sectionRefs = useRef<(HTMLElement | null)[]>(Array(SECTION_COUNT).fill(null));
  const [visibleSections, setVisibleSections] = useState<boolean[]>(() =>
    Array(SECTION_COUNT).fill(false)
  );
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  /**
   * 특정 섹션을 visible로 표시하는 헬퍼
   */
  const markVisible = useCallback((index: number) => {
    setVisibleSections((prev) => {
      if (prev[index]) return prev; // 이미 표시됨 — 업데이트 없음
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setActiveSectionIndex(index);
  }, []);

  /**
   * IntersectionObserver 기반 감시 및 초기 가시성 설정
   */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // prefers-reduced-motion 활성 시 즉시 전체 표시
    if (prefersReducedMotion) {
      setVisibleSections(Array(SECTION_COUNT).fill(true));
      return;
    }

    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              markVisible(index);
            }
          });
        },
        { threshold: 0.3 } // 30% 진입 시 트리거 (50%보다 낮아 모바일 대형 섹션에서도 동작)
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [markVisible]);

  /**
   * 섹션 ref 등록 콜백 팩토리
   * - useMemo로 안정화 (렌더마다 새 함수 생성 방지)
   * - 사용법: ref={setRef(index)}
   */
  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  }, []);

  /**
   * 안정화된 ref 콜백 배열 (렌더 간 동일 참조 유지)
   * React가 ref 변경으로 감지하지 않아 불필요한 Observer 재생성 방지
   */
  const stableRefs = useMemo(
    () => Array.from({ length: SECTION_COUNT }, (_, i) => setRef(i)),
    [setRef]
  );

  /**
   * 특정 섹션으로 smooth scroll
   * prefers-reduced-motion 활성 시 instant scroll
   */
  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index];
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
      block: 'start',
    });
  }, []);

  return {
    stableRefs,  // ref={stableRefs[index]} 형태로 사용
    visibleSections,
    activeSectionIndex,
    scrollToSection,
  };
}
