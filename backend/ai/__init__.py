from .base import BaseAI
from .level1 import Level1AI
from .level2 import Level2AI
from .level3 import Level3AI
from .level4 import Level4AI
from .level5 import Level5AI

# 난이도 → AI 클래스 매핑 (새 레벨 추가 시 여기만 수정)
AI_REGISTRY: dict[int, type[BaseAI]] = {
    1: Level1AI,
    2: Level2AI,
    3: Level3AI,
    4: Level4AI,
    5: Level5AI,
}


def get_ai(difficulty: int) -> BaseAI:
    """난이도에 맞는 AI 인스턴스 반환"""
    ai_class = AI_REGISTRY.get(difficulty)
    if ai_class is None:
        raise ValueError(f"Invalid difficulty: {difficulty}")
    return ai_class()
