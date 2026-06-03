import { GameHook } from '../hooks/useGame';

interface Props {
  game: GameHook;
}

export default function GameStatus({ game }: Props) {
  const { state } = game;
  const { phase, currentTurn, moveCount } = state;

  let message: string;
  let messageClass = 'text-xl font-bold text-gray-800';

  if (phase === 'black_win') {
    message = '흑 승리!';
    messageClass = 'text-2xl font-bold text-gray-900';
  } else if (phase === 'white_win') {
    message = '백 승리!';
    messageClass = 'text-2xl font-bold text-gray-500';
  } else if (phase === 'draw') {
    message = '무승부';
    messageClass = 'text-2xl font-bold text-yellow-700';
  } else if (state.isAiThinking) {
    message = 'AI 생각 중…';
    messageClass = 'text-xl font-bold text-blue-600 animate-pulse';
  } else {
    message = currentTurn === 'black' ? '흑의 차례' : '백의 차례';
  }

  return (
    <div className="mb-4 text-center">
      <p className={messageClass}>{message}</p>
      <p className="text-sm text-gray-500 mt-1">{moveCount}수</p>
      {state.invalidReason && (
        <p className="text-sm text-red-600 font-semibold mt-1">
          ⚠ {state.invalidReason}
        </p>
      )}
    </div>
  );
}
