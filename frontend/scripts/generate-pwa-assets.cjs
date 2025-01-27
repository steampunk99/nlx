const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../src/assets/logo.png');
const targetDir = path.join(__dirname, '../public/icons');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function generateIcons() {
  return new Promise((resolve, reject) => {
    try {
      const promises = [];
      for (const size of sizes) {
        promises.push(sharp(sourceIcon)
          .resize(size, size)
          .toFile(path.join(targetDir, `icon-${size}x${size}.png`))
          .then(() => {
            console.log(`Generated ${size}x${size} icon`);
          }));
      }
      Promise.all(promises).then(() => {
        console.log('All icons generated successfully!');
        resolve();
      });
    } catch (error) {
      console.error('Error generating icons:', error);
      reject(error);
    }
  });
}

generateIcons();
