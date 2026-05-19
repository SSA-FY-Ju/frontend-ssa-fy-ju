'use client';

/**
 * 분석 기록 탭 컴포넌트 (T104)
 *
 * 탭 목록:
 * - 관운 분석 (CAREER_TIMING)
 * - AI 컨설팅 (CONSULTATION)
 * - 기업 궁합 (COMPATIBILITY)
 */

type AnalysisTab = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

interface HistoryTabsProps {
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
}

const TABS: { id: AnalysisTab; label: string }[] = [
  { id: 'CAREER_TIMING', label: '관운 분석' },
  { id: 'CONSULTATION', label: 'AI 컨설팅' },
  { id: 'COMPATIBILITY', label: '기업 궁합' },
];

export function HistoryTabs({ activeTab, onTabChange }: HistoryTabsProps) {
  return (
    <div className="flex" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="flex-1 py-3 text-sm font-medium transition-all"
            style={
              isActive
                ? {
                    borderBottom: '2px solid #a78bfa',
                    color: '#a78bfa',
                    background: 'rgba(139,92,246,0.06)',
                  }
                : {
                    borderBottom: '2px solid transparent',
                    color: 'rgba(148,163,184,0.5)',
                  }
            }
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
  );
}
