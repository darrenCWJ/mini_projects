"""
A bizarre Python challenge. First read this text:-
https://pastebin.com/sHqwZBAz
and convert it to English by changing every "1" to "a", every "2" to "e", every "3" to "i", every "4" to "o", every "5" to "u" and every "6" to "y".
You now have the book "Alice In Wonderland".
Then make a dictionary of every word that exists in the text. A word is any contiguous string of purely alphabetic characters. 
Then for each word in your dictionary, add together the ascii values of all the characters in the word (use the ord() function). Then test if the resulting sum is a prime number.
Example "and" has ascii values 97, 110, 100 which totals 307, and that is a prime number!
Find the 2 longest words where the sum of the ascii values is prime.
(The answer is not depressing. I was wrong, LOL)
"""

import re
from collections import Counter
import sympy 
import copy


with open("AliceText.txt",  encoding="utf8") as f:
    lines = f.readlines()
storyR = '\n'.join(lines)
    
# replace numbers with words
lisletters = ["a","e","i","o","u","y"]
dicletters = {k:v for k,v in enumerate(lisletters,1)}

# cleaning the story
story = "".join(map(lambda x: dicletters[int(x)] if x.isnumeric() else x,storyR))

# creating a dictionary of every word
lisofword = re.findall(r"[\w']+", story.lower())
setofword = dict.fromkeys(lisofword)

# finding ASCII value of the character
def asciilength(word):
    summa = 0
    count = 0
    for letter in word:
        summa += ord(letter)
        count+=1
        prime = sympy.isprime(summa)
    return summa,count,prime



for k in setofword:
    setofword[k] = asciilength(str(k))
    
# finding2 longest word where ascii value is prime
setofword2 = setofword.copy()
for key, value in setofword2.items():
    if value[2] == False:
        del setofword[key]
        
newset = {k: v for k, v in sorted(setofword.items(), key=lambda item: item[1][1], reverse=True)}

first2pairs = {k: newset[k] for k in list(newset)[:2]}