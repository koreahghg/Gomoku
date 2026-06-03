from __future__ import annotations
from game.board import BOARD_SIZE
from .board_state import BoardState
from .bitboard import Bitboard, SIZE

_CENTER = (BOARD_SIZE // 2, BOARD_SIZE // 2)  # (7, 7) 천원


class CandidateGenerator:
    """
    탐색 후보 수 생성기.
    우선순위: 즉시 승리수 → 즉시 차단수 → 기존 돌 주변 radius 이내 빈 셀.
    """

    def __init__(self, radius: int = 2) -> None:
        self.radius = radius

    def generate(self, board: BoardState, color: str) -> list[tuple[int, int]]:
        """
        우선순위 순서로 후보 수 목록 반환.
        목록이 비면 천원(7, 7)만 포함한 리스트를 반환한다.
        """
        # TODO: _get_threat_moves() 구현 후 우선순위 로직 활성화
        threat = self._get_threat_moves(board, color)
        if threat:
            return threat
        return self._get_proximity_moves(board)

    def _get_threat_moves(self, board: BoardState, color: str) -> list[tuple[int, int]]:
        """
        즉시 승리수(나의 4 완성) 또는 즉시 차단수(상대 4 방어) 탐색.
        TODO: 평가 함수 구현 단계에서 패턴 기반으로 완성.
        """
        return []

    def _get_proximity_moves(self, board: BoardState) -> list[tuple[int, int]]:
        """기존 돌 주변 radius 이내 빈 셀을 후보로 반환."""
        occupied = board.bitboard.occupied_mask()

        # 아직 한 수도 없으면 천원 반환
        if occupied == 0:
            return [_CENTER]

        candidates: set[tuple[int, int]] = set()
        for pos in range(SIZE * SIZE):
            if not (occupied >> pos & 1):
                continue
            row, col = divmod(pos, SIZE)
            for dr in range(-self.radius, self.radius + 1):
                for dc in range(-self.radius, self.radius + 1):
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = row + dr, col + dc
                    if 0 <= nr < SIZE and 0 <= nc < SIZE and board.is_empty(nr, nc):
                        candidates.add((nr, nc))

        return list(candidates) if candidates else [_CENTER]
