'use client';

// 파일 크기 예외: 원형 RadialBar 차트 + 4개 항목 ScoreBar가 하나의 시각화 단위를
// 구성. ScoreBar를 별도 파일로 분리하면 props drilling이 복잡해짐
/**
 * 기업 궁합 점수 시각화 (T088)
 *
 * - 종합 점수 원형 + 신뢰도 텍스트
 * - 4개 항목 점수 진행 바 (Recharts)
 */

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts';

const CONFIDENCE_LABEL: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
};

const CONFIDENCE_COLOR: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW: 'text-red-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-star-400',
};

interface ScoreBarProps {
  label: string;
  score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-white">{label}</span>
        <span style={{ color }} className="font-bold">
          {score}점
        </span>
      </div>
      <div className="h-2 bg-night-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface CompatibilityScoreProps {
  score: number; // 0-100 종합 점수
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  sipShinScore: number;
  oHangScore: number;
  jijangGanScore: number;
  leadershipScore: number;
}

export function CompatibilityScore({
  score,
  confidenceLevel,
  sipShinScore,
  oHangScore,
  jijangGanScore,
  leadershipScore,
}: CompatibilityScoreProps) {
  const scoreColor =
    score >= 80 ? '#f59e0b' : score >= 60 ? '#22c55e' : '#ef4444';

  const radialData = [{ name: '점수', value: score, fill: scoreColor }];

  return (
    <div className="flex flex-col gap-6">
      {/* 원형 종합 점수 */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={radialData}
              startAngle={90}
              endAngle={90 - 360 * (score / 100)}
            >
              <RadialBar dataKey="value" background={{ fill: '#1e1e2e' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* 가운데 점수 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="text-night-700 text-xs">/ 100</span>
          </div>
        </div>

        {/* 신뢰도 */}
        <div className="text-center">
          <span className="text-night-700 text-sm">신뢰도: </span>
          <span className={`text-sm font-bold ${CONFIDENCE_COLOR[confidenceLevel]}`}>
            {CONFIDENCE_LABEL[confidenceLevel]}
          </span>
        </div>
      </div>

      {/* 4개 항목 점수 바 */}
      <div className="bg-night-800 rounded-lg p-4 flex flex-col gap-3">
        <h3 className="text-star-400 text-sm font-medium mb-1">점수 분석</h3>
        <ScoreBar label="십신 궁합" score={sipShinScore} />
        <ScoreBar label="오행 궁합" score={oHangScore} />
        <ScoreBar label="지장간 궁합" score={jijangGanScore} />
        <ScoreBar label="리더십 매칭" score={leadershipScore} />
      </div>
    </div>
  );
}
