"""Водяной знак на фото товаров: узор из мелких полупрозрачных логотипов + уменьшение до 320 px.
Запускается из publish.sh перед сборкой. Каждое фото помечается один раз:
хэши уже помеченных фото хранятся в build/wm_done.json, повторно знак не ставится.
Иконки разделов (si.json) и картинки статей (sx-art-*.json) не трогаются."""
import json, os, glob, io, base64, hashlib
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'build'); IMG = os.path.join(ROOT, 'site', 'img')
DONE_F = os.path.join(B, 'wm_done.json')
ALPHA = 0.20      # прозрачность логотипа (20%)
MAXSIDE = 320     # максимальная сторона фото, px
QUALITY = 80      # качество webp
SKIP_FILES = {'si.json'}

done = set(json.load(open(DONE_F))) if os.path.exists(DONE_F) else set()
D = json.load(open(os.path.join(B, 'data.json'), encoding='utf8'))
LOGO = Image.open(io.BytesIO(base64.b64decode(D['IM']['logo'].split(',', 1)[1]))).convert('RGBA')
h = lambda s: hashlib.sha1(s.encode()).hexdigest()[:16]

def stamp(im):
    im = im.convert('RGBA')
    if max(im.size) > MAXSIDE:
        im.thumbnail((MAXSIDE, MAXSIDE), Image.LANCZOS)
    W, H = im.size
    lw = max(40, int(min(W, H) * 0.40))
    l = LOGO.resize((lw, int(LOGO.height * lw / LOGO.width)), Image.LANCZOS)
    l.putalpha(l.split()[3].point(lambda p: int(p * ALPHA)))
    l = l.rotate(30, expand=True, resample=Image.BICUBIC)
    layer = Image.new('RGBA', (W, H))
    sx, sy = int(l.width * 1.05), int(l.height * 1.1)
    for r, y in enumerate(range(-sy // 2, H, sy)):
        for x in range(-sx + (sx // 2 if r % 2 else 0), W, sx):
            layer.paste(l, (x, y), l)
    im.alpha_composite(layer)
    out = io.BytesIO(); im.convert('RGB').save(out, 'WEBP', quality=QUALITY, method=6)
    return out.getvalue()

n = 0
for f in sorted(glob.glob(IMG + '/s*.json')):
    if os.path.basename(f) in SKIP_FILES or os.path.basename(f).startswith('sx-art-'):  # картинки статей — без знака и уменьшения
        continue
    J = json.load(open(f, encoding='utf8')); changed = False
    for k, v in J.items():
        if h(v) in done:
            continue
        pre, _, b64 = v.rpartition(',')
        raw = stamp(Image.open(io.BytesIO(base64.b64decode(b64))))
        nv = (pre + ',' if pre else '') + base64.b64encode(raw).decode()
        J[k] = nv; done.add(h(nv)); changed = True; n += 1
    if changed:
        json.dump(J, open(f, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
json.dump(sorted(done), open(DONE_F, 'w'), indent=0)
print('watermark: новых фото помечено', n)
