from __future__ import annotations
from .base_search import BaseSearch
from ..board_state import BoardState

_INF = float("inf")


class MinimaxSearch(BaseSearch):
    """
    Minimax 탐색 엔진.
    현재는 구조 테스트용 stub — search()는 첫 번째 후보 수를 반환한다.
    TODO: _minimax() 구현 후 search()에 연결.
    """

    def search(self, board: BoardState, color: str, depth: int) -> tuple[int, int]:
        """
        구조 테스트용: 후보 수 목록의 첫 번째 수 반환.
        TODO: _minimax() 연결로 교체.
        """
        candidates = self.generator.generate(board, color)
        c = candidates[0]
        return c.row, c.col

    def _minimax(
        self,
        board: BoardState,
        color: str,
        depth: int,
        is_maximizing: bool,
    ) -> float:
        """
        Minimax 재귀 탐색.
        - is_maximizing=True : color 관점에서 최대값 선택
        - is_maximizing=False: 상대 관점에서 최솟값 선택
        TODO: 다음 단계에서 구현.
        """
        raise NotImplementedError
