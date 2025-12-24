#! /bin/bash

# SETUP 
# GFS_EXIBITION_DATE="20251216"
# GFS_RESOLUTION="0p25"
# GFS_CYCLE="00"

# PARAMETERS="&var_VGRD=on&var_UGRD=on"

# levels=("lev_925_mb=on" "lev_850_mb=on" "lev_500_mb=on" "lev_250_mb=on" "lev_10_m_above_ground=on")

GFS_EXIBITION_DATE=$1
GFS_RESOLUTION=$2
GFS_CYCLE=$3

PARAMETERS=$4
OUTDIR=$5

levels=($6)

TMP_DIR="tmp"
JSON_DATA_STORAGE="server/data"
TILES_DATA_STORAGE="server/tiles"

# CREATE DIRS
if [ ! -d $TMP_DIR ]; then
    mkdir $TMP_DIR
fi

if [ ! -d $JSON_DATA_STORAGE ]; then
    mkdir $JSON_DATA_STORAGE
fi

if  [ ! -d $TILES_DATA_STORAGE ]; then
    mkdir $TILES_DATA_STORAGE
fi

for forecast in {0..5}
do
    forecast="$(printf f%03d $forecast)"
    for level in "${levels[@]}"
    do
        GFS_URL="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_${GFS_RESOLUTION}.pl?dir=%2Fgfs.${GFS_EXIBITION_DATE}%2F${GFS_CYCLE}%2Fatmos&file=gfs.t${GFS_CYCLE}z.pgrb2.${GFS_RESOLUTION}.${forecast}${PARAMETERS}&${level}"

        # DOWNLOAD
        TMP_GRIB="${TMP_DIR}/tmp_${level}.grib"
        echo "======================================"
        echo "STARTING DOWNLOAD"
        echo "======================================"
        curl $GFS_URL -o $TMP_GRIB 

        # HANDLE WITH GRIB
        GFS_JSON_PATH="${JSON_DATA_STORAGE}/gfs/${OUTDIR}/${GFS_EXIBITION_DATE}/${GFS_CYCLE}/${forecast}"
        if [ ! -d $GFS_JSON_PATH ]; then
            mkdir -p ${GFS_JSON_PATH};
        fi
        
        FILE_PATH="${GFS_JSON_PATH}/${level}.json"
        SIMPLE_TMP_FILE="${TMP_DIR}/simple_tmp_${level}.grib"
        
        grib_set -r -s packingType=grid_simple "${TMP_GRIB}" "${SIMPLE_TMP_FILE}"
        printf "{ \"data\": `grib_dump -j "${SIMPLE_TMP_FILE}"` }" > $FILE_PATH

        # GENERATE IMAGE
        cd data
        npm run start $OUTDIR $FILE_PATH
        cd ..

        # GENERATE TILES
        TILE_OUTDIR="${TILES_DATA_STORAGE}/gfs/${OUTDIR}/${GFS_EXIBITION_DATE}/${level}/${forecast}"
        
        echo $TILE_OUTDIR
        rm -rf $TILE_OUTDIR
        gdal2tiles.py \
            --xyz --tiledriver=WEBP -p raster -z 3-5 -w leaflet \
            "${TMP_DIR}/image-tmp.webp" $TILE_OUTDIR

        # REMOVE TMP FILES
        rm $TMP_GRIB $SIMPLE_TMP_FILE "${TMP_DIR}/image-tmp.webp"

    done

done