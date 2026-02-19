# Assignment 2: Hill Climbing for Travelling Salesman Problem

import math
import random

def distance(c1, c2):
    return math.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)

def total_distance(cities, tour):
    n = len(tour)
    return sum(distance(cities[tour[i]], cities[tour[(i + 1) % n]]) for i in range(n))

def two_opt_swap(tour, i, j):
    return tour[:i] + tour[i:j+1][::-1] + tour[j+1:]

def hill_climbing(cities):
    tour = list(range(len(cities)))
    random.shuffle(tour)
    current_dist = total_distance(cities, tour)

    improved = True
    while improved:
        improved = False
        for i in range(1, len(tour) - 1):
            for j in range(i + 1, len(tour)):
                new_tour = two_opt_swap(tour, i, j)
                new_dist = total_distance(cities, new_tour)
                if new_dist < current_dist:
                    tour = new_tour
                    current_dist = new_dist
                    improved = True
                    break
            if improved:
                break

    return tour, current_dist

cities = [(0, 0), (1, 5), (4, 1), (4, 4), (2, 2)]

tour, dist = hill_climbing(cities)
print("Tour:", tour)
print("Total Distance:", round(dist, 2))
