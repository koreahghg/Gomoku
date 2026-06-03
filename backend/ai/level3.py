from .base import BaseAI
from .core import BoardState, PatternEvaluator, CandidateGenerator
from .core.search import MinimaxSearch
from game.board import Board


class Level3AI(BaseAI):
    """난이도 3 - 어려움: Minimax (탐색 깊이 3)"""

    def __init__(self) -> None:
        generator = CandidateGenerator(radius=2)
        evaluator = PatternEvaluator()
        self._search = MinimaxSearch(evaluator, generator)

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        board_state = BoardState.from_grid(board)
        return self._search.search(board_state, ai_color, depth=3)
