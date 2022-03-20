# -*- coding: utf-8 -*-
"""
https://leetcode.com/problems/maximum-subarray/

Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.

Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.

Input: nums = [1]
Output: 1

Input: nums = [5,4,-1,7,8]
Output: 23

"""

class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        if not nums: return 0
        l,r = 0, 0
        res = 0
        maxi = float("-inf")
        while l <= len(nums) - 1:
            
            for i in range(r,len(nums)):
                res += nums[i]
                maxi = max(res,maxi)
                if res < 0 : 
                    l = r + 1
                    res = 0
                    continue 
            res = 0
            l+=1
            r=l
        return maxi