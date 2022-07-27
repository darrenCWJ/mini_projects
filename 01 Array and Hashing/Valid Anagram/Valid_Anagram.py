"""
Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.
"""
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        itemS,itemT = defaultdict(), defaultdict()
        for i in range(len(s)):
            itemS[s[i]] = itemS.get(s[i],0) + 1
            itemT[t[i]] = itemT.get(t[i],0) + 1
        return True if itemS==itemT else False