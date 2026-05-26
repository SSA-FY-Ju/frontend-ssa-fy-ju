/**
 * 분석 상세 페이지 전용 레이아웃
 * — 글로벌 헤더를 이 경로에서만 숨깁니다.
 *   Swiper 풀페이지 컴포넌트가 100vh를 온전히 사용하기 위함.
 */
export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 이 레이아웃 범위에서만 헤더 숨김 */}
      <style>{`
        header { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
