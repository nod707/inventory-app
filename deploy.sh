#!/bin/bash

# Build the client
cd client
npm run build

# Go back to root
cd ..

# Add all changes
git add .

# Commit changes
git commit -m "Update: Auto-measure feature with OpenCV integration"

# Push to main branch
git push origin main
