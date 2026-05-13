import { NextResponse } from 'next/server';
import { mockCompanyAutocomplete } from '@/mocks/data/company';

/** 기업명 자동완성 목업 */
export async function POST() {
  return NextResponse.json({
    success: true,
    data: mockCompanyAutocomplete,
    error: null,
    timestamp: Date.now(),
  });
}
