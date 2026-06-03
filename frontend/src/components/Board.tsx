import { GameHook } from '../hooks/useGame';
import { Stone } from '../types/game';

interface Props {
  game: GameHook;
}

const BOARD_SIZE = 15;
const CELL_SIZE = 40; // px

// 화점(별) 위치: 천원(7,7) + 4귀 화점
const STAR_POINTS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

export default function Board({ game }: Props) {
  const { state, placeStone } = game;
  const { board, phase, lastMove } = state;

  const handleClick = (row: number, col: number) => {
    if (phase !== 'playing') return;
    placeStone(row, col);
  };

  const boardPx = CELL_SIZE * BOARD_SIZE;

  return (
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

      {/* 셀별 클릭 영역 + 돌 렌더링 */}
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
              onClick={() => handleClick(row, col)}
            >
              {stone && (
                <div
                  className={[
                    'rounded-full border',
                    stone === 'black'
                      ? 'bg-gray-900 border-gray-700'
                      : 'bg-white border-gray-400',
                    // 마지막 착수에 빨간 점 표시
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
  );
}
