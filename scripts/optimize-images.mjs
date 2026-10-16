import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.resolve('public/images');

const images = [
  { file: 'hero-salon.jpg', base: 'hero-salon', sizes: [1600, 1024, 640] },
  { file: 'hair-ritual.jpg', base: 'hair-ritual', sizes: [800, 480] },
  { file: 'facial-ritual.jpg', base: 'facial-ritual', sizes: [800, 480] },
  { file: 'balayage-styling.jpg', base: 'balayage-styling', sizes: [800, 480] },
];

async function run() {
  for (const item of images) {
    const inputPath = path.join(imagesDir, item.file);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping missing ${item.file}`);
      continue;
    }

    const metadata = await sharp(inputPath).metadata();
    console.log(`Processing ${item.file}: ${metadata.width}x${metadata.height}`);

    // Main WebP
    const mainWebp = path.join(imagesDir, `${item.base}.webp`);
    await sharp(inputPath)
      .webp({ quality: 82, effort: 6 })
      .toFile(mainWebp);
    console.log(`Created ${item.base}.webp: ${(fs.statSync(mainWebp).size / 1024).toFixed(1)} KB`);

    // Sized WebP versions for responsive srcset
    for (const size of item.sizes) {
      if (metadata.width && metadata.width < size) continue;
      const sizedWebp = path.join(imagesDir, `${item.base}-${size}.webp`);
      await sharp(inputPath)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toFile(sizedWebp);
      console.log(`Created ${item.base}-${size}.webp: ${(fs.statSync(sizedWebp).size / 1024).toFixed(1)} KB`);
    }
  }
}

run().catch(console.error);
