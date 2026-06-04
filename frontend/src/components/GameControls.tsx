import { useState } from 'react';
import { Difficulty, PlayerColor } from '../types/game';
import { GameHook } from '../hooks/useGame';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Easy', 2: 'Normal', 3: 'Hard', 4: 'Extreme',
};

export default function GameControls({ game }: { game: GameHook }) {
  const { state, startGame } = game;
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('black');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>(3);

  if (state.phase !== 'setup') return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Stone color picker */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">돌 선택</div>
        <div className="grid grid-cols-2 gap-3">
          {(['black', 'white'] as PlayerColor[]).map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={[
                'flex flex-col items-center gap-2.5 py-4 rounded-xl border-2 transition-all',
                selectedColor === color
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600/60 hover:border-slate-500 bg-slate-700/30',
              ].join(' ')}
            >
              <div className={[
                'w-10 h-10 rounded-full shadow-xl',
                color === 'black'
                  ? 'bg-gradient-to-br from-slate-400 to-slate-900 border border-slate-600'
                  : 'bg-gradient-to-br from-white to-slate-300 border border-slate-400',
              ].join(' ')} />
              <span className="text-sm font-medium text-slate-300">
                {color === 'black' ? '흑 (선공)' : '백 (후공)'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty segmented control */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">난이도</div>
        <div className="flex bg-slate-700/40 p-1 rounded-lg gap-0.5">
          {([1, 2, 3, 4] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDiff(d)}
              className={[
                'flex-1 py-2 rounded-md text-xs font-medium transition-all',
                selectedDiff === d
                  ? 'bg-amber-500 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              ].join(' ')}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => startGame(selectedColor, selectedDiff)}
        className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors shadow-lg text-sm tracking-wide"
      >
        게임 시작
      </button>
    </div>
  );
}
