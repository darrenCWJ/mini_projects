"""
https://leetcode.com/problems/partition-equal-subset-sum/submissions/

Given a non-empty array nums containing only positive integers, 
find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.


E.g 1
Input: nums = [1,5,11,5]
Output: true
Explanation: The array can be partitioned as [1, 5, 5] and [11].

E.g 2
Input: nums = [1,2,3,5]
Output: false
Explanation: The array cannot be partitioned into equal sum subsets.
"""

class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        if sum(nums) % 2:
            return False
        
        partitionval = set()
        partitionval.add(0)
        target = sum(nums) // 2
        newLoopPartition = partitionval.copy()
        for i in nums:
            for j in newLoopPartition:
                partitionval.add(i + j)
                if target == i + j:
                    return True
            newLoopPartition = partitionval.copy()
            
        return True if target in partitionval else False