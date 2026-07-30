const sharp = require('sharp');
const fs = require('fs');

async function processImage(inputPath, outputPath) {
  try {
    const img = sharp(inputPath);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    
    // Iterate through pixels (RGBA)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      // If the pixel is white or very close to white
      if (r > 230 && g > 230 && b > 230) {
        data[i+3] = 0; // Make it fully transparent
      }
    }
    
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);
    
    console.log(`Updated ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function main() {
  await processImage('public/images/brand/logo.png', 'public/images/brand/logo-tmp.png');
  fs.renameSync('public/images/brand/logo-tmp.png', 'public/images/brand/logo.png');
  
  await processImage('public/images/brand/logo-dark.png', 'public/images/brand/logo-dark-tmp.png');
  fs.renameSync('public/images/brand/logo-dark-tmp.png', 'public/images/brand/logo-dark.png');
  
  await processImage('public/images/brand/logo-light.png', 'public/images/brand/logo-light-tmp.png');
  fs.renameSync('public/images/brand/logo-light-tmp.png', 'public/images/brand/logo-light.png');
}

main();
