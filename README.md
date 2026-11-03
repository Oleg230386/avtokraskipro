# Avtokraski_Pro — avtokraskipro.kz

- `build/gen.py` — сборка статического сайта в `static/` (данные: `build/data.json`, `build/templates.html`, фото: `site/img/*.json`).
- `./publish.sh "что изменилось"` — пересобрать и выложить в ветку `deploy`.
- Ветка `deploy` = содержимое `httpdocs`. Plesk «Git» забирает её автоматически по веб-хуку.
- Файлы подтверждения `google099ad330cd3fe9d6.html` и `yandex_6d6343c53e2e252c.html` копируются при каждой сборке — не удалять.
