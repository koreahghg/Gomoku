import { useState, useCallback, useRef } from 'react';
import { Board, Difficulty, GameState, PlayerColor, ProbabilityPoint, Stone } from '../types/game';

const N = 15;

function createEmptyBoard(): Board {
  return Array.from({ length: N }, () => Array(N).fill(null));
}

function checkWin(board: Board, row: number, col: number, color: Stone): boolean {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let i = 1; i < N; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= N || c < 0 || c >= N || board[r][c] !== color) break;
      count++;
    }
    for (let i = 1; i < N; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= N || c < 0 || c >= N || board[r][c] !== color) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

function findWinningStones(board: Board, row: number, col: number, color: Stone): [number, number][] {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]] as const;
  for (const [dr, dc] of dirs) {
    const stones: [number, number][] = [[row, col]];
    for (let i = 1; i < N; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= N || c < 0 || c >= N || board[r][c] !== color) break;
      stones.push([r, c]);
    }
    for (let i = 1; i < N; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= N || c < 0 || c >= N || board[r][c] !== color) break;
      stones.push([r, c]);
    }
    if (stones.length >= 5) return stones;
  }
  return [];
}

async function apiFetchAiMove(board: Board, aiColor: PlayerColor, difficulty: Difficulty) {
  const res = await fetch('/api/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board, difficulty, ai_color: aiColor }),
  });
  if (!res.ok) throw new Error('AI move failed');
  return res.json() as Promise<{ row: number; col: number }>;
}

async function apiFetchProb(board: Board, aiColor: PlayerColor, signal: AbortSignal): Promise<number> {
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, ai_color: aiColor }),
      signal,
    });
    if (!res.ok) return 50;
    const data = await res.json();
    return data.probability as number;
  } catch {
    return 50;
  }
}

const initialGameState: GameState = {
  board: createEmptyBoard(),
  currentTurn: 'black',
  playerColor: 'black',
  difficulty: 2,
  phase: 'setup',
  isAiThinking: false,
  moveCount: 0,
  lastMove: null,
  invalidReason: null,
  winningStones: [],
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialGameState);
  const [probHistory, setProbHistory] = useState<ProbabilityPoint[]>([]);
  const busyRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state; // Always in sync — avoids stale closure in placeStone
  const evalAbortRef = useRef<AbortController | null>(null);

  const scheduleEval = useCallback((board: Board, aiColor: PlayerColor, move: number) => {
    evalAbortRef.current?.abort();
    const ac = new AbortController();
    evalAbortRef.current = ac;
    apiFetchProb(board, aiColor, ac.signal).then(prob => {
      if (!ac.signal.aborted)
        setProbHistory(h => [...h, { move, prob }]);
    });
  }, []);

  const startGame = useCallback(async (playerColor: PlayerColor, difficulty: Difficulty) => {
    const emptyBoard = createEmptyBoard();
    const aiColor: PlayerColor = playerColor === 'black' ? 'white' : 'black';
    setProbHistory([{ move: 0, prob: 50 }]);

    if (playerColor === 'black') {
      setState({
        ...initialGameState,
        board: emptyBoard,
        playerColor,
        difficulty,
        phase: 'playing',
        currentTurn: 'black',
      });
      return;
    }

    // Player is white → AI (black) goes first
    setState({
      ...initialGameState,
      board: emptyBoard,
      playerColor,
      difficulty,
      phase: 'playing',
      currentTurn: 'black',
      isAiThinking: true,
    });

    try {
      busyRef.current = true;
      const aiMove = await apiFetchAiMove(emptyBoard, 'black', difficulty);
      const b = emptyBoard.map(r => [...r]);
      b[aiMove.row][aiMove.col] = 'black';
      const prob = await apiFetchProb(b, aiColor, new AbortController().signal);

      setState(prev => ({
        ...prev,
        board: b,
        currentTurn: 'white',
        moveCount: 1,
        lastMove: [aiMove.row, aiMove.col],
        isAiThinking: false,
      }));
      setProbHistory([{ move: 0, prob: 50 }, { move: 1, prob }]);
    } catch {
      setState(prev => ({ ...prev, isAiThinking: false }));
    } finally {
      busyRef.current = false;
    }
  }, []);

  const resetGame = useCallback(() => {
    busyRef.current = false;
    evalAbortRef.current?.abort();
    setState(initialGameState);
    setProbHistory([]);
  }, []);

  // Stable reference — reads fresh state via stateRef, no stale closure
  const placeStone = useCallback(async (row: number, col: number) => {
    const { phase, currentTurn, playerColor, difficulty, board, moveCount } = stateRef.current;

    if (
      phase !== 'playing' ||
      currentTurn !== playerColor ||
      board[row][col] !== null ||
      busyRef.current
    ) return;

    busyRef.current = true;
    const aiColor: PlayerColor = playerColor === 'black' ? 'white' : 'black';

    // Forbidden move check (black only)
    if (playerColor === 'black') {
      try {
        const res = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ board, row, col, color: 'black' }),
        });
        const data = await res.json();
        if (!data.valid) {
          setState(prev => ({ ...prev, invalidReason: data.reason ?? '금수입니다' }));
          busyRef.current = false;
          return;
        }
      } catch {
        // Network error — skip validation
      }
    }

    // Place player stone
    const b1: Board = board.map(r => [...r]);
    b1[row][col] = playerColor;
    const m1 = moveCount + 1;
    const playerWon = checkWin(b1, row, col, playerColor);
    const phase1 = playerWon
      ? (`${playerColor}_win` as const)
      : m1 === N * N ? 'draw' : 'playing';

    setState(prev => ({
      ...prev,
      board: b1,
      currentTurn: aiColor,
      moveCount: m1,
      lastMove: [row, col],
      phase: phase1,
      isAiThinking: phase1 === 'playing',
      invalidReason: null,
      winningStones: playerWon ? findWinningStones(b1, row, col, playerColor) : [],
    }));

    scheduleEval(b1, aiColor, m1);

    if (phase1 !== 'playing') {
      busyRef.current = false;
      return;
    }

    // AI move
    try {
      const aiMove = await apiFetchAiMove(b1, aiColor, difficulty);
      const b2: Board = b1.map(r => [...r]);
      b2[aiMove.row][aiMove.col] = aiColor;
      const m2 = m1 + 1;
      const aiWon = checkWin(b2, aiMove.row, aiMove.col, aiColor);
      const phase2 = aiWon
        ? (`${aiColor}_win` as const)
        : m2 === N * N ? 'draw' : 'playing';

      setState(prev => ({
        ...prev,
        board: b2,
        currentTurn: playerColor,
        moveCount: m2,
        lastMove: [aiMove.row, aiMove.col],
        phase: phase2,
        isAiThinking: false,
        winningStones: aiWon ? findWinningStones(b2, aiMove.row, aiMove.col, aiColor) : [],
      }));

      scheduleEval(b2, aiColor, m2);
    } catch {
      setState(prev => ({ ...prev, isAiThinking: false }));
    } finally {
      busyRef.current = false;
    }
  }, [scheduleEval]); // Stable — stateRef gives fresh values without deps

  return { state, probHistory, startGame, resetGame, placeStone };
}

export type GameHook = ReturnType<typeof useGame>;
