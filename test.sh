#!/bin/bash
# California Building Environment - Test Script
# Automated quality checks for HTML, CSS, JS, and links

set -e
ERRORS=0
WARNINGS=0

echo "=== California Building Environment - Quality Tests ==="
echo ""

# 1. HTML Validation
echo "1. HTML Validation..."
for f in $(find . -name '*.html' ! -path './dist/*' ! -path './_includes/*' ! -path './_layouts/*' | sort); do
  opens=$(grep -oP '<(div|section|header|footer|nav|main|article|ul|ol|li|p|form|span|h[1-6])\b' "$f" 2>/dev/null | wc -l)
  closes=$(grep -oP '</(div|section|header|footer|nav|main|article|ul|ol|li|p|form|span|h[1-6])>' "$f" 2>/dev/null | wc -l)
  diff=$((opens - closes))
  if [ "$diff" -gt "1" ] || [ "$diff" -lt "-1" ]; then
    echo "   ERROR: $f - tag mismatch (opens=$opens, closes=$closes)"
    ERRORS=$((ERRORS + 1))
  fi
done
echo "   HTML tags: checked"

# 2. CSS Validation
echo "2. CSS Validation..."
opens=$(awk '{n+=gsub(/{/,"&")}END{print n}' assets/css/style.css)
closes=$(awk '{n+=gsub(/}/,"&")}END{print n}' assets/css/style.css)
if [ "$opens" -ne "$closes" ]; then
  echo "   ERROR: style.css brace mismatch ($opens/$closes)"
  ERRORS=$((ERRORS + 1))
fi
for f in assets/css/modules/*.css; do
  o=$(awk '{n+=gsub(/{/,"&")}END{print n}' "$f")
  c=$(awk '{n+=gsub(/}/,"&")}END{print n}' "$f")
  if [ "$o" -ne "$c" ]; then
    echo "   ERROR: $f brace mismatch ($o/$c)"
    ERRORS=$((ERRORS + 1))
  fi
done
echo "   CSS braces: OK"

# 3. JS Syntax
echo "3. JS Syntax..."
if node --check assets/js/main.js 2>/dev/null; then
  echo "   JS syntax: OK"
else
  echo "   ERROR: JS syntax error"
  ERRORS=$((ERRORS + 1))
fi

# 4. Link Check (handles relative paths in subdirectories)
echo "4. Link Check..."
for f in $(find . -name '*.html' ! -path './dist/*' ! -path './_includes/*' ! -path './_layouts/*' | sort); do
  dir=$(dirname "$f")
  grep -oP 'href="(?!http|mailto|tel|#|javascript)[^"]*\.html' "$f" 2>/dev/null | sed 's/href="//' | sort -u | while read link; do
    resolved=$(echo "$link" | sed 's/&amp;/\&/g')
    # Try resolving from file's directory first, then from root
    found=0
    [ -f "$dir/$resolved" ] && found=1
    [ -f "$resolved" ] && found=1
    [ -f ".$resolved" ] && found=1
    if [ "$found" = "0" ]; then
      echo "   WARNING: $f - potentially broken link: $link"
    fi
  done
done
echo "   Links: checked"

# 5. Missing Images
echo "5. Image Check..."
MISSING=0
grep -rhoP 'src="(?!http)[^"]*\.(jpg|jpeg|png|gif|svg|webp|ico)"' --include='*.html' . 2>/dev/null | sed 's/src="//;s/"//' | sort -u | while read img; do
  found=0
  for d in . assets images services areas industries about; do
    [ -f "$d/$img" ] && found=1 && break
  done
  if [ "$found" = "0" ]; then
    echo "   WARNING: missing image: $img"
  fi
done
echo "   Images: checked"

# 6. Accessibility
echo "6. Accessibility..."
for f in $(find . -name '*.html' ! -path './dist/*' ! -path './_includes/*' ! -path './_layouts/*' | sort); do
  noalt=$(grep '<img' "$f" 2>/dev/null | grep -cv 'alt=')
  if [ "$noalt" -gt "0" ]; then
    echo "   WARNING: $f - $noalt images without alt text"
  fi
done
echo "   Alt text: checked"

# 7. SEO
echo "7. SEO Checks..."
for f in $(find . -name '*.html' ! -path './dist/*' ! -path './_includes/*' ! -path './_layouts/*' | sort); do
  title=$(head -5 "$f" | grep -c 'title:')
  desc=$(head -10 "$f" | grep -c 'description:')
  if [ "$title" = "0" ]; then echo "   WARNING: $f - no title"; fi
  if [ "$desc" = "0" ]; then echo "   WARNING: $f - no description"; fi
done
echo "   SEO: checked"

# 8. Security
echo "8. Security Checks..."
grep -rl 'http://' --include='*.html' . 2>/dev/null | grep -v 'schema.org' | head -5 | while read f; do
  echo "   WARNING: $f - contains http:// link"
done
echo "   Security: checked"

# Summary
echo ""
echo "=== Test Results ==="
echo "Errors: $ERRORS"
if [ "$ERRORS" -gt "0" ]; then
  echo "STATUS: FAILED"
  exit 1
else
  echo "STATUS: PASSED"
  exit 0
fi
