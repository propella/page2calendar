#!/bin/bash

# Build script for Chrome Web Store submission

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_FILE="$SCRIPT_DIR/../page2calendar.zip"

# Remove existing zip if exists
rm -f "$OUTPUT_FILE"

# Create zip
cd "$SCRIPT_DIR"
zip -r "$OUTPUT_FILE" \
  manifest.json \
  popup.html \
  popup.js \
  content.js \
  styles.css \
  _locales/ \
  icons/

echo "Created: $OUTPUT_FILE"
