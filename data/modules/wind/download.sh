# DOWNLOAD 
GFS_DATE="current"

# GENERATE IMAGE
pnpm run-wind

# GENERATE TILES
rm -rf ../frontend/tiles/gfs/wind/${GFS_DATE}
gdal2tiles.py --xyz -p raster -z 0-4 -w leaflet ../tmp/image-test.jpeg ../frontend/tiles/gfs/wind/${GFS_DATE}

# REMOVE TMP FILES
rm ../tmp/image-test.jpeg