"""
color sorting

given a list of
[0,1,0,1,1,2,2]

sort it in order

out = [0,0,1,1,1,2,2]

"""

import random

def colorsort( colors): # colors as list object
    l,i,r = 0,0, len(colors) -1
    
    def swap(lis,p1,p2):
        backup = lis[p1]
        lis[p1] = lis[p2]
        lis[p2] = backup
        return lis
    
    
    while i<r:
        if colors[i]==0:
            colors = swap(colors,l,i)
            l+=1
            i+=1
        if colors[i] ==1:
            i+=1
        if colors[i]==2:
            colors = swap(colors,r,i)
            r-=1
    return colors


randoml = [0]*8 + [1] *8 + [2] *8
print(randoml)
random.shuffle(randoml)
print(randoml)
colorsorting = colorsort(randoml)
print(colorsorting)

sett = colorsort([1,1,0,0,0,2,2,1])
print(sett)

sett2 = colorsort([1,1,2,2,0,0,2,1,2,2,1])
print(sett2)