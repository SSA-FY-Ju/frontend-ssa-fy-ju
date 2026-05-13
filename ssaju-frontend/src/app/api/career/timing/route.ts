import { NextResponse } from 'next/server';
import { mockCareerTimingResult } from '@/mocks/data/career';

/** 관운 분석 목업 (500ms 지연) */
export async function POST() {
  await new Promise((r) => setTimeout(r, 500));
  return NextResponse.json({
    success: true,
    data: mockCareerTimingResult,
    error: null,
    timestamp: Date.now(),
  });
}
