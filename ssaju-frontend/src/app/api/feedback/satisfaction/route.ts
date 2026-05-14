import { NextResponse } from 'next/server';

/** 피드백 제출 목업 */
export async function POST() {
  await new Promise((r) => setTimeout(r, 300));
  return NextResponse.json({
    success: true,
    data: { feedbackId: 'mock-feedback-001' },
    error: null,
    timestamp: Date.now(),
  });
}
