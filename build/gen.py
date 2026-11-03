import json, re, os, io, base64, html, shutil, glob, urllib.parse, datetime

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
def save_img(k, uri):
    head, b64 = uri.split(',', 1)
    assert 'webp' in head, (k, head)
    open(f'{OUT}/img/{k}.webp', 'wb').write(base64.b64decode(b64))

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
        h += '<div class="hs-it" data-i="%d" role="button" tabindex="0" aria-label="%s"><img %s alt="%s" width="300" height="300"></div>' % (i, alt, src, alt)
        cards[i] = card_html(CD[i])
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

APP_JS_VER = '1'

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
    body = re.sub(r'(<main class="grid" data-c="([0-9,]*)">)</main>', lambda m: m.group(1).replace(' data-c="%s"' % m.group(2), '') + ''.join(card_html(CD[int(i)]) for i in m.group(2).split(',') if i) + '</main>', body)
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
    doc = ('<!DOCTYPE html>\n<html lang="ru"><head><meta charset="utf-8">'
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
    open(p + 'index.html', 'w', encoding='utf8').write(doc)
    return path_of(pid)

paths = []
for m in re.finditer(r'<template data-p="([^"]*)" data-t="([^"]*)">(.*?)</template>', T, re.S):
    paths.append(page(m.group(1), m.group(2), m.group(3)))
print('pages', len(paths))

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
shutil.copy(B + '/app.js', OUT + '/assets/app.js')
os.makedirs(OUT + '/docs', exist_ok=True)
shutil.copy(B + '/D8125-tehkarta.pdf', OUT + '/docs/D8125-tehkarta.pdf')
