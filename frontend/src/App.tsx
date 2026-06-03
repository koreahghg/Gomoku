import { useGame } from './hooks/useGame';
import Board from './components/Board';
import GameStatus from './components/GameStatus';

export default function App() {
  const game = useGame();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">오목</h1>
      <GameStatus game={game} />
      <Board game={game} />
    </div>
  );
}
