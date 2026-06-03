from __future__ import annotations
from .base_search import BaseSearch
from ..board_state import BoardState
from ..evaluator import BaseEvaluator
from ..candidate import CandidateGenerator

_INF = float("inf")
_WIN_SCORE = 200_000  # SCORE_TABLE["FIVE"](100_000)보다 커야 한다


class AlphaBetaSearch(BaseSearch):
    """Alpha-Beta 가지치기 탐색 엔진. Minimax와 동일한 결과, 더 빠른 탐색."""

    def __init__(self, evaluator: BaseEvaluator, generator: CandidateGenerator) -> None:
        super().__init__(evaluator, generator)
        self.node_count: int = 0

    def search(self, board: BoardState, color: str, depth: int) -> tuple[int, int]:
        """
        최선의 착수 위치 반환.
        search() 호출마다 node_count가 초기화된다.
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
        Alpha-Beta 가지치기 재귀 탐색.
        alpha: 최대화 플레이어가 현재까지 보장받은 최솟값 (하한)
        beta : 최소화 플레이어가 현재까지 보장받은 최댓값 (상한)
        beta <= alpha 이면 해당 가지를 차단(pruning).
        """
        self.node_count += 1

        if depth <= 0:
            return self.evaluator.evaluate(board, self._ai_color)

        candidates = self.generator.generate(board, turn_color)

        if is_maximizing:
            value = -_INF
            for c in candidates:
                board.place(c.row, c.col, turn_color)
                if self._is_terminal(board, c.row, c.col, turn_color):
                    board.undo()
                    return _WIN_SCORE + depth
                val = self._alphabeta(board, self._opponent(turn_color), depth - 1, alpha, beta, False)
                board.undo()
                value = max(value, val)
                alpha = max(alpha, value)
                if alpha >= beta:
                    break  # beta cutoff
            return value
        else:
            value = _INF
            for c in candidates:
                board.place(c.row, c.col, turn_color)
                if self._is_terminal(board, c.row, c.col, turn_color):
                    board.undo()
                    return -(_WIN_SCORE + depth)
                val = self._alphabeta(board, self._opponent(turn_color), depth - 1, alpha, beta, True)
                board.undo()
                value = min(value, val)
                beta = min(beta, value)
                if beta <= alpha:
                    break  # alpha cutoff
            return value
