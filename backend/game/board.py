from typing import Optional

# 돌 색상: "black", "white", None(빈 칸)
Stone = Optional[str]
Board = list[list[Stone]]
BOARD_SIZE = 15


def create_empty_board() -> Board:
    """빈 15x15 보드 생성"""
    return [[None] * BOARD_SIZE for _ in range(BOARD_SIZE)]


def is_in_bounds(row: int, col: int) -> bool:
    return 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE


def count_consecutive(board: Board, row: int, col: int, color: str, dr: int, dc: int) -> int:
    """한 방향으로 연속된 같은 색 돌의 수 반환 (현재 위치 제외)"""
    count = 0
    r, c = row + dr, col + dc
    while is_in_bounds(r, c) and board[r][c] == color:
        count += 1
        r += dr
        c += dc
    return count
