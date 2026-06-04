import math
from collections import OrderedDict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from game.rules import check_winner, validate_black_move
from ai import get_ai
from ai.difficulty_config import DIFFICULTY_CONFIGS
from ai.core import BoardState, PatternEvaluator

router = APIRouter()


class AiMoveRequest(BaseModel):
    board: list[list[str | None]]
    difficulty: int
    ai_color: str


class AiMoveResponse(BaseModel):
    row: int
    col: int


class ValidateMoveRequest(BaseModel):
    board: list[list[str | None]]
    row: int
    col: int
    color: str


class ValidateMoveResponse(BaseModel):
    valid: bool
    reason: str | None = None
    winner: str | None = None


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/move", response_model=AiMoveResponse)
def get_ai_move(req: AiMoveRequest):
    if req.difficulty not in DIFFICULTY_CONFIGS:
        raise HTTPException(
            status_code=400,
            detail=f"difficulty must be one of {sorted(DIFFICULTY_CONFIGS)}",
        )
    if req.ai_color not in ("black", "white"):
        raise HTTPException(status_code=400, detail="ai_color must be 'black' or 'white'")

    ai = get_ai(req.difficulty)
    row, col = ai.get_move(req.board, req.ai_color)
    return AiMoveResponse(row=row, col=col)


@router.post("/validate", response_model=ValidateMoveResponse)
def validate_move(req: ValidateMoveRequest):
    row, col = req.row, req.col
    board = req.board

    if not (0 <= row < 15 and 0 <= col < 15):
        return ValidateMoveResponse(valid=False, reason="보드 범위를 벗어났습니다")

    if board[row][col] is not None:
        return ValidateMoveResponse(valid=False, reason="이미 돌이 있는 위치입니다")

    if req.color == 'black':
        valid, reason = validate_black_move(board, row, col)
        if not valid:
            return ValidateMoveResponse(valid=False, reason=reason)

    board[row][col] = req.color
    winner = req.color if check_winner(board, row, col, req.color) else None
    board[row][col] = None

    return ValidateMoveResponse(valid=True, winner=winner)


class EvaluateRequest(BaseModel):
    board: list[list[str | None]]
    ai_color: str


class EvaluateResponse(BaseModel):
    probability: float


_evaluator = PatternEvaluator()
_SCALE = 3000.0

# LRU cache for repeated board evaluations (same position evaluated many times per game)
_EVAL_CACHE_MAX = 1024
_eval_cache: OrderedDict[tuple, float] = OrderedDict()


def _board_key(board: list[list[str | None]], ai_color: str) -> tuple:
    return (tuple(cell or '' for row in board for cell in row), ai_color)


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate_board(req: EvaluateRequest):
    if req.ai_color not in ("black", "white"):
        raise HTTPException(status_code=400, detail="ai_color must be 'black' or 'white'")

    key = _board_key(req.board, req.ai_color)
    if key in _eval_cache:
        _eval_cache.move_to_end(key)
        return EvaluateResponse(probability=_eval_cache[key])

    board_state = BoardState.from_grid(req.board)
    score = _evaluator.evaluate(board_state, req.ai_color)
    probability = round(100.0 / (1.0 + math.exp(-score / _SCALE)), 1)

    _eval_cache[key] = probability
    if len(_eval_cache) > _EVAL_CACHE_MAX:
        _eval_cache.popitem(last=False)

    return EvaluateResponse(probability=probability)
