import { NextResponse } from 'next/server';

/** 인증 상태 확인 — 더 이상 사용하지 않음 (JWT 방식으로 전환) */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { isLoggedIn: false, user: null },
    error: null,
    timestamp: Date.now(),
  });
}
