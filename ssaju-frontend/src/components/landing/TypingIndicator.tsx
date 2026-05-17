'use client';

/**\n * 파일 역할: 채팅 인터페이스에서 봇 응답 대기 상태(타이핑 점 애니메이션)를 표시합니다.\n */

export default function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center">
      <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
      <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
      <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
    </div>
  );
}
