"""
you are selecting art for a client with special tastes. client wants only to be shown art with favorite colors,
 blue(b), yellow(y) or red(r), but only one color per art-piece. so if a piece has blue, 
 it must not contain yellow or red write code to help you select pieces to show client.
all art available has been color-coded by your assistant
"""

art = ["1ygb", "2gbw", "3ygb", "4mbg", "5bgy", "6grb", "7yrg", "8grm", "9owy"]

print(f"Artwork: {[pic[0] for pic in art if ('y' in pic) + ('b' in pic) + ('r' in pic) == 1]}")

