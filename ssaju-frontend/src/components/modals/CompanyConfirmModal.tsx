'use client';

// 파일 크기 예외: 모달 다이얼로그 구조(오버레이·컨테이너·버튼 그룹) 및
// 기업 목록 라디오 렌더링이 하나의 UI 단위를 형성하여 분리 시 가독성 저하
/**
 * 기업 정보 확인 모달 (T085)
 *
 * 자동 조회된 기업 정보를 사용자에게 확인받는 모달
 * - "확인": 조회된 기업명으로 분석 진행
 * - "수동 입력": 기업명 직접 입력 모드
 * - 기업 미발견: 수동 입력 폼 자동 표시
 */

import { useState } from 'react';

interface CompanyConfirmModalProps {
  /** 자동 조회된 기업 후보 목록 */
  suggestions: string[];
  /** 원래 입력한 기업명 */
  originalInput: string;
  /** 기업 확인 콜백 */
  onConfirm: (companyName: string) => void;
  /** 수동 입력 선택 콜백 */
  onManualInput: () => void;
  /** 모달 닫기 */
  onClose: () => void;
}

export function CompanyConfirmModal({
  suggestions,
  originalInput,
  onConfirm,
  onManualInput,
  onClose,
}: CompanyConfirmModalProps) {
  const [selected, setSelected] = useState(suggestions[0] ?? originalInput);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-night-800 border border-night-700 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          aria-label="모달 닫기"
          className="absolute top-4 right-4 text-night-700 hover:text-white transition-colors text-xl"
        >
          ×
        </button>

        <h2 id="company-confirm-title" className="text-star-400 text-lg font-bold mb-4">
          기업 검색 결과
        </h2>

        {suggestions.length > 0 ? (
          <>
            <p className="text-white text-sm mb-3">
              &quot;{originalInput}&quot; 검색 결과입니다. 분석할 기업을 선택해주세요.
            </p>

            {/* 기업 목록 */}
            <div className="flex flex-col gap-2 mb-4">
              {suggestions.map((name) => (
                <label
                  key={name}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selected === name
                      ? 'border-star-500 bg-night-700'
                      : 'border-night-700 hover:border-night-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="company"
                    value={name}
                    checked={selected === name}
                    onChange={() => setSelected(name)}
                    className="accent-star-500"
                  />
                  <span className="text-white text-sm">{name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onConfirm(selected)}
                className="flex-1 bg-star-500 hover:bg-star-400 text-night-900 font-bold py-2 rounded transition-colors"
              >
                이 기업으로 분석
              </button>
              <button
                onClick={onManualInput}
                className="px-4 py-2 border border-night-700 hover:border-star-500 text-star-300 text-sm rounded transition-colors"
              >
                직접 입력
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 기업 미발견 → 수동 입력 안내 */}
            <p className="text-white text-sm mb-4">
              &quot;{originalInput}&quot;에 대한 검색 결과가 없습니다.
              <br />
              기업명을 직접 입력해주세요.
            </p>
            <button
              onClick={onManualInput}
              className="w-full bg-star-500 hover:bg-star-400 text-night-900 font-bold py-2 rounded transition-colors"
            >
              직접 입력하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
