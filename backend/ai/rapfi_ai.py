from __future__ import annotations
import os
import subprocess
import threading
from pathlib import Path
from .base import BaseAI
from game.board import Board, BOARD_SIZE

# ── 설정 ─────────────────────────────────────────────────────────────────────
_ENGINE_PATH = Path(__file__).parent / "engines" / "rapfi"
_TIME_MS     = 18_000   # 수당 제한 시간 (ms) — 변경 가능
# ─────────────────────────────────────────────────────────────────────────────

_INSTALL_MSG = """
Rapfi 바이너리가 없습니다.

[설치 방법]
1. https://github.com/dhbloo/rapfi/releases 에서
   macOS (arm64) 빌드를 다운로드하거나 직접 빌드:

   brew install cmake
   git clone https://github.com/dhbloo/rapfi.git
   cd rapfi && mkdir build && cd build
   cmake .. -DCMAKE_BUILD_TYPE=Release
   make -j$(sysctl -n hw.logicalcpu)

2. 빌드된 바이너리를 아래 경로에 복사:
   {path}

3. 실행 권한 부여:
   chmod +x {path}

4. 서버 재시작
"""


class RapfiAI(BaseAI):
    """
    Rapfi 오목 엔진 subprocess 래퍼 (Piskvork 프로토콜).

    - BOARD 커맨드로 매 수마다 전체 보드 전송 (무상태 방식)
    - 프로세스는 인스턴스 소멸 시 종료
    """

    def __init__(self, engine_path: str | None = None, time_ms: int = _TIME_MS) -> None:
        path = engine_path or os.environ.get("RAPFI_PATH") or str(_ENGINE_PATH)

        if not os.path.isfile(path):
            raise FileNotFoundError(_INSTALL_MSG.format(path=path))

        self._proc = subprocess.Popen(
            [path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,
        )

        # 초기화
        self._send("START 15")
        resp = self._recv()
        if "error" in resp.lower():
            raise RuntimeError(f"Rapfi START 실패: {resp}")

        self._send(f"INFO timeout_turn {time_ms}")
        self._send("INFO timeout_match 0")
        self._send("INFO rule 0")   # 0=Freestyle, 1=Standard(금수)

    # ── 저수준 I/O ─────────────────────────────────────────────────────────

    def _send(self, line: str) -> None:
        self._proc.stdin.write(line + "\n")
        self._proc.stdin.flush()

    def _recv(self) -> str:
        """엔진 응답 한 줄 읽기 (MESSAGE/DEBUG 줄 스킵)."""
        while True:
            line = self._proc.stdout.readline().strip()
            if not line:
                continue
            if line.upper().startswith(("MESSAGE", "DEBUG")):
                continue
            return line

    def is_alive(self) -> bool:
        return self._proc.poll() is None

    # ── BaseAI 인터페이스 ───────────────────────────────────────────────────

    def get_move(self, board: Board, ai_color: str) -> tuple[int, int]:
        opp_color = "white" if ai_color == "black" else "black"

        # 전체 보드 상태 전송 (BOARD 커맨드)
        self._send("BOARD")
        for r in range(BOARD_SIZE):
            for c in range(BOARD_SIZE):
                stone = board[r][c]
                if stone == ai_color:
                    self._send(f"{c},{r},1")   # 내 돌 = 1
                elif stone == opp_color:
                    self._send(f"{c},{r},2")   # 상대 돌 = 2
        self._send("DONE")

        resp = self._recv()          # "col,row"
        col_s, row_s = resp.split(",")
        return int(row_s), int(col_s)

    def __del__(self) -> None:
        try:
            self._send("END")
            self._proc.terminate()
        except Exception:
            pass


# ── 모듈 레벨 싱글톤 (프로세스 재사용) ────────────────────────────────────────
_lock: threading.Lock = threading.Lock()
_instance: RapfiAI | None = None


def get_rapfi() -> RapfiAI:
    """Rapfi 인스턴스를 반환. 죽었으면 재시작."""
    global _instance
    with _lock:
        if _instance is None or not _instance.is_alive():
            _instance = RapfiAI()
        return _instance
