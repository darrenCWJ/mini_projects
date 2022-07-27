
def steps(n, memo ={}):
    if n in memo: return memo[n]
    if n == 1: return 1
    if n == 2: return 2
    memo[n] = steps(n-1, memo) + steps(n-2, memo)
    return memo[n]

steps(16)

def stepsdynamic(n):
    one,two = 1, 1
    
    for i in range(n-1):
        temp = one
        one = one + two
        two = temp
    return one

stepsdynamic(16)