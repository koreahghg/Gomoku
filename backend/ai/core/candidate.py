from __future__ import annotations
from typing import NamedTuple
from game.board import BOARD_SIZE
from .board_state import BoardState
from .bitboard import Bitboard, SIZE

_CENTER = (BOARD_SIZE // 2, BOARD_SIZE // 2)  # (7, 7) 천원


class Candidate(NamedTuple):
    """
    단일 후보 수.
    score 는 정렬 키 — 현재는 0.0 으로 초기화.
    점수 계산 단계에서 채워진 뒤 sorted(candidates, key=lambda c: -c.score) 로 정렬한다.
    """
    row: int
    col: int
    score: float = 0.0


def _density(occupied: int, row: int, col: int, radius: int) -> int:
    """(row, col) 주변 radius 이내의 돌 개수 (Move Ordering 용 빠른 휴리스틱)."""
    count = 0
    for dr in range(-radius, radius + 1):
        for dc in range(-radius, radius + 1):
            nr, nc = row + dr, col + dc
            if 0 <= nr < SIZE and 0 <= nc < SIZE:
                if (occupied >> (nr * SIZE + nc)) & 1:
                    count += 1
    return count


class CandidateGenerator:
    """
    탐색 후보 수 생성기.
    우선순위: 즉시 승리수 → 즉시 차단수 → 기존 돌 주변 radius 이내 빈 셀.
    후보는 주변 돌 밀도 내림차순으로 정렬 → Alpha-Beta Move Ordering 효과.
    max_candidates > 0 이면 상위 N개만 반환해 분기 인수(branching factor)를 제한.
    """

    def __init__(self, radius: int = 2, max_candidates: int = 0) -> None:
        self.radius = radius
        self.max_candidates = max_candidates

    def generate(self, board: BoardState, color: str) -> list[Candidate]:
        """
        우선순위 순서로 후보 수 목록 반환.
        목록이 비면 천원(7, 7)만 포함한 리스트를 반환한다.
        """
        # TODO: _get_threat_moves() 구현 후 우선순위 로직 활성화
        threat = self._get_threat_moves(board, color)
        if threat:
            return threat
        return self._get_proximity_moves(board)

    def _get_threat_moves(self, board: BoardState, color: str) -> list[Candidate]:
        """
        즉시 승리수(나의 4 완성) 또는 즉시 차단수(상대 4 방어) 탐색.
        TODO: 평가 함수 구현 단계에서 패턴 기반으로 완성.
        """
        return []

    def _get_proximity_moves(self, board: BoardState) -> list[Candidate]:
        """기존 돌 주변 radius 이내 빈 셀을 후보로 반환.
        밀도(주변 돌 수) 내림차순 정렬 → 높은 밀도 = 쟁점 지역 = 먼저 탐색.
        max_candidates 가 0이 아니면 상위 N개로 제한.
        """
        occupied = board.bitboard.occupied_mask()

        if occupied == 0:
            return [Candidate(*_CENTER)]

        seen: set[tuple[int, int]] = set()
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
                        seen.add((nr, nc))

        if not seen:
            return [Candidate(*_CENTER)]

        # 밀도 기반 정렬 (높은 밀도 → 먼저 탐색)
        candidates = sorted(
            (Candidate(r, c, _density(occupied, r, c, self.radius)) for r, c in seen),
            key=lambda c: -c.score,
        )
        if self.max_candidates > 0:
            candidates = candidates[:self.max_candidates]
        return candidates
