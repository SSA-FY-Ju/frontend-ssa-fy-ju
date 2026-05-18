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
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{score}점</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 999,
            boxShadow: `0 0 6px ${color}66`,
            transition: 'width 0.7s ease',
          }}
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
    <div className="flex flex-col gap-8">
      {/* 원형 종합 점수 */}
      <div className="flex items-center gap-8">
        <div className="relative" style={{ width: 120, height: 120, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={radialData}
              startAngle={90}
              endAngle={90 - 360 * (score / 100)}
            >
              <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.04)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span style={{ fontSize: '2rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/ 100</span>
          </div>
        </div>

        {/* 신뢰도 */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>
            신뢰도
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800 }} className={CONFIDENCE_COLOR[confidenceLevel]}>
            {CONFIDENCE_LABEL[confidenceLevel]}
          </p>
        </div>
      </div>

      {/* 4개 항목 점수 바 */}
      <div className="flex flex-col gap-4">
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase' }}>
          항목별 점수
        </p>
        <ScoreBar label="십신 궁합" score={sipShinScore} />
        <ScoreBar label="오행 궁합" score={oHangScore} />
        <ScoreBar label="지장간 궁합" score={jijangGanScore} />
        <ScoreBar label="리더십 매칭" score={leadershipScore} />
      </div>
    </div>
  );
}
