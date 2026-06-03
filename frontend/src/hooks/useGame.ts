import { useState, useCallback } from 'react';
import { Board, Difficulty, GameState, PlayerColor, Stone } from '../types/game';

const BOARD_SIZE = 15;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function checkWin(board: Board, row: number, col: number, color: Stone): boolean {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < BOARD_SIZE; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== color) break;
      count++;
    }
    for (let i = 1; i < BOARD_SIZE; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== color) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

const initialState: GameState = {
  board: createEmptyBoard(),
  currentTurn: 'black',
  playerColor: 'black',
  difficulty: 3,
  phase: 'playing',
  isAiThinking: false,
  moveCount: 0,
  lastMove: null,
  invalidReason: null,
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);

  const startGame = useCallback((playerColor: PlayerColor, difficulty: Difficulty) => {
    setState({ ...initialState, playerColor, difficulty });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  const placeStone = useCallback((row: number, col: number) => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;
      if (prev.board[row][col] !== null) return prev;

      const newBoard = prev.board.map((r) => [...r]);
      newBoard[row][col] = prev.currentTurn;
      const newMoveCount = prev.moveCount + 1;
      const newLastMove: [number, number] = [row, col];

      if (checkWin(newBoard, row, col, prev.currentTurn)) {
        return {
          ...prev,
          board: newBoard,
          moveCount: newMoveCount,
          lastMove: newLastMove,
          phase: prev.currentTurn === 'black' ? 'black_win' : 'white_win',
        };
      }

      const isFull = newMoveCount === BOARD_SIZE * BOARD_SIZE;

      return {
        ...prev,
        board: newBoard,
        currentTurn: prev.currentTurn === 'black' ? 'white' : 'black',
        moveCount: newMoveCount,
        lastMove: newLastMove,
        phase: isFull ? 'draw' : 'playing',
      };
    });
  }, []);

  return { state, startGame, resetGame, placeStone };
}

export type GameHook = ReturnType<typeof useGame>;
