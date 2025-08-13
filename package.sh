#!/bin/bash

# TreasuryViz Extension Package Script
# Creates a ready-to-install XPI file for Firefox

echo "📦 Packaging TreasuryViz Extension..."

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the treasury-viz-extension directory."
    exit 1
fi

# Create a temporary directory for packaging
TEMP_DIR="treasuryviz-package"
rm -rf "$TEMP_DIR"
mkdir "$TEMP_DIR"

# Copy all extension files
echo "📋 Copying extension files..."
cp -r manifest.json popup.html options.html icons css js "$TEMP_DIR/"

# Create XPI file
echo "🗜️  Creating XPI file..."
cd "$TEMP_DIR"
zip -r "../treasuryviz.xpi" .
cd ..

# Clean up temporary directory
echo "🧹 Cleaning up..."
rm -rf "$TEMP_DIR"

# Check if XPI was created successfully
if [ -f "treasuryviz.xpi" ]; then
    echo "✅ Success! Extension packaged as treasuryviz.xpi"
    echo ""
    echo "📦 Package contents:"
    echo "   - Extension size: $(du -h treasuryviz.xpi | cut -f1)"
    echo "   - Files included: $(unzip -l treasuryviz.xpi | wc -l)"
    echo ""
    echo "🚀 Installation instructions:"
    echo "   1. Open Firefox"
    echo "   2. Go to about:addons"
    echo "   3. Click the gear icon ⚙️"
    echo "   4. Select 'Install Add-on From File...'"
    echo "   5. Choose treasuryviz.xpi"
    echo "   6. Confirm installation"
    echo ""
    echo "🔧 For development installation:"
    echo "   1. Open Firefox"
    echo "   2. Go to about:debugging"
    echo "   3. Click 'This Firefox'"
    echo "   4. Click 'Load Temporary Add-on...'"
    echo "   5. Select manifest.json from this folder"
else
    echo "❌ Error: Failed to create XPI file"
    exit 1
fi

echo ""
echo "🎉 TreasuryViz extension is ready to use!"