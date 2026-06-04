import { ProbabilityPoint } from '../types/game';

interface Props {
  data: ProbabilityPoint[];
  aiColor: 'black' | 'white';
}

const W = 280, H = 200;
const ML = 40, MR = 10, MT = 20, MB = 30;
const PW = W - ML - MR;
const PH = H - MT - MB;
const Y_TICKS = [0, 25, 50, 75, 100];

function xOf(move: number, maxMove: number) { return ML + (move / maxMove) * PW; }
function yOf(prob: number) { return MT + ((100 - prob) / 100) * PH; }

export default function WinProbabilityChart({ data, aiColor }: Props) {
  const current = data[data.length - 1]?.prob ?? 50;
  const maxMove = Math.max(data[data.length - 1]?.move ?? 0, 14);

  const linePoints = data
    .map(d => `${xOf(d.move, maxMove).toFixed(1)},${yOf(d.prob).toFixed(1)}`)
    .join(' ');

  const fillPath = data.length >= 2
    ? [
        `M ${xOf(data[0].move, maxMove).toFixed(1)},${yOf(50).toFixed(1)}`,
        ...data.map(d => `L ${xOf(d.move, maxMove).toFixed(1)},${yOf(d.prob).toFixed(1)}`),
        `L ${xOf(data[data.length - 1].move, maxMove).toFixed(1)},${yOf(50).toFixed(1)}`,
        'Z',
      ].join(' ')
    : '';

  const isAiAhead = current >= 50;
  const accentRaw = isAiAhead ? '#10b981' : '#ef4444';
  const accentBright = isAiAhead ? '#34d399' : '#f87171';
  const xTicks = [0, Math.round(maxMove / 2), maxMove];

  return (
    <div className="bg-slate-800/70 backdrop-blur border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI 승리 확률</h2>
        <span className="text-xs text-slate-600">
          AI: {aiColor === 'black' ? '흑 ●' : '백 ○'}
        </span>
      </div>

      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold tabular-nums" style={{ color: accentBright }}>
          {current.toFixed(1)}
        </span>
        <span className="text-base font-semibold mb-0.5" style={{ color: accentBright }}>%</span>
        <span className="text-xs text-slate-500 mb-0.5 ml-1.5">
          {isAiAhead ? 'AI 우세' : '플레이어 우세'}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
        {/* Background zones */}
        <rect x={ML} y={MT} width={PW} height={PH / 2}
          fill="rgba(16,185,129,0.06)" />
        <rect x={ML} y={MT + PH / 2} width={PW} height={PH / 2}
          fill="rgba(239,68,68,0.06)" />

        {/* Grid lines */}
        {Y_TICKS.map(tick => (
          <g key={tick}>
            <line
              x1={ML} x2={ML + PW} y1={yOf(tick)} y2={yOf(tick)}
              stroke={tick === 50 ? '#334155' : '#1e293b'}
              strokeWidth={tick === 50 ? 1.2 : 0.8}
              strokeDasharray={tick === 50 ? '4 3' : undefined}
            />
            <text x={ML - 5} y={yOf(tick) + 4}
              textAnchor="end" fontSize={10} fill="#475569">
              {tick}%
            </text>
          </g>
        ))}

        {/* Fill area */}
        {fillPath && (
          <path d={fillPath} fill={accentRaw} opacity={0.18} />
        )}

        {/* Line */}
        {data.length >= 2 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke={accentRaw}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xOf(d.move, maxMove)}
            cy={yOf(d.prob)}
            r={i === data.length - 1 ? 4 : 2}
            fill={accentRaw}
            stroke={i === data.length - 1 ? '#0f172a' : 'none'}
            strokeWidth={1.5}
          />
        ))}

        {/* Chart border */}
        <rect x={ML} y={MT} width={PW} height={PH}
          fill="none" stroke="#1e293b" strokeWidth={1} />

        {/* X-axis labels */}
        {xTicks.map(t => (
          <text key={t} x={xOf(t, maxMove)} y={MT + PH + 16}
            textAnchor="middle" fontSize={10} fill="#475569">
            {t}
          </text>
        ))}
        <text x={ML + PW / 2} y={H - 2}
          textAnchor="middle" fontSize={10} fill="#334155">
          수 (手)
        </text>
      </svg>
    </div>
  );
}
