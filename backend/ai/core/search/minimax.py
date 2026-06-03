from __future__ import annotations
from .base_search import BaseSearch
from ..board_state import BoardState
from ..evaluator import BaseEvaluator
from ..candidate import CandidateGenerator

_INF = float("inf")
_WIN_SCORE = 200_000   # SCORE_TABLE["FIVE"](100_000)보다 커야 한다
_TT_MAX_SIZE = 200_000 # Minimax는 가지치기 없음 → 소규모 TT로 충분


class MinimaxSearch(BaseSearch):
    """Minimax 탐색 엔진 + Transposition Table (exact-only)."""

    def __init__(self, evaluator: BaseEvaluator, generator: CandidateGenerator) -> None:
        super().__init__(evaluator, generator)
        self.node_count: int = 0
        # TT: board_hash → (value, depth)  — exact 값만 저장
        self._tt: dict[int, tuple[float, int]] = {}

    def search(self, board: BoardState, color: str, depth: int) -> tuple[int, int]:
        """
        최선의 착수 위치 반환.
        search() 호출마다 node_count가 초기화된다.
        """
        self.node_count = 0
        self._ai_color = color

        best_move: tuple[int, int] | None = None
        best_score = -_INF
        candidates = self.generator.generate(board, color)

        for c in candidates:
            board.place(c.row, c.col, color)
            if self._is_terminal(board, c.row, c.col, color):
                board.undo()
                return c.row, c.col  # 즉시 승리수 발견
            score = self._minimax(board, self._opponent(color), depth - 1, False)
            board.undo()
            if score > best_score:
                best_score = score
                best_move = (c.row, c.col)

        return best_move if best_move is not None else (candidates[0].row, candidates[0].col)

    def _minimax(
        self,
        board: BoardState,
        turn_color: str,
        depth: int,
        is_maximizing: bool,
    ) -> float:
        """
        Minimax 재귀 탐색 + Transposition Table 조회/저장 (exact 한정).
        turn_color: 이번 수를 두는 색상
        is_maximizing: turn_color가 AI(최대화) 플레이어이면 True
        """
        self.node_count += 1

        # ── Transposition Table 조회 ──────────────────────────────────────
        h = board.hash
        entry = self._tt.get(h)
        if entry is not None:
            tt_val, tt_depth = entry
            if tt_depth >= depth:
                return tt_val
        # ─────────────────────────────────────────────────────────────────

        if depth <= 0:
            val = self.evaluator.evaluate(board, self._ai_color)
            self._tt[h] = (val, 0)
            return val

        candidates = self.generator.generate(board, turn_color)

        if is_maximizing:
            best = -_INF
            for c in candidates:
                board.place(c.row, c.col, turn_color)
                if self._is_terminal(board, c.row, c.col, turn_color):
                    board.undo()
                    return _WIN_SCORE + depth  # 빨리 이길수록 높은 점수
                val = self._minimax(board, self._opponent(turn_color), depth - 1, False)
                board.undo()
                best = max(best, val)
        else:
            best = _INF
            for c in candidates:
                board.place(c.row, c.col, turn_color)
                if self._is_terminal(board, c.row, c.col, turn_color):
                    board.undo()
                    return -(_WIN_SCORE + depth)  # 빨리 질수록 낮은 점수
                val = self._minimax(board, self._opponent(turn_color), depth - 1, True)
                board.undo()
                best = min(best, val)

        if len(self._tt) < _TT_MAX_SIZE:
            self._tt[h] = (best, depth)
        return best
