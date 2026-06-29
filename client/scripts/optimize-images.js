const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const assetsDir = path.join(__dirname, "..", "public", "assets");

async function convertEmbeddedSvg(svgFile, outputFile) {
  const svgContent = fs.readFileSync(path.join(assetsDir, svgFile), "utf8");
  const match = svgContent.match(/data:image\/(jpeg|png);base64,([^"')]+)/);
  if (!match) {
    throw new Error(`No embedded base64 image found in ${svgFile}`);
  }
  const buffer = Buffer.from(match[2], "base64");
  await sharp(buffer).webp({ quality: 80 }).toFile(path.join(assetsDir, outputFile));
}

async function convertRaster(inputFile, outputFile) {
  await sharp(path.join(assetsDir, inputFile))
    .webp({ quality: 80 })
    .toFile(path.join(assetsDir, outputFile));
}

async function main() {
  await convertEmbeddedSvg("CTA.svg", "CTA.webp");
  await convertRaster("Container.jpg", "Container.webp");
  await convertRaster("loginImage.png", "loginImage.webp");

  for (const file of ["CTA.svg", "CTA.webp", "Container.jpg", "Container.webp", "loginImage.png", "loginImage.webp"]) {
    const { size } = fs.statSync(path.join(assetsDir, file));
    console.log(`${file}: ${(size / 1024).toFixed(1)} KB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
