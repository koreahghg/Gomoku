import random
from .base import BaseAI
from game.board import Board


class Level5AI(BaseAI):
    """
    난이도 5 - 무적.
    TODO: 알파-베타 가지치기 + 깊은 탐색 + 고급 휴리스틱.
          사실상 패배하지 않도록 설계. (선수 필승 전략 포함)
    """

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        # TODO: 다음 단계에서 구현
        empty = self._get_empty_cells(board)
        return random.choice(empty)
