# Self-contained font CSS. The renderer must not depend on the network:
# Chromium here reaches nothing over HTTPS, and a card that silently falls
# back to a system sans is a card that ships wrong.
import re, base64, subprocess, sys
css = open('fonts.css', encoding='utf-8').read()
urls = sorted(set(re.findall(r'https://fonts\.gstatic\.com/[^\s)]+\.woff2', css)))
print(f"{len(urls)} faces", flush=True)
cache = {}
for i, u in enumerate(urls, 1):
    r = subprocess.run(['curl','-sS','--fail','-A','Mozilla/5.0','-o','-',u], capture_output=True)
    if r.returncode or not r.stdout:
        print("  FAIL", u); sys.exit(1)
    cache[u] = 'data:font/woff2;base64,' + base64.b64encode(r.stdout).decode()
    print(f"  [{i}/{len(urls)}] {len(r.stdout):>6}B  {u.split('/')[-1]}", flush=True)
for u, d in cache.items():
    css = css.replace(u, d)
open('fonts-inline.css','w',encoding='utf-8').write(css)
print("wrote fonts-inline.css", len(css)//1024, "KB")
