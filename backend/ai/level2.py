import random
from .base import BaseAI
from game.board import Board


class Level2AI(BaseAI):
    """
    난이도 2 - 보통.
    TODO: 간단한 휴리스틱 구현
          우선순위: ① 5목 완성 → ② 상대 5목 차단 → ③ 랜덤
    """

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        # TODO: 다음 단계에서 구현
        empty = self._get_empty_cells(board)
        return random.choice(empty)
