"""
Combination Sum

https://leetcode.com/problems/combination-sum/
Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.

The same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

It is guaranteed that the number of unique combinations that sum up to target is less than 150 combinations for the given input.

Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
Explanation:
2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
7 is a candidate, and 7 = 7.
These are the only two combinations.

Input: candidates = [2,3,5], target = 8
Output: [[2,2,2,2],[2,3,3],[3,5]]
"""

def combSum (candidates , target):
    combinations = []
    
    def perm(i, currentVal , total): # i is the integer value of current target in candidates. currentVal is the list of values tested. Total is the sum of currentVal
        if target == total:
            combinations.append(currentVal.copy())
            return
        if i>= len(candidates) or total > target:
            return
        
        print(currentVal)
        currentVal.append(candidates[i])
        perm(i, currentVal, total + candidates[i])
        currentVal.pop()
        perm(i + 1,currentVal, total)
            
    perm(0,[],0)
    return combinations

a = combSum([2,3,6,7], 7)

b = combSum([2,3,5],8)