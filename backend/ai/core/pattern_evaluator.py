from __future__ import annotations
from .board_state import BoardState
from .evaluator import BaseEvaluator
from .bitboard import SIZE

# ─── 패턴 점수 테이블 (여기서 직접 수정) ──────────────────────────────────
SCORE_TABLE: dict[str, float] = {
    "FIVE":     100_000.0,   # 5목         — 즉시 승리
    "OPEN4":     10_000.0,   # 열린4       — 양쪽 열림, 막지 않으면 다음 수에 승리
    "CLOSED4":   1_000.0,    # 닫힌4       — 한 쪽 막힘 (직선형 · 점프형 포함)
    "OPEN3":       500.0,    # 열린3       — 양쪽 열림
    "CLOSED3":     100.0,    # 닫힌3       — 한 쪽 막힘
    "OPEN2":        50.0,    # 열린2       — 양쪽 열림
    "CLOSED2":      10.0,    # 닫힌2       — 한 쪽 막힘
}
# ─────────────────────────────────────────────────────────────────────────


def _count_patterns_in_line(line: str) -> dict[str, int]:
    """줄 문자열 하나에서 각 패턴 개수를 셈.
    O = 자기 돌 · X = 상대 돌 또는 벽 · . = 빈 칸
    """
    n = len(line)
    counts: dict[str, int] = {k: 0 for k in SCORE_TABLE}

    # Pass 1: 연속 런(run) 기반 직선 패턴
    i = 0
    while i < n:
        if line[i] != "O":
            i += 1
            continue
        j = i
        while j < n and line[j] == "O":
            j += 1
        run = j - i
        left_open  = i > 0 and line[i - 1] == "."
        right_open = j < n and line[j]     == "."

        if run >= 5:
            counts["FIVE"] += 1
        elif run == 4:
            if left_open and right_open:
                counts["OPEN4"] += 1
            elif left_open or right_open:
                counts["CLOSED4"] += 1
        elif run == 3:
            if left_open and right_open:
                counts["OPEN3"] += 1
            elif left_open or right_open:
                counts["CLOSED3"] += 1
        elif run == 2:
            if left_open and right_open:
                counts["OPEN2"] += 1
            elif left_open or right_open:
                counts["CLOSED2"] += 1

        i = j

    # Pass 2: 점프 사(jump-four) — 5칸 윈도우에 O 4개 + 빈 칸 1개, X 없음
    # OOO.O / OO.OO / O.OOO → 빈 칸을 채우면 5목 완성 → CLOSED4
    for s in range(n - 4):
        w = line[s: s + 5]
        if (
            w[0] == "O" and w[4] == "O"
            and w.count("O") == 4
            and "X" not in w
        ):
            counts["CLOSED4"] += 1

    return counts


def _extract_lines(board: BoardState, color: str) -> list[str]:
    """4방향(수평 · 수직 · 우하향 · 우상향) 줄 문자열 목록 반환.
    길이 5 미만 줄은 어떤 패턴도 성립하지 않으므로 제외한다.
    """
    bb = board.bitboard
    own_mask = bb.get_mask(color)
    opp_mask = bb.get_mask("white" if color == "black" else "black")

    def cell(r: int, c: int) -> str:
        p = r * SIZE + c
        if (own_mask >> p) & 1:
            return "O"
        if (opp_mask >> p) & 1:
            return "X"
        return "."

    lines: list[str] = []

    # 수평 (15줄)
    for r in range(SIZE):
        lines.append("".join(cell(r, c) for c in range(SIZE)))

    # 수직 (15줄)
    for c in range(SIZE):
        lines.append("".join(cell(r, c) for r in range(SIZE)))

    # 우하향 대각 (\): r - c = k
    for k in range(-(SIZE - 1), SIZE):
        diag = [cell(r, r - k) for r in range(SIZE) if 0 <= r - k < SIZE]
        if len(diag) >= 5:
            lines.append("".join(diag))

    # 우상향 대각 (/): r + c = s
    for s in range(2 * SIZE - 1):
        anti = [cell(r, s - r) for r in range(SIZE) if 0 <= s - r < SIZE]
        if len(anti) >= 5:
            lines.append("".join(anti))

    return lines


class PatternEvaluator(BaseEvaluator):
    """패턴 기반 보드 평가기.
    SCORE_TABLE 값을 조정해 AI의 전략적 성향을 바꿀 수 있다.
    """

    def evaluate(self, board: BoardState, color: str) -> float:
        opp = "white" if color == "black" else "black"
        return self._score_color(board, color) - self._score_color(board, opp)

    def _score_color(self, board: BoardState, color: str) -> float:
        total = 0.0
        for line in _extract_lines(board, color):
            for pat, cnt in _count_patterns_in_line(line).items():
                total += cnt * SCORE_TABLE[pat]
        return total
