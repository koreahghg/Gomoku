from .base import BaseAI
from .difficulty_config import DIFFICULTY_CONFIGS, ConfigurableAI


def get_ai(difficulty: int) -> BaseAI:
    """난이도에 맞는 AI 인스턴스 반환. 호출마다 새 인스턴스 생성."""
    cfg = DIFFICULTY_CONFIGS.get(difficulty)
    if cfg is None:
        raise ValueError(f"Invalid difficulty: {difficulty}. Valid: {sorted(DIFFICULTY_CONFIGS)}")
    return ConfigurableAI(cfg)
