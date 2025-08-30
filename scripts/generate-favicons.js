#!/usr/bin/env node

/**
 * Favicon Generation Script for Pulse
 * Converts SVG files to PNG and ICO formats for web compatibility
 *
 * Usage: node scripts/generate-favicons.js
 *
 * Requirements:
 * - Install sharp: npm install --save-dev sharp
 * - Or use online converters mentioned in comments below
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if sharp is available
let sharp;
try {
  const sharpModule = await import("sharp");
  sharp = sharpModule.default;
} catch {
  console.log(
    "⚠️  Sharp not found. Please install it with: npm install --save-dev sharp",
  );
  console.log("⚠️  Or use online converters listed below:\n");

  console.log("🌐 Online Conversion Options:");
  console.log("1. https://svg2ico.com - Fast, browser-based SVG to ICO");
  console.log(
    "2. https://convertico.com/svg-to-ico/ - Professional SVG to ICO",
  );
  console.log("3. https://picflow.com/convert/svg-to-ico - Ad-free converter");
  console.log(
    "4. https://svg-to-png-jpeg-favicon.vercel.app/ - Multi-format converter\n",
  );

  console.log("📝 Manual Steps:");
  console.log("1. Upload public/favicon.svg to any converter above");
  console.log("2. Generate sizes: 16x16, 32x32, 180x180, and ICO");
  console.log(
    "3. Save as: favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, favicon.ico",
  );
  console.log("4. Place all files in the public/ directory");

  process.exit(0);
}

const publicDir = path.join(__dirname, "..", "public");

// Conversion configurations
const conversions = [
  {
    input: path.join(publicDir, "favicon.svg"),
    output: path.join(publicDir, "favicon-16x16.png"),
    size: 16,
  },
  {
    input: path.join(publicDir, "favicon-32x32.svg"),
    output: path.join(publicDir, "favicon-32x32.png"),
    size: 32,
  },
  {
    input: path.join(publicDir, "apple-touch-icon.svg"),
    output: path.join(publicDir, "apple-touch-icon.png"),
    size: 180,
  },
];

async function generateFavicons() {
  console.log("🎨 Generating favicon files...\n");

  try {
    // Generate PNG files
    for (const config of conversions) {
      if (fs.existsSync(config.input)) {
        await sharp(config.input)
          .resize(config.size, config.size)
          .png()
          .toFile(config.output);

        console.log(
          `✅ Generated: ${path.basename(config.output)} (${config.size}x${config.size})`,
        );
      } else {
        console.log(
          `⚠️  Source file not found: ${path.basename(config.input)}`,
        );
      }
    }

    // Generate ICO file from 32x32 PNG
    const ico32Path = path.join(publicDir, "favicon-32x32.png");

    if (fs.existsSync(ico32Path)) {
      // Sharp doesn't support ICO output, so we'll create a renamed copy
      // For true ICO format, use online converters or imagemagick
      await sharp(ico32Path)
        .resize(32, 32)
        .png()
        .toFile(path.join(publicDir, "favicon-temp.png"));

      console.log(
        "✅ Generated: favicon-temp.png (use online converter for .ico)",
      );
      console.log(
        "💡 For true ICO format, upload favicon-temp.png to: https://svg2ico.com",
      );
    }

    console.log("\n🎉 Favicon generation completed!");
    console.log("\n📁 Generated files:");
    console.log("- favicon-16x16.png");
    console.log("- favicon-32x32.png");
    console.log("- apple-touch-icon.png");
    console.log("- favicon-temp.png (convert to .ico online)");

    console.log("\n🔗 Next steps:");
    console.log("1. Convert favicon-temp.png to favicon.ico using online tool");
    console.log("2. Delete favicon-temp.png after conversion");
    console.log("3. Test your favicon at: http://localhost:3000");
  } catch (error) {
    console.error("❌ Error generating favicons:", error.message);
    process.exit(1);
  }
}

// Run the script
generateFavicons();
