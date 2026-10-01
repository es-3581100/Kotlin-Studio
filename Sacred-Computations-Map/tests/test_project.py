import json, sys, unittest
from urllib.parse import unquote
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'python'))
from sacred_computations.catalog import concepts, relations, sources
from sacred_computations.graph import shortest_path
from sacred_computations.symbolic import emit, pythagorean_identity
class SacredTests(unittest.TestCase):
 def test_source_count_and_exclusions(self):
  s=sources(); self.assertEqual(len(s),245)
  bad=[x['filename'] for x in s if 'kotlin' in x['filename'].lower() or 'openrndr' in x['filename'].lower()]
  self.assertEqual(bad,[])
 def test_all_relation_nodes_exist(self):
  ids={n['id'] for n in concepts()}
  for e in relations(): self.assertIn(e['source'],ids); self.assertIn(e['target'],ids)
 def test_algebraic_bridges_residual_zero(self):
  for cid in ['golden-ratio','silver-ratio','plastic-ratio','tribonacci-ratio','supergolden-ratio','supersilver-ratio']:
   self.assertEqual(emit(cid)['residual'],'0')
 def test_pythagorean_identity(self): self.assertEqual(str(pythagorean_identity()),'0')
 def test_pell_to_code_route(self):
  r=shortest_path('pell','rust-target'); self.assertTrue(r); self.assertEqual(r[0],'pell'); self.assertEqual(r[-1],'rust-target')
 def test_tribonacci_rauzzy_lane(self):
  r=shortest_path('tribonacci','rauzy-fractal'); self.assertTrue(r); self.assertLessEqual(len(r),3)
 def test_local_source_files_exist(self):
  for s in sources(): self.assertTrue((ROOT/'public'/Path(unquote(s['localPath']))).exists(),s['filename'])

 def test_matrix_hud_contract(self):
  html=(ROOT/'index.html').read_text(encoding='utf-8')
  js=(ROOT/'web'/'app.js').read_text(encoding='utf-8')
  css=(ROOT/'web'/'styles.css').read_text(encoding='utf-8')
  for token in ['matrixCanvas','matrixFullscreen','matrixX','matrixY','matrixZ','matrixCluster']:
   self.assertIn(token,html)
  for token in ['requestFullscreen','fullscreenchange','rotatePoint','mRx','mRy','mRz','projectPoint']:
   self.assertIn(token,js)
  self.assertIn('.matrixStage:fullscreen',css)
  self.assertIn('X=capability, Y=concept, Z=cluster',js)
if __name__=='__main__': unittest.main()