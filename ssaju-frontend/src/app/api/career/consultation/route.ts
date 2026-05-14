import { NextResponse } from 'next/server';
import { mockConsultationData } from '@/mocks/data/career';

/** AI 컨설팅 목업 (1.5초 지연) */
export async function POST() {
  await new Promise((r) => setTimeout(r, 1500));
  return NextResponse.json({
    success: true,
    data: mockConsultationData,
    error: null,
    timestamp: Date.now(),
  });
}
