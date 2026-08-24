const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const userLogoPath = '/Users/filipmoslavac/.gemini/antigravity/brain/bda5eea4-6290-4c70-af6c-adb9621f153d/.user_uploaded/media_1787610159268.png';

async function makeUniversalIcon() {
  console.log('Generating universal icon (preserves user yellow squircle + black M in both iOS Light & Dark modes)...');

  // App dark background for corner cutouts
  const darkBg = { r: 12, g: 13, b: 20, alpha: 1 }; // #0c0d14

  const buffer512 = await sharp(userLogoPath)
    .flatten({ background: darkBg })
    .resize(512, 512)
    .png()
    .toBuffer();

  const buffer180 = await sharp(userLogoPath)
    .flatten({ background: darkBg })
    .resize(180, 180)
    .png()
    .toBuffer();

  const buffer192 = await sharp(userLogoPath)
    .flatten({ background: darkBg })
    .resize(192, 192)
    .png()
    .toBuffer();

  const buffer32 = await sharp(userLogoPath)
    .flatten({ background: darkBg })
    .resize(32, 32)
    .png()
    .toBuffer();

  // Save to all locations
  fs.writeFileSync(path.join(__dirname, '../public/logo.png'), buffer512);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-precomposed.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-180x180.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-180x180-precomposed.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-152x152.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-120x120.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-76x76.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-60x60.png'), buffer180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon-57x57.png'), buffer180);

  fs.writeFileSync(path.join(__dirname, '../public/icons/icon-192x192.png'), buffer192);
  fs.writeFileSync(path.join(__dirname, '../public/icons/icon-512x512.png'), buffer512);

  fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), buffer32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), buffer32);

  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), buffer32);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), buffer180);

  console.log('Universal icons generated successfully!');
}

makeUniversalIcon().catch(console.error);
