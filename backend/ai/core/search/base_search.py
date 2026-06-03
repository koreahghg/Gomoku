from __future__ import annotations
from abc import ABC, abstractmethod
from ..board_state import BoardState
from ..evaluator import BaseEvaluator
from ..candidate import CandidateGenerator


class BaseSearch(ABC):
    """
    탐색 엔진 인터페이스.
    새 탐색 알고리즘(Minimax, Alpha-Beta, MCTS 등)은 이 클래스를 상속하고
    search()와 내부 재귀 메서드를 구현한다.
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
        마지막 착수(last_row, last_col)가 게임 종료를 유발하는지 확인.
        TODO: game.rules.check_winner에 위임하도록 구현.
        """
        # 임시로 grid 변환 후 rules 호출 — 탐색 구현 단계에서 비트보드 직접 검사로 최적화
        return False

    @staticmethod
    def _opponent(color: str) -> str:
        return "white" if color == "black" else "black"
