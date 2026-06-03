from __future__ import annotations
from abc import ABC, abstractmethod
from .board_state import BoardState


class BaseEvaluator(ABC):
    """
    보드 평가 함수 인터페이스.
    새 평가 전략은 이 클래스를 상속하고 evaluate()만 구현한다.
    """

    @abstractmethod
    def evaluate(self, board: BoardState, color: str) -> float:
        """
        보드 상태를 color 관점에서 수치화.
        양수 = color에 유리 / 음수 = color에 불리.

        Args:
            board: 현재 보드 상태
            color: 점수를 측정할 기준 색상 ("black" | "white")

        Returns:
            점수 (float)
        """
        ...


class NullEvaluator(BaseEvaluator):
    """구조 테스트용 평가기. 항상 0.0 반환."""

    def evaluate(self, board: BoardState, color: str) -> float:
        return 0.0
