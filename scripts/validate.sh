#!/bin/bash
set -e

echo "=== Начало валидации ==="

# Проверка JSON
echo "Проверка JSON..."
find . -type f -name "*.json" -exec jq '.' {} \; > /dev/null

# Проверка JavaScript
echo "Проверка JavaScript..."
find . -type f -name "*.js" -exec node --check {} \;

# Проверка HTML
echo "Проверка HTML..."
find . -type f -name "*.html" -exec tidy -qe {} \;

# Проверка CSS
echo "Проверка CSS..."
npx stylelint "site/**/*.css" --config .stylelintrc.json

echo "=== Валидация завершена ==="
