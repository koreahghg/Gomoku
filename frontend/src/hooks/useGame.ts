import { useState, useCallback, useRef } from 'react';
import { Board, Difficulty, GameState, PlayerColor, ProbabilityPoint, Stone } from '../types/game';

const BOARD_SIZE = 15;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function checkWin(board: Board, row: number, col: number, color: Stone): boolean {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < BOARD_SIZE; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== color) break;
      count++;
    }
    for (let i = 1; i < BOARD_SIZE; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== color) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

// ── 백엔드 호출 유틸 ─────────────────────────────────────────────────────────

async function apiFetchAiMove(board: Board, aiColor: PlayerColor, difficulty: Difficulty) {
  const res = await fetch('/api/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board, difficulty, ai_color: aiColor }),
  });
  if (!res.ok) throw new Error('AI move failed');
  return res.json() as Promise<{ row: number; col: number }>;
}

async function apiFetchProb(board: Board, aiColor: PlayerColor): Promise<number> {
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, ai_color: aiColor }),
    });
    if (!res.ok) return 50;
    const data = await res.json();
    return data.probability as number;
  } catch {
    return 50;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

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
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialGameState);
  const [probHistory, setProbHistory] = useState<ProbabilityPoint[]>([]);
  const busyRef = useRef(false); // AI 이동 중 중복 클릭 방지

  // ── 게임 시작 ───────────────────────────────────────────────────────────────
  const startGame = useCallback(async (playerColor: PlayerColor, difficulty: Difficulty) => {
    const emptyBoard = createEmptyBoard();
    const aiColor: PlayerColor = playerColor === 'black' ? 'white' : 'black';

    setProbHistory([{ move: 0, prob: 50 }]);

    if (playerColor === 'black') {
      // 플레이어(흑) 선공 → 즉시 플레이어 차례
      setState({
        ...initialGameState,
        board: emptyBoard,
        playerColor,
        difficulty,
        phase: 'playing',
        currentTurn: 'black',
      });
    } else {
      // 플레이어(백) → AI(흑) 선공
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
        const prob = await apiFetchProb(b, aiColor);

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
    }
  }, []);

  // ── 리셋 ────────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    busyRef.current = false;
    setState(initialGameState);
    setProbHistory([]);
  }, []);

  // ── 돌 놓기 (플레이어) ──────────────────────────────────────────────────────
  const placeStone = useCallback(async (row: number, col: number) => {
    const { phase, currentTurn, playerColor, difficulty, board, moveCount } = state;

    if (
      phase !== 'playing' ||
      currentTurn !== playerColor ||
      board[row][col] !== null ||
      busyRef.current
    ) return;

    busyRef.current = true;
    const aiColor: PlayerColor = playerColor === 'black' ? 'white' : 'black';

    // ── 흑 금수 검사 (열린33 · 44 · 장목) ──
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
        // 네트워크 오류 시 검증 스킵
      }
    }

    // ── 플레이어 착수 ──
    const b1: Board = board.map(r => [...r]);
    b1[row][col] = playerColor;
    const m1 = moveCount + 1;
    const playerWon = checkWin(b1, row, col, playerColor);
    const phase1 = playerWon
      ? (`${playerColor}_win` as const)
      : m1 === BOARD_SIZE * BOARD_SIZE
      ? 'draw'
      : 'playing';

    setState(prev => ({
      ...prev,
      board: b1,
      currentTurn: aiColor,
      moveCount: m1,
      lastMove: [row, col],
      phase: phase1,
      isAiThinking: phase1 === 'playing',
      invalidReason: null,   // 유효한 착수 → 이전 금수 메시지 제거
    }));

    // 플레이어 착수 후 확률 갱신
    apiFetchProb(b1, aiColor).then(prob =>
      setProbHistory(h => [...h, { move: m1, prob }])
    );

    if (phase1 !== 'playing') {
      busyRef.current = false;
      return;
    }

    // ── AI 착수 ──
    try {
      const aiMove = await apiFetchAiMove(b1, aiColor, difficulty);
      const b2: Board = b1.map(r => [...r]);
      b2[aiMove.row][aiMove.col] = aiColor;
      const m2 = m1 + 1;
      const aiWon = checkWin(b2, aiMove.row, aiMove.col, aiColor);
      const phase2 = aiWon
        ? (`${aiColor}_win` as const)
        : m2 === BOARD_SIZE * BOARD_SIZE
        ? 'draw'
        : 'playing';

      setState(prev => ({
        ...prev,
        board: b2,
        currentTurn: playerColor,
        moveCount: m2,
        lastMove: [aiMove.row, aiMove.col],
        phase: phase2,
        isAiThinking: false,
      }));

      // AI 착수 후 확률 갱신
      apiFetchProb(b2, aiColor).then(prob =>
        setProbHistory(h => [...h, { move: m2, prob }])
      );
    } catch {
      setState(prev => ({ ...prev, isAiThinking: false }));
    } finally {
      busyRef.current = false;
    }
  }, [state]);

  return { state, probHistory, startGame, resetGame, placeStone };
}

export type GameHook = ReturnType<typeof useGame>;
