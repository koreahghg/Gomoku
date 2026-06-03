import { GameHook } from '../hooks/useGame';

interface Props {
  game: GameHook;
}

export default function GameStatus({ game }: Props) {
  const { state } = game;
  const { phase, playerColor, currentTurn, isAiThinking, moveCount, invalidReason } = state;

  if (phase === 'setup') return null;

  let message = '';
  if (phase === 'black_win') {
    message = playerColor === 'black' ? '승리!' : '패배...';
  } else if (phase === 'white_win') {
    message = playerColor === 'white' ? '승리!' : '패배...';
  } else if (isAiThinking) {
    message = 'AI가 생각 중...';
  } else if (currentTurn === playerColor) {
    message = '당신의 차례';
  } else {
    message = 'AI의 차례';
  }

  const isGameOver = phase === 'black_win' || phase === 'white_win';

  return (
    <div className="mb-4 text-center">
      <p className={`text-xl font-bold ${isGameOver ? 'text-blue-600' : 'text-gray-800'}`}>
        {message}
      </p>
      {invalidReason && (
        <p className="text-red-500 text-sm mt-1">{invalidReason}</p>
      )}
      <p className="text-sm text-gray-500 mt-1">
        {moveCount}수 &middot; 내 색: {playerColor === 'black' ? '흑' : '백'}
      </p>
    </div>
  );
}
