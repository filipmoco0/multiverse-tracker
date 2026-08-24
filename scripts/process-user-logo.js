const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const userLogoPath = '/Users/filipmoslavac/.gemini/antigravity/brain/bda5eea4-6290-4c70-af6c-adb9621f153d/.user_uploaded/media_1787610159268.png';

async function processLogo() {
  console.log('Processing user uploaded logo...');
  const inputBuffer = fs.readFileSync(userLogoPath);

  // 1. Master Logo for Navbar & UI (512x512)
  await sharp(inputBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/logo.png'));

  // 2. Apple Touch Icon for iOS (180x180)
  await sharp(inputBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  // 3. PWA Icons (192x192 & 512x512)
  if (!fs.existsSync(path.join(__dirname, '../public/icons'))) {
    fs.mkdirSync(path.join(__dirname, '../public/icons'), { recursive: true });
  }

  await sharp(inputBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/icons/icon-192x192.png'));

  await sharp(inputBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/icons/icon-512x512.png'));

  // 4. Favicon PNG (32x32)
  await sharp(inputBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  // 5. Next.js App Router Favicon & Apple Icon
  await sharp(inputBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../src/app/icon.png'));

  await sharp(inputBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../src/app/apple-icon.png'));

  console.log('All user logo assets processed and saved successfully!');
}

processLogo().catch(console.error);
