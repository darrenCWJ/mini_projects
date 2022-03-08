"""
palindrome question

find the longest palindrome sequence in the string

e.g 
in = babacd
out = bab or aba

in = abbac
out = abba
"""

def palindrome(string):
    
    length = 0
    res = ""

    #odd cases
    for i in range(len(string)):
        l,r = i,i
        
        while l>=0 and r<len(string) and string[l] == string[r]:
            if (r-l+1) > length:
                res = string[l:r+1]
                length = r-l+1
            l-=1
            r+=1

    #even cases 
    for i in range(len(string)):
        l,r = i,i+1
        
        while l>=0 and r<len(string) and string[l] == string[r]:
            if (r-l+1) > length:
                res = string[l:r+1]
                length = r-l+1
            l-=1
            r+=1
    return(res)
        
print(palindrome("babacd"))

print(palindrome("caccad"))