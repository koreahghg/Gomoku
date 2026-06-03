from .base import BaseAI
from .difficulty_config import DIFFICULTY_CONFIGS, ConfigurableAI
from .extreme_ai import ExtremeAI


def get_ai(difficulty: int) -> BaseAI:
    """난이도에 맞는 AI 인스턴스 반환."""
    if difficulty == 4:
        # Rapfi 엔진이 있으면 사용, 없으면 ExtremeAI 폴백
        try:
            from .rapfi_ai import get_rapfi
            return get_rapfi()
        except FileNotFoundError:
            return ExtremeAI()

    cfg = DIFFICULTY_CONFIGS.get(difficulty)
    if cfg is None:
        raise ValueError(f"Invalid difficulty: {difficulty}. Valid: {sorted(DIFFICULTY_CONFIGS)}")
    return ConfigurableAI(cfg)
