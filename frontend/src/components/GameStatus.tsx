import { GameHook } from '../hooks/useGame';

export default function GameStatus({ game }: { game: GameHook }) {
  const { state } = game;
  const { phase, currentTurn, moveCount, isAiThinking, invalidReason } = state;

  let message: string;
  let isOver = false;
  let isDraw = false;

  if (phase === 'black_win') {
    message = '흑 승리!'; isOver = true;
  } else if (phase === 'white_win') {
    message = '백 승리!'; isOver = true;
  } else if (phase === 'draw') {
    message = '무승부'; isDraw = true;
  } else if (isAiThinking) {
    message = 'AI 생각 중…';
  } else {
    message = currentTurn === 'black' ? '흑의 차례' : '백의 차례';
  }

  const showStone = !isOver && !isDraw && !isAiThinking;

  return (
    <div className="flex flex-col items-center gap-1 mt-3">
      <div className="flex items-center gap-2">
        {showStone && (
          <div className={[
            'w-3.5 h-3.5 rounded-full',
            currentTurn === 'black'
              ? 'bg-gradient-to-br from-slate-400 to-slate-900 border border-slate-600'
              : 'bg-gradient-to-br from-white to-slate-300 border border-slate-400',
          ].join(' ')} />
        )}
        <span className={[
          'text-sm font-semibold',
          isOver    ? 'text-amber-400'              :
          isDraw    ? 'text-yellow-400'             :
          isAiThinking ? 'text-blue-400 animate-pulse' :
                      'text-slate-300',
        ].join(' ')}>
          {message}
        </span>
        <span className="text-slate-600 text-xs">· {moveCount}수</span>
      </div>
      {invalidReason && (
        <span className="text-xs text-red-400">{invalidReason}</span>
      )}
    </div>
  );
}
