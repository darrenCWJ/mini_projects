def fib(n, memo = {}):
    print(n)
    if n in memo: return memo[n]
    if n<=2 : return 1
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]
##  1, 1, 2, 3, 5, 8, 13, 21, 34

print("optimize fib prob")
print(fib(19))

def ufib(n):
    print(n)
    if n<=2: return 1
    return ufib(n-1) + ufib(n-2)

print("unoptimize fib prob")
print(ufib(19))

"""
How fibonacchi equation can be optimize such that the same codes will not need to be run again
"""
