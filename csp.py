# Assignment 3: Constraint Satisfaction Problem
# Problem: SEND + MORE = MONEY

import itertools

def solve_csp():
    letters = ('S', 'E', 'N', 'D', 'M', 'O', 'R', 'Y')

    for p in itertools.permutations(range(10), len(letters)):
        s, e, n, d, m, o, r, y = p

        if s == 0 or m == 0:
            continue

        send  = s * 1000 + e * 100 + n * 10 + d
        more  = m * 1000 + o * 100 + r * 10 + e
        money = m * 10000 + o * 1000 + n * 100 + e * 10 + y

        if send + more == money:
            return dict(zip(letters, p))

solution = solve_csp()
print(solution)
