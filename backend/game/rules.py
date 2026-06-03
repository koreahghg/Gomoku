from .board import Board, BOARD_SIZE, count_consecutive, is_in_bounds

# 검사할 4방향 (한 방향만; 반대 방향은 코드 내에서 -dr, -dc로 처리)
DIRECTIONS = [(0, 1), (1, 0), (1, 1), (1, -1)]


def check_winner(board: Board, row: int, col: int, color: str) -> bool:
    """
    (row, col)에 color 돌을 놓은 상태에서 승리 여부 판정.
    - 흑: 정확히 5연속 (장목 불인정)
    - 백: 5연속 이상 모두 승리
    """
    for dr, dc in DIRECTIONS:
        fwd = count_consecutive(board, row, col, color, dr, dc)
        bwd = count_consecutive(board, row, col, color, -dr, -dc)
        total = fwd + bwd + 1  # 현재 돌 포함

        if color == 'white' and total >= 5:
            return True
        if color == 'black' and total == 5:
            return True

    return False


def validate_black_move(board: Board, row: int, col: int) -> tuple[bool, str | None]:
    """
    흑의 착수 위치에 대해 공식 금수 규칙 검사.
    반환: (유효 여부, 무효 사유)
    """
    if board[row][col] is not None:
        return False, "이미 돌이 있는 위치입니다"

    # 임시로 돌 배치 후 금수 검사
    board[row][col] = 'black'

    overline = _check_overline(board, row, col)
    double_four = _check_double_four(board, row, col)
    double_three = _check_double_three(board, row, col)

    board[row][col] = None  # 원상 복구

    # 5목 완성(승리)이면 금수 예외: 장목이 아닌 5목은 유효
    board[row][col] = 'black'
    is_five = check_winner(board, row, col, 'black')
    board[row][col] = None

    if is_five:
        return True, None  # 5목 완성은 금수 적용 안 함

    if overline:
        return False, "장목(6목 이상)은 흑의 금수입니다"
    if double_four:
        return False, "4-4 금수입니다"
    if double_three:
        return False, "3-3 금수입니다"

    return True, None


def _check_overline(board: Board, row: int, col: int) -> bool:
    """장목(6목 이상) 여부"""
    for dr, dc in DIRECTIONS:
        fwd = count_consecutive(board, row, col, 'black', dr, dc)
        bwd = count_consecutive(board, row, col, 'black', -dr, -dc)
        if fwd + bwd + 1 >= 6:
            return True
    return False


def _count_fours(board: Board, row: int, col: int) -> int:
    """
    (row, col)을 포함한 4 패턴(열린4, 닫힌4 포함) 수를 방향별로 셈.
    TODO: 다음 단계에서 정밀 패턴 매칭 구현
    """
    count = 0
    for dr, dc in DIRECTIONS:
        fwd = count_consecutive(board, row, col, 'black', dr, dc)
        bwd = count_consecutive(board, row, col, 'black', -dr, -dc)
        if fwd + bwd + 1 == 4:
            count += 1
    return count


def _count_open_threes(board: Board, row: int, col: int) -> int:
    """
    (row, col)을 포함한 열린 3 패턴 수.
    TODO: 다음 단계에서 정밀 패턴 매칭 구현
    """
    count = 0
    for dr, dc in DIRECTIONS:
        fwd = count_consecutive(board, row, col, 'black', dr, dc)
        bwd = count_consecutive(board, row, col, 'black', -dr, -dc)
        total = fwd + bwd + 1
        if total != 3:
            continue
        # 양 끝이 열려 있는지 확인
        far_fwd = (row + (fwd + 1) * dr, col + (fwd + 1) * dc)
        far_bwd = (row - (bwd + 1) * dr, col - (bwd + 1) * dc)
        end_fwd_open = is_in_bounds(*far_fwd) and board[far_fwd[0]][far_fwd[1]] is None
        end_bwd_open = is_in_bounds(*far_bwd) and board[far_bwd[0]][far_bwd[1]] is None
        if end_fwd_open and end_bwd_open:
            count += 1
    return count


def _check_double_four(board: Board, row: int, col: int) -> bool:
    """4-4 금수: 한 수로 4 패턴이 2개 이상 생기는 경우"""
    return _count_fours(board, row, col) >= 2


def _check_double_three(board: Board, row: int, col: int) -> bool:
    """3-3 금수: 한 수로 열린 3이 2개 이상 생기는 경우"""
    return _count_open_threes(board, row, col) >= 2
