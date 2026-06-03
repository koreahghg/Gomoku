from abc import ABC, abstractmethod
from game.board import Board, BOARD_SIZE


class BaseAI(ABC):
    """
    모든 AI 레벨이 구현하는 추상 인터페이스.
    새 알고리즘 추가 시 이 클래스를 상속하고 get_move()만 구현하면 된다.
    """

    @abstractmethod
    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        """
        현재 보드를 보고 AI의 착수 위치를 반환.

        Args:
            board: 15x15 보드 상태
            ai_color: AI 돌 색상 ("black" | "white")

        Returns:
            (row, col) 튜플
        """
        ...

    def _get_empty_cells(self, board: Board) -> list[tuple[int, int]]:
        """빈 칸 좌표 목록 반환 (공통 유틸리티)"""
        return [
            (r, c)
            for r in range(BOARD_SIZE)
            for c in range(BOARD_SIZE)
            if board[r][c] is None
        ]
