"""
Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.
"""
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        allsol = defaultdict(list)
        for string in strs:
            allsol[tuple(sorted(string))].append(string)
        return allsol.values()
    

## solution when 26 > logn
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        all_sol = defaultdict(list)
        for s in strs:
            all_res = [0] * 26
            for c in s:
                all_res[ord(c) - ord('a')] += 1
            all_sol[tuple(all_res)].append(s)
        return all_sol.values()