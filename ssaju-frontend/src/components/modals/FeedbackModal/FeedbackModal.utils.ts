import type { FeedbackType } from './FeedbackModal.types';

export const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = {
  CONSULTATION: 'AI 커리어 컨설팅',
  COMPATIBILITY: '기업 궁합 분석',
};

export const OPTIONS = [
  {
    value: 'SATISFIED' as const,
    emoji: '🌟',
    label: '도움이 됐어요',
    sub: '분석이 유용했어요',
    activeStyle: {
      background: 'linear-gradient(135deg, rgba(250,204,21,0.18) 0%, rgba(234,179,8,0.1) 100%)',
      border: '1.5px solid rgba(250,204,21,0.55)',
      boxShadow: '0 0 20px rgba(250,204,21,0.15)',
    },
    inactiveStyle: {
      background: 'rgba(255,255,255,0.03)',
      border: '1.5px solid rgba(255,255,255,0.08)',
    },
    activeColor: '#fde047',
    inactiveColor: '#475569',
  },
  {
    value: 'DISSATISFIED' as const,
    emoji: '💫',
    label: '아쉬웠어요',
    sub: '개선이 필요해요',
    activeStyle: {
      background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.12) 100%)',
      border: '1.5px solid rgba(139,92,246,0.55)',
      boxShadow: '0 0 20px rgba(139,92,246,0.15)',
    },
    inactiveStyle: {
      background: 'rgba(255,255,255,0.03)',
      border: '1.5px solid rgba(255,255,255,0.08)',
    },
    activeColor: '#a78bfa',
    inactiveColor: '#475569',
  },
];
