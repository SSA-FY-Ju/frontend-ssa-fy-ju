'use client';

/**
 * 설립일자 직접 선택 캘린더 (기업 궁합 — 404 fallback)
 *
 * - 오늘 이전 날짜만 선택 가능
 * - 헤더 클릭 → 월 선택 뷰 (3×4 그리드) / 월 선택 → 일 뷰 복귀
 * - 마운트 시 slide-up + fade, 뷰 전환 시 fade 애니메이션
 * - 확인 버튼 클릭 시 YYYY-MM-DD 형식으로 onConfirm 호출
 */

import { useState, useEffect, useRef } from 'react';

interface FoundingDatePickerProps {
  companyName: string;
  onConfirm: (date: string) => void; // YYYY-MM-DD
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS_LABEL = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad(n: number) {
  return String(n).padStart(2, '0');
}

type ViewMode = 'day' | 'month';

export function FoundingDatePicker({ companyName, onConfirm }: FoundingDatePickerProps) {
  const today = new Date();
  const [mountVisible, setMountVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [panelKey, setPanelKey] = useState(0); // 뷰 전환 시 fade 재트리거
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<{ year: number; month: number; day: number } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMountVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // 뷰 전환 helper — fade 재트리거
  const switchView = (mode: ViewMode) => {
    setViewMode(mode);
    setPanelKey(k => k + 1);
  };

  /* ── 일 뷰 helpers ── */
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const isDayNextDisabled =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  const isFutureDay = (day: number) => new Date(viewYear, viewMonth, day) > today;
  const isSelectedDay = (day: number) =>
    selected?.year === viewYear && selected?.month === viewMonth && selected?.day === day;
  const isTodayDay = (day: number) =>
    viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startOffset = firstDayOfWeek(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  /* ── 월 뷰 helpers ── */
  const prevYear = () => setViewYear(y => y - 1);
  const nextYear = () => {
    if (viewYear >= today.getFullYear()) return;
    setViewYear(y => y + 1);
  };
  const isMonthNextYearDisabled = viewYear >= today.getFullYear();

  const isFutureMonth = (monthIdx: number) =>
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && monthIdx > today.getMonth());

  const handleMonthSelect = (monthIdx: number) => {
    if (isFutureMonth(monthIdx)) return;
    setViewMonth(monthIdx);
    switchView('day');
  };

  /* ── 공통 ── */
  const selectedLabel = selected
    ? `${selected.year}년 ${MONTHS_LABEL[selected.month]} ${selected.day}일`
    : null;

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(`${selected.year}-${pad(selected.month + 1)}-${pad(selected.day)}`);
  };

  return (
    <div
      style={{
        opacity: mountVisible ? 1 : 0,
        transform: mountVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.38s cubic-bezier(0.22,1,0.36,1), transform 0.38s cubic-bezier(0.22,1,0.36,1)',
        width: '100%',
      }}
    >
      {/* 안내 문구 */}
      <div style={{
        marginBottom: 28, padding: '18px 20px',
        background: 'rgba(139,92,246,0.08)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 16,
      }}>
        <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.55)', marginBottom: 6 }}>
          설립일자를 찾지 못했습니다
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#e9d5ff', lineHeight: 1.5 }}>
          <span style={{ color: '#c4b5fd' }}>{companyName}</span>의 설립일자를 직접 선택해주세요
        </p>
      </div>

      {/* 캘린더 카드 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(139,92,246,0.18)',
        borderRadius: 20,
        padding: '24px 20px 20px',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
      }}>
        {/* 공통 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* 왼쪽 화살표 */}
          <button
            onClick={viewMode === 'day' ? prevMonth : prevYear}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: 'rgba(139,92,246,0.12)', color: '#c4b5fd',
              cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.12)')}
          >‹</button>

          {/* 클릭 가능한 년·월 레이블 */}
          <button
            onClick={() => switchView(viewMode === 'day' ? 'month' : 'day')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: '#e9d5ff', letterSpacing: '0.04em' }}>
              {viewMode === 'day'
                ? `${viewYear}년 ${MONTHS_LABEL[viewMonth]}`
                : `${viewYear}년`}
            </span>
            <span style={{
              fontSize: 10, color: '#a78bfa',
              transform: viewMode === 'month' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              display: 'inline-block',
            }}>▾</span>
          </button>

          {/* 오른쪽 화살표 */}
          {(() => {
            const dis = viewMode === 'day' ? isDayNextDisabled : isMonthNextYearDisabled;
            return (
              <button
                onClick={viewMode === 'day' ? nextMonth : nextYear}
                disabled={dis}
                style={{
                  width: 32, height: 32, borderRadius: 10, border: 'none',
                  background: dis ? 'rgba(255,255,255,0.03)' : 'rgba(139,92,246,0.12)',
                  color: dis ? 'rgba(255,255,255,0.15)' : '#c4b5fd',
                  cursor: dis ? 'default' : 'pointer',
                  fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (!dis) e.currentTarget.style.background = 'rgba(139,92,246,0.25)'; }}
                onMouseLeave={(e) => { if (!dis) e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; }}
              >›</button>
            );
          })()}
        </div>

        {/* 패널 — fade 전환 */}
        <FadePanel keyVal={panelKey}>
          {viewMode === 'day' ? (
            <>
              {/* 요일 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
                {DAYS.map((d, i) => (
                  <div key={d} style={{
                    textAlign: 'center', fontSize: 11, fontWeight: 600, paddingBottom: 8,
                    color: i === 0 ? 'rgba(248,113,113,0.6)' : i === 6 ? 'rgba(147,197,253,0.6)' : 'rgba(196,181,253,0.35)',
                    letterSpacing: '0.04em',
                  }}>{d}</div>
                ))}
              </div>
              {/* 날짜 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const future = isFutureDay(day);
                  const sel = isSelectedDay(day);
                  const tod = isTodayDay(day);
                  const col = (i % 7 === 0) ? 'rgba(248,113,113,0.7)' : (i % 7 === 6) ? 'rgba(147,197,253,0.7)' : 'rgba(255,255,255,0.75)';
                  return (
                    <button
                      key={day}
                      onClick={() => !future && setSelected({ year: viewYear, month: viewMonth, day })}
                      disabled={future}
                      style={{
                        height: 36, width: '100%', border: 'none', borderRadius: 9,
                        fontSize: 13, fontWeight: sel ? 700 : 400,
                        cursor: future ? 'default' : 'pointer',
                        color: future ? 'rgba(255,255,255,0.12)' : sel ? '#fff' : tod ? '#c4b5fd' : col,
                        background: sel
                          ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                          : tod && !sel ? 'rgba(139,92,246,0.12)' : 'transparent',
                        boxShadow: sel ? '0 2px 12px rgba(109,40,217,0.5)' : 'none',
                        transition: 'all 0.12s', outline: 'none',
                      }}
                      onMouseEnter={(e) => { if (!future && !sel) e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
                      onMouseLeave={(e) => { if (!future && !sel) e.currentTarget.style.background = 'transparent'; }}
                    >{day}</button>
                  );
                })}
              </div>
            </>
          ) : (
            /* 월 선택 그리드 */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {MONTHS_LABEL.map((label, idx) => {
                const future = isFutureMonth(idx);
                const isCurrentMonth = viewYear === today.getFullYear() && idx === today.getMonth();
                const isSelMonth = selected?.year === viewYear && selected?.month === idx;
                return (
                  <button
                    key={label}
                    onClick={() => handleMonthSelect(idx)}
                    disabled={future}
                    style={{
                      padding: '12px 0', borderRadius: 12, border: 'none',
                      fontSize: 13, fontWeight: isSelMonth ? 700 : 500,
                      cursor: future ? 'default' : 'pointer',
                      color: future ? 'rgba(255,255,255,0.15)'
                        : isSelMonth ? '#fff'
                        : isCurrentMonth ? '#c4b5fd'
                        : 'rgba(255,255,255,0.7)',
                      background: isSelMonth
                        ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                        : isCurrentMonth && !isSelMonth ? 'rgba(139,92,246,0.12)' : 'transparent',
                      boxShadow: isSelMonth ? '0 2px 10px rgba(109,40,217,0.45)' : 'none',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!future && !isSelMonth) e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
                    onMouseLeave={(e) => { if (!future && !isSelMonth) e.currentTarget.style.background = 'transparent'; }}
                  >{label}</button>
                );
              })}
            </div>
          )}
        </FadePanel>

        {/* 선택된 날짜 표시 */}
        <div style={{
          marginTop: 20, paddingTop: 20,
          borderTop: '1px solid rgba(139,92,246,0.12)',
          textAlign: 'center', fontSize: 13,
          color: selectedLabel ? '#c4b5fd' : 'rgba(196,181,253,0.25)',
          fontWeight: selectedLabel ? 600 : 400,
          transition: 'color 0.2s',
        }}>
          {selectedLabel ?? '날짜를 선택해주세요'}
        </div>
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={handleConfirm}
        disabled={!selected}
        style={{
          marginTop: 16, width: '100%', padding: '17px 24px',
          borderRadius: 20,
          border: selected ? '1px solid rgba(167,139,250,0.45)' : '1px solid rgba(255,255,255,0.06)',
          background: selected
            ? 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 40%, #4f46e5 100%)'
            : 'rgba(255,255,255,0.03)',
          color: selected ? '#fff' : 'rgba(255,255,255,0.18)',
          fontSize: 14, fontWeight: 800, letterSpacing: '0.07em',
          cursor: selected ? 'pointer' : 'default',
          transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
        } as React.CSSProperties}
        onMouseEnter={(e) => { if (selected) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.12)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
      >
        {selected ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, opacity: 0.75 }}>✦</span>
            <span>이 날짜로 분석하기</span>
            <span style={{ fontSize: 11, opacity: 0.75 }}>✦</span>
          </span>
        ) : '날짜를 먼저 선택해주세요'}
      </button>
    </div>
  );
}

/** 키가 바뀔 때마다 fade-in 재생하는 래퍼 */
function FadePanel({ keyVal, children }: { keyVal: number; children: React.ReactNode }) {
  const [opacity, setOpacity] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpacity(0);
    timerRef.current = setTimeout(() => setOpacity(1), 20);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [keyVal]);

  return (
    <div style={{ opacity, transition: 'opacity 0.2s ease' }}>
      {children}
    </div>
  );
}
