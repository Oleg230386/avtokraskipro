"""Отправить все адреса из sitemap.xml в Яндекс и Bing (IndexNow). Запуск после publish.sh: python3 build/indexnow.py"""
import json, re, os, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = re.search(r"INDEXNOW_KEY = '(\w+)'", open(ROOT + '/build/gen.py', encoding='utf8').read()).group(1)
urls = re.findall(r'<loc>(.*?)</loc>', open(ROOT + '/static/sitemap.xml', encoding='utf8').read())
body = json.dumps({"host": "avtokraskipro.kz", "key": KEY, "keyLocation": "https://avtokraskipro.kz/%s.txt" % KEY, "urlList": urls}).encode()
for ep in ("https://yandex.com/indexnow", "https://api.indexnow.org/indexnow"):
    try:
        r = urllib.request.urlopen(urllib.request.Request(ep, body, {"Content-Type": "application/json; charset=utf-8"}), timeout=60)
        print(ep, r.status, len(urls))
    except urllib.error.HTTPError as e:
        print(ep, e.code, e.read()[:300])
