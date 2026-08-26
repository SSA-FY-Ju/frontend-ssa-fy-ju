/** 사주(SAJU)는 백엔드 피드백 대상이 아니므로 타입 단계에서 제외한다. */
export type FeedbackType = 'CONSULTATION' | 'COMPATIBILITY';

export interface FeedbackModalProps {
  feedbackType: FeedbackType;
  onClose: () => void;
  /** 피드백 제출 성공 시 추가로 호출되는 콜백 */
  onSubmitted?: () => void;
  /** 제공 시 하단에 "그냥 나가기" 버튼을 표시 */
  exitAction?: { onExit: () => void };
}
