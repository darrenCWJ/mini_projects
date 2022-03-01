

def main():
    import requests
    from bs4 import BeautifulSoup
    import random
    
    # URL = "https://www.jewelchangiairport.com/en/dine.html"
    URL = "https://www.kinex.com.sg/dining"
    # URL = "https://www.capitaland.com/sg/malls/tampinesmall/en/stores.html"
    page = requests.get(URL)
    
    soup = BeautifulSoup(page.content, "html.parser")
    
    results = soup.find_all("div", class_="item-list")
    
    
    
    shopnames = []
    for shop in results:
        # for kinex
        shopname = shop.find("span", class_="item-list-title")
        shopnames.append(shopname.text)
        
    
    print(random.choice(shopnames))
    
    
if __name__ == "__main__":
    main()