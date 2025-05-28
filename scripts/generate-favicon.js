const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));
    
    // Convert SVG to PNG with different sizes
    const sizes = [16, 32, 48];
    const pngBuffers = await Promise.all(
      sizes.map(size =>
        sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );
    
    // Write the PNG files
    await Promise.all(
      sizes.map((size, index) =>
        fs.promises.writeFile(
          path.join(__dirname, `../public/favicon-${size}.png`),
          pngBuffers[index]
        )
      )
    );
    
    console.log('Favicon PNG files generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon(); 