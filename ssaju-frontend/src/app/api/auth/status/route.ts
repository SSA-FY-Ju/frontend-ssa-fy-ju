import { NextResponse } from 'next/server';
import { mockAuthStatus } from '@/mocks/data/auth';

/** 인증 상태 확인 목업 (백엔드 없이 로컬 개발용) */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockAuthStatus,
    error: null,
    timestamp: Date.now(),
  });
}
