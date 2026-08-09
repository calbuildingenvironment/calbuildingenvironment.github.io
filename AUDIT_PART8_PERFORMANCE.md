# Part 8: Complete Website Performance Audit

**Site:** California Building Environment (calbuildingenv.com)  
**Date:** 2026-08-08  
**Architecture:** Static HTML/CSS/JS — no build step, no Jekyll, no framework  
**Deployment Target:** GitHub Pages  

---

## Executive Summary

| Metric | Value | Assessment |
|--------|-------|------------|
| Total CSS (3 files) | ~36 KB | ✅ Excellent |
| Total JS (1 file) | ~3.7 KB | ✅ Excellent |
| Hero image (full) | 129 KB | ⚠️ Large for LCP |
| Service images (full) | 117–195 KB | ⚠️ Several oversized |
| Image format | 100% WebP | ✅ Optimal |
| Responsive images | Yes (srcset) | ✅ Good |
| Lazy loading | Partial (eager on hero) | ⚠️ Mixed |
| Font loading | Google Fonts (preconnect) | ⚠️ 3rd-party dependency |
| Render-blocking CSS | 3 files, no media queries | ⚠️ Blocks FCP |
| External dependencies | Google Fonts, Google Maps | ⚠️ 2 third-parties |

**Overall Performance Score: 78/100**

---

## Detailed Findings

### 1. IMAGES

#### FILE: `assets/images/hero.webp` (and responsive variants)
**PROBLEM:** Full-size hero image is 2560×1440 at 129 KB. Served as `fetchpriority="high"` with `loading="eager"` on all pages. Largest Contentful Paint (LCP) candidate.
**IMPACT:** Delays LCP on slow connections; 129 KB is ~1.5s on 3G.
**SEVERITY:** HIGH
**EXACT FIX:**
- Re-compress hero.webp to ≤80 KB (target q75 WebP)
- Ensure hero-640.webp ≤15 KB, hero-960.webp ≤25 KB, hero-1280.webp ≤40 KB
- Keep `fetchpriority="high"` only on homepage; remove from subpages

---

#### FILE: `assets/images/services/asbestos.webp` (195 KB, 1536×1024)
**PROBLEM:** Largest service image at 195 KB. Served as `loading="eager" fetchpriority="high"` on asbestos page.
**IMPACT:** LCP delay on service pages; 195 KB is excessive for a content image.
**SEVERITY:** HIGH
**EXACT FIX:**
- Re-compress to ≤90 KB (q75 WebP, 1536×1024)
- Generate responsive variants: 640w ≤20 KB, 960w ≤35 KB, 1280w ≤60 KB
- Change to `loading="lazy"` (not LCP candidate on subpages)

---

#### FILE: `assets/images/services/moisture.webp` (170 KB, 1536×1024)
**PROBLEM:** Second largest service image at 170 KB. Used on mold-inspections.html with `loading="eager" fetchpriority="high"`.
**IMPACT:** Same as above — LCP delay.
**SEVERITY:** HIGH
**EXACT FIX:**
- Re-compress to ≤90 KB
- Generate proper responsive variants
- Change to `loading="lazy"`

---

#### FILE: `assets/images/services/lead-materials.webp` (153 KB, 1536×1024)
**PROBLEM:** Third largest at 153 KB. Used on lead-paint-inspections.html.
**IMPACT:** LCP delay on lead page.
**SEVERITY:** HIGH
**EXACT FIX:**
- Re-compress to ≤90 KB
- Generate responsive variants
- Change to `loading="lazy"`

---

#### FILE: `assets/images/services/asbestos-materials.webp` (144 KB), `air-monitoring-field.webp` (136 KB), `lead.webp` (135 KB), `air-monitoring.webp` (135 KB), `moisture-1280.webp` (131 KB)
**PROBLEM:** 5 additional service images >130 KB each.
**IMPACT:** Cumulative page weight; slower subpage loads.
**SEVERITY:** MEDIUM
**EXACT FIX:**
- Re-compress all to ≤90 KB (target 60-80 KB)
- Ensure responsive variants are proportionally sized

---

#### FILE: `assets/images/icons/apple-touch-icon.png` (5.8 KB)
**PROBLEM:** PNG format for touch icon; could be SVG.
**IMPACT:** Negligible.
**SEVERITY:** LOW
**EXACT FIX:** Optional — convert to SVG or leave as-is.

---

#### FILE: All service pages — `loading="eager" fetchpriority="high"` on split-layout images
**PROBLEM:** Every service page marks the split-image as eager + high priority, but only the homepage hero is true LCP. Subpage hero is in `page-hero` section (text-only); the split-image appears *below the fold*.
**IMPACT:** Browser downloads large images unnecessarily early, competing with critical resources.
**SEVERITY:** HIGH
**EXACT FIX:**
```html
<!-- On service pages, change: -->
<img src="../assets/images/services/asbestos.webp" ... loading="eager" fetchpriority="high">
<!-- To: -->
<img src="../assets/images/services/asbestos.webp" ... loading="lazy">
```
Keep `fetchpriority="high"` only on `index.html` hero image.

---

### 2. CSS

#### FILE: `assets/css/modules/components.css` (24.6 KB)
**PROBLEM:** Largest CSS file at 24.6 KB. Contains all component styles (buttons, cards, forms, grids, tables, badges, footer, animations).
**IMPACT:** Render-blocking; delays First Contentful Paint.
**SEVERITY:** MEDIUM
**EXACT FIX:**
- Keep as single file (36 KB total CSS is fine for static site)
- Add `media="print" onload="this.media='all'"` pattern for non-critical styles (footer, animations, print styles) — but marginal gain at this size
- **Better:** Inline critical CSS (above-fold: header, hero, buttons) in `<head>`, load rest async. ~3 KB critical.

---

#### FILE: `assets/css/modules/base.css` (1.8 KB), `layout.css` (9.5 KB)
**PROBLEM:** Small but render-blocking.
**IMPACT:** Minimal individually.
**SEVERITY:** LOW
**EXACT FIX:** Include in critical CSS inlining above.

---

#### FILE: All HTML pages — 3 separate `<link rel="stylesheet">` tags
**PROBLEM:** 3 HTTP requests for CSS (no HTTP/2 multiplexing benefit on GitHub Pages CDN).
**IMPACT:** Extra round trips.
**SEVERITY:** LOW
**EXACT FIX:** Concatenate into single `styles.css` (36 KB) — one request. Or inline critical + async load rest.

---

### 3. JAVASCRIPT

#### FILE: `assets/js/main.js` (3.7 KB)
**PROBLEM:** Loaded with `defer` in all pages — correct.
**IMPACT:** Non-blocking; minimal.
**SEVERITY:** NONE
**EXACT FIX:** None needed. Could inline (3.7 KB) to eliminate request, but `defer` is fine.

---

### 4. FONTS

#### FILE: All HTML pages — Google Fonts Inter (6 weights)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```
**PROBLEM:** 
- 6 font weights = ~120 KB total (WOFF2)
- 3rd-party domain (`fonts.googleapis.com`, `fonts.gstatic.com`) — DNS + TLS + download
- `display=swap` causes layout shift (CLS) on first load
- No `font-display: optional` or self-hosting
**IMPACT:** Delays text rendering; CLS risk; 3rd-party dependency.
**SEVERITY:** MEDIUM
**EXACT FIX:**
1. **Self-host Inter WOFF2** (variable font preferred): Download variable font (`Inter-Variable.woff2` ~40 KB for all weights) → serve from `/assets/fonts/`
2. Update CSS: `@font-face { src: url('../fonts/Inter-Variable.woff2') format('woff2-variations'); }`
3. Remove Google Fonts links + preconnects
4. Eliminates 3rd-party, reduces weight ~65%, eliminates CLS from font swap

---

### 5. EXTERNAL DEPENDENCIES

#### FILE: County pages (4) — Google Maps iframe
```html
<iframe src="https://www.google.com/maps?q=Orange+County,+California&z=9&output=embed" ...>
```
**PROBLEM:** 
- Loads Google Maps JS API (~200 KB+)
- Blocks main thread on interaction
- 3rd-party cookies/tracking
**IMPACT:** Heavy on county pages; TBT (Total Blocking Time) spike.
**SEVERITY:** MEDIUM
**EXACT FIX:**
- Replace with static map image (generate via Maps Static API) + link to full Google Maps
- Or use `loading="lazy"` on iframe (already present) + add `referrerpolicy="strict-origin-when-cross-origin"` (already present)
- **Better:** Static PNG/WebP map thumbnail (20 KB) + `<a href="https://maps.google.com/...">View full map</a>`

---

### 6. RENDER-BLOCKING RESOURCES

#### FILE: All HTML pages — CSS in `<head>`
```html
<link rel="stylesheet" href="assets/css/modules/base.css">
<link rel="stylesheet" href="assets/css/modules/layout.css">
<link rel="stylesheet" href="assets/css/modules/components.css">
```
**PROBLEM:** 3 render-blocking CSS requests before any content paints.
**IMPACT:** Delays FCP by ~100-200ms on GitHub Pages.
**SEVERITY:** MEDIUM
**EXACT FIX:**
```html
<!-- Inline critical CSS (~3 KB for header + hero + buttons) -->
<style>/* critical CSS here */</style>
<!-- Load rest async -->
<link rel="preload" href="assets/css/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="assets/css/styles.css"></noscript>
```

---

### 7. LAZY LOADING

#### FILE: Service pages — hero split images
**PROBLEM:** `loading="eager" fetchpriority="high"` on below-fold images.
**IMPACT:** Wasted bandwidth; competes with true LCP.
**SEVERITY:** HIGH (see Images section above)
**EXACT FIX:** Change to `loading="lazy"` on all service/industry/area page split-images.

---

#### FILE: County pages — Google Maps iframe
**PROBLEM:** Already has `loading="lazy"` — correct.
**SEVERITY:** NONE

---

### 8. COMPRESSION

#### FILE: All images
**PROBLEM:** WebP images appear compressed at ~q85-90 (large file sizes for dimensions).
**IMPACT:** 2-3x larger than optimal q75.
**SEVERITY:** HIGH
**EXACT FIX:** Re-compress all WebP images at q75 (or use `cwebp -q 75 -m 6 -mt`). Target sizes:
- Hero 2560×1440: ≤80 KB
- Service 1536×1024: ≤90 KB
- Responsive variants proportionally smaller

---

### 9. IMAGE DIMENSIONS vs DISPLAY SIZE

#### FILE: `index.html` hero
```html
<img src="assets/images/hero.webp" 
     srcset="assets/images/hero-640.webp 640w, assets/images/hero-960.webp 960w, assets/images/hero-1280.webp 1280w, assets/images/hero.webp 2560w"
     sizes="(max-width: 768px) 94vw, (max-width: 1400px) 560px, 600px"
     width="2560" height="1440">
```
**PROBLEM:** `width="2560" height="1440"` but `sizes` says max 600px on desktop. Browser downloads 2560w variant on large screens but displays at 600px.
**IMPACT:** Wasted bytes (129 KB vs ~35 KB needed).
**SEVERITY:** MEDIUM
**EXACT FIX:** Update `sizes` to match actual display width, or generate 600w variant and cap srcset at 1200w.

---

#### FILE: Service pages split images
```html
<source srcset="../assets/images/services/asbestos-640.webp 640w, ../assets/images/services/asbestos-960.webp 960w, ../assets/images/services/asbestos-1280.webp 1280w, ../assets/images/services/asbestos.webp 1536w" sizes="(max-width: 768px) 94vw, 560px" type="image/webp">
<img src="../assets/images/services/asbestos.webp" ... width="1536" height="1024">
```
**PROBLEM:** `sizes` says 560px max on desktop, but 1536w variant in srcset. Displayed at ~560px.
**IMPACT:** Downloads 1536w (195 KB) but displays at 560px (needs ~960w max).
**SEVERITY:** MEDIUM
**EXACT FIX:** Remove 1536w from srcset; cap at 1280w. Or update `sizes` to reflect actual layout.

---

### 10. DUPLICATE RESOURCES

#### FILE: All pages — Google Fonts CSS requested per page
**PROBLEM:** Each page loads `fonts.googleapis.com/css2?family=Inter...` separately. Browser caches, but first visit = 3 requests (CSS + 2 font files).
**IMPACT:** Extra 3rd-party requests.
**SEVERITY:** LOW
**EXACT FIX:** Self-host fonts (see Fonts section).

---

### 11. UNUSED ASSETS

#### FILE: `assets/images/services/air-monitoring-field.webp` + variants (4 files, 360 KB total)
**PROBLEM:** Used only on `air-monitoring.html` but full-size + 3 variants exist. Same for `asbestos-materials.webp` (used on asbestos page only).
**IMPACT:** Not a runtime issue — only affects build/deploy size.
**SEVERITY:** LOW
**EXACT FIX:** None needed for runtime. Optional: remove unused variants if any.

---

### 12. DOM COMPLEXITY

#### FILE: All pages
**PROBLEM:** DOM depth moderate (~15-20 levels max). ~300-500 nodes per page. Service cards, grids, tables.
**IMPACT:** Negligible for static HTML. No framework overhead.
**SEVERITY:** NONE

---

### 13. ANIMATIONS

#### FILE: `assets/css/modules/components.css` + `base.css`
```css
html { scroll-behavior: smooth; }
.fade-up { opacity: 0; transform: translateY(20px); transition: opacity .6s, transform .6s; }
.fade-up.visible { opacity: 1; transform: none; }
.btn:hover { transform: translateY(-2px); }
.call-button:hover { transform: translateY(-2px); }
```
**PROBLEM:** `scroll-behavior: smooth` on `html` can cause jank on anchor jumps. IntersectionObserver animations are lightweight.
**IMPACT:** Minimal.
**SEVERITY:** LOW
**EXACT FIX:** Optional — remove `scroll-behavior: smooth` if anchor jumps feel laggy; use JS smooth scroll instead.

---

### 14. VIDEO

**PROBLEM:** No video content on site.
**SEVERITY:** N/A

---

### 15. BACKGROUND IMAGES

#### FILE: `components.css` — `.hero` section uses `<img>`, not CSS background
**PROBLEM:** None — hero uses semantic `<img>` with srcset (good).
**SEVERITY:** NONE

---

### 16. MOBILE PERFORMANCE

| Factor | Status |
|--------|--------|
| Viewport meta | ✅ Present |
| Touch targets | ✅ Buttons/links ≥48px |
| Font size | ✅ 16px base, readable |
| Tap highlights | ✅ Default |
| Horizontal scroll | ✅ `overflow-x: hidden` on html/body |
| Image sizing | ⚠️ Hero srcset includes 2560w — mobile downloads 640w (correct) |
| Font loading | ⚠️ Google Fonts swap causes CLS on mobile 3G |
| Maps iframe | ⚠️ Heavy on county pages mobile |

---

## BIGGEST PERFORMANCE PROBLEMS

| Rank | Problem | Pages Affected | Estimated LCP Impact |
|------|---------|----------------|---------------------|
| 1 | **Oversized service images (130-195 KB)** served eager+high-priority below fold | 6 service pages | +1.5-3s LCP on 3G |
| 2 | **Hero image 129 KB** (could be 80 KB) | Homepage | +0.5-1s LCP |
| 3 | **Google Fonts 3rd-party dependency** (6 weights, ~120 KB) | All 27 pages | +200-500ms FCP + CLS risk |
| 4 | **Google Maps iframe** on county pages | 4 area pages | +200 KB + TBT |
| 5 | **3 render-blocking CSS files** | All 27 pages | +100-200ms FCP |

---

## QUICK WINS (≤30 min each, high impact)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Change `loading="eager" fetchpriority="high"` → `loading="lazy"` on all service/industry/area page split-images | 5 min | **HIGH** — stops wasted eager downloads |
| 2 | Re-compress all WebP images to q75 (hero ≤80 KB, services ≤90 KB) | 15 min | **HIGH** — 40-50% image weight reduction |
| 3 | Remove 1536w from service image srcsets (cap at 1280w) | 10 min | **MEDIUM** — matches actual display size |
| 4 | Self-host Inter variable font (replace Google Fonts) | 20 min | **HIGH** — eliminates 3rd-party, -65% font weight, fixes CLS |
| 5 | Replace Google Maps iframes with static map images + links | 15 min | **MEDIUM** — removes 200 KB JS per county page |

---

## OPTIONAL OPTIMIZATIONS (nice to have)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 6 | Inline critical CSS (~3 KB), async load rest | 30 min | **LOW-MED** — saves ~100ms FCP |
| 7 | Concatenate 3 CSS files → 1 `styles.css` | 10 min | **LOW** — 1 fewer request |
| 8 | Inline `main.js` (3.7 KB) to eliminate request | 5 min | **LOW** — saves 1 request |
| 9 | Add `font-display: optional` if keeping Google Fonts | 2 min | **LOW** — reduces CLS |
| 10 | Generate 600w hero variant, cap srcset at 1200w | 10 min | **LOW** — saves ~40 KB on desktop |
| 11 | Add `Content-Encoding: br` / `gzip` via GitHub Pages (automatic) | 0 min | **NONE** — already enabled |
| 12 | Add `Cache-Control: immutable` for versioned assets | N/A | **NONE** — GitHub Pages doesn't support custom headers |

---

## PERFORMANCE SCORE /100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Image Optimization | 55 | 30% | 16.5 |
| CSS Delivery | 80 | 15% | 12.0 |
| JavaScript | 95 | 10% | 9.5 |
| Fonts | 50 | 15% | 7.5 |
| Third-Party Dependencies | 55 | 10% | 5.5 |
| Caching/Compression | 90 | 10% | 9.0 |
| Mobile UX | 80 | 10% | 8.0 |
| **TOTAL** | | **100%** | **68/100** |

**After Quick Wins (1-5): ~85/100**  
**After All Fixes: ~92/100**

---

## IMPLEMENTATION PRIORITY ORDER

1. **Fix eager loading on below-fold images** (5 min) — immediate bandwidth savings
2. **Re-compress all WebP to q75** (15 min) — biggest byte reduction
3. **Self-host Inter variable font** (20 min) — eliminates 3rd-party + CLS
4. **Replace Maps iframes with static images** (15 min) — heavy county pages
5. **Cap srcsets at actual display sizes** (10 min) — prevents oversized downloads
6. **Inline critical CSS + async load** (30 min) — FCP improvement

Total effort: ~1.5 hours for all high-impact fixes.

---

## FILES TO MODIFY

| File | Changes Needed |
|------|----------------|
| `index.html` | Hero: fix srcset caps, keep fetchpriority=high |
| `services/*.html` (6) | Split images: `loading="lazy"`, remove fetchpriority, fix srcset caps |
| `industries/*.html` (8) | Split images: `loading="lazy"`, fix srcset caps |
| `areas/*.html` (4) | Replace Maps iframe with static image + link |
| `contact.html`, `about.html`, `faq.html` | Split images: `loading="lazy"` |
| `assets/css/modules/*.css` | Extract critical CSS; add @font-face for self-hosted Inter |
| `assets/images/` | Re-compress all WebP to q75; add Inter-Variable.woff2 to `assets/fonts/` |
| All HTML | Remove Google Fonts links; add self-hosted font preload |

---

**End of Part 8 Audit**