from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1]; DIST=ROOT/'dist'
if DIST.exists(): shutil.rmtree(DIST)
DIST.mkdir()
for name in ['index.html','data','web','public']:
    src=ROOT/name; dst=DIST/name
    if src.is_dir(): shutil.copytree(src,dst)
    else: shutil.copy2(src,dst)
print('built',DIST)
