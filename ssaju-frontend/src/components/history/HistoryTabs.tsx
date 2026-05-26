'use client';

/**
 * 분석 기록 탭 컴포넌트
 * API 명세(TIMING, CONSULTATION, COMPATIBILITY)에 맞춰 업데이트
 */

type AnalysisTab = 'ALL' | 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';

interface HistoryTabsProps {
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
}

const TABS: { id: AnalysisTab; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'TIMING', label: '관운 분석' },
  { id: 'CONSULTATION', label: 'AI 컨설팅' },
  { id: 'COMPATIBILITY', label: '기업 궁합' },
];

export function HistoryTabs({ activeTab, onTabChange }: HistoryTabsProps) {
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div style={{ position: 'relative', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex-1 py-3 text-sm font-medium"
              style={{
                color: isActive ? '#a78bfa' : 'rgba(148,163,184,0.5)',
                background: isActive ? 'rgba(139,92,246,0.06)' : 'transparent',
                transition: 'color 0.2s, background 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(196,181,253,0.7)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(148,163,184,0.5)';
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 슬라이딩 언더라인 */}
      <div
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: `${100 / TABS.length}%`,
          height: 2,
          background: '#a78bfa',
          borderRadius: 1,
          transform: `translateX(${activeIndex * 100}%)`,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
