from .base import BaseAI
from .core import BoardState, NullEvaluator, CandidateGenerator
from .core.search import AlphaBetaSearch
from game.board import Board


class Level4AI(BaseAI):
    """난이도 4 - 매우 어려움: Alpha-Beta 가지치기 (탐색 깊이 5)"""

    def __init__(self) -> None:
        generator = CandidateGenerator(radius=2)
        evaluator = NullEvaluator()
        self._search = AlphaBetaSearch(evaluator, generator)

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        board_state = BoardState.from_grid(board)
        return self._search.search(board_state, ai_color, depth=5)
