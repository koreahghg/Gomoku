from __future__ import annotations
from game.board import Board, BOARD_SIZE
from .bitboard import Bitboard, SIZE
from .zobrist import hash_board, hash_update


class BoardState:
    """
    AI 탐색용 보드 상태.
    Bitboard를 감싸고 place/undo 히스토리와 Zobrist 해시를 관리한다.
    탐색 중 place() → undo() 쌍으로 복사 없이 상태를 되돌린다.
    해시는 place/undo 시 XOR 증분 갱신 → Transposition Table 키로 사용.
    """

    def __init__(self, bitboard: Bitboard, move_count: int = 0, board_hash: int = 0) -> None:
        self._bitboard = bitboard
        self._history: list[tuple[int, str]] = []  # (pos, color) 스택
        self.move_count = move_count
        self._hash = board_hash

    # --- 생성 ---

    @classmethod
    def from_grid(cls, grid: Board) -> BoardState:
        bb = Bitboard.from_grid(grid)
        move_count = sum(1 for row in grid for cell in row if cell is not None)
        h = hash_board(bb.black, bb.white)
        return cls(bb, move_count, h)

    # --- 착수 / 되돌리기 ---

    def place(self, row: int, col: int, color: str) -> None:
        pos = Bitboard.pos(row, col)
        self._bitboard.place(pos, color)
        self._history.append((pos, color))
        self.move_count += 1
        self._hash = hash_update(self._hash, pos, color)

    def undo(self) -> tuple[int, int, str] | None:
        """마지막 착수를 되돌리고 (row, col, color)를 반환. 히스토리가 없으면 None."""
        if not self._history:
            return None
        pos, color = self._history.pop()
        self._bitboard.remove(pos, color)
        self.move_count -= 1
        self._hash = hash_update(self._hash, pos, color)  # XOR 역연산 = 제거
        row, col = divmod(pos, SIZE)
        return row, col, color

    # --- 조회 ---

    def is_empty(self, row: int, col: int) -> bool:
        return not self._bitboard.is_occupied(Bitboard.pos(row, col))

    @property
    def bitboard(self) -> Bitboard:
        return self._bitboard

    @property
    def hash(self) -> int:
        """Zobrist 해시 (Transposition Table 키)."""
        return self._hash

    # --- 변환 ---

    def copy(self) -> BoardState:
        new = BoardState(self._bitboard.copy(), self.move_count, self._hash)
        new._history = self._history.copy()
        return new

    def to_grid(self) -> Board:
        return self._bitboard.to_grid()
