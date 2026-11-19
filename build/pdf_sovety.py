"""PDF-версии статей «Полезные советы» (кнопка «Скачать статью в PDF»).

Запускается в publish.sh ПОСЛЕ gen.py: открывает собранные страницы static/sovety/<статья>/
в Chrome (playwright), оставляет логотип, заголовок и текст статьи и печатает в PDF.
Результат: build/sovety_pdf/<статья>.pdf (хранится в git) и static/docs/sovety/<статья>.pdf.
PDF пересобирается только если статья изменилась (хэш шаблона в build/sovety_pdf/state.json).
Принудительно пересобрать всё: python3 build/pdf_sovety.py --all
"""
import hashlib, http.server, json, os, re, shutil, socketserver, sys, threading, functools

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'build'); OUT = os.path.join(ROOT, 'static')
PD = os.path.join(B, 'sovety_pdf'); os.makedirs(PD, exist_ok=True)
SD = os.path.join(OUT, 'docs', 'sovety'); os.makedirs(SD, exist_ok=True)
ST = os.path.join(PD, 'state.json')
T = open(os.path.join(B, 'templates.html'), encoding='utf8').read()
arts = {m.group(1): hashlib.sha1(m.group(0).encode('utf8')).hexdigest()
        for m in re.finditer(r'<template data-p="sovety\.([a-z0-9\-]+)".*?</template>', T, re.S)}
state = json.load(open(ST)) if os.path.exists(ST) else {}
force = '--all' in sys.argv
todo = [a for a, h in arts.items() if force or state.get(a) != h or not os.path.exists(os.path.join(PD, a + '.pdf'))]

def copy_all():
    for a in arts:
        p = os.path.join(PD, a + '.pdf')
        if os.path.exists(p):
            shutil.copy(p, os.path.join(SD, a + '.pdf'))

if not todo:
    copy_all(); print('pdf: без изменений'); sys.exit(0)

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    copy_all(); print('pdf: нет playwright — PDF не обновлены'); sys.exit(0)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=OUT))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

PREP = r"""() => {
  const S = 'https://avtokraskipro.kz';
  const logo = document.querySelector('.limg'), h1 = document.querySelector('h1.pt'), art = document.querySelector('.tipart');
  const a = art.cloneNode(true);
  a.querySelectorAll('.pdfb,.tipb,.art-cta').forEach(e => e.remove());
  a.querySelectorAll('.cta a.btn').forEach(e => { const s = document.createElement('b'); s.textContent = 'WhatsApp: +7 777 118-73-55'; e.replaceWith(s); });
  a.querySelectorAll('a[href^="/"]').forEach(e => e.setAttribute('href', S + e.getAttribute('href')));
  a.querySelectorAll('img').forEach(e => e.removeAttribute('loading'));
  a.querySelectorAll('details').forEach(e => e.open = true);
  const w = document.createElement('div'); w.className = 'pdfw';
  w.innerHTML = '<div class="pdfh"></div>';
  if (logo) { const l = logo.cloneNode(true); l.removeAttribute('loading'); w.firstChild.appendChild(l); }
  const t = document.createElement('div'); t.className = 'pdft';
  t.innerHTML = 'avtokraskipro.kz<br>Астана, ул. Талапкерская 24А · без выходных<br>WhatsApp: +7 777 118-73-55';
  w.firstChild.appendChild(t);
  const hh = document.createElement('h1'); hh.textContent = h1.textContent; w.appendChild(hh);
  w.appendChild(a);
  document.body.innerHTML = ''; document.body.appendChild(w);
  const st = document.createElement('style');
  st.textContent = 'html,body{background:#fff!important;margin:0}#app,.wrap{all:unset}' +
    '.pdfw{font-family:Barlow,system-ui,sans-serif;color:#1b2228}' +
    '.pdfh{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #c8161d;padding-bottom:8px;margin-bottom:10px}' +
    '.pdfh img{height:46px;width:auto}.pdft{font-size:11px;line-height:1.4;text-align:right;color:#46525f}' +
    '.pdfw h1{font:700 26px/1.15 "Barlow Condensed",sans-serif;margin:6px 0 10px}' +
    '.pdfw .tipart{border:0;padding:0;margin:0;font-size:13.5px}' +
    '.pdfw figure,.pdfw .tbl,.pdfw tr,.pdfw .prod,.pdfw .note,.pdfw .warn,.pdfw .cta{break-inside:avoid}' +
    '.pdfw h2,.pdfw h3{break-after:avoid}.pdfw .prods{grid-template-columns:repeat(4,1fr)}' +
    '.pdfw figure svg{max-width:440px!important;max-height:240mm;width:auto!important}.pdfw img{max-width:100%}';
  document.head.appendChild(st);
  return [...document.images].length;
}"""
WAIT = "() => [...document.images].every(i => i.complete && i.naturalWidth > 0)"
FOOT = ('<div style="font-size:8px;width:100%;padding:0 12mm;color:#7b8693;display:flex;justify-content:space-between">'
        '<span>Avtokraski_Pro · avtokraskipro.kz · Полезные советы</span>'
        '<span>стр. <span class="pageNumber"></span> из <span class="totalPages"></span></span></div>')

exe = next((p for p in ('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser') if os.path.exists(p)), None)
with sync_playwright() as p:
    b = p.chromium.launch(**({'executable_path': exe} if exe else {}))
    pg = b.new_page(viewport={'width': 800, 'height': 1200})
    for a in todo:
        pg.goto('http://127.0.0.1:%d/sovety/%s/' % (port, a), wait_until='networkidle')
        pg.evaluate(PREP)
        try:
            pg.wait_for_function(WAIT, timeout=20000)
        except Exception:
            print('pdf: не все фото загрузились в', a)
        pg.wait_for_timeout(500)
        out = os.path.join(PD, a + '.pdf')
        pg.pdf(path=out, format='A4', print_background=True, display_header_footer=True,
               header_template='<span></span>', footer_template=FOOT,
               margin={'top': '12mm', 'bottom': '14mm', 'left': '12mm', 'right': '12mm'})
        state[a] = arts[a]
        print('pdf:', a, os.path.getsize(out) // 1024, 'КБ')
    b.close()
srv.shutdown()
json.dump(state, open(ST, 'w'), indent=1, ensure_ascii=False)
copy_all()
