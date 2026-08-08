const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(process.cwd(), 'assets', 'images');

// Target sizes
const HERO_MAX_SIZE = 80 * 1024; // 80 KB for hero images
const SERVICE_MAX_SIZE = 90 * 1024; // 90 KB for service images

async function compressImage(inputPath, outputPath, maxSizeKB, quality = 75) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    // Write the compressed image - read the original into buffer first to avoid locking issues
    const inputBuffer = fs.readFileSync(inputPath);
    let buffer = await sharp(inputBuffer)
      .webp({ quality, effort: 6 })
      .toBuffer();

    let currentQuality = quality;

    // If still too large, reduce quality iteratively
    while (buffer.length > maxSizeKB * 1024 && currentQuality > 30) {
      currentQuality -= 5;
      buffer = await sharp(inputBuffer)
        .webp({ quality: currentQuality, effort: 6 })
        .toBuffer();
    }

    // Write the compressed image
    await fs.promises.writeFile(inputPath, buffer);

    const savings = ((originalSize - buffer.length) / originalSize * 100).toFixed(1);
    console.log(`${path.basename(inputPath)}: ${originalSize} bytes → ${buffer.length} bytes (${savings}% smaller, quality=${currentQuality})`);

    return { originalSize, compressedSize: buffer.length, quality: currentQuality };
  } catch (err) {
    console.error(`Error compressing ${inputPath}:`, err.message);
    return null;
  }
}

async function processDirectory(dir, maxSizeKB) {
  const files = fs.readdirSync(dir);
  const results = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subResults = await processDirectory(fullPath, maxSizeKB);
      results.push(...subResults);
    } else if (file.endsWith('.webp')) {
      const result = await compressImage(fullPath, fullPath, maxSizeKB);
      if (result) {
        results.push({ file, ...result });
      }
    }
  }

  return results;
}

async function main() {
  console.log('Starting WebP image compression...\n');

  // Hero images - target 80KB
  console.log('=== HERO IMAGES (target: 80KB) ===');
  const heroDir = path.join(IMAGES_DIR);
  const heroFiles = fs.readdirSync(heroDir).filter(f => f.startsWith('hero') && f.endsWith('.webp'));

  for (const file of heroFiles) {
    const fullPath = path.join(heroDir, file);
    await compressImage(fullPath, fullPath, 80);
  }

  // Service images - target 90KB
  console.log('\n=== SERVICE IMAGES (target: 90KB) ===');
  const servicesDir = path.join(IMAGES_DIR, 'services');
  const serviceFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('.webp'));

  for (const file of serviceFiles) {
    const fullPath = path.join(servicesDir, file);
    await compressImage(fullPath, fullPath, 90);
  }

  // Icons - compress lightly
  console.log('\n=== ICON IMAGES ===');
  const iconsDir = path.join(IMAGES_DIR, 'icons');
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.svg'));
    for (const file of iconFiles) {
      if (file.endsWith('.webp') || file.endsWith('.png')) {
        const fullPath = path.join(iconsDir, file);
        await compressImage(fullPath, fullPath, 50, 80);
      }
    }
  }

  console.log('\n✅ All images compressed!');
}

main().catch(console.error);