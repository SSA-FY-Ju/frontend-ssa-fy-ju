import { NextResponse } from 'next/server';
import { mockCompatibilityResult } from '@/mocks/data/company';

/** 기업 궁합 분석 목업 (1초 지연) */
export async function POST() {
  await new Promise((r) => setTimeout(r, 1000));
  return NextResponse.json({
    success: true,
    data: mockCompatibilityResult,
    error: null,
    timestamp: Date.now(),
  });
}
