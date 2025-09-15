# Pages Publisher (CI/CD)
Контракт: вся статика сайта живёт в `site/` и публикуется через `upload-pages-artifact@v3` → `deploy-pages@v4`.
При сбое — короткий RCA (не найден артефакт, неверный путь, кеш).
