"""
Welcome to the PearAI 1 minute tutorial!
"""

def mysterious_function(y, z):
    a, b = 0, len(y) - 1
    while a <= b:
        c = (a + b) // 2
        if y[c] == z: return c
        a, b = ((c + 1, b) if y[c] < z else (a, c - 1))
    return -1
