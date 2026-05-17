'use client';

export default function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center">
      <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
      <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
      <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
    </div>
  );
}
