// 돌 색상: null은 빈 칸
export type Stone = 'black' | 'white' | null;

// 15x15 보드
export type Board = Stone[][];

// 난이도: 1=Easy / 2=Normal / 3=Hard / 4=Extreme
export type Difficulty = 1 | 2 | 3 | 4;

// 플레이어가 선택한 색상
export type PlayerColor = 'black' | 'white';

// 게임 진행 단계
export type GamePhase =
  | 'setup'      // 색상·난이도 선택 화면
  | 'playing'    // 게임 진행 중
  | 'black_win'  // 흑 승리
  | 'white_win'  // 백 승리
  | 'draw';      // 무승부 (225수 소진)

export interface GameState {
  board: Board;
  currentTurn: PlayerColor;          // 현재 착수 차례
  playerColor: PlayerColor;          // 플레이어가 선택한 색상
  difficulty: Difficulty;
  phase: GamePhase;
  isAiThinking: boolean;             // AI 계산 중 여부 (UI 잠금용)
  moveCount: number;                 // 총 착수 수
  lastMove: [number, number] | null; // 마지막 착수 위치 (강조 표시용)
  invalidReason: string | null;      // 금수 등 무효 착수 사유
}

// AI 착수 요청 (프론트 → 백엔드)
export interface AiMoveRequest {
  board: Board;
  difficulty: Difficulty;
  ai_color: PlayerColor;
}

// AI 착수 응답 (백엔드 → 프론트)
export interface AiMoveResponse {
  row: number;
  col: number;
}

// 착수 유효성 검증 요청 (프론트 → 백엔드)
export interface ValidateMoveRequest {
  board: Board;
  row: number;
  col: number;
  color: PlayerColor;
}

// 착수 유효성 검증 응답 (백엔드 → 프론트)
export interface ValidateMoveResponse {
  valid: boolean;
  reason?: string;         // 무효 사유 (예: "3-3 금수", "장목")
  winner?: PlayerColor;    // 이 착수로 승리 시 색상
}

// 보드 평가 요청 / 응답
export interface EvaluateRequest {
  board: Board;
  ai_color: PlayerColor;
}

export interface EvaluateResponse {
  probability: number;     // AI 승리 확률 0~100
}

// 승리 확률 이력 한 점
export interface ProbabilityPoint {
  move: number;            // 수 번호 (0 = 시작)
  prob: number;            // AI 승리 확률 0~100
}
