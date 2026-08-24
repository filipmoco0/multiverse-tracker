const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const userLogoPath = '/Users/filipmoslavac/.gemini/antigravity/brain/bda5eea4-6290-4c70-af6c-adb9621f153d/.user_uploaded/media_1787610159268.png';

async function makeSolidYellowIcon() {
  console.log('Flattening user logo with solid yellow #FBBF24 background (no transparent pixels)...');

  const solidYellow = { r: 251, g: 191, b: 36, alpha: 1 }; // #FBBF24

  // Flatten over solid yellow background
  const flattened512 = await sharp(userLogoPath)
    .flatten({ background: solidYellow })
    .resize(512, 512)
    .png()
    .toBuffer();

  const flattened180 = await sharp(userLogoPath)
    .flatten({ background: solidYellow })
    .resize(180, 180)
    .png()
    .toBuffer();

  const flattened192 = await sharp(userLogoPath)
    .flatten({ background: solidYellow })
    .resize(192, 192)
    .png()
    .toBuffer();

  const flattened32 = await sharp(userLogoPath)
    .flatten({ background: solidYellow })
    .resize(32, 32)
    .png()
    .toBuffer();

  // Write to all public and app locations
  fs.writeFileSync(path.join(__dirname, '../public/logo.png'), flattened512);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-precomposed.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-180x180.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-180x180-precomposed.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-152x152.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-120x120.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-76x76.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-60x60.png'), flattened180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-57x57.png'), flattened180);

  fs.writeFileSync(path.join(__dirname, '../public/icons/icon-192x192.png'), flattened192);
  fs.writeFileSync(path.join(__dirname, '../public/icons/icon-512x512.png'), flattened512);

  fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), flattened32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), flattened32);

  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), flattened32);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), flattened180);

  console.log('All icons successfully flattened with solid yellow background!');
}

makeSolidYellowIcon().catch(console.error);
