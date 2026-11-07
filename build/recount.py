"""Пересчёт счётчиков в шаблонах (build/templates.html): «Всего: N», числа на кнопках-чипах
и плитках подразделов. Число = сколько непустых карточек реально стоит на странице, куда ведёт кнопка.
Запускается из publish.sh перед сборкой, поэтому после удаления/добавления карточек счётчики верные."""
import json, os, re, sys

B = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(B, 'templates.html')
CD = json.load(open(os.path.join(B, 'data.json'), encoding='utf8'))['CD']
T = open(F, encoding='utf8').read()

TPL = {m.group(1): m.group(2) for m in re.finditer(r'<template data-p="([^"]*)" data-t="[^"]*">(.*?)</template>', T, re.S)}

def ids_of(body):
    out = []
    for l in re.findall(r'data-c="([0-9,]*)"', body):
        for x in l.split(','):
            if x and int(x) < len(CD) and CD[int(x)]:  # повторы считаются: карточка показывается столько раз
                out.append(x)
    return out

def count(p):
    if p not in TPL:
        return None
    ids = ids_of(TPL[p])
    if ids:
        return len(ids)
    subs = set()
    for q, b in TPL.items():
        if q.startswith(p + '.'):
            subs.update(ids_of(b))  # для раздела из плиток — без повторов
    return len(subs) or None

def pl(n):
    a, b = n % 10, n % 100
    w = 'позиция' if a == 1 and b != 11 else ('позиции' if 2 <= a <= 4 and not 12 <= b <= 14 else 'позиций')
    return '%d %s' % (n, w)

changes = []
def fix_body(p, body):
    def chip(m):
        n = count(m.group(2))
        # на странице бренда кнопки показывают товары этого бренда в разделе: пересчитываются
        # только кнопки, ведущие на подраздел этого же бренда (например brand-u-pol → raspyliteli.u-pol)
        if p.startswith('brand-') and not m.group(2).endswith('.' + p[6:]):
            return m.group(0)
        if n is None or str(n) == m.group(4):
            return m.group(0)
        changes.append('%s: %s %s→%d' % (p, m.group(2), m.group(4), n))
        return m.group(1) + m.group(3) + str(n) + m.group(5)
    body = re.sub(r'(<a class="chip" href="#([a-z0-9.\-]+)"(?: aria-pressed="true")?>)([^<]*<span>)(\d+)(</span>)', chip, body)
    def tile(m):
        n = count(m.group(2))
        if n is None or m.group(4) == pl(n):
            return m.group(0)
        changes.append('%s: плитка %s %s→%s' % (p, m.group(2), m.group(4), pl(n)))
        return m.group(1) + m.group(3) + pl(n) + m.group(5)
    body = re.sub(r'(<a class="tile" href="#([a-z0-9.\-]+)">)(<b>[^<]*</b><span>)(\d+ позици[яий]+)(</span>)', tile, body)
    n = count(p)
    if n is not None and ids_of(body):
        def tot(m):
            if m.group(1) != str(n):
                changes.append('%s: Всего %s→%d' % (p, m.group(1), n))
            return 'Всего: %d' % n
        body = re.sub(r'Всего: (\d+)', tot, body)
    return body

T2 = re.sub(r'(<template data-p="([^"]*)" data-t="[^"]*">)(.*?)(</template>)',
            lambda m: m.group(1) + fix_body(m.group(2), m.group(3)) + m.group(4), T, flags=re.S)
if T2 != T and '--dry' not in sys.argv:
    open(F, 'w', encoding='utf8').write(T2)
print('recount: исправлено счётчиков %d' % len(changes))
for c in changes:
    print('  ' + c)
