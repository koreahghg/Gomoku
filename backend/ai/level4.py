import random
from .base import BaseAI
from game.board import Board


class Level4AI(BaseAI):
    """
    난이도 4 - 매우 어려움.
    TODO: 알파-베타 가지치기 + 중간 수준 탐색 깊이
    """

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        # TODO: 다음 단계에서 구현
        empty = self._get_empty_cells(board)
        return random.choice(empty)
