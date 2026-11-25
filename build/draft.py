"""Собирает черновик (одностраничную версию для артефакта Claude) в site/ из build/data.json и build/templates.html."""
import json, os, gzip, base64
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'build'); SITE = os.path.join(ROOT, 'site')
D = json.load(open(B + '/data.json', encoding='utf8'))
T = open(B + '/templates.html', encoding='utf8').read()
import re
T = re.sub(r' download="[^"]*"', '', T.replace('href="/docs/sovety/', 'href="docs/sovety/'))  # PDF статей в черновике лежат в docs/sovety/
js = open(B + '/draft_app.js', encoding='utf8').read()
J = lambda v: json.dumps(v, ensure_ascii=False)
for k in ('IM', 'NAV', 'FOOT', 'ATT', 'TOP', 'CD'):
    js = js.replace('/*@%s@*/' % k, J(D[k]), 1)
js = open(B + '/tdv.js', encoding='utf8').read() + '\n' + open(B + '/lb.js', encoding='utf8').read() + '\n' + js  # просмотр техкарт — первым, чтобы «назад» закрывал техкарту, а не окно товара
js += '\n' + open(B + '/cart.js', encoding='utf8').read()  # корзина
js += '\n' + open(B + '/gal.js', encoding='utf8').read()  # галерея фото
KK = json.load(open(B + '/kk.json', encoding='utf8')); KK['t'].update(json.load(open(B + '/kk_products.json', encoding='utf8')))  # + названия и описания товаров
js += '\nwindow.KK=' + json.dumps(KK, ensure_ascii=False, separators=(',', ':')) + ';\n' + open(B + '/i18n.js', encoding='utf8').read()  # язык РУС | ҚАЗ
# Большие фото для просмотра на весь экран: пакеты site_big/b<N>.json (~0,6 МБ), в артефакте — img/big/b<N>.json.
# Какой ключ в каком пакете — window.BIGI в черновике (lb.js). В git пакеты не хранятся (собираются из build/big/).
BIGD = os.path.join(ROOT, 'site_big'); os.makedirs(BIGD, exist_ok=True)
_bf = sorted(f for f in os.listdir(B + '/big') if f.endswith('.webp'))
packs, BIGI, cur, sz = [{}], {}, 0, 0
for f in _bf:
    d = 'data:image/webp;base64,' + base64.b64encode(open(B + '/big/' + f, 'rb').read()).decode()
    if sz and sz + len(d) > 650000: packs.append({}); sz = 0
    packs[-1][f[:-5]] = d; sz += len(d); BIGI[f[:-5]] = len(packs) - 1
for n, pk in enumerate(packs):
    p = os.path.join(BIGD, 'b%d.json' % n); s_ = json.dumps(pk, separators=(',', ':'))
    if not os.path.exists(p) or open(p).read() != s_: open(p, 'w').write(s_)
for f in os.listdir(BIGD):
    if f.startswith('b') and int(f[1:-5]) >= len(packs): os.remove(os.path.join(BIGD, f))
js = 'window.BIGI=' + json.dumps(BIGI, separators=(',', ':')) + ';\n' + js
print('big packs', len(packs), len(BIGI))
# Страницы переводных техкарт (build/tds_ru) в черновике: в артефакте мало места под файлы, поэтому webp-страницы
# собираются в пакеты site_docs/t<N>.json (в артефакте docs/t<N>.json), карта страница→пакет — window.TDP (tdv.js).
TDD = os.path.join(ROOT, 'site_docs'); os.makedirs(TDD, exist_ok=True)
_tn = sorted(set(v['pdf'][:-4] for v in json.load(open(B + '/tds_ru/docs.json', encoding='utf8')).values()))
_tf = sorted(f for f in os.listdir(B + '/docs') if f.endswith('.webp') and f.rsplit('-', 1)[0] in _tn)
# остальные техкарты (не из tds_ru) — тоже в пакеты, после переводных (чтобы освободить файлы в артефакте, 25.11.2026)
_tf += sorted(f for f in os.listdir(B + '/docs') if f.endswith('.webp') and f.rsplit('-', 1)[0] not in _tn)
tpk, TDP, tsz = [{}], {}, 0
for f in _tf:
    d = 'data:image/webp;base64,' + base64.b64encode(open(B + '/docs/' + f, 'rb').read()).decode()
    if tsz and tsz + len(d) > 650000: tpk.append({}); tsz = 0
    tpk[-1][f] = d; tsz += len(d); TDP[f] = len(tpk) - 1
for n, pk in enumerate(tpk):
    p_ = os.path.join(TDD, 't%d.json' % n); s_ = json.dumps(pk, separators=(',', ':'))
    if not os.path.exists(p_) or open(p_).read() != s_: open(p_, 'w').write(s_)
for f in os.listdir(TDD):
    if f.startswith('t') and int(f[1:-5]) >= len(tpk): os.remove(os.path.join(TDD, f))
js = 'window.TDP=' + json.dumps(TDP, separators=(',', ':')) + ';\n' + js
print('tds packs', len(tpk), len(TDP))
app = T + '\x00' + js
open(SITE + '/app.txt', 'w', encoding='utf8').write(app)
z = base64.b64encode(gzip.compress(app.encode('utf8'), 9, mtime=0)).decode()
shell = open(B + '/draft_shell.html', encoding='utf8').read()
open(SITE + '/index.html', 'w', encoding='utf8').write(shell.replace('/*@D@*/', z, 1))
print('draft ok', len(app))
