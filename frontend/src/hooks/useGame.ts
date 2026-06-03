import { useState, useCallback } from 'react';
import { Board, Difficulty, GameState, PlayerColor } from '../types/game';

const BOARD_SIZE = 15;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
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
      return {
        ...prev,
        board: newBoard,
        currentTurn: prev.currentTurn === 'black' ? 'white' : 'black',
        moveCount: prev.moveCount + 1,
        lastMove: [row, col] as [number, number],
      };
    });
  }, []);

  return { state, startGame, resetGame, placeStone };
}

export type GameHook = ReturnType<typeof useGame>;
