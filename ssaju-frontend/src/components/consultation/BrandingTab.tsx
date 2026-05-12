'use client';

/** 브랜딩 탭 (T073) */

import type { BrandingInfo } from '@/types/api';

interface BrandingTabProps {
  branding: BrandingInfo;
}

export function BrandingTab({ branding }: BrandingTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 정장 색상 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-xs font-medium mb-1">추천 정장 색상</h3>
        <p className="text-white text-sm">{branding.suitColor}</p>
      </div>

      {/* 이미지 스타일 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-xs font-medium mb-1">이미지 스타일</h3>
        <p className="text-white text-sm">{branding.imageStyle}</p>
      </div>

      {/* 헤어메이크업 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-xs font-medium mb-1">헤어 & 메이크업</h3>
        <p className="text-white text-sm">{branding.hairMakeup}</p>
      </div>

      {/* 파워 키워드 */}
      <div className="bg-night-800 rounded-lg p-4">
        <h3 className="text-star-400 text-xs font-medium mb-2">파워 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {branding.powerKeywords.map((kw) => (
            <span key={kw} className="px-3 py-1 bg-star-500/10 border border-star-500/40 text-star-300 text-sm rounded-full">
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
