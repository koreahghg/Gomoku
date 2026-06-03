from __future__ import annotations
import random
from .bitboard import SIZE

# 고정 시드 → 매 실행마다 동일한 해시 테이블 보장
_rng = random.Random(20240101)

# ZOBRIST_TABLE[pos][0] = black, [1] = white
# pos = row * SIZE + col  (0 ~ SIZE*SIZE-1)
ZOBRIST_TABLE: list[list[int]] = [
    [_rng.getrandbits(64), _rng.getrandbits(64)]
    for _ in range(SIZE * SIZE)
]


def hash_board(black_mask: int, white_mask: int) -> int:
    """비트마스크 두 개에서 Zobrist 해시를 처음부터 계산."""
    h = 0
    b = black_mask
    while b:
        lsb = b & -b
        h ^= ZOBRIST_TABLE[lsb.bit_length() - 1][0]
        b ^= lsb
    w = white_mask
    while w:
        lsb = w & -w
        h ^= ZOBRIST_TABLE[lsb.bit_length() - 1][1]
        w ^= lsb
    return h


def hash_update(h: int, pos: int, color: str) -> int:
    """돌 추가·제거 시 해시 증분 갱신 (XOR은 역연산이 자기 자신)."""
    return h ^ ZOBRIST_TABLE[pos][0 if color == "black" else 1]
