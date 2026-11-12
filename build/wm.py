"""Фото товаров: водяной знак (узор из мелких полупрозрачных логотипов) + две версии каждого фото.

Оригинал (без знака, в полном качестве) хранится в build/orig/<ключ>.<формат> — из него всё и делается:
  * site/img/s*.json — фото для карточек (до THUMB px по большей стороне), со знаком;
  * build/big/<ключ>.webp — большое фото для просмотра на весь экран (до BIG px), со знаком.
Фото никогда не увеличиваются больше оригинала, поэтому качество на сайте = качество присланного фото.

Новое фото: положить ОРИГИНАЛ (не уменьшать!) в site/img/s*.json как обычно — при publish.sh скрипт
сам сохранит его в build/orig/, поставит знак и сделает обе версии.
Состояние — build/wm_state.json. Старые фото без оригинала (их хэши в build/wm_done.json) не трогаются.
Иконки разделов (si.json) и картинки статей (sx-art-*.json) не трогаются."""
import json, os, glob, io, base64, hashlib
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'build'); IMG = os.path.join(ROOT, 'site', 'img')
ORIG = os.path.join(B, 'orig'); BIGD = os.path.join(B, 'big')
STATE_F = os.path.join(B, 'wm_state.json'); DONE_F = os.path.join(B, 'wm_done.json')
ALPHA = 0.20      # прозрачность логотипа (20%)
THUMB = 480       # фото в карточке, px
BIG = 1400        # фото на весь экран, px
Q_THUMB, Q_BIG = 80, 82
P = '%s/%s/%s/%s/%s' % (ALPHA, THUMB, BIG, Q_THUMB, Q_BIG)
SKIP_FILES = {'si.json'}
os.makedirs(ORIG, exist_ok=True); os.makedirs(BIGD, exist_ok=True)

legacy = set(json.load(open(DONE_F))) if os.path.exists(DONE_F) else set()
state = json.load(open(STATE_F)) if os.path.exists(STATE_F) else {}
D = json.load(open(os.path.join(B, 'data.json'), encoding='utf8'))
LOGO = Image.open(io.BytesIO(base64.b64decode(D['IM']['logo'].split(',', 1)[1]))).convert('RGBA')
h = lambda s: hashlib.sha1(s.encode()).hexdigest()[:16]
hb = lambda b: hashlib.sha1(b).hexdigest()[:16]

def stamp(src, maxside, q):
    im = ImageOps.exif_transpose(src).convert('RGBA')
    if max(im.size) > maxside:
        im.thumbnail((maxside, maxside), Image.LANCZOS)
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
    bg = Image.new('RGBA', (W, H), (255, 255, 255, 255))  # прозрачный фон → белый
    bg.alpha_composite(im); bg.alpha_composite(layer)
    out = io.BytesIO(); bg.convert('RGB').save(out, 'WEBP', quality=q, method=6)
    return out.getvalue()

def orig_path(k):
    g = glob.glob(os.path.join(ORIG, glob.escape(k) + '.*'))
    return g[0] if g else None

def save_orig(k, raw):
    old = orig_path(k)
    if old: os.remove(old)
    fmt = (Image.open(io.BytesIO(raw)).format or 'img').lower().replace('jpeg', 'jpg')
    p = os.path.join(ORIG, k + '.' + fmt); open(p, 'wb').write(raw); return p

def make(k, p):
    raw = open(p, 'rb').read(); src = Image.open(io.BytesIO(raw))
    open(os.path.join(BIGD, k + '.webp'), 'wb').write(stamp(src, BIG, Q_BIG))
    v = 'data:image/webp;base64,' + base64.b64encode(stamp(src, THUMB, Q_THUMB)).decode()
    state[k] = {'o': hb(raw), 't': h(v), 'p': P}
    return v

n = 0
for f in sorted(glob.glob(IMG + '/s*.json')):
    bn = os.path.basename(f)
    if bn in SKIP_FILES or bn.startswith('sx-art-'):
        continue
    J = json.load(open(f, encoding='utf8')); changed = False
    for k, v in J.items():
        hv, st, op = h(v), state.get(k), orig_path(k)
        if st and st['t'] == hv and op:
            if st['p'] == P and st['o'] == hb(open(op, 'rb').read()) and os.path.exists(os.path.join(BIGD, k + '.webp')):
                continue  # всё готово
            nv = make(k, op)           # изменились настройки или оригинал — пересобрать
        elif not st and op and hv in legacy:
            nv = make(k, op)           # первый запуск: оригинал восстановлен из истории
        elif hv in legacy:
            continue                   # старое фото без оригинала — оставить как есть
        else:                          # новое фото: это и есть оригинал
            nv = make(k, save_orig(k, base64.b64decode(v.rpartition(',')[2])))
        J[k] = nv; changed = True; n += 1
    if changed:
        json.dump(J, open(f, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
json.dump(state, open(STATE_F, 'w'), indent=0, sort_keys=True)
print('watermark: фото обработано', n)
