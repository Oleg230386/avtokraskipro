#!/usr/bin/env python3
"""Переводные техкарты (ТДС) в PDF в фирменном стиле Avtokraski_Pro.

Источник: build/tds_ru/<ИМЯ>.html — заголовок в комментарии <!-- ... --> и тело (h2, p, ul, table).
Поля заголовка:
  brand: U-POL            (необязательно, по умолчанию U-POL)
  title: Название · что это
  sub:   Код, фасовка (красная строка)
  orig:  U-POL, TDS «…», ред. … от …   (для строки «Оригинал: …»)
  keys:  КОД1, КОД2       (начала кодов товаров для DOCS)
  row:   Параметр | значение   (строки таблицы «Техническая информация» на сайте, можно много)
Результат: build/docs/<ИМЯ>-tehkarta.pdf и страницы <ИМЯ>-tehkarta-N.webp (ширина 1100),
и build/tds_ru/docs.json — записи для DOCS.

Запуск: python3 build/tds_pdf.py [ИМЯ ...]   (без имён — все изменённые)
"""
import glob, hashlib, html, json, os, re, subprocess, sys, tempfile

B = os.path.dirname(os.path.abspath(__file__))
SRC = B + '/tds_ru'
OUT = B + '/docs'
STATE = SRC + '/state.json'

CSS = """
@page { size: A4; margin: 16mm 15mm 16mm 15mm; }
* { box-sizing: border-box; }
body { font-family: 'DejaVu Sans', sans-serif; color: #1d1d1f; font-size: 10.6pt; line-height: 1.5; margin: 0; }
.hd { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #c8102e; padding-bottom: 8px; margin-bottom: 12px; }
.hd .k { color: #666; font-size: 10pt; }
.hd h1 { font-size: 19pt; line-height: 1.25; margin: 2px 0 4px; font-weight: 700; }
.hd .sub { color: #c8102e; font-weight: 700; font-size: 12pt; }
.hd .co { color: #666; font-size: 10pt; text-align: left; white-space: nowrap; padding-left: 16px; line-height: 1.6; }
.note { background: #f3f3f3; color: #555; font-size: 8.6pt; padding: 7px 10px; border-radius: 3px; margin-bottom: 12px; line-height: 1.45; }
h2 { background: #232323; color: #fff; font-size: 11.5pt; padding: 5px 10px; border-radius: 3px; margin: 14px 0 7px; page-break-after: avoid; break-after: avoid; }
h3 { font-size: 10.8pt; margin: 10px 0 4px; page-break-after: avoid; break-after: avoid; }
p { margin: 0 0 6px; }
ul { margin: 0 0 7px; padding-left: 20px; }
li { margin: 1px 0; }
table { width: calc(100% - 2px); margin: 6px 1px 8px 0; border-collapse: collapse; font-size: 9.8pt; }
tr { page-break-inside: avoid; break-inside: avoid; }
th { page-break-after: avoid; }
td, th { border: 1px solid #cfcfcf; padding: 4px 8px; vertical-align: top; text-align: left; }
th { background: #eeeeee; font-weight: 700; }
table.kv td:first-child { width: 42%; color: #444; }
.small { font-size: 8.8pt; color: #555; }
.ft { margin-top: 14px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 8.4pt; color: #777; }
"""

def parse(path):
    s = open(path, encoding='utf8').read()
    m = re.match(r'\s*<!--(.*?)-->', s, re.S)
    meta = {'rows': [], 'keys': []}
    for line in m.group(1).strip().splitlines():
        if ':' not in line:
            continue
        k, v = line.split(':', 1); k = k.strip(); v = v.strip()
        if k == 'row':
            a, b = v.split('|', 1); meta['rows'].append([a.strip(), b.strip()])
        elif k == 'keys':
            meta['keys'] = [x.strip() for x in v.split(',') if x.strip()]
        else:
            meta[k] = v
    AEROSOL = '<h3>Уход за баллоном и хранение</h3>\n<p>После работы переверните баллон вверх дном и коротко распылите, чтобы очистить распылитель. Если распылитель засорился, снимите его и замочите в мягком растворителе, затем установите обратно. Перед использованием выдержите баллон 2 часа при комнатной температуре. Для длительного хранения держите в сухом проветриваемом месте, вдали от прямых солнечных лучей и мороза. Температура хранения 5–25 °C, рекомендуемая температура нанесения 20 °C. Перед работой изучите паспорт безопасности и соблюдайте предупреждения на упаковке.</p>'
    PUTTY = '<h2>Примечания</h2>\n<ul>\n<li>Не добавляйте больше отвердителя, чем рекомендовано, — иначе возможно проступание пятен.</li>\n<li>Температура реакции — не ниже +5 °C.</li>\n<li>Температура хранения 5–25 °C, в хорошо проветриваемом месте.</li>\n<li>Не возвращайте смешанный материал в банку.</li>\n<li>Для идеальной поверхности под цвет рекомендуется грунт на растворителе.</li>\n<li>Отходы сдавайте в специализированные организации или пункты сбора, не сливайте в канализацию.</li>\n</ul>'
    PREP5 = '<h2>Подготовка и нанесение</h2>\n<p>При работе настоятельно рекомендуется использовать средства индивидуальной защиты, чтобы избежать раздражения дыхательных путей, кожи и глаз. Во всех случаях после шлифовки поверхность снова очищают.</p>\n<table class="kv">\n<tr><td>Голая сталь</td><td>обезжиривателем на растворителе, шлифовка P80</td></tr>\n<tr><td>Оцинкованная сталь</td><td>обезжиривателем на растворителе, шлифовка P180</td></tr>\n<tr><td>Алюминий / старое или заводское ЛКП</td><td>обезжиривателем на растворителе, шлифовка P180</td></tr>\n<tr><td>Стеклопластик / SMC</td><td>обезжиривателем на растворителе, шлифовка P180</td></tr>\n<tr><td>Старая шпатлёвка</td><td>обезжиривателем на растворителе, шлифовка P80–P180</td></tr>\n</table>'
    SAFETY = '<h2>Безопасность</h2>\n<p class="small">Только для профессионального применения. Перед работой прочитайте инструкцию полностью. Продукт содержит опасные вещества — всегда используйте средства индивидуальной защиты. Подробности — на этикетке и в паспорте безопасности (SDS). Данные приведены для информации и могут меняться без предупреждения; покупатель сам проверяет пригодность продукта для своей задачи.</p>'
    meta['body'] = s[m.end():].strip().replace('<!--SAFETY-->', SAFETY).replace('<!--AEROSOL-->', AEROSOL).replace('<!--PUTTY-->', PUTTY).replace('<!--PREP5-->', PREP5)
    return meta

def page_html(meta):
    e = html.escape
    brand = meta.get('brand', 'U-POL')
    return f"""<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="hd"><div><div class="k">{e(brand)} · Техническое описание</div><h1>{e(meta['title'])}</h1><div class="sub">{e(meta.get('sub',''))}</div></div>
<div class="co">Avtokraski_Pro<br>avtokraskipro.kz</div></div>
<div class="note">Перевод технической карты производителя на русский язык. Оригинал: {e(meta['orig'])}, английский язык. Перевод выполнен Avtokraski_Pro для удобства покупателей; при расхождениях действует оригинал производителя.</div>
{re.sub(r' (°C|%|мкм|мин|бар|мм|г/л|мл|сек|ч\b)', '\u00a0\\1', meta['body'])}
<div class="ft">Avtokraski_Pro · Астана, ул. Талапкерская 24А · avtokraskipro.kz · WhatsApp +7 777 118 73 55</div>
</body></html>"""

def render(name, meta, browser):
    from PIL import Image
    pdf = f'{OUT}/{name}-tehkarta.pdf'
    pg = browser.new_page()
    pg.set_content(page_html(meta), wait_until='load')
    pg.pdf(path=pdf, format='A4', print_background=True, prefer_css_page_size=True)
    pg.close()
    for old in glob.glob(f'{OUT}/{name}-tehkarta-*.webp'):
        os.remove(old)
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['pdftoppm', '-r', '150', '-png', pdf, td + '/p'], check=True)
        files = sorted(glob.glob(td + '/p-*.png'), key=lambda f: int(re.search(r'-(\d+)\.png$', f).group(1)))
        for i, f in enumerate(files, 1):
            im = Image.open(f).convert('RGB')
            w = 1100; im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            im.save(f'{OUT}/{name}-tehkarta-{i}.webp', 'WEBP', quality=80, method=6)
    return len(files)

def main():
    from playwright.sync_api import sync_playwright
    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    names = sys.argv[1:] or [os.path.basename(f)[:-5] for f in sorted(glob.glob(SRC + '/*.html'))]
    docs_path = SRC + '/docs.json'
    docs = json.load(open(docs_path, encoding='utf8')) if os.path.exists(docs_path) else {}
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path='/usr/bin/google-chrome') if os.path.exists('/usr/bin/google-chrome') else p.chromium.launch()
        for n in names:
            path = f'{SRC}/{n}.html'
            h = hashlib.md5(open(path, 'rb').read() + CSS.encode()).hexdigest()
            meta = parse(path)
            if state.get(n, {}).get('h') == h and len(sys.argv) == 1 and os.path.exists(f'{OUT}/{n}-tehkarta.pdf'):
                pages = state[n]['pg']
            else:
                pages = render(n, meta, br); print(n, pages, 'стр.')
            state[n] = {'h': h, 'pg': pages}
            src = f"Перевод Avtokraski_Pro с английского. Оригинал: {meta['orig']}"
            for k in meta['keys']:
                docs[k] = {'pdf': f'{n}-tehkarta.pdf', 'pg': pages, 'src': src, 'rows': meta['rows']}
        br.close()
    json.dump(state, open(STATE, 'w'), ensure_ascii=False, indent=1)
    json.dump(docs, open(docs_path, 'w', encoding='utf8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main()
