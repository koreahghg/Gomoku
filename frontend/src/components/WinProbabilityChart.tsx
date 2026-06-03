import { ProbabilityPoint } from '../types/game';

interface Props {
  data: ProbabilityPoint[];
  aiColor: 'black' | 'white';
}

// ── 차트 레이아웃 상수 ──────────────────────────────────────────────────────
const W = 360, H = 280;
const ML = 46, MR = 16, MT = 28, MB = 38;
const PW = W - ML - MR;   // 플롯 너비
const PH = H - MT - MB;   // 플롯 높이

const Y_TICKS = [0, 25, 50, 75, 100];

function xOf(move: number, maxMove: number) {
  return ML + (move / maxMove) * PW;
}
function yOf(prob: number) {
  return MT + ((100 - prob) / 100) * PH;
}
// ────────────────────────────────────────────────────────────────────────────

export default function WinProbabilityChart({ data, aiColor }: Props) {
  const current = data[data.length - 1]?.prob ?? 50;
  const maxMove = Math.max(data[data.length - 1]?.move ?? 0, 14);

  // 꺾은선 좌표
  const linePoints = data
    .map(d => `${xOf(d.move, maxMove).toFixed(1)},${yOf(d.prob).toFixed(1)}`)
    .join(' ');

  // 50% 기준선과 꺾은선 사이 채우기 경로
  const fillPath = data.length >= 2
    ? [
        `M ${xOf(data[0].move, maxMove).toFixed(1)},${yOf(50).toFixed(1)}`,
        ...data.map(d => `L ${xOf(d.move, maxMove).toFixed(1)},${yOf(d.prob).toFixed(1)}`),
        `L ${xOf(data[data.length - 1].move, maxMove).toFixed(1)},${yOf(50).toFixed(1)}`,
        'Z',
      ].join(' ')
    : '';

  const isAiAhead = current >= 50;
  const fillColor = isAiAhead ? '#22c55e' : '#ef4444';   // green / red
  const lineColor = isAiAhead ? '#16a34a' : '#dc2626';
  const probColor = isAiAhead ? '#15803d' : '#b91c1c';

  // X축 눈금: 0, maxMove/2, maxMove
  const xTicks = [0, Math.round(maxMove / 2), maxMove];

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
      {/* 헤더 */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-bold text-gray-700">AI 승리 확률</h2>
        <span className="text-xs text-gray-400">
          AI: {aiColor === 'black' ? '흑 ●' : '백 ○'}
        </span>
      </div>

      {/* 현재 확률 */}
      <div className="flex items-end gap-1.5">
        <span className="text-4xl font-bold tabular-nums" style={{ color: probColor }}>
          {current.toFixed(1)}
        </span>
        <span className="text-lg font-semibold mb-0.5" style={{ color: probColor }}>%</span>
        <span className="text-sm text-gray-400 mb-0.5 ml-1">
          {isAiAhead ? 'AI 우세' : '플레이어 우세'}
        </span>
      </div>

      {/* SVG 차트 */}
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* ── 배경 존 ── */}
        {/* AI 승리 구역 (상단) — 연한 초록 */}
        <rect x={ML} y={MT} width={PW} height={PH / 2} fill="#dcfce7" />
        {/* 플레이어 승리 구역 (하단) — 연한 빨강 */}
        <rect x={ML} y={MT + PH / 2} width={PW} height={PH / 2} fill="#fee2e2" />

        {/* ── 격자선 ── */}
        {Y_TICKS.map(tick => (
          <g key={tick}>
            <line
              x1={ML} x2={ML + PW}
              y1={yOf(tick)} y2={yOf(tick)}
              stroke={tick === 50 ? '#9ca3af' : '#e5e7eb'}
              strokeWidth={tick === 50 ? 1.5 : 1}
              strokeDasharray={tick === 50 ? '5 4' : undefined}
            />
            <text
              x={ML - 6} y={yOf(tick) + 4}
              textAnchor="end" fontSize={11} fill="#6b7280"
            >
              {tick}%
            </text>
          </g>
        ))}

        {/* 50% 라벨 */}
        <text x={ML + PW + 3} y={yOf(50) + 4} fontSize={10} fill="#9ca3af">50%</text>

        {/* ── 채우기 영역 ── */}
        {fillPath && (
          <path d={fillPath} fill={fillColor} opacity={0.18} />
        )}

        {/* ── 꺾은선 ── */}
        {data.length >= 2 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* ── 데이터 점 ── */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xOf(d.move, maxMove)}
            cy={yOf(d.prob)}
            r={i === data.length - 1 ? 4.5 : 2.5}
            fill={lineColor}
            stroke="white"
            strokeWidth={i === data.length - 1 ? 1.5 : 0}
          />
        ))}

        {/* ── 축 테두리 ── */}
        <rect x={ML} y={MT} width={PW} height={PH}
          fill="none" stroke="#d1d5db" strokeWidth={1} />

        {/* ── X축 눈금 라벨 ── */}
        {xTicks.map(t => (
          <text
            key={t}
            x={xOf(t, maxMove)}
            y={MT + PH + 18}
            textAnchor="middle"
            fontSize={11}
            fill="#6b7280"
          >
            {t}
          </text>
        ))}

        {/* X축 이름 */}
        <text
          x={ML + PW / 2} y={H - 2}
          textAnchor="middle" fontSize={11} fill="#9ca3af"
        >
          수 (手)
        </text>
      </svg>

      {/* 범례 */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-300" />
          AI 우세 구역
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
          플레이어 우세 구역
        </span>
      </div>
    </div>
  );
}
