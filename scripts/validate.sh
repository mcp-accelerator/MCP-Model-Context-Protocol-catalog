#!/bin/bash
set -e

echo "=== Начало валидации ==="

# Проверка JSON файлов
echo "Проверка JSON..."
find . -type f -name "*.json" -exec sh -c '
    for file do
        if ! jq "." "$file" > /dev/null 2>&1; then
            echo "Ошибка в $file"
            exit 1
        fi
    done' sh {} +

# Проверка JavaScript
echo "Проверка JavaScript..."
find . -type f -name "*.js" -exec node --check {} \;

# Проверка HTML
echo "Проверка HTML..."
find . -type f -name "*.html" -exec tidy -qe {} \;

# Проверка CSS
echo "Проверка CSS..."
find . -type f -name "*.css" -exec stylelint {} \;

echo "=== Валидация завершена ==="
