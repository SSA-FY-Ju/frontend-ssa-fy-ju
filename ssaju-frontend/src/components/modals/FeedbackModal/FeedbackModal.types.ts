export type FeedbackType = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

export interface FeedbackModalProps {
  feedbackType: FeedbackType;
  onClose: () => void;
  /** 피드백 제출 성공 시 추가로 호출되는 콜백 */
  onSubmitted?: () => void;
  /** 제공 시 하단에 "그냥 나가기" 버튼을 표시 */
  exitAction?: { onExit: () => void };
}
