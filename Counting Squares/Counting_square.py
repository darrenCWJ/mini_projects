"""
https://leetcode.com/problems/detect-squares/submissions/

You are given a stream of points on the X-Y plane. Design an algorithm that:

Adds new points from the stream into a data structure. Duplicate points are allowed and should be treated as different points.
Given a query point, counts the number of ways to choose three points from the data structure such that the three points and the query point form an axis-aligned square with positive area.
An axis-aligned square is a square whose edges are all the same length and are either parallel or perpendicular to the x-axis and y-axis.

Implement the DetectSquares class:

DetectSquares() Initializes the object with an empty data structure.
void add(int[] point) Adds a new point point = [x, y] to the data structure.
int count(int[] point) Counts the number of ways to form axis-aligned squares with point point = [x, y] as described above.
"""

class DetectSquares:

    def __init__(self):
        self.allpoints = defaultdict(tuple)
        

    def add(self, point: List[int]) -> None:
        self.allpoints[tuple(point)] = self.allpoints.get(tuple(point),0) + 1

    def count(self, point: List[int]) -> int:
        allsquare = 0
        qx, qy = point
        for x,y in self.allpoints.keys():
            # check if x and y in dataset is diagonal of given point
            if ((abs(qx - x)  != abs(qy-y))) | (qy == y) | (qx == x):
                continue
            # add the other sides if have
            allsquare += self.allpoints.get((x,qy),0) * self.allpoints.get((qx,y),0) * self.allpoints.get((x,y),0)
        return allsquare

# Your DetectSquares object will be instantiated and called as such:
# obj = DetectSquares()
# obj.add(point)
# param_2 = obj.count(point)