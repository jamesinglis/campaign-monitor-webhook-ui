#!/bin/bash

# Build script for Campaign Monitor Webhook UI
# This script builds the application for the DDEV environment

echo "🏗️  Building Campaign Monitor Webhook UI..."

# Build the application
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Built assets are in the /dist directory"
    echo "🌐 You can now visit: https://campaign-monitor-webhook-ui.ddev.site:8443"
else
    echo "❌ Build failed!"
    exit 1
fi