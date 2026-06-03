from .base import BaseAI
from .core import BoardState, NullEvaluator, CandidateGenerator
from .core.search import AlphaBetaSearch
from game.board import Board


class Level5AI(BaseAI):
    """
    난이도 5 - 무적: Alpha-Beta 가지치기 + 최적화 (탐색 깊이 7).
    TODO: 킬러 무브, 이동 순서 정렬, 트랜스포지션 테이블 추가 예정.
    """

    def __init__(self) -> None:
        generator = CandidateGenerator(radius=2)
        evaluator = NullEvaluator()
        self._search = AlphaBetaSearch(evaluator, generator)

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        board_state = BoardState.from_grid(board)
        return self._search.search(board_state, ai_color, depth=7)
