#!/bin/bash

# Исправляем site/assets/style.css
npx stylelint "site/assets/style.css" --fix

# Исправляем site/assets/builder.css
npx stylelint "site/assets/builder.css" --fix

# Исправляем site/style.css
npx stylelint "site/style.css" --fix

echo "CSS files fixed"
