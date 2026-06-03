from __future__ import annotations
from game.board import Board, BOARD_SIZE

SIZE = BOARD_SIZE  # 15


class Bitboard:
    """
    15x15 오목 보드를 두 개의 정수(비트마스크)로 표현.
    pos = row * 15 + col  (0~224)
    """

    def __init__(self, black: int = 0, white: int = 0) -> None:
        self.black = black
        self.white = white

    # --- 위치 변환 ---

    @staticmethod
    def pos(row: int, col: int) -> int:
        return row * SIZE + col

    @staticmethod
    def to_row_col(pos: int) -> tuple[int, int]:
        return divmod(pos, SIZE)

    # --- 돌 조작 ---

    def place(self, pos: int, color: str) -> None:
        if color == "black":
            self.black |= 1 << pos
        else:
            self.white |= 1 << pos

    def remove(self, pos: int, color: str) -> None:
        if color == "black":
            self.black &= ~(1 << pos)
        else:
            self.white &= ~(1 << pos)

    # --- 상태 조회 ---

    def is_occupied(self, pos: int) -> bool:
        return bool((self.black | self.white) >> pos & 1)

    def is_color(self, pos: int, color: str) -> bool:
        mask = self.black if color == "black" else self.white
        return bool(mask >> pos & 1)

    def get_mask(self, color: str) -> int:
        """비트 연산용 원시 마스크 반환"""
        return self.black if color == "black" else self.white

    def occupied_mask(self) -> int:
        return self.black | self.white

    # --- 변환 ---

    def copy(self) -> Bitboard:
        return Bitboard(self.black, self.white)

    @classmethod
    def from_grid(cls, grid: Board) -> Bitboard:
        bb = cls()
        for r in range(SIZE):
            for c in range(SIZE):
                stone = grid[r][c]
                if stone is not None:
                    bb.place(cls.pos(r, c), stone)
        return bb

    def to_grid(self) -> Board:
        grid: Board = [[None] * SIZE for _ in range(SIZE)]
        for r in range(SIZE):
            for c in range(SIZE):
                p = self.pos(r, c)
                if self.is_color(p, "black"):
                    grid[r][c] = "black"
                elif self.is_color(p, "white"):
                    grid[r][c] = "white"
        return grid
