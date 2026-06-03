from __future__ import annotations
import random
from dataclasses import dataclass
from .base import BaseAI
from .core import BoardState, PatternEvaluator, CandidateGenerator
from .core.search import MinimaxSearch, AlphaBetaSearch
from game.board import Board

# ── 난이도별 설정 (여기서 직접 수정) ──────────────────────────────────────
@dataclass(frozen=True)
class DifficultyConfig:
    name: str            # 표시 이름
    depth: int           # 탐색 깊이
    random_rate: float   # 랜덤 착수 확률  0.0 = 항상 AI / 1.0 = 항상 랜덤
    use_alphabeta: bool  # True = Alpha-Beta  /  False = Minimax
    radius: int          # 후보 생성 반경 (기존 돌 주변 N칸)


DIFFICULTY_CONFIGS: dict[int, DifficultyConfig] = {
    1: DifficultyConfig(
        name="Easy",
        depth=1,
        random_rate=0.3,    # 30% 확률로 후보 중 랜덤 선택
        use_alphabeta=False,
        radius=2,
    ),
    2: DifficultyConfig(
        name="Normal",
        depth=3,
        random_rate=0.0,
        use_alphabeta=False,
        radius=2,
    ),
    3: DifficultyConfig(
        name="Hard",
        depth=4,
        random_rate=0.0,
        use_alphabeta=True,
        radius=2,
    ),
    4: DifficultyConfig(
        name="Extreme",
        depth=5,
        random_rate=0.0,
        use_alphabeta=True,
        radius=2,
    ),
}
# ─────────────────────────────────────────────────────────────────────────


class ConfigurableAI(BaseAI):
    """DIFFICULTY_CONFIGS를 읽어 동작하는 단일 AI 구현체."""

    def __init__(self, config: DifficultyConfig) -> None:
        self._config = config
        generator = CandidateGenerator(radius=config.radius)
        evaluator = PatternEvaluator()
        self._search = (
            AlphaBetaSearch(evaluator, generator)
            if config.use_alphabeta
            else MinimaxSearch(evaluator, generator)
        )

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        board_state = BoardState.from_grid(board)
        cfg = self._config

        # 랜덤 착수 (Easy의 가끔 랜덤)
        if cfg.random_rate > 0 and random.random() < cfg.random_rate:
            candidates = CandidateGenerator(radius=cfg.radius).generate(board_state, ai_color)
            c = random.choice(candidates)
            return c.row, c.col

        return self._search.search(board_state, ai_color, depth=cfg.depth)
