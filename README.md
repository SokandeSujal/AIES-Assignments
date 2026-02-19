# AI and Expert Systems — Lab Assignments

**Course:** Artificial Intelligence (CET2007B / CS332)  
**Academic Year:** 2025–2026

---

## Files

| File | Description |
|---|---|
| `state_space_search.py` | BFS and DFS on 8-Puzzle |
| `a_star.py` | A* algorithm for grid pathfinding |
| `hill_climbing.py` | Hill Climbing for TSP using 2-opt swaps |
| `csp.py` | CSP solver: SEND + MORE = MONEY |
| `StudyAssignment_StateSpaceSearch.ipynb` | Notebook exploring BFS and DFS |
| `Assignment1_AStar.ipynb` | Notebook exploring A* |
| `Assignment2_HillClimbing.ipynb` | Notebook exploring Hill Climbing |
| `Assignment3_CSP.ipynb` | Notebook exploring CSP |

---

## Assignments

### Study Assignment — State Space Search

Implements BFS and DFS to solve the 8-Puzzle. BFS explores nodes level by level and always finds the shortest path. DFS explores as deep as possible and uses less memory but may not find the shortest path.

### Assignment 1 — A* Algorithm

A* finds the shortest path on a grid using `f(n) = g(n) + h(n)`, where `g(n)` is the cost from start and `h(n)` is the Manhattan Distance heuristic. It is faster than BFS because the heuristic guides the search toward the goal.

### Assignment 2 — Hill Climbing for TSP

Hill Climbing starts from a random tour and repeatedly applies 2-opt swaps to reduce the total distance. It stops when no improving swap can be found. Since results depend on the starting tour, running it multiple times and taking the best result helps.

### Assignment 3 — Constraint Satisfaction Problem

Solves SEND + MORE = MONEY by trying all permutations of digits for the letters. The constraints (no leading zeros, all digits unique, arithmetic equality) are checked for each permutation. The solution is `9567 + 1085 = 10652`.

---

## How to Run

No external libraries needed. All code uses the Python standard library.

```bash
python state_space_search.py
python a_star.py
python hill_climbing.py
python csp.py
```

To run notebooks:

```bash
pip install notebook
jupyter notebook
```
