from __future__ import annotations
from abc import ABC, abstractmethod
from ..board_state import BoardState
from ..evaluator import BaseEvaluator
from ..candidate import CandidateGenerator
from ..bitboard import SIZE

_DIRS = ((0, 1), (1, 0), (1, 1), (1, -1))


class BaseSearch(ABC):
    """
    탐색 엔진 인터페이스.
    새 탐색 알고리즘은 이 클래스를 상속하고 search()를 구현한다.
    """

    def __init__(self, evaluator: BaseEvaluator, generator: CandidateGenerator) -> None:
        self.evaluator = evaluator
        self.generator = generator

    @abstractmethod
    def search(self, board: BoardState, color: str, depth: int) -> tuple[int, int]:
        """
        최선의 착수 위치 (row, col) 반환.

        Args:
            board: 현재 보드 상태
            color: AI 돌 색상 ("black" | "white")
            depth: 탐색 깊이
        """
        ...

    def _is_terminal(self, board: BoardState, last_row: int, last_col: int, color: str) -> bool:
        """
        last_row/col에 color 돌을 놓은 직후 승리 여부를 비트보드로 직접 판정.
        - 흑: 정확히 5연속
        - 백: 5연속 이상
        """
        mask = board.bitboard.get_mask(color)
        for dr, dc in _DIRS:
            total = 1
            for sign in (1, -1):
                r, c = last_row + sign * dr, last_col + sign * dc
                while 0 <= r < SIZE and 0 <= c < SIZE and (mask >> (r * SIZE + c)) & 1:
                    total += 1
                    r += sign * dr
                    c += sign * dc
            if color == "black" and total == 5:
                return True
            if color == "white" and total >= 5:
                return True
        return False

    @staticmethod
    def _opponent(color: str) -> str:
        return "white" if color == "black" else "black"
