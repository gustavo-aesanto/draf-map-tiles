# SETUP 
GFS_EXIBITION_DATE="20251211"
GFS_FORECASTING="f000"
GFS_RESOLUTION="0p25"
GFS_CYCLE="00"

LEVEL="lev_10_m_above_ground=on"
SUB_REGION=""
PARAMETERS="&var_VGRD=on&var_UGRD=on"

GFS_URL="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_${GFS_RESOLUTION}.pl?dir=%2Fgfs.${GFS_EXIBITION_DATE}%2F${GFS_CYCLE}%2Fatmos&file=gfs.t${GFS_CYCLE}z.pgrb2.${GFS_RESOLUTION}.${GFS_FORECASTING}${PARAMETERS}&${LEVEL}"

TMP_DIR="tmp"

# DOWNLOAD
TMP_GRIB="${TMP_DIR}/tmp.grib"

curl "${GFS_URL}" -o "${TMP_GRIB}"

# HANDLE WITH GRIB
grib_set -r -s packingType=grid_simple "${TMP_GRIB}" "${TMP_DIR}/simple_tmp.grib"
printf "{ \"data\": `grib_dump -j "${TMP_DIR}/simple_tmp.grib"` }" > "${TMP_DIR}/tmp.json"

# GENERATE IMAGE
cd data
npm run run-wind
cd ..

# GENERATE TILES
rm -rf frontend/tiles/gfs/wind/${GFS_EXIBITION_DATE}
gdal2tiles.py --xyz -p raster -z 0-4 -w leaflet "${TMP_DIR}/image-test.jpeg" frontend/tiles/gfs/wind/${GFS_EXIBITION_DATE}

# REMOVE TMP FILES
rm "${TMP_DIR}/simple_tmp.grib" "${TMP_DIR}/tmp.grib" 