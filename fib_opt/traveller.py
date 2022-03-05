"""
If a traveller is placed on the topleft of the map which contains axis (X,Y), if the traveller can only move in 2 directions right and down, 
how many ways can he take to reach the ending point at (1,1)


"""


def gridTraveler(X,Y, memo = {}):
    if (X,Y) in memo: return memo[X,Y]
    if (X==0 or Y == 0) : return 0
    if (X==1 and Y == 1) : return 1
    memo[X,Y] = gridTraveler(X-1,Y,memo) + gridTraveler(X,Y-1,memo)
    return memo[X,Y]
   

 
### Test cases
print(gridTraveler(1, 1)) # 1
print(gridTraveler(2, 3)) # 3
print(gridTraveler(3, 2)) # 3
print(gridTraveler(3, 3)) # 6
print(gridTraveler(18, 18)) # 2333606220



