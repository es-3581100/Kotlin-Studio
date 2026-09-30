from __future__ import annotations
import argparse, json
from .catalog import concept, bridge, sources
from .graph import shortest_path
from .symbolic import emit, POLYNOMIALS

def main(argv=None):
    p=argparse.ArgumentParser(prog='sacred-compute',description='Explore Sacred Computations from source math to symbolic/code bridges.')
    sub=p.add_subparsers(dest='cmd',required=True)
    q=sub.add_parser('show'); q.add_argument('concept_id')
    q=sub.add_parser('bridge'); q.add_argument('concept_id')
    q=sub.add_parser('route'); q.add_argument('start'); q.add_argument('goal')
    q=sub.add_parser('sources'); q.add_argument('query')
    a=p.parse_args(argv)
    if a.cmd=='show':
        c=concept(a.concept_id)
        if not c: raise SystemExit('unknown concept')
        print(json.dumps(c,indent=2,ensure_ascii=False))
    elif a.cmd=='bridge':
        b=bridge(a.concept_id)
        if a.concept_id in POLYNOMIALS: b={**(b or {}),'liveSymPy':emit(a.concept_id)}
        if not b: raise SystemExit('no executable bridge for this concept yet')
        print(json.dumps(b,indent=2,ensure_ascii=False))
    elif a.cmd=='route': print(' -> '.join(shortest_path(a.start,a.goal)))
    else:
        qq=a.query.lower()
        for s in sources():
            if qq in s['title'].lower(): print(f"{s['group']:7} {s['title']}\n  {s['localPath']}")
if __name__=='__main__': main()
