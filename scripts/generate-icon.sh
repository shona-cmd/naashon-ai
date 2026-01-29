#!/bin/bash
# Generate a simple icon for the extension using ImageMagick

mkdir -p images

# Create a 128x128 icon with gradient and text
convert -size 128x128 \
  xc:none \
  -background 'gradient:linear-gradient(135deg, #667eea 0%, #764ba2 100%)' \
  -fill white \
  -gravity center \
  -pointsize 60 \
  -font DejaVu-Sans-Bold \
  label:AI \
  -composite \
  images/icon.png

echo "Icon created at images/icon.png"

# Also create 256x256 for high DPI displays
convert -size 256x256 \
  xc:none \
  -background 'gradient:linear-gradient(135deg, #667eea 0%, #764ba2 100%)' \
  -fill white \
  -gravity center \
  -pointsize 120 \
  -font DejaVu-Sans-Bold \
  label:AI \
  -composite \
  images/icon-256.png

echo "High DPI icon created at images/icon-256.png"
