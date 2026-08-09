const fs = require("fs");
const path = require("path");

const ROOT = ".";

// Phase 1: Define all moves (source -> destination)
const moves = [
  // Root pages -> subfolders
  ["about.html", "about/index.html"],
  ["contact.html", "contact/index.html"],
  ["faq.html", "faq/index.html"],
  ["privacy.html", "privacy/index.html"],
  ["thank-you.html", "thank-you/index.html"],
  // Services
  ["services/asbestos-inspections.html", "services/asbestos-inspections/index.html"],
  ["services/mold-inspections.html", "services/mold-inspections/index.html"],
  ["services/lead-paint-inspections.html", "services/lead-paint-inspections/index.html"],
  ["services/indoor-air-quality.html", "services/indoor-air-quality/index.html"],
  ["services/air-monitoring.html", "services/air-monitoring/index.html"],
  ["services/air-clearance-testing.html", "services/air-clearance-testing/index.html"],
  // Industries
  ["industries/commercial.html", "industries/commercial/index.html"],
  ["industries/contractors.html", "industries/contractors/index.html"],
  ["industries/government.html", "industries/government/index.html"],
  ["industries/property-managers.html", "industries/property-managers/index.html"],
  ["industries/real-estate.html", "industries/real-estate/index.html"],
  ["industries/residential.html", "industries/residential/index.html"],
  ["industries/schools.html", "industries/schools/index.html"],
  // Areas
  ["areas/orange-county.html", "areas/orange-county/index.html"],
  ["areas/los-angeles-county.html", "areas/los-angeles-county/index.html"],
  ["areas/riverside-county.html", "areas/riverside-county/index.html"],
  ["areas/san-bernardino-county.html", "areas/san-bernardino-county/index.html"],
];

// Phase 1: Create directories and move files
console.log("Phase 1: Moving files...");
for (const [src, dest] of moves) {
  const srcPath = path.join(ROOT, src);
  const destDir = path.dirname(path.join(ROOT, dest));
  if (!fs.existsSync(srcPath)) {
    console.log(`  SKIP (source missing): ${src}`);
    continue;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcPath, path.join(ROOT, dest));
  fs.unlinkSync(srcPath);
  console.log(`  Moved: ${src} -> ${dest}`);
}

// Phase 2: Update links in all files
console.log("\nPhase 2: Updating internal links...");

const allFiles = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".claude") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html") && !e.name.includes("AUDIT")) allFiles.push(p);
  }
}
walk(ROOT);

let totalUpdates = 0;

// Files that moved from root to subfolder (depth changed by +1)
const rootPages = ["about/index.html","contact/index.html","faq/index.html","privacy/index.html","thank-you/index.html"];
// Files that moved within subfolders (depth changed by +1)
const subPages = [
  "services/asbestos-inspections/index.html","services/mold-inspections/index.html",
  "services/lead-paint-inspections/index.html","services/indoor-air-quality/index.html",
  "services/air-monitoring/index.html","services/air-clearance-testing/index.html",
  "industries/commercial/index.html","industries/contractors/index.html",
  "industries/government/index.html","industries/property-managers/index.html",
  "industries/real-estate/index.html","industries/residential/index.html",
  "industries/schools/index.html",
  "areas/orange-county/index.html","areas/los-angeles-county/index.html",
  "areas/riverside-county/index.html","areas/san-bernardino-county/index.html",
];
// Files that stayed at same depth (no link changes needed for navigation)
const rootIndex = "index.html";
const subIndex = ["services/index.html","industries/index.html","areas/index.html"];

for (const filePath of allFiles) {
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, "/");

  // Skip files that don't need link updates
  if ([rootIndex,...subIndex].includes(relPath)) {
    // These files still need canonical/OG updates but no nav link changes
    // (handled below)
  }

  // For root pages that moved to subfolders (about, contact, faq, privacy, thank-you):
  // Links like href="contact.html" → href="../contact/"
  // Links like href="services/mold-inspections.html" → href="../services/mold-inspections/"
  // Links like href="index.html" → href="../index.html"
  if (rootPages.includes(relPath)) {
    // Root-level siblings: contact.html -> ../contact/
    html = html.replace(/href="about\.html"/g, 'href="../about/"');
    html = html.replace(/href="contact\.html"/g, 'href="../contact/"');
    html = html.replace(/href="faq\.html"/g, 'href="../faq/"');
    html = html.replace(/href="privacy\.html"/g, 'href="../privacy/"');
    html = html.replace(/href="thank-you\.html"/g, 'href="../thank-you/"');
    html = html.replace(/href="404\.html"/g, 'href="../404.html"');
    html = html.replace(/href="index\.html"/g, 'href="../index.html"');
    // Subfolder siblings: services/xxx.html -> ../services/xxx/
    html = html.replace(/href="services\/index\.html"/g, 'href="../services/"');
    html = html.replace(/href="services\/([\w-]+)\.html"/g, 'href="../services/$1/"');
    html = html.replace(/href="industries\/index\.html"/g, 'href="../industries/"');
    html = html.replace(/href="industries\/([\w-]+)\.html"/g, 'href="../industries/$1/"');
    html = html.replace(/href="areas\/index\.html"/g, 'href="../areas/"');
    html = html.replace(/href="areas\/([\w-]+)\.html"/g, 'href="../areas/$1/"');
  }

  // For service/industry/area pages that moved (depth +1):
  // Links like href="../contact.html" -> "../../contact/"
  // Links like href="../index.html" -> "../../index.html"
  if (subPages.includes(relPath)) {
    html = html.replace(/href="\.\.\/([\w-]+)\.html"/g, 'href="../../$1/"');
    html = html.replace(/href="\.\.\/services\/([\w-]+)\.html"/g, 'href="../../services/$1/"');
    html = html.replace(/href="\.\.\/industries\/([\w-]+)\.html"/g, 'href="../../industries/$1/"');
    html = html.replace(/href="\.\.\/areas\/([\w-]+)\.html"/g, 'href="../../areas/$1/"');
    // Also handle ../index.html and ../services/index.html patterns
    html = html.replace(/href="\.\.\/index\.html"/g, 'href="../../index.html"');
    html = html.replace(/href="\.\.\/services\/index\.html"/g, 'href="../../services/"');
    html = html.replace(/href="\.\.\/industries\/index\.html"/g, 'href="../../industries/"');
    html = html.replace(/href="\.\.\/areas\/index\.html"/g, 'href="../../areas/"');
  }

  // Canonical URLs - add trailing slash for moved pages
  const movedRootPages = {
    "about/index.html": "/about/",
    "contact/index.html": "/contact/",
    "faq/index.html": "/faq/",
    "privacy/index.html": "/privacy/",
    "thank-you/index.html": "/thank-you/",
  };
  const movedSubPages = {
    "services/asbestos-inspections/index.html": "/services/asbestos-inspections/",
    "services/mold-inspections/index.html": "/services/mold-inspections/",
    "services/lead-paint-inspections/index.html": "/services/lead-paint-inspections/",
    "services/indoor-air-quality/index.html": "/services/indoor-air-quality/",
    "services/air-monitoring/index.html": "/services/air-monitoring/",
    "services/air-clearance-testing/index.html": "/services/air-clearance-testing/",
    "industries/commercial/index.html": "/industries/commercial/",
    "industries/contractors/index.html": "/industries/contractors/",
    "industries/government/index.html": "/industries/government/",
    "industries/property-managers/index.html": "/industries/property-managers/",
    "industries/real-estate/index.html": "/industries/real-estate/",
    "industries/residential/index.html": "/industries/residential/",
    "industries/schools/index.html": "/industries/schools/",
    "areas/orange-county/index.html": "/areas/orange-county/",
    "areas/los-angeles-county/index.html": "/areas/los-angeles-county/",
    "areas/riverside-county/index.html": "/areas/riverside-county/",
    "areas/san-bernardino-county/index.html": "/areas/san-bernardino-county/",
  };
  const movedPages = { ...movedRootPages, ...movedSubPages };

  // Update canonical URL in this file
  const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/calbuildingenv\.com\/([^"]+)">/);
  if (canonicalMatch) {
    const oldCanonicalPath = canonicalMatch[1];
    const oldCanonical = `https://calbuildingenv.com/${oldCanonicalPath}`;
    // Check if this file's path is in the moved pages map
    const newPath = movedPages[relPath];
    if (newPath) {
      const newCanonical = `https://calbuildingenv.com${newPath}`;
      html = html.replace(oldCanonical, newCanonical);
    } else {
      // The canonical points to another page that moved
      // Check if the canonical path matches any moved page
      for (const [movedRel, movedUrl] of Object.entries(movedPages)) {
        const movedHtmlPath = movedRel.replace("/index.html", ".html");
        if (oldCanonicalPath === movedHtmlPath) {
          html = html.replace(oldCanonical, `https://calbuildingenv.com${movedUrl}`);
          break;
        }
      }
    }
  }

  // Update OG:url in this file
  const ogMatch = html.match(/<meta property="og:url" content="https:\/\/calbuildingenv\.com\/([^"]+)">/);
  if (ogMatch) {
    const oldOgPath = ogMatch[1];
    const oldOg = `https://calbuildingenv.com/${oldOgPath}`;
    const newPath = movedPages[relPath];
    if (newPath) {
      html = html.replace(oldOg, `https://calbuildingenv.com${newPath}`);
    } else {
      for (const [movedRel, movedUrl] of Object.entries(movedPages)) {
        const movedHtmlPath = movedRel.replace("/index.html", ".html");
        if (oldOgPath === movedHtmlPath) {
          html = html.replace(oldOg, `https://calbuildingenv.com${movedUrl}`);
          break;
        }
      }
    }
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html);
    totalUpdates++;
  }
}

console.log(`\nPhase 2 complete: ${totalUpdates} files updated`);

// Phase 3: Update sitemap
console.log("\nPhase 3: Updating sitemap...");
let sitemap = fs.readFileSync("sitemap.xml", "utf8");

// Root pages that moved to subfolders
const rootMoves = {
  "/about.html": "/about/",
  "/contact.html": "/contact/",
  "/faq.html": "/faq/",
  "/privacy.html": "/privacy/",
  "/thank-you.html": "/thank-you/",
};

// Service/industry/area files that moved to subfolders
const subMoves = {
  "/services/asbestos-inspections.html": "/services/asbestos-inspections/",
  "/services/mold-inspections.html": "/services/mold-inspections/",
  "/services/lead-paint-inspections.html": "/services/lead-paint-inspections/",
  "/services/indoor-air-quality.html": "/services/indoor-air-quality/",
  "/services/air-monitoring.html": "/services/air-monitoring/",
  "/services/air-clearance-testing.html": "/services/air-clearance-testing/",
  "/industries/commercial.html": "/industries/commercial/",
  "/industries/contractors.html": "/industries/contractors/",
  "/industries/government.html": "/industries/government/",
  "/industries/property-managers.html": "/industries/property-managers/",
  "/industries/real-estate.html": "/industries/real-estate/",
  "/industries/residential.html": "/industries/residential/",
  "/industries/schools.html": "/industries/schools/",
  "/areas/orange-county.html": "/areas/orange-county/",
  "/areas/los-angeles-county.html": "/areas/los-angeles-county/",
  "/areas/riverside-county.html": "/areas/riverside-county/",
  "/areas/san-bernardino-county.html": "/areas/san-bernardino-county/",
};

const allMoves = { ...rootMoves, ...subMoves };

for (const [oldPath, newPath] of Object.entries(allMoves)) {
  const fullOld = `https://calbuildingenv.com${oldPath}`;
  const fullNew = `https://calbuildingenv.com${newPath}`;
  sitemap = sitemap.replace(fullOld, fullNew);
}

fs.writeFileSync("sitemap.xml", sitemap);
console.log("  Sitemap updated");

console.log("\nAll phases complete!");
