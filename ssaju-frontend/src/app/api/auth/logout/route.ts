import { NextResponse } from 'next/server';

/** 로그아웃 목업 */
export async function POST() {
  return NextResponse.json({
    success: true,
    data: null,
    error: null,
    timestamp: Date.now(),
  });
}
