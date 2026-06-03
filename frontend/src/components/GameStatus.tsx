import { GameHook } from '../hooks/useGame';

interface Props {
  game: GameHook;
}

export default function GameStatus({ game }: Props) {
  const { state } = game;
  const { currentTurn, moveCount } = state;

  return (
    <div className="mb-4 text-center">
      <p className="text-xl font-bold text-gray-800">
        {currentTurn === 'black' ? '흑의 차례' : '백의 차례'}
      </p>
      <p className="text-sm text-gray-500 mt-1">{moveCount}수</p>
    </div>
  );
}
