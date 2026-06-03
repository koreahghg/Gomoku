import { useGame } from './hooks/useGame';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import GameControls from './components/GameControls';
import WinProbabilityChart from './components/WinProbabilityChart';

export default function App() {
  const game = useGame();
  const { state, probHistory } = game;
  const aiColor = state.playerColor === 'black' ? 'white' : 'black';

  // ── 설정 화면 ──────────────────────────────────────────────────────────────
  if (state.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">오목</h1>
        <p className="text-gray-500 mb-6">AI와 대전하기</p>
        <div className="bg-white rounded-2xl shadow-md p-8">
          <GameControls game={game} />
        </div>
      </div>
    );
  }

  // ── 게임 화면 ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-start justify-center gap-8 px-6 py-8">

        {/* 왼쪽: 오목판 */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 self-start">오목</h1>
          <GameStatus game={game} />
          <Board game={game} />
          <GameControls game={game} />
        </div>

        {/* 오른쪽: 승리 확률 그래프 */}
        <div className="sticky top-8 flex flex-col gap-3 pt-14">
          <WinProbabilityChart data={probHistory} aiColor={aiColor} />

          {/* 간단한 통계 */}
          {probHistory.length > 1 && (
            <div className="bg-white rounded-2xl shadow-md p-4 text-sm text-gray-600 flex flex-col gap-1">
              <div className="font-semibold text-gray-700 mb-1">현재까지 기록</div>
              <div className="flex justify-between">
                <span>총 수</span>
                <span className="font-medium">{state.moveCount}수</span>
              </div>
              <div className="flex justify-between">
                <span>AI 최고 확률</span>
                <span className="font-medium text-green-700">
                  {Math.max(...probHistory.map(p => p.prob)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>AI 최저 확률</span>
                <span className="font-medium text-red-700">
                  {Math.min(...probHistory.map(p => p.prob)).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
