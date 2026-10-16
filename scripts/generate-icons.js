const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIcoRaw = require('png-to-ico');
const pngToIco = pngToIcoRaw.default || pngToIcoRaw;

const SOURCE_IMAGE = path.join(__dirname, '../public/icons/glow-glamour-app-icon.png');
const PUBLIC_DIR = path.join(__dirname, '../public');
const ICONS_DIR = path.join(__dirname, '../public/icons');
const SRC_APP_DIR = path.join(__dirname, '../src/app');

// Matte charcoal background color matching the icon artwork
const BG_COLOR = { r: 20, g: 20, b: 17, alpha: 1 };

async function generateIcons() {
  console.log('Reading source image from:', SOURCE_IMAGE);
  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error('Source image not found at ' + SOURCE_IMAGE);
  }

  const meta = await sharp(SOURCE_IMAGE).metadata();
  console.log(`Source image dimensions: ${meta.width}x${meta.height}, format: ${meta.format}`);

  // 1. Generate primary standard sizes
  const sizes = [
    { name: 'pwa-512x512.png', size: 512, dests: [PUBLIC_DIR, ICONS_DIR] },
    { name: 'pwa-192x192.png', size: 192, dests: [PUBLIC_DIR, ICONS_DIR] },
    { name: 'apple-touch-icon.png', size: 180, dests: [PUBLIC_DIR, ICONS_DIR] },
    { name: 'favicon.png', size: 32, dests: [PUBLIC_DIR, ICONS_DIR] },
    { name: 'favicon-32x32.png', size: 32, dests: [PUBLIC_DIR, ICONS_DIR] },
    { name: 'favicon-16x16.png', size: 16, dests: [PUBLIC_DIR, ICONS_DIR] },
    // Standard names for compatibility with established convention
    { name: 'icon-512.png', size: 512, dests: [ICONS_DIR] },
    { name: 'icon-192.png', size: 192, dests: [ICONS_DIR] },
    { name: 'icon.png', size: 192, dests: [PUBLIC_DIR] },
  ];

  for (const item of sizes) {
    let pipeline = sharp(SOURCE_IMAGE).resize(item.size, item.size, {
      fit: 'cover',
      position: 'center'
    });

    if (item.size <= 32) {
      // Gentle sharpen for crisp rendering on browser tabs
      pipeline = pipeline.sharpen({ sigma: 0.5, m1: 0.5, m2: 1.0 });
    }

    const buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();

    for (const destDir of item.dests) {
      const outPath = path.join(destDir, item.name);
      fs.writeFileSync(outPath, buffer);
      console.log(`Generated: ${path.relative(path.join(__dirname, '..'), outPath)} (${item.size}x${item.size})`);
    }
  }

  // 2. Generate maskable icon (512x512) with safe-zone padding
  // Android safe-zone requires content within the inner 80% circle (radius 40%).
  // We scale the image to ~80% of canvas (410x410) and center it on the matching matte charcoal canvas.
  const innerScaledBuffer = await sharp(SOURCE_IMAGE)
    .resize(410, 410, { fit: 'contain' })
    .toBuffer();

  const maskableBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BG_COLOR
    }
  })
    .composite([{ input: innerScaledBuffer, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const maskableDests = [
    path.join(PUBLIC_DIR, 'pwa-maskable-512x512.png'),
    path.join(ICONS_DIR, 'pwa-maskable-512x512.png'),
    path.join(ICONS_DIR, 'maskable-icon-512.png'),
    path.join(ICONS_DIR, 'maskable-icon-192.png')
  ];

  for (const p of maskableDests) {
    if (p.includes('192')) {
      const b192 = await sharp(maskableBuffer).resize(192, 192).png().toBuffer();
      fs.writeFileSync(p, b192);
    } else {
      fs.writeFileSync(p, maskableBuffer);
    }
    console.log(`Generated Maskable: ${path.relative(path.join(__dirname, '..'), p)}`);
  }

  // 3. Generate multi-resolution favicon.ico (16, 32, 48)
  const icoSource16 = path.join(PUBLIC_DIR, 'favicon-16x16.png');
  const icoSource32 = path.join(PUBLIC_DIR, 'favicon-32x32.png');
  const icoSource48Buffer = await sharp(SOURCE_IMAGE).resize(48, 48).png().toBuffer();
  const icoSource48 = path.join(PUBLIC_DIR, 'favicon-48x48.temp.png');
  fs.writeFileSync(icoSource48, icoSource48Buffer);

  const icoBuffer = await pngToIco([icoSource16, icoSource32, icoSource48]);
  fs.unlinkSync(icoSource48);

  const icoDests = [
    path.join(PUBLIC_DIR, 'favicon.ico'),
    path.join(ICONS_DIR, 'favicon.ico')
  ];

  for (const p of icoDests) {
    fs.writeFileSync(p, icoBuffer);
    console.log(`Generated Favicon ICO: ${path.relative(path.join(__dirname, '..'), p)}`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
