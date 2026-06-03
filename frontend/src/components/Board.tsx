import { GameHook } from '../hooks/useGame';
import { Stone } from '../types/game';

interface Props {
  game: GameHook;
}

const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const LABEL_SIZE = 20;

const STAR_POINTS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

export default function Board({ game }: Props) {
  const { state, placeStone } = game;
  const { board, lastMove } = state;

  const boardPx = CELL_SIZE * BOARD_SIZE;

  return (
    <div className="flex flex-col items-start select-none">
      {/* 열 좌표 (1-15) */}
      <div className="flex">
        <div style={{ width: LABEL_SIZE }} />
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div
            key={i}
            style={{
              width: CELL_SIZE,
              height: LABEL_SIZE,
              lineHeight: `${LABEL_SIZE}px`,
              textAlign: 'center',
              fontSize: 11,
              color: '#6B5623',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* 행 좌표 (1-15) */}
        <div className="flex flex-col">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div
              key={i}
              style={{
                width: LABEL_SIZE,
                height: CELL_SIZE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: '#6B5623',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* 오목판 */}
        <div
          className="relative border-2 border-amber-900 shadow-lg"
          style={{ width: boardPx, height: boardPx, backgroundColor: '#C8964E' }}
        >
          {/* 격자선 + 화점 */}
          <svg className="absolute inset-0 pointer-events-none" width={boardPx} height={boardPx}>
            {Array.from({ length: BOARD_SIZE }, (_, i) => (
              <g key={i}>
                <line
                  x1={CELL_SIZE / 2 + i * CELL_SIZE} y1={CELL_SIZE / 2}
                  x2={CELL_SIZE / 2 + i * CELL_SIZE} y2={boardPx - CELL_SIZE / 2}
                  stroke="#8B6914" strokeWidth="1"
                />
                <line
                  x1={CELL_SIZE / 2} y1={CELL_SIZE / 2 + i * CELL_SIZE}
                  x2={boardPx - CELL_SIZE / 2} y2={CELL_SIZE / 2 + i * CELL_SIZE}
                  stroke="#8B6914" strokeWidth="1"
                />
              </g>
            ))}
            {STAR_POINTS.map(([r, c]) => (
              <circle
                key={`${r}-${c}`}
                cx={CELL_SIZE / 2 + c * CELL_SIZE}
                cy={CELL_SIZE / 2 + r * CELL_SIZE}
                r={4}
                fill="#8B6914"
              />
            ))}
          </svg>

          {/* 클릭 영역 + 돌 렌더링 */}
          {Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => {
              const stone: Stone = board[row][col];
              const isLastMove = lastMove?.[0] === row && lastMove?.[1] === col;

              return (
                <div
                  key={`${row}-${col}`}
                  className="absolute flex items-center justify-center cursor-pointer"
                  style={{
                    left: col * CELL_SIZE,
                    top: row * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                  onClick={() => placeStone(row, col)}
                >
                  {stone && (
                    <div
                      className={[
                        'rounded-full border',
                        stone === 'black'
                          ? 'bg-gray-900 border-gray-700'
                          : 'bg-white border-gray-400',
                        isLastMove ? 'ring-2 ring-red-500 ring-offset-0' : '',
                      ].join(' ')}
                      style={{ width: CELL_SIZE - 6, height: CELL_SIZE - 6 }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
