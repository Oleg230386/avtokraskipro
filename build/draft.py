"""Собирает черновик (одностраничную версию для артефакта Claude) в site/ из build/data.json и build/templates.html."""
import json, os, gzip, base64
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'build'); SITE = os.path.join(ROOT, 'site')
D = json.load(open(B + '/data.json', encoding='utf8'))
T = open(B + '/templates.html', encoding='utf8').read()
js = open(B + '/draft_app.js', encoding='utf8').read()
J = lambda v: json.dumps(v, ensure_ascii=False)
for k in ('IM', 'NAV', 'FOOT', 'ATT', 'TOP', 'CD'):
    js = js.replace('/*@%s@*/' % k, J(D[k]), 1)
js = open(B + '/tdv.js', encoding='utf8').read() + '\n' + open(B + '/lb.js', encoding='utf8').read() + '\n' + js  # просмотр техкарт — первым, чтобы «назад» закрывал техкарту, а не окно товара
js += '\n' + open(B + '/cart.js', encoding='utf8').read()  # корзина
js += '\n' + open(B + '/gal.js', encoding='utf8').read()  # галерея фото
KK = json.load(open(B + '/kk.json', encoding='utf8')); KK['t'].update(json.load(open(B + '/kk_products.json', encoding='utf8')))  # + названия и описания товаров
js += '\nwindow.KK=' + json.dumps(KK, ensure_ascii=False, separators=(',', ':')) + ';\n' + open(B + '/i18n.js', encoding='utf8').read()  # язык РУС | ҚАЗ
app = T + '\x00' + js
open(SITE + '/app.txt', 'w', encoding='utf8').write(app)
z = base64.b64encode(gzip.compress(app.encode('utf8'), 9, mtime=0)).decode()
shell = open(B + '/draft_shell.html', encoding='utf8').read()
open(SITE + '/index.html', 'w', encoding='utf8').write(shell.replace('/*@D@*/', z, 1))
print('draft ok', len(app))
