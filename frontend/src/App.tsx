import { useGame } from './hooks/useGame';
import Board from './components/Board';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';

export default function App() {
  const game = useGame();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8">
      <h1 className="text-4xl font-bold mb-2 text-gray-800">오목</h1>
      <p className="text-sm text-gray-400 mb-6">공식 규칙 (흑: 3-3, 4-4, 장목 금수)</p>
      <GameStatus game={game} />
      <Board game={game} />
      <GameControls game={game} />
    </div>
  );
}
