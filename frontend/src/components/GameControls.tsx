import { useState } from 'react';
import { Difficulty, PlayerColor } from '../types/game';
import { GameHook } from '../hooks/useGame';

interface Props {
  game: GameHook;
}

// ── 난이도 표시 이름 (백엔드 DIFFICULTY_CONFIGS.name과 일치) ──────────────
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Easy',
  2: 'Normal',
  3: 'Hard',
  4: 'Extreme',
};
// ────────────────────────────────────────────────────────────────────────

export default function GameControls({ game }: Props) {
  const { state, startGame, resetGame } = game;
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('black');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(3);

  // 게임 중·종료 후: 처음으로 돌아가기 버튼만 표시
  if (state.phase !== 'setup') {
    return (
      <div className="mt-6">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          처음으로
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-5">
      {/* 색상 선택 */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-semibold text-gray-600">색상 선택</span>
        <div className="flex gap-3">
          {(['black', 'white'] as PlayerColor[]).map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={[
                'px-5 py-2 rounded border-2 font-medium transition-colors',
                selectedColor === color
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400',
              ].join(' ')}
            >
              {color === 'black' ? '흑 (선공)' : '백 (후공)'}
            </button>
          ))}
        </div>
      </div>

      {/* 난이도 선택 */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-semibold text-gray-600">난이도</span>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(Number(e.target.value) as Difficulty)}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700"
        >
          {([1, 2, 3, 4] as Difficulty[]).map((d) => (
            <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
          ))}
        </select>
      </div>

      {/* 게임 시작 */}
      <button
        onClick={() => startGame(selectedColor, selectedDifficulty)}
        className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-lg shadow"
      >
        게임 시작
      </button>
    </div>
  );
}
