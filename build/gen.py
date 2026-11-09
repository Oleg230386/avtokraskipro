import json, re, os, io, base64, html, shutil, glob, urllib.parse, datetime

# Google Analytics (счётчик посещаемости) + события-заявки: WhatsApp, корзина
GA_ID = 'G-YW5ERFQ46T'
GA = ('<script async src="https://www.googletagmanager.com/gtag/js?id=%s"></script>'
      '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","%s");'
      'document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("a,button");if(!t)return;'
      'var h=t.getAttribute("href")||"",n;'
      'if(t.id==="csend")n="cart_send";else if(t.classList.contains("cadd"))n="add_to_cart_click";'
      'else if(/wa\\.me|whatsapp/i.test(h))n=/77074231516/.test(h)?"colorist_click":"whatsapp_click";'
      'else if(/^tel:/.test(h))n="phone_click";else if(/instagram\\.com/.test(h))n="instagram_click";'
      'if(n)gtag("event",n,{link_url:h,page_path:location.pathname})},true);</script>') % (GA_ID, GA_ID)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
B = os.path.join(ROOT, 'build')
OUT = os.environ.get('OUT') or os.path.join(ROOT, 'static')
DOMAIN = 'https://avtokraskipro.kz'
WA = '77771187355'

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT + '/img', exist_ok=True)
os.makedirs(OUT + '/assets', exist_ok=True)

D = json.load(open(B + '/data.json', encoding='utf8'))
CD, NAV, FOOT, TOP, ATT = D['CD'], D['NAV'], D['FOOT'], D['TOP'], D['ATT']
T = open(B + '/templates.html', encoding='utf8').read()

# ---------- images ----------
IV = {}  # метка версии каждой картинки: новое фото = новый адрес, телефоны сразу берут его
def save_img(k, uri):
    head, b64 = uri.split(',', 1)
    assert 'webp' in head, (k, head)
    raw = base64.b64decode(b64)
    IV[k] = __import__('hashlib').md5(raw).hexdigest()[:8]
    open(f'{OUT}/img/{k}.webp', 'wb').write(raw)

for k, v in D['IM'].items():
    save_img(k, v)
for f in glob.glob(SITE + '/img/s*.json'):
    for k, v in json.load(open(f)).items():
        save_img(k, v)
print('images', len(os.listdir(OUT + '/img')))

# ---------- helpers ----------
def path_of(pid):
    if pid in ('home', ''):
        return '/'
    if pid.startswith('brand-'):
        return '/brand/' + pid[6:] + '/'
    return '/' + pid.replace('.', '/') + '/'

def fix_links(s):
    return re.sub(r'href="#([a-z0-9.\-]+)"', lambda m: 'href="%s"' % path_of(m.group(1)), s)

def enc(t):
    return urllib.parse.quote(t, safe="-_.!~*'()")

def wa(t):
    return 'https://wa.me/' + WA + '?text=' + enc(t)

def strip_tags(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))

def card_html(c):
    """Fill WhatsApp link and real image path into a card."""
    t = strip_tags(re.search(r'<h2>(.*?)</h2>', c, re.S).group(1))
    m = re.search(r'<p class="sub">(.*?)</p>', c, re.S)
    sb = strip_tags(m.group(1)) if m else ''
    k = re.match(r'^Код: (.*?)(?:\. Фасовка:.*)?$', sb)
    cd = k.group(1) if k else None
    nm = t[len(cd) + 3:] if cd and t.startswith(cd + ' · ') else t
    w = 'Здравствуйте! Интересует товар: ' + nm + (' (код ' + cd + ')' if cd else '') + '. Подскажите цену и наличие.'
    c = c.replace('<a class="btn wa"></a>',
                  '<a class="btn wa" href="%s" target="_blank" rel="noopener">%s</a>' % (html.escape(wa(w)), ATT))
    c = re.sub(r'<img class="ph" data-img="([^"]+)"', r'<img class="ph" src="/img/\1.webp" decoding="async"', c)
    return c

def imgs(s, eager=()):
    def r(m):
        k = m.group(1)
        lazy = '' if k in eager else ' loading="lazy"'
        return '<img src="/img/%s.webp"%s' % (k, lazy)
    return re.sub(r'<img data-img="([^"]+)"', r, s)

CSS = ''
h = open(SITE + '/index.html', encoding='utf8').read()
CSS = '\n'.join(re.findall(r'<style>(.*?)</style>', h[:h.find('<script>var D=')], re.S))
PP_CSS = ''.join(r.replace('#pv .pvw', '.pp.pvw').replace('#pv ', '.pp ') for r in re.findall(r'#pv [^{}]*\{[^}]*\}', CSS))
PP_CSS += ('.pp.pvw{padding-top:4px}.pp .pvb{text-decoration:none}.pp .gal{margin:0 0 4px}.pp .gal .gtr{border-radius:8px;border:1px solid var(--line,#ddd);background:#fff}'
           '.pp .gal .gtr>img{display:block;width:100%;height:auto;max-height:70vh;aspect-ratio:1;object-fit:contain;background:#fff}.pp .pvi{height:auto}.pp .gal .ga{width:42px;height:42px;font-size:28px}'
           '.pp .cbx{margin:0 0 10px}.pp .cadd{font-size:17px;min-height:48px}.pp .cstep{min-height:48px}.card h2 a.pl{color:inherit;text-decoration:none}')
CSS += '\n' + PP_CSS
open(OUT + '/assets/site.css', 'w', encoding='utf8').write(CSS)

# ---------- home slider ----------
def slider():
    ids = []
    for code in TOP:
        for i, c in enumerate(CD):
            m = re.search(r'<h2>([\s\S]*?)</h2>', c)
            if m and (m.group(1).startswith(code + ' · ') or m.group(1) == code):
                ids.append(i); break
    h = ('<a class="hs-brand" href="/"><img src="/img/ig-av.webp" alt="" width="32" height="32">'
         '<b>AVTOKRASKI<span>_PRO</span></b><small>· популярные товары</small></a><div class="hs-vp"><div class="hs-tr">')
    cards = {}
    for n, i in enumerate(ids):
        m = re.search(r'data-img="([^"]+)"', CD[i]); t = re.search(r'<h2>([\s\S]*?)</h2>', CD[i])
        if not m: continue
        alt = t.group(1) if t else ''
        src = ('src="/img/%s.webp"' % m.group(1)) if n < 4 else ('data-img="%s"' % m.group(1))
        im = '<img %s alt="%s" width="300" height="300">' % (src, alt)
        if i in PP:  # настоящая ссылка на страницу товара (для поиска); клик по-прежнему открывает окно
            im = '<a class="hs-a" href="/tovar/%s/" tabindex="-1" style="display:block">%s</a>' % (PP[i], im)
        h += '<div class="hs-it" data-i="%d" role="button" tabindex="0" aria-label="%s">%s</div>' % (i, alt, im)
        cards[i] = card_html(CD[i], i)
    h += ('</div></div><div class="hs-nav"><button type="button" class="hs-prev" aria-label="Назад">‹</button>'
          '<button type="button" class="hs-next" aria-label="Вперёд">›</button></div><div class="hs-bar"></div>')
    return h, cards

# ---------- titles / descriptions ----------
def pl(n):
    n = int(n); a, b = n % 10, n % 100
    w = 'позиция' if a == 1 and b != 11 else ('позиции' if 2 <= a <= 4 and not 12 <= b <= 14 else 'позиций')
    return '%d %s' % (n, w)

def meta_for(pid, h1, count, chips):
    city = 'Астана'
    if pid == 'home':
        return ('Avtokraski_Pro — автокраски, лаки, грунты и материалы для кузовного ремонта в Астане',
                'Магазин автокрасок в Астане: лаки, грунты, шпатлёвки, абразивы, краскопульты PPG, U-POL, RANAL, Norton. '
                'Подбор краски по коду цвета. Доставка по Казахстану и СНГ, Kaspi Red и рассрочка.')
    brands = ', '.join(chips[:5])
    if pid.startswith('brand-'):
        secs = ', '.join(c.lower() for c in chips[:4])
        return ('%s — каталог и цены в Астане | Avtokraski_Pro' % h1,
                '%s в Астане: %s%s. Цены в тенге, наличие и консультация в WhatsApp, доставка по Казахстану и СНГ.'
                % (h1, pl(count), (' — ' + secs) if secs else ''))
    if '.' in pid:
        return ('%s — цены и наличие в Астане | Avtokraski_Pro' % h1,
                '%s в Астане: %s с ценами в тенге и фасовкой. Узнать наличие в WhatsApp, доставка по Казахстану и СНГ.'
                % (h1, pl(count)))
    return ('%s — купить в Астане, цены | Avtokraski_Pro' % h1,
            '%s в Астане%s: %s с ценами и фасовкой. Подбор и консультация в WhatsApp, доставка по Казахстану и СНГ.'
            % (h1, (' — ' + brands) if brands else '', pl(count)))

LD_HOME = {
    "@context": "https://schema.org", "@type": "AutoPartsStore", "name": "Avtokraski_Pro",
    "url": DOMAIN + "/", "logo": DOMAIN + "/img/logo.webp", "image": DOMAIN + "/img/logo.webp",
    "telephone": "+77771187355",
    "address": {"@type": "PostalAddress", "streetAddress": "ул. Талапкерская, 24а, 204 бутик, 2 этаж",
                "addressLocality": "Астана", "postalCode": "Z11A2Y1", "addressCountry": "KZ"},
    "areaServed": ["Казахстан"], "sameAs": ["https://www.instagram.com/avtokraski_pro/"],
    "description": "Автокраски, лаки, грунты, абразивы и оборудование для кузовного ремонта в Астане."
}

import hashlib
APP_JS = open(B + '/tdv.js', encoding='utf8').read() + '\n' + open(B + '/app.js', encoding='utf8').read() + '\n' + open(B + '/cart.js', encoding='utf8').read() + '\n' + open(B + '/gal.js', encoding='utf8').read()  # сайт + корзина + галерея фото
APP_JS_VER = hashlib.md5((CSS + APP_JS).encode('utf8')).hexdigest()[:8]  # меняется при любой правке оформления/скрипта — телефоны сразу берут новое

def page(pid, title_t, body):
    body = body
    # nav
    def navr(m):
        c = m.group(1); h_ = NAV
        if c: h_ = h_.replace('href="#%s">' % c, 'href="#%s" aria-current="page">' % c)
        return h_
    body = re.sub(r'<div data-nav="([^"]*)"></div>', navr, body)
    body = body.replace('<footer data-f></footer>', '<footer>' + FOOT + '</footer>')
    hs_cards = {}
    def fill(m):
        ids = [int(x) for x in m.group(2).split(',') if x]
        return m.group(1) + ''.join(card_html(CD[i]) for i in ids) + '</main>'
    body = re.sub(r'(<main class="grid" data-c="([0-9,]*)">)</main>', lambda m: m.group(1).replace(' data-c="%s"' % m.group(2), '') + ''.join(card_html(CD[int(i)], int(i)) for i in m.group(2).split(',') if i) + '</main>', body)
    if 'id="hs"' in body:
        sh, hs_cards = slider()
        body = body.replace('<div class="hs" id="hs" aria-roledescription="carousel" aria-label="Популярные товары"></div>',
                            '<div class="hs" id="hs" aria-roledescription="carousel" aria-label="Популярные товары">' + sh + '</div>')
    body = imgs(body, eager=('logo', 'ig-av', 'kaspi-red'))
    body = fix_links(body)
    # counts / meta
    h1m = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.S)
    h1 = strip_tags(h1m.group(1)).strip() if h1m else 'Avtokraski_Pro'
    cm = re.search(r'id="cnt">Всего: (\d+)', body)
    count = cm.group(1) if cm else str(body.count('class="card"'))
    if count == '0':
        count = str(sum(int(x) for x in re.findall(r'<a class="tile" href="[^"]*"><b>[^<]*</b><span>(\d+)', body)))
    chips = [strip_tags(re.sub(r'<span>.*?</span>', '', x)) for x in re.findall(r'<a class="chip" href="/[^"]*"(?: aria-pressed="true")?>(.*?)</a>', (body.split('</h1>',1)[-1].split('<main')[0] if '</h1>' in body else ''))]
    chips = [c for c in chips if c and c != 'Все' and not c.startswith('Поиск')]
    nav_names = set(strip_tags(x) for x in re.findall(r'<img[^>]*class="cic"[^>]*>([^<]*)</a>', NAV))
    if not pid.startswith('brand-'):
        chips = [c for c in chips if c not in nav_names]
    title, desc = meta_for(pid, h1, count, chips)
    url = DOMAIN + path_of(pid)
    ld = ''
    if pid == 'home':
        ld = '<script type="application/ld+json">%s</script>' % json.dumps(LD_HOME, ensure_ascii=False)
    else:
        crumbs = re.search(r'<nav class="bc"[^>]*>(.*?)</nav>', body, re.S)
        if crumbs:
            items = []
            parts = re.findall(r'<a href="([^"]+)">(.*?)</a>', crumbs.group(1))
            for n, (hr, nm) in enumerate(parts):
                items.append({"@type": "ListItem", "position": n + 1, "name": strip_tags(nm), "item": DOMAIN + hr})
            items.append({"@type": "ListItem", "position": len(items) + 1, "name": h1, "item": url})
            ld = '<script type="application/ld+json">%s</script>' % json.dumps(
                {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}, ensure_ascii=False)
    hsc = ''
    if hs_cards:
        hsc = '<script>window.HSC=%s;</script>' % json.dumps({str(k): v for k, v in hs_cards.items()}, ensure_ascii=False).replace('</', '<\\/')
    doc = ('<!DOCTYPE html>\n<html lang="ru"><head><meta charset="utf-8">' + GA +
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
           '<title>%s</title><meta name="description" content="%s"><link rel="canonical" href="%s">'
           '<meta property="og:type" content="website"><meta property="og:site_name" content="Avtokraski_Pro">'
           '<meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:url" content="%s">'
           '<meta property="og:image" content="%s/img/logo.webp"><meta property="og:locale" content="ru_RU">'
           '<link rel="icon" href="/img/ig-av.webp" type="image/webp"><meta name="theme-color" content="#c8161d">'
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" media="print" onload="this.media=\'all\'">'
           '<link rel="stylesheet" href="/assets/site.css?v=%s">%s</head><body>\n<div id="app" class="pg">%s</div>%s'
           '<script src="/assets/app.js?v=%s" defer></script></body></html>\n') % (
        html.escape(title), html.escape(desc), url, html.escape(title), html.escape(desc), url, DOMAIN,
        APP_JS_VER, ld, body, hsc, APP_JS_VER)
    p = OUT + path_of(pid)
    os.makedirs(p, exist_ok=True)
    doc = re.sub(r'(/img/([\w\-]+)\.webp)"', lambda m: m.group(1) + ('?v=' + IV[m.group(2)] if m.group(2) in IV else '') + '"', doc)
    open(p + 'index.html', 'w', encoding='utf8').write(doc)
    return path_of(pid)


# ---------- страницы товаров /tovar/<slug>/ ----------
PP_SECTIONS = ('laki', 'grunty', 'aerozoli', 'shpatlevki', 'otverditeli', 'abrazivy', 'lenty', 'raspyliteli', 'avtohimiya', 'oborudovanie', 'prochee', 'emal')  # разделы, для которых делаются отдельные страницы товаров
TR = dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя', ['a','b','v','g','d','e','e','zh','z','i','j','k','l','m','n','o','p','r','s','t','u','f','h','c','ch','sh','sch','','y','','e','yu','ya']))
def slugify(t):
    t = t.lower()
    t = ''.join(TR.get(ch, ch) for ch in t)
    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')
    if len(t) > 70:
        t = t[:70].rsplit('-', 1)[0]
    return t or 'tovar'

TPL = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r'<template data-p="([^"]*)" data-t="([^"]*)">(.*?)</template>', T, re.S)}
def tpl_ids(pid):
    if pid not in TPL: return []
    return [int(x) for l in re.findall(r'data-c="([0-9,]*)"', TPL[pid][1]) for x in l.split(',') if x]
def tpl_h1(pid):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', TPL[pid][1], re.S)
    return strip_tags(m.group(1)).strip() if m else pid

def card_key(c):
    h2 = re.search(r'<h2>(.*?)</h2>', c, re.S).group(1)
    pr = (re.search(r'class="price">(.*?)</div>', c) or [None, ''])[1]
    return h2 + '|' + pr

PP = {}        # card index -> slug
PP_HOME = {}   # slug -> (card index, [(pid, name), ...] breadcrumbs)
_used = {}
for sec in PP_SECTIONS:
    subs = [p for p in TPL if p.startswith(sec + '.')]
    _all = []
    for p_ in [sec] + subs:
        for i in tpl_ids(p_):
            if i not in _all: _all.append(i)
    for i in _all:
        c = CD[i]
        if not c:
            continue
        k = card_key(c)
        if k in _used:
            PP[i] = _used[k]; continue
        t = strip_tags(re.search(r'<h2>(.*?)</h2>', c, re.S).group(1))
        sl = slugify(t.replace(' (мирлон)', ''))  # «(мирлон)» в названии не меняет адрес страницы
        if sl in PP_HOME:  # то же название, другая фасовка — добавить фасовку в адрес
            fm_ = re.search(r'Фасовка:\s*(.*?)</p>', c)
            if fm_: sl = sl + '-' + slugify(strip_tags(fm_.group(1)))
        base = sl; n = 2
        while sl in PP_HOME:
            sl = '%s-%d' % (base, n); n += 1
        _c = [p for p in subs if i in tpl_ids(p)]
        sub = min(_c, key=lambda p: len(tpl_ids(p))) if _c else None  # самый точный подраздел
        crumbs = [(sec, tpl_h1(sec))] + ([(sub, tpl_h1(sub))] if sub else [])
        PP[i] = sl; _used[k] = sl; PP_HOME[sl] = (i, crumbs)
# та же карточка в других разделах тоже ведёт на страницу товара
for i, c in enumerate(CD):
    if c and i not in PP and card_key(c) in _used:
        PP[i] = _used[card_key(c)]

_card_html0 = card_html
def card_html(c, _i=None):
    c = _card_html0(c)
    if _i is not None and _i in PP:
        c = re.sub(r'<h2>(.*?)</h2>', lambda m: '<h2><a class="pl" href="/tovar/%s/">%s</a></h2>' % (PP[_i], m.group(1)), c, count=1, flags=re.S)
    return c

def _price_num(pr):
    d = re.sub(r'[^0-9]', '', pr)
    return d if d and d != '0' else None

def pp_tds(code):
    """Техническая информация + кнопка PDF на странице товара (данные — DOCS из build/app.js)."""
    k = None
    for d_ in PP_DOCS:
        if code.startswith(d_): k = d_
    if not k: return ''
    o = PP_DOCS[k]; e = html.escape
    h = '<div class="tds"><h3>Техническая информация</h3><p class="src">%s</p><dl>' % e(o['src'])
    h += ''.join('<dt>%s</dt><dd>%s</dd>' % (e(a), e(b)) for a, b in o['rows']) + '</dl>'
    if o.get('hard'):
        h += '<table><thead><tr><th>Температура</th><th>Отвердитель</th><th>Разбавитель</th></tr></thead><tbody>' + ''.join('<tr><td>%s</td><td>%s</td><td>%s</td></tr>' % tuple(map(e, r)) for r in o['hard']) + '</tbody></table>'
    return h + '<a class="btn doc" href="%s" data-pg="%d" target="_blank" rel="noopener">Открыть техническую карту (PDF)</a></div>' % (o['pdf'], o.get('pg', 1))
_dj = re.search(r'var DOCS=(\{.*\});$', open(B + '/app.js', encoding='utf8').read(), re.M).group(1)
PP_DOCS = json.loads(re.sub(r'([{,])(pdf|pg|src|rows|hard):', r'\1"\2":', _dj))

def product_page(sl):
    i, crumbs = PP_HOME[sl]
    c = _card_html0(CD[i])
    g = lambda r: (re.search(r, c, re.S) or [None, ''])[1]
    ti = strip_tags(g(r'<h2>(.*?)</h2>')).strip()
    cat = strip_tags(g(r'<div class="top">(.*?)</div>')).strip()
    me = strip_tags(g(r'<p class="meta">(.*?)</p>')).strip()
    sb = strip_tags(g(r'<p class="sub">(.*?)</p>')).strip()
    ds = strip_tags(g(r'<p class="desc">(.*?)</p>')).strip()
    pr_html = g(r'<div class="price">(.*?)</div>')
    pr = strip_tags(pr_html).strip()
    wa_href = g(r'<a class="btn wa" href="([^"]+)"')
    km = re.search(r'Код:\s*(.*?)(?:\.\s*Фасовка:|\.?$)', sb); fm = re.search(r'Фасовка:\s*(.*)$', sb)
    code = km.group(1).strip() if km else ''
    if code and not re.search(r'[0-9A-Za-zА-Яа-я]', code):
        code = ''; km = None  # код скрыт звёздочками — не показывать
    brand = me.split(' · ')[0].strip() if me else ''
    e = html.escape
    rows = ''
    if me: rows += '<dt>Бренд / серия</dt><dd>%s</dd>' % e(me)
    if cat: rows += '<dt>Раздел</dt><dd>%s</dd>' % e(cat)
    if km: rows += '<dt>Код товара</dt><dd>%s</dd>' % e(code)
    if fm: rows += '<dt>Фасовка</dt><dd>%s</dd>' % e(fm.group(1).strip())
    # фото: галерея или одно фото
    gal = re.search(r'<div class="gal">.*?</button></div>', c, re.S)
    imgs_k = re.findall(r'src="/img/([\w\-]+)\.webp"', gal.group(0) if gal else g(r'(<img class="ph"[^>]*>)'))
    if gal:
        ph = re.sub(r'<img class="ph" ', '<img ', gal.group(0)).replace(' loading="lazy"', '')
    elif imgs_k:
        ph = '<img class="pvi" src="/img/%s.webp" alt="%s" width="600" height="600">' % (imgs_k[0], e(ti))
    else:
        ph = '<div class="pvn">Фото товара скоро появится</div>'
    back = crumbs[-1][0]
    bc = '<nav class="bc" aria-label="Путь"><a href="/">Главная</a>' + ''.join(' / <a href="%s">%s</a>' % (path_of(p), e(n)) for p, n in crumbs) + ' / ' + e(ti) + '</nav>'
    body = ('<div class="top-nav brandline"><a class="logo" href="/" aria-label="Avtokraski_Pro — на главную"><img data-img="logo" class="limg" alt="Avtokraski_Pro" width="220" height="56"></a></div>'
            + re.search(r'<div class="hb3">.*?</div>', TPL[crumbs[0][0]][1], re.S).group(0)
            + '<div data-nav="%s"></div>' % crumbs[0][0] + bc
            + '<div class="pvw pp"><a class="pvb" href="%s">← Назад к разделу «%s»</a>' % (path_of(back), e(crumbs[-1][1])) + ph
            + '<div class="pvc">%s</div><h1>%s</h1>' % (e(cat), e(ti)) + ('<dl>%s</dl>' % rows if rows else '')
            + '<h3>Описание</h3>' + ('<p class="pvd">%s</p>' % e(ds) if ds else '<p class="pvd none">Подробное описание, применение и совместимость уточняйте у менеджера в WhatsApp.</p>')
            + pp_tds(code)
            + ('<div class="price">%s</div>' % pr_html if pr_html else '')
            + ('<a class="btn" href="%s" target="_blank" rel="noopener">Узнать цену и наличие</a>' % wa_href if wa_href else '')
            + '</div><footer data-f></footer>')
    def navr(m):
        cc = m.group(1)
        return NAV.replace('href="#%s">' % cc, 'href="#%s" aria-current="page">' % cc)
    body = re.sub(r'<div data-nav="([^"]*)"></div>', navr, body)
    body = body.replace('<footer data-f></footer>', '<footer>' + FOOT + '</footer>')
    body = imgs(body, eager=('logo',))
    body = fix_links(body)
    url = DOMAIN + '/tovar/%s/' % sl
    pn = _price_num(pr)
    sti = ti if (not brand or brand.lower() in ti.lower()) else brand + ' ' + ti
    title = '%s — купить в Астане%s | Avtokraski_Pro' % (sti, (', цена %s' % pr) if pn else '')
    dsc = (ds.replace('\n', ' ')[:150].rsplit(' ', 1)[0] + '…') if len(ds) > 155 else ds
    desc = '%s%s. %sКупить в Астане, доставка по Казахстану и СНГ. Наличие — в WhatsApp.' % (sti, (' — ' + pr) if pn else '', (dsc + ' ') if dsc else '')
    img_url = DOMAIN + ('/img/%s.webp' % imgs_k[0] if imgs_k else '/img/logo.webp')
    prod = {"@context": "https://schema.org", "@type": "Product", "name": ti, "image": [DOMAIN + '/img/%s.webp' % k for k in imgs_k] or [img_url], "url": url}
    if ds: prod["description"] = ds[:1000]
    if code: prod["sku"] = code
    if brand: prod["brand"] = {"@type": "Brand", "name": brand}
    if pn: prod["offers"] = {"@type": "Offer", "price": pn, "priceCurrency": "KZT", "url": url, "availability": "https://schema.org/InStock", "seller": {"@type": "Organization", "name": "Avtokraski_Pro"}}
    items = [{"@type": "ListItem", "position": 1, "name": "Главная", "item": DOMAIN + "/"}]
    for p_, n_ in crumbs:
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": n_, "item": DOMAIN + path_of(p_)})
    items.append({"@type": "ListItem", "position": len(items) + 1, "name": ti, "item": url})
    ld = '<script type="application/ld+json">%s</script><script type="application/ld+json">%s</script>' % (
        json.dumps(prod, ensure_ascii=False).replace('</', '<\\/'),
        json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}, ensure_ascii=False))
    doc = ('<!DOCTYPE html>\n<html lang="ru"><head><meta charset="utf-8">' + GA +
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
           '<title>%s</title><meta name="description" content="%s"><link rel="canonical" href="%s">'
           '<meta property="og:type" content="product"><meta property="og:site_name" content="Avtokraski_Pro">'
           '<meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:url" content="%s">'
           '<meta property="og:image" content="%s"><meta property="og:locale" content="ru_RU">'
           '<link rel="icon" href="/img/ig-av.webp" type="image/webp"><meta name="theme-color" content="#c8161d">'
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" media="print" onload="this.media=\'all\'">'
           '<link rel="stylesheet" href="/assets/site.css?v=%s">%s</head><body>\n<div id="app" class="pg">%s</div>'
           '<script src="/assets/app.js?v=%s" defer></script></body></html>\n') % (
        e(title), e(desc), url, e(title), e(desc), url, img_url, APP_JS_VER, ld, body, APP_JS_VER)
    doc = re.sub(r'(/img/([\w\-]+)\.webp)"', lambda m: m.group(1) + ('?v=' + IV[m.group(2)] if m.group(2) in IV else '') + '"', doc)
    d = OUT + '/tovar/%s/' % sl
    os.makedirs(d, exist_ok=True)
    open(d + 'index.html', 'w', encoding='utf8').write(doc)
    return '/tovar/%s/' % sl

paths = []
for m in re.finditer(r'<template data-p="([^"]*)" data-t="([^"]*)">(.*?)</template>', T, re.S):
    paths.append(page(m.group(1), m.group(2), m.group(3)))
ppaths = [product_page(sl) for sl in PP_HOME]
print('pages', len(paths), 'products', len(ppaths))

# ---------- cards.js for global search ----------
js = open(SITE + '/app.txt', encoding='utf8').read().split('\x00', 1)[1]
a = js.find('var CD=') + 7; b = js.find(';var pgs', a)
open(OUT + '/assets/cards.js', 'w', encoding='utf8').write('window.CD=' + js[a:b] + ';')

# ---------- sitemap / robots / 404 / htaccess ----------
today = datetime.date.today().isoformat()
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for p in paths:
    pr = '1.0' if p == '/' else ('0.8' if p.count('/') == 2 else '0.6')
    sm.append('<url><loc>%s%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>' % (DOMAIN, p, today, pr))
for p in ppaths:
    sm.append('<url><loc>%s%s</loc><lastmod>%s</lastmod><priority>0.5</priority></url>' % (DOMAIN, p, today))
sm.append('</urlset>')
open(OUT + '/sitemap.xml', 'w').write('\n'.join(sm) + '\n')
open(OUT + '/robots.txt', 'w').write('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\nHost: %s\n' % (DOMAIN, DOMAIN))

home = open(OUT + '/index.html', encoding='utf8').read()
nf = re.sub(r'<title>.*?</title>', '<title>Страница не найдена | Avtokraski_Pro</title><meta name="robots" content="noindex">', home)
nf = re.sub(r'<header class="hero".*?</header>', '<header class="hero"><h1>Страница не найдена</h1><p>Такой страницы нет. Перейдите на <a href="/">главную</a> или воспользуйтесь поиском по каталогу.</p></header>', nf, flags=re.S)
nf = re.sub(r'<script type="application/ld\+json">.*?</script>', '', nf)
open(OUT + '/404.html', 'w', encoding='utf8').write(nf)

open(OUT + '/.htaccess', 'w').write('''# Avtokraski_Pro
ErrorDocument 404 /404.html
DirectoryIndex index.html

# Перенаправление на https: включить (убрать # в 4 строках ниже) после установки SSL-сертификата
#RewriteEngine On
#RewriteCond %{HTTPS} off [OR]
#RewriteCond %{HTTP_HOST} ^www\\. [NC]
#RewriteRule ^ https://avtokraskipro.kz%{REQUEST_URI} [L,R=301]

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript text/javascript application/json image/svg+xml text/xml application/xml text/plain
</IfModule>

<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/webp "access plus 30 days"
ExpiresByType text/css "access plus 7 days"
ExpiresByType application/javascript "access plus 7 days"
ExpiresByType text/html "access plus 0 seconds"
</IfModule>
''')
print('done')
shutil.copy(B + '/google099ad330cd3fe9d6.html', OUT + '/google099ad330cd3fe9d6.html')
shutil.copy(B + '/yandex_6d6343c53e2e252c.html', OUT + '/yandex_6d6343c53e2e252c.html')
open(OUT + '/assets/app.js', 'w', encoding='utf8').write(APP_JS)
os.makedirs(OUT + '/docs', exist_ok=True)
shutil.copy(B + '/D8125-tehkarta.pdf', OUT + '/docs/D8125-tehkarta.pdf')
shutil.copy(B + '/emakout-7320v-tehkarta.pdf', OUT + '/docs/emakout-7320v-tehkarta.pdf')
shutil.copy(B + '/emakout-5335sp-tehkarta.pdf', OUT + '/docs/emakout-5335sp-tehkarta.pdf')
for _f in glob.glob(B + '/docs/*.webp') + glob.glob(B + '/docs/*.pdf'):  # страницы техкарт для просмотра на сайте
    shutil.copy(_f, OUT + '/docs/' + os.path.basename(_f))
# IndexNow (Яндекс, Bing): файл-ключ подтверждает, что сайт наш
INDEXNOW_KEY = 'd09dccbe98f6a96ecf6cf6003526fb14'
open(OUT + '/%s.txt' % INDEXNOW_KEY, 'w').write(INDEXNOW_KEY)
open(OUT + '/version.txt', 'w').write('Avtokraski_Pro build ' + datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5))).strftime('%Y-%m-%d %H:%M') + '\n')
