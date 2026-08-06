#!/bin/bash
# Quick HTML validator using grep patterns

echo "=== HTML Quick Validation ==="
echo ""

ERRORS=0

for f in $(find . -name '*.html' ! -path './dist/*' ! -path './_includes/*' ! -path './_layouts/*' | sort); do
  # Check DOCTYPE
  if ! head -1 "$f" | grep -q 'DOCTYPE'; then
    echo "MISSING DOCTYPE: $f"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check html lang
  if ! grep -q 'lang=' "$f"; then
    echo "MISSING LANG: $f"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check viewport
  if ! grep -q 'viewport' "$f"; then
    echo "MISSING VIEWPORT: $f"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check title
  if ! grep -q 'title:' "$f"; then
    echo "MISSING TITLE: $f"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "Errors found: $ERRORS"
[ "$ERRORS" -eq "0" ] && echo "All pages valid." || echo "Fix errors above."
