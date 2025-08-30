#!/bin/bash

# Pulse Favicon Generation Script
# Converts SVG files to PNG and ICO formats using ImageMagick
#
# Prerequisites:
# - ImageMagick installed (brew install imagemagick or apt-get install imagemagick)
#
# Usage: ./scripts/generate-favicons.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$(dirname "$SCRIPT_DIR")/public"

echo -e "${BLUE}🎨 Pulse Favicon Generator${NC}"
echo -e "${BLUE}===========================${NC}\n"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick not found!${NC}"
    echo -e "${YELLOW}Please install ImageMagick:${NC}"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  CentOS/RHEL: sudo yum install ImageMagick"
    echo ""
    echo -e "${YELLOW}Alternative: Use online converters${NC}"
    echo "1. https://svg2ico.com"
    echo "2. https://convertico.com/svg-to-ico/"
    echo "3. Open scripts/favicon-converter.html in your browser"
    exit 1
fi

# Check if SVG files exist
if [ ! -f "$PUBLIC_DIR/favicon.svg" ]; then
    echo -e "${RED}❌ favicon.svg not found in public directory!${NC}"
    exit 1
fi

echo -e "${GREEN}📁 Found SVG files, starting conversion...${NC}\n"

# Create PNG files from SVG
echo -e "${BLUE}🔄 Generating PNG files...${NC}"

# Generate 16x16 PNG
if [ -f "$PUBLIC_DIR/favicon-16x16.svg" ]; then
    convert "$PUBLIC_DIR/favicon-16x16.svg" -resize 16x16 "$PUBLIC_DIR/favicon-16x16.png"
    echo -e "${GREEN}✅ Generated favicon-16x16.png${NC}"
else
    convert "$PUBLIC_DIR/favicon.svg" -resize 16x16 "$PUBLIC_DIR/favicon-16x16.png"
    echo -e "${GREEN}✅ Generated favicon-16x16.png (from main favicon.svg)${NC}"
fi

# Generate 32x32 PNG
if [ -f "$PUBLIC_DIR/favicon-32x32.svg" ]; then
    convert "$PUBLIC_DIR/favicon-32x32.svg" -resize 32x32 "$PUBLIC_DIR/favicon-32x32.png"
    echo -e "${GREEN}✅ Generated favicon-32x32.png${NC}"
else
    convert "$PUBLIC_DIR/favicon.svg" -resize 32x32 "$PUBLIC_DIR/favicon-32x32.png"
    echo -e "${GREEN}✅ Generated favicon-32x32.png (from main favicon.svg)${NC}"
fi

# Generate Apple Touch Icon
if [ -f "$PUBLIC_DIR/apple-touch-icon.svg" ]; then
    convert "$PUBLIC_DIR/apple-touch-icon.svg" -resize 180x180 "$PUBLIC_DIR/apple-touch-icon.png"
    echo -e "${GREEN}✅ Generated apple-touch-icon.png${NC}"
else
    convert "$PUBLIC_DIR/favicon.svg" -resize 180x180 "$PUBLIC_DIR/apple-touch-icon.png"
    echo -e "${GREEN}✅ Generated apple-touch-icon.png (from main favicon.svg)${NC}"
fi

# Generate ICO file
echo -e "\n${BLUE}🔄 Generating ICO file...${NC}"
convert "$PUBLIC_DIR/favicon-32x32.png" "$PUBLIC_DIR/favicon-16x16.png" "$PUBLIC_DIR/favicon.ico"
echo -e "${GREEN}✅ Generated favicon.ico${NC}"

# Generate additional sizes (optional)
echo -e "\n${BLUE}🔄 Generating additional sizes...${NC}"
convert "$PUBLIC_DIR/favicon.svg" -resize 48x48 "$PUBLIC_DIR/favicon-48x48.png"
echo -e "${GREEN}✅ Generated favicon-48x48.png${NC}"

convert "$PUBLIC_DIR/favicon.svg" -resize 96x96 "$PUBLIC_DIR/favicon-96x96.png"
echo -e "${GREEN}✅ Generated favicon-96x96.png${NC}"

convert "$PUBLIC_DIR/favicon.svg" -resize 192x192 "$PUBLIC_DIR/favicon-192x192.png"
echo -e "${GREEN}✅ Generated favicon-192x192.png${NC}"

# Summary
echo -e "\n${GREEN}🎉 Favicon generation completed successfully!${NC}"
echo -e "\n${BLUE}📁 Generated files in public/:${NC}"
echo "- favicon.ico"
echo "- favicon-16x16.png"
echo "- favicon-32x32.png"
echo "- favicon-48x48.png"
echo "- favicon-96x96.png"
echo "- favicon-192x192.png"
echo "- apple-touch-icon.png"

echo -e "\n${BLUE}🔗 Next steps:${NC}"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Check browser tab for your new favicon!"
echo "4. Test on mobile by adding to home screen"

echo -e "\n${YELLOW}💡 Tips:${NC}"
echo "- Clear browser cache if favicon doesn't update immediately"
echo "- Test on different devices and browsers"
echo "- Use browser dev tools to verify all favicon sizes load correctly"

echo -e "\n${GREEN}✨ Your Pulse app now has a professional favicon! ✨${NC}"
