from __future__ import annotations
import time
from .base import BaseAI
from .core import BoardState, PatternEvaluator, CandidateGenerator
from .core.search import AlphaBetaSearch
from game.board import Board

# ── Extreme 설정 (여기서 수정) ───────────────────────────────────────────────
_TIME_LIMIT   = 19.0   # 초: 수당 최대 탐색 시간
_MAX_DEPTH    = 12     # 절대 최대 깊이 (시간 안에 도달 불가능 시 자동 중단)
_MAX_CANDS    = 15     # 후보 수 상한 (위협 수는 항상 포함, 근접 수에만 적용)
_BRANCH_EST   = 4.0    # 유효 분기 인수 추정 (보수적 — 낮출수록 더 깊이 탐색)
# ─────────────────────────────────────────────────────────────────────────────


class ExtremeAI(BaseAI):
    """
    반복 심화 Alpha-Beta (Iterative Deepening + TT Best-Move Ordering).

    동작 방식:
      depth=1 → depth=2 → … 순서로 탐색, 이전 깊이의 TT best-move가
      다음 깊이의 move ordering에 재활용 → 효율적인 가지치기.
      예산(_TIME_LIMIT초) 소진 직전에 자동 종료.
    """

    def __init__(self) -> None:
        generator = CandidateGenerator(radius=2, max_candidates=_MAX_CANDS)
        evaluator = PatternEvaluator()
        self._search = AlphaBetaSearch(evaluator, generator)

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        board_state = BoardState.from_grid(board)
        start = time.perf_counter()

        # 폴백: 위협 수 또는 첫 번째 근접 후보
        first_cands = self._search.generator.generate(board_state, ai_color)
        best_move: tuple[int, int] = (first_cands[0].row, first_cands[0].col)

        last_dt = 0.001  # 직전 깊이에 걸린 시간 (초)

        for depth in range(1, _MAX_DEPTH + 1):
            elapsed   = time.perf_counter() - start
            remaining = _TIME_LIMIT - elapsed

            # 다음 깊이 예상 시간이 남은 예산을 초과하면 중단
            if depth > 2 and last_dt * _BRANCH_EST > remaining:
                break

            t0   = time.perf_counter()
            move = self._search.search(board_state, ai_color, depth)
            last_dt = time.perf_counter() - t0

            if move is not None:
                best_move = move

            # 실제 경과가 예산 85% 초과 시 안전 중단
            if time.perf_counter() - start > _TIME_LIMIT * 0.85:
                break

        return best_move
