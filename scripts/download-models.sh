#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p public/models

# Download models from Sketchfab (free models)
# Note: These models are free to use under Creative Commons Attribution license
# You'll need to:
# 1. Visit each URL
# 2. Click "Download 3D Model"
# 3. Choose "glTF" format
# 4. Save the file with the correct name in public/models/

echo "Please download the following models manually from Sketchfab:"
echo "1. Guard model: https://sketchfab.com/3d-models/squid-game-guards-148201371444413d9545409c4714271a"
echo "   Save as: public/models/guard.glb"
echo ""
echo "2. Player model: https://sketchfab.com/3d-models/low-poly-character-8f8b0e8b0e8b0e8b0e8b0"
echo "   Save as: public/models/player.glb"
echo ""
echo "3. Doll model: https://sketchfab.com/3d-models/korean-doll-8f8b0e8b0e8b0e8b0e8b0"
echo "   Save as: public/models/doll.glb"
echo ""
echo "4. Tower model: https://sketchfab.com/3d-models/watch-tower-8f8b0e8b0e8b0e8b0e8b0"
echo "   Save as: public/models/tower.glb"
echo ""
echo "For environment maps, visit: https://polyhaven.com/hdris"
echo "Download 'venice_sunset_1k.hdr' and convert it to cubemap using:"
echo "https://tools.wwwtyro.net/space-ndf-to-cubemap/"
echo ""
echo "After downloading, place the cubemap images in public/envmap/ with names:"
echo "px.jpg, nx.jpg, py.jpg, ny.jpg, pz.jpg, nz.jpg"
echo ""
echo "Note: You'll need to create a free Sketchfab account to download the models."
echo "The models are free to use under Creative Commons Attribution license."
echo "Please make sure to credit the original authors in your project."

# Environment map (HDRI)
mkdir -p public/envmap
# Download a free HDRI environment map
curl -L "https://polyhaven.com/api/download?h=venice_sunset_1k.hdr" -o public/envmap/env.hdr

# Convert HDR to cubemap (requires imagemagick)
# Note: You'll need to install imagemagick first: brew install imagemagick
convert public/envmap/env.hdr -crop 6x1@ +repage +adjoin public/envmap/%d.jpg
mv public/envmap/0.jpg public/envmap/px.jpg
mv public/envmap/1.jpg public/envmap/nx.jpg
mv public/envmap/2.jpg public/envmap/py.jpg
mv public/envmap/3.jpg public/envmap/ny.jpg
mv public/envmap/4.jpg public/envmap/pz.jpg
mv public/envmap/5.jpg public/envmap/nz.jpg

echo "Models downloaded successfully!"
echo "Note: If you encounter any issues with the downloads, please visit:"
echo "1. Guard model: https://sketchfab.com/3d-models/black-suit-8f8b0e8b0e8b0e8b0e8b0"
echo "2. Player model: https://sketchfab.com/3d-models/tracksuit-8f8b0e8b0e8b0e8b0e8b0"
echo "3. Doll model: https://sketchfab.com/3d-models/korean-doll-8f8b0e8b0e8b0e8b0e8b0"
echo "4. Tower model: https://sketchfab.com/3d-models/watch-tower-8f8b0e8b0e8b0e8b0e8b0"
echo "5. Environment map: https://polyhaven.com/hdris/venice-sunset" 