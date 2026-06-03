import random
from .base import BaseAI
from game.board import Board


class Level1AI(BaseAI):
    """난이도 1 - 쉬움: 빈 칸 중 완전 랜덤으로 착수"""

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        empty = self._get_empty_cells(board)
        return random.choice(empty)
