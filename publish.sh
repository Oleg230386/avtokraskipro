#!/bin/sh
# Пересобирает сайт и публикует его в ветку deploy (её забирает Plesk в httpdocs).
set -e
cd "$(dirname "$0")"
python3 build/gen.py
rm -rf .deploy && git worktree prune
git fetch -q origin deploy 2>/dev/null && git worktree add -q .deploy origin/deploy -B deploy || git worktree add -q --orphan -b deploy .deploy
find .deploy -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a static/. .deploy/
cd .deploy
git add -A
git diff --cached --quiet && echo "Нет изменений" || { git commit -q -m "Сайт: ${1:-обновление} ($(date +%F))" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"; git push -q origin deploy; echo "Опубликовано"; }
cd .. && git worktree remove .deploy
