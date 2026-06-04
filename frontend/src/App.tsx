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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-900 shadow-lg border border-slate-600" />
            <h1 className="text-4xl font-bold text-slate-100 tracking-tight">오목</h1>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white to-slate-300 shadow-lg border border-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">AI와 대전하기</p>
        </div>
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-8 w-full max-w-xs">
          <GameControls game={game} />
        </div>
      </div>
    );
  }

  // ── 게임 화면 ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="px-6 py-3 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-900" />
          <span className="font-bold text-slate-100 text-sm">오목</span>
        </div>
        <button
          onClick={game.resetGame}
          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700/80 hover:border-slate-500 rounded-lg transition-colors"
        >
          처음으로
        </button>
      </header>

      {/* Main layout */}
      <main className="flex flex-col lg:flex-row items-start justify-center gap-6 px-6 py-6">
        {/* Board + status */}
        <div className="flex flex-col items-center">
          <Board game={game} />
          <GameStatus game={game} />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 w-full lg:w-[320px] lg:pt-2">
          <WinProbabilityChart data={probHistory} aiColor={aiColor} />

          {probHistory.length > 1 && (
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                통계
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>총 수</span>
                  <span className="text-slate-200 font-medium">{state.moveCount}수</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AI 최고 확률</span>
                  <span className="text-emerald-400 font-medium">
                    {Math.max(...probHistory.map(p => p.prob)).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AI 최저 확률</span>
                  <span className="text-red-400 font-medium">
                    {Math.min(...probHistory.map(p => p.prob)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
