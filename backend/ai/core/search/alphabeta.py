from __future__ import annotations
from .base_search import BaseSearch
from ..board_state import BoardState
from ..evaluator import BaseEvaluator
from ..candidate import CandidateGenerator

_INF = float("inf")
_WIN_SCORE = 200_000   # SCORE_TABLE["FIVE"](100_000)보다 커야 한다
_TT_MAX_SIZE = 500_000 # 엔트리 상한 (~25 MB 추산)

# TT 플래그
_EXACT = 0  # 정확한 minimax 값
_LOWER = 1  # 하한 (beta cutoff 발생)
_UPPER = 2  # 상한 (fail-low, 개선 없음)


class AlphaBetaSearch(BaseSearch):
    """Alpha-Beta 가지치기 + Transposition Table 탐색 엔진."""

    def __init__(self, evaluator: BaseEvaluator, generator: CandidateGenerator) -> None:
        super().__init__(evaluator, generator)
        self.node_count: int = 0
        # TT: board_hash → (value, depth, flag)
        self._tt: dict[int, tuple[float, int, int]] = {}

    def search(self, board: BoardState, color: str, depth: int) -> tuple[int, int]:
        """
        최선의 착수 위치 반환.
        search() 호출마다 node_count가 초기화된다.
        TT는 호출 간 유지 (동일 국면 재탐색 시 재활용).
        """
        self.node_count = 0
        self._ai_color = color

        best_move: tuple[int, int] | None = None
        alpha = -_INF
        candidates = self.generator.generate(board, color)

        for c in candidates:
            board.place(c.row, c.col, color)
            if self._is_terminal(board, c.row, c.col, color):
                board.undo()
                return c.row, c.col  # 즉시 승리수 발견
            score = self._alphabeta(board, self._opponent(color), depth - 1, alpha, _INF, False)
            board.undo()
            if score > alpha:
                alpha = score
                best_move = (c.row, c.col)

        return best_move if best_move is not None else (candidates[0].row, candidates[0].col)

    def _alphabeta(
        self,
        board: BoardState,
        turn_color: str,
        depth: int,
        alpha: float,
        beta: float,
        is_maximizing: bool,
    ) -> float:
        """
        Alpha-Beta 가지치기 재귀 탐색 + Transposition Table 조회/저장.
        alpha: AI가 현재까지 보장받은 하한
        beta : 상대가 허용하는 상한
        beta <= alpha → 가지 차단(pruning)
        """
        self.node_count += 1

        # 원래 윈도우 저장 (TT 플래그 결정에 사용)
        alpha_orig = alpha
        beta_orig = beta

        # ── Transposition Table 조회 ──────────────────────────────────────
        h = board.hash
        entry = self._tt.get(h)
        if entry is not None:
            tt_val, tt_depth, tt_flag = entry
            if tt_depth >= depth:
                if tt_flag == _EXACT:
                    return tt_val
                if tt_flag == _LOWER:
                    alpha = max(alpha, tt_val)
                else:  # _UPPER
                    beta = min(beta, tt_val)
                if alpha >= beta:
                    return tt_val
        # ─────────────────────────────────────────────────────────────────

        if depth <= 0:
            val = self.evaluator.evaluate(board, self._ai_color)
            self._tt[h] = (val, 0, _EXACT)
            return val

        candidates = self.generator.generate(board, turn_color)
        cutoff = False

        if is_maximizing:
            value = -_INF
            for c in candidates:
                board.place(c.row, c.col, turn_color)
                if self._is_terminal(board, c.row, c.col, turn_color):
                    board.undo()
                    value = _WIN_SCORE + depth
                    break
                val = self._alphabeta(board, self._opponent(turn_color), depth - 1, alpha, beta, False)
                board.undo()
                if val > value:
                    value = val
                if value > alpha:
                    alpha = value
                if alpha >= beta:
                    cutoff = True
                    break
        else:
            value = _INF
            for c in candidates:
                board.place(c.row, c.col, turn_color)
                if self._is_terminal(board, c.row, c.col, turn_color):
                    board.undo()
                    value = -(_WIN_SCORE + depth)
                    break
                val = self._alphabeta(board, self._opponent(turn_color), depth - 1, alpha, beta, True)
                board.undo()
                if val < value:
                    value = val
                if value < beta:
                    beta = value
                if beta <= alpha:
                    cutoff = True
                    break

        # ── Transposition Table 저장 ──────────────────────────────────────
        if value <= alpha_orig:
            flag = _UPPER
        elif cutoff:
            flag = _LOWER if is_maximizing else _UPPER
        else:
            flag = _EXACT
        if len(self._tt) < _TT_MAX_SIZE:
            self._tt[h] = (value, depth, flag)
        # ─────────────────────────────────────────────────────────────────

        return value
