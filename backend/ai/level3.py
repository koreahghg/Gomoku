import random
from .base import BaseAI
from game.board import Board


class Level3AI(BaseAI):
    """
    난이도 3 - 어려움.
    TODO: 미니맥스 알고리즘 (탐색 깊이: 낮음)
    """

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        # TODO: 다음 단계에서 구현
        empty = self._get_empty_cells(board)
        return random.choice(empty)
