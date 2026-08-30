# Near-monochrome gradients over black quantise almost perfectly: 256
# colours costs a mean error under 0.25/255 and saves about 30%.
from PIL import Image
import os
OUT = {'main': 'og.png', 'gym': 'og-gym.png', 'max': 'og-max.png'}
for n, dest in OUT.items():
    im = Image.open(f'/tmp/og/{n}.png').convert('RGB')
    q = im.quantize(colors=256, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
    p = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'img', dest)
    q.save(p, optimize=True)
    print(f"  {dest:<12} {os.path.getsize(p)/1024:6.1f} KB")
