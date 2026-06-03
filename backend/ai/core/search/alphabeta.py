from __future__ import annotations
from .base_search import BaseSearch
from ..board_state import BoardState

_INF = float("inf")


class AlphaBetaSearch(BaseSearch):
    """
    Alpha-Beta 가지치기 탐색 엔진.
    MinimaxSearch의 최적화 버전 — 동일한 결과를 더 빠르게 탐색한다.
    현재는 구조 테스트용 stub — search()는 첫 번째 후보 수를 반환한다.
    TODO: _alphabeta() 구현 후 search()에 연결.
    """

    def search(self, board: BoardState, color: str, depth: int) -> tuple[int, int]:
        """
        구조 테스트용: 후보 수 목록의 첫 번째 수 반환.
        TODO: _alphabeta() 연결로 교체.
        """
        candidates = self.generator.generate(board, color)
        c = candidates[0]
        return c.row, c.col

    def _alphabeta(
        self,
        board: BoardState,
        color: str,
        depth: int,
        alpha: float,
        beta: float,
        is_maximizing: bool,
    ) -> float:
        """
        Alpha-Beta 가지치기 재귀 탐색.
        - alpha: 최대화 플레이어가 보장받은 최솟값
        - beta : 최소화 플레이어가 보장받은 최댓값
        - beta <= alpha 조건에서 가지 차단(pruning)
        TODO: 다음 단계에서 구현.
        """
        raise NotImplementedError
