"""

Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.
"""

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        amount = {}
        for num in nums:
            amount[num] = amount.get(num,0) + 1
        
        reverse_amount = [[] for i in range(len(nums) + 1)]
        for value,key in amount.items():
            reverse_amount[key].append(value) ## appending the values inside the list with the times appeared as index
        
        output = []
        for i in range(len(reverse_amount) -1,0,-1):
            for n in reverse_amount[i]:
                output.append(n)
                if len(output) == k:
                    return output