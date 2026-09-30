from __future__ import annotations
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
def _load(name): return json.loads((ROOT/'data'/name).read_text())
def concepts(): return _load('concepts.json')
def relations(): return _load('relations.json')
def bridges(): return _load('bridges.json')
def sources(): return _load('sources.json')
def concept(cid): return next((x for x in concepts() if x['id']==cid), None)
def bridge(cid): return bridges().get(cid)
