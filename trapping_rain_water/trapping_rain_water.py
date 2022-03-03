"""
Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

https://leetcode.com/problems/trapping-rain-water/
"""


height = [4,2,0,3,2,5] ## return 9
# height = [0,1,0,2,1,0,1,3,2,1,2,1] ## return 6

def trap(height):
    if not height: return 0
    
    l, r = 0 , len(height) - 1  
    maxL , maxR = height[l], height[r]
    result = 0
    
    while l < r:
        if maxL < maxR:
            l += 1
            maxL = max(maxL, height[l])
            result = result + max(min(maxL, maxR) - height[l], 0)

        else:
            r -= 1
            maxR = max(maxR, height[r])
            result = result + max(min(maxL, maxR) - height[r], 0 )

    return result


h = trap(height)
print(h)