import { useState, useCallback } from 'react';
import {
  Board,
  Difficulty,
  GameState,
  PlayerColor,
  AiMoveRequest,
  ValidateMoveRequest,
} from '../types/game';

const BOARD_SIZE = 15;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

const initialState: GameState = {
  board: createEmptyBoard(),
  currentTurn: 'black',
  playerColor: 'black',
  difficulty: 3,
  phase: 'setup',
  isAiThinking: false,
  moveCount: 0,
  lastMove: null,
  invalidReason: null,
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);

  // 게임 시작: 색상·난이도 확정 후 playing 단계로 전환
  const startGame = useCallback((playerColor: PlayerColor, difficulty: Difficulty) => {
    setState({
      board: createEmptyBoard(),
      currentTurn: 'black',
      playerColor,
      difficulty,
      phase: 'playing',
      isAiThinking: false,
      moveCount: 0,
      lastMove: null,
      invalidReason: null,
    });
  }, []);

  // 처음 화면(setup)으로 돌아가기
  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  // 플레이어 착수 처리
  const placeStone = useCallback(async (row: number, col: number) => {
    // 게임 진행 중이 아니거나, AI 계산 중이거나, 플레이어 차례가 아니면 무시
    if (state.phase !== 'playing' || state.isAiThinking) return;
    if (state.currentTurn !== state.playerColor) return;

    const { board, playerColor, difficulty } = state;
    const aiColor: PlayerColor = playerColor === 'black' ? 'white' : 'black';

    // 1. 백엔드에 착수 유효성 검증 요청
    const validateReq: ValidateMoveRequest = { board, row, col, color: playerColor };
    const validateRes = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validateReq),
    }).then((r) => r.json());

    // 금수 또는 무효 착수
    if (!validateRes.valid) {
      setState((prev) => ({ ...prev, invalidReason: validateRes.reason ?? '무효 착수' }));
      return;
    }

    // 2. 보드 업데이트
    const newBoard: Board = board.map((r) => [...r]);
    newBoard[row][col] = playerColor;
    const newMoveCount = state.moveCount + 1;

    // 3. 플레이어 착수로 승리 판정
    if (validateRes.winner) {
      setState((prev) => ({
        ...prev,
        board: newBoard,
        lastMove: [row, col],
        moveCount: newMoveCount,
        phase: validateRes.winner === 'black' ? 'black_win' : 'white_win',
        invalidReason: null,
      }));
      return;
    }

    // 4. AI 착수 요청
    setState((prev) => ({
      ...prev,
      board: newBoard,
      currentTurn: aiColor,
      lastMove: [row, col],
      moveCount: newMoveCount,
      isAiThinking: true,
      invalidReason: null,
    }));

    const aiReq: AiMoveRequest = { board: newBoard, difficulty, ai_color: aiColor };
    const aiRes = await fetch('/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiReq),
    }).then((r) => r.json());

    // 5. AI 착수 유효성 검증 (승리 판정 포함)
    const aiValidateReq: ValidateMoveRequest = {
      board: newBoard,
      row: aiRes.row,
      col: aiRes.col,
      color: aiColor,
    };
    const aiValidateRes = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiValidateReq),
    }).then((r) => r.json());

    const boardAfterAi: Board = newBoard.map((r) => [...r]);
    boardAfterAi[aiRes.row][aiRes.col] = aiColor;

    setState((prev) => ({
      ...prev,
      board: boardAfterAi,
      currentTurn: playerColor,
      lastMove: [aiRes.row, aiRes.col],
      moveCount: newMoveCount + 1,
      isAiThinking: false,
      phase: aiValidateRes.winner
        ? aiValidateRes.winner === 'black'
          ? 'black_win'
          : 'white_win'
        : 'playing',
    }));
  }, [state]);

  return { state, startGame, resetGame, placeStone };
}

// 훅 반환 타입 (컴포넌트 props 타입으로 재사용)
export type GameHook = ReturnType<typeof useGame>;
