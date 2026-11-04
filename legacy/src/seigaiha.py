# Seigaiha tile: overlapping fans, later (lower) rows painted over earlier ones.
import sys, urllib.parse
def tile(paper, ink, R=20):
    fans = [(R,-R/2),(0,0),(2*R,0),(R,R/2),(0,R),(2*R,R),(R,1.5*R)]
    s = f"<svg xmlns='http://www.w3.org/2000/svg' width='{2*R}' height='{R}' viewBox='0 0 {2*R} {R}'>"
    for x,y in fans:
        s += f"<circle cx='{x:g}' cy='{y:g}' r='{R}' fill='{paper}'/>"
        for r in (R-1, R*0.72, R*0.46, R*0.2):
            s += f"<circle cx='{x:g}' cy='{y:g}' r='{r:g}' fill='none' stroke='{ink}' stroke-width='1'/>"
    s += "</svg>"
    return "url(\"data:image/svg+xml," + urllib.parse.quote(s, safe="=:/' ") + "\")"
if __name__ == "__main__":
    print(tile(sys.argv[1], sys.argv[2]))
