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
    <div className="flex border-b border-night-700">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              'flex-1 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-star-400 text-star-400'
                : 'text-gray-400 hover:text-gray-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
