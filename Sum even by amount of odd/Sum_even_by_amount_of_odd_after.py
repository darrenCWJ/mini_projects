"""
Here is a crazy little coding / problem solving challenge. Given this list of integers:-
[18, 23, 17, 30, 6, 33, 32, 24, 12, 17, 36, 19, 35, 12, 17, 14, 15, 31, 38, 26]
the task is to multiply each even integer by the number of odd integers that follow it in the list. 
Then add up all these products to give an overall total. 
Tell me the event in history that occurred in the year represented by that total (or just tell me the total!)
For example, the integer 14 has 2 odd integers after it, so that contributes 28 to the total. 
The integer 36 is followed by 5 odd integers, so that contributes 180 to the total.
"""

import requests
from bs4 import BeautifulSoup

def sumevenodd(lis):
    total_num, current_even_num = 0, 0
    for i in lis:
        if i%2==0:
            current_even_num += i
            continue
        total_num += current_even_num
    
    print(total_num)
    return total_num

def googlesearch(total_num):
    google_search = requests.get(f'https://www.google.com/search?q=happen+{total_num}')
    soup = BeautifulSoup(google_search.text, "html.parser")
    results = soup.find_all( 'h3' )[0]
    print(results.text)
    
def main():
    lis = [18, 23, 17, 30, 6, 33, 32, 24, 12, 17, 36, 19, 35, 12, 17, 14, 15, 31, 38, 26]
    year = sumevenodd(lis)
    googlesearch(year)
    
if __name__ == '__main__':
    main()