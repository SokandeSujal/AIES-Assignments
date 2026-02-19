# State Space Search - BFS and DFS
# Problem: 8-Puzzle

from collections import deque

GOAL = (1, 2, 3, 4, 5, 6, 7, 8, 0)

def get_neighbors(state):
    state = list(state)
    i = state.index(0)
    row, col = i // 3, i % 3
    neighbors = []
    moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    for dr, dc in moves:
        r, c = row + dr, col + dc
        if 0 <= r < 3 and 0 <= c < 3:
            j = r * 3 + c
            new = state[:]
            new[i], new[j] = new[j], new[i]
            neighbors.append(tuple(new))
    return neighbors

def bfs(start):
    queue = deque([[start]])
    visited = {start}
    while queue:
        path = queue.popleft()
        current = path[-1]
        if current == GOAL:
            return path
        for neighbor in get_neighbors(current):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(path + [neighbor])
    return None

def dfs(start, limit=20):
    stack = [([start], {start})]
    while stack:
        path, visited = stack.pop()
        current = path[-1]
        if current == GOAL:
            return path
        if len(path) >= limit:
            continue
        for neighbor in get_neighbors(current):
            if neighbor not in visited:
                stack.append((path + [neighbor], visited | {neighbor}))
    return None

start = (1, 2, 3, 4, 0, 6, 7, 5, 8)

bfs_path = bfs(start)
print("BFS moves:", len(bfs_path) - 1)

dfs_path = dfs(start)
print("DFS moves:", len(dfs_path) - 1)
