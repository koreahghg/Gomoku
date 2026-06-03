from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from game.rules import check_winner, validate_black_move
from ai import get_ai

router = APIRouter()


class AiMoveRequest(BaseModel):
    board: list[list[str | None]]  # 15x15
    difficulty: int                 # 1~5
    ai_color: str                   # "black" | "white"


class AiMoveResponse(BaseModel):
    row: int
    col: int


class ValidateMoveRequest(BaseModel):
    board: list[list[str | None]]
    row: int
    col: int
    color: str                      # "black" | "white"


class ValidateMoveResponse(BaseModel):
    valid: bool
    reason: str | None = None
    winner: str | None = None       # 이 착수로 승리 시 색상 반환


@router.get("/health")
def health_check():
    """서버 상태 확인"""
    return {"status": "ok"}


@router.post("/move", response_model=AiMoveResponse)
def get_ai_move(req: AiMoveRequest):
    """AI 착수 위치 요청"""
    if req.difficulty not in range(1, 6):
        raise HTTPException(status_code=400, detail="difficulty must be 1~5")
    if req.ai_color not in ("black", "white"):
        raise HTTPException(status_code=400, detail="ai_color must be 'black' or 'white'")

    ai = get_ai(req.difficulty)
    row, col = ai.get_move(req.board, req.ai_color)
    return AiMoveResponse(row=row, col=col)


@router.post("/validate", response_model=ValidateMoveResponse)
def validate_move(req: ValidateMoveRequest):
    """착수 유효성 검증 (금수 포함) + 승리 여부 판정"""
    row, col = req.row, req.col
    board = req.board

    if not (0 <= row < 15 and 0 <= col < 15):
        return ValidateMoveResponse(valid=False, reason="보드 범위를 벗어났습니다")

    if board[row][col] is not None:
        return ValidateMoveResponse(valid=False, reason="이미 돌이 있는 위치입니다")

    # 흑 금수 검사
    if req.color == 'black':
        valid, reason = validate_black_move(board, row, col)
        if not valid:
            return ValidateMoveResponse(valid=False, reason=reason)

    # 승리 여부 판정 (임시로 돌 놓고 검사 후 복구)
    board[row][col] = req.color
    winner = req.color if check_winner(board, row, col, req.color) else None
    board[row][col] = None

    return ValidateMoveResponse(valid=True, winner=winner)
