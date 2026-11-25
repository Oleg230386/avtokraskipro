#!/usr/bin/env python3
"""Добавляет/обновляет записи из build/tds_ru/docs.json в DOCS во всех 4 файлах (app.js, code.js, draft_app.js, pv.js)."""
import json, os, re
B = os.path.dirname(os.path.abspath(__file__))
docs = json.load(open(B + '/tds_ru/docs.json', encoding='utf8'))
def ser(k, o, pref):
    return json.dumps(k, ensure_ascii=False) + ':{pdf:' + json.dumps(pref + o['pdf']) + ',pg:' + str(o['pg']) + ',src:' + json.dumps(o['src'], ensure_ascii=False) + ',rows:' + json.dumps(o['rows'], ensure_ascii=False) + '}'
for fn, pref in [('app.js', '/docs/'), ('code.js', 'docs/'), ('draft_app.js', 'docs/'), ('pv.js', 'docs/')]:
    p = f'{B}/{fn}'; s = open(p, encoding='utf8').read()
    m = re.search(r'^var DOCS=(\{.*\});$', s, re.M)
    body = m.group(1)
    for k, o in docs.items():
        ent = ser(k, o, pref)
        # убрать прежнюю запись этого ключа (наша, из tds_ru), если есть
        body = re.sub(r',' + re.escape(json.dumps(k, ensure_ascii=False)) + r':\{pdf:"[^"]*",pg:\d+,src:"(?:Перевод )?Avtokraski_Pro[^"]*",rows:\[.*?\]\]\}(?=[,}])', '', body)
        if json.dumps(k, ensure_ascii=False) + ':{' in body:
            print(fn, 'уже есть, пропуск:', k); continue
        body = body[:-1] + ',' + ent + '}'
    s = s[:m.start(1)] + body + s[m.end(1):]
    open(p, 'w', encoding='utf8').write(s)
    print(fn, 'ok')
