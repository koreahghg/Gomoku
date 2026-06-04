export type Stone = 'black' | 'white' | null;
export type Board = Stone[][];
export type Difficulty = 1 | 2 | 3 | 4;
export type PlayerColor = 'black' | 'white';
export type GamePhase = 'setup' | 'playing' | 'black_win' | 'white_win' | 'draw';

export interface GameState {
  board: Board;
  currentTurn: PlayerColor;
  playerColor: PlayerColor;
  difficulty: Difficulty;
  phase: GamePhase;
  isAiThinking: boolean;
  moveCount: number;
  lastMove: [number, number] | null;
  invalidReason: string | null;
  winningStones: [number, number][];
}

export interface AiMoveRequest {
  board: Board;
  difficulty: Difficulty;
  ai_color: PlayerColor;
}

export interface AiMoveResponse {
  row: number;
  col: number;
}

export interface ValidateMoveRequest {
  board: Board;
  row: number;
  col: number;
  color: PlayerColor;
}

export interface ValidateMoveResponse {
  valid: boolean;
  reason?: string;
  winner?: PlayerColor;
}

export interface EvaluateRequest {
  board: Board;
  ai_color: PlayerColor;
}

export interface EvaluateResponse {
  probability: number;
}

export interface ProbabilityPoint {
  move: number;
  prob: number;
}
