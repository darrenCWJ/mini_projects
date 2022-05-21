import numpy as np

grid = [
    [0,0,0,0,0,2,1,8,0],
    [3,0,9,5,7,1,4,6,0],
    [4,1,2,3,8,0,5,9,0],
    [1,6,0,0,5,0,0,0,9],
    [0,0,0,0,0,7,3,0,0],
    [8,0,3,0,0,0,2,0,5],
    [0,0,0,6,3,0,9,0,0],
    [0,0,6,0,0,0,0,0,1],
    [2,3,0,7,0,9,0,0,0]
]

def solve(row, col, number):
    global grid
    for i in range(9):
        if grid[i][col] == number:
            return False

    for i in range(9):
        if grid[row][i] == number:
            return False
    
    nrow = (row//3) * 3
    ncol = (col//3) * 3

    for i in range(3):
        for j in range(3):
            if grid[nrow+i][ncol+j] == number:
                return False
    return True


def solver():
    global grid
    for row in range(9):
        for col in range(9):
            if grid[row][col] == 0:
                for number in range(1,10):
                    if solve(row,col,number):
                        grid[row][col] = number
                        solver()
                        grid[row][col] = 0
                return
    print(np.matrix(grid))
if __name__ == "__main__":
    solver()