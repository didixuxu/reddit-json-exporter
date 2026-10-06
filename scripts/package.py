"""Build a deterministic, dependency-free extension ZIP without user exports."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo

root = Path(__file__).resolve().parent.parent
source = root / 'extension'
manifest = json.loads((source / 'manifest.json').read_text())
out = root / 'dist'
out.mkdir(exist_ok=True)
target = out / f'reddit-json-exporter-v{manifest["version"]}.zip'
allowed = {'.js', '.html', '.css', '.png', '.jpg', '.json'}

for asset in [manifest['action']['default_popup'], *manifest['icons'].values()]:
    if not (source / asset).is_file():
        raise SystemExit(f'Missing manifest asset: {asset}')

with ZipFile(target, 'w', ZIP_DEFLATED) as z:
    for path in sorted(source.rglob('*')):
        if not path.is_file() or path.name.startswith('.') or path.suffix not in allowed:
            continue
        item = ZipInfo(path.relative_to(source).as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
        item.compress_type = ZIP_DEFLATED
        item.external_attr = 0o644 << 16
        z.writestr(item, path.read_bytes())

with ZipFile(target) as z:
    if 'manifest.json' not in z.namelist():
        raise SystemExit('manifest.json must be at ZIP root')

digest = hashlib.sha256(target.read_bytes()).hexdigest()
checksum = out / 'SHA256SUMS.txt'
checksum.write_text(f'{digest}  {target.name}\n')
print(target)
print(digest)
