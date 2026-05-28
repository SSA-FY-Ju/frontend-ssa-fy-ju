import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ color: '#fff', position: 'relative', zIndex: 10 }}
    >
      <div className="text-center max-w-md w-full flex flex-col items-center gap-6">
        <p
          className="font-black leading-none"
          style={{ fontSize: 96, color: 'rgba(139,92,246,0.3)', lineHeight: 1 }}
        >
          404
        </p>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold" style={{ color: '#e9d5ff' }}>
            페이지를 찾을 수 없어요
          </h1>
          <p className="text-sm" style={{ color: 'rgba(196,181,253,0.5)' }}>
            존재하지 않거나 이동된 페이지입니다.
          </p>
        </div>

        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.35)',
            color: '#c4b5fd',
          }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
