#!/bin/bash
# California Building Environment - Build Script
# Minifies CSS/JS for production deployment

set -e

echo "=== California Building Environment - Build ==="
echo ""

# Create dist directory
mkdir -p dist/assets/css dist/assets/js

echo "1. Copying CSS modules..."
mkdir -p dist/assets/css/modules
cp assets/css/modules/*.css dist/assets/css/modules/
echo "   Modules copied."

echo "2. Copying JS..."
cp assets/js/main.js dist/assets/js/main.js
echo "   main.js copied."

echo "3. Copying assets..."
cp -r assets/images dist/assets/ 2>/dev/null
echo "   Images copied."

echo "4. Copying HTML files..."
# Copy all HTML files preserving structure
find . -name '*.html' ! -path './dist/*' ! -path './_includes/*' ! -path './_layouts/*' -exec cp --parents {} dist/ \;
echo "   HTML files copied."

echo "5. Copying config files..."
cp robots.txt sitemap.xml llms.txt humans.txt manifest.webmanifest browserconfig.xml dist/ 2>/dev/null
echo "   Config files copied."

echo ""
echo "=== Build Complete ==="
echo "Output: dist/"
echo "Total size: $(du -sh dist/ | cut -f1)"
echo ""
echo "To deploy: push dist/ to GitHub Pages or upload to hosting."
