#! /bin/bash
HOUR=$(date +%H)
CYCLE_NUM=$((10#$HOUR / 6 * 6))

GFS_EXIBITION_DATE=$(date +"%Y%m%d")
GFS_RESOLUTION=$1
GFS_CYCLE=$(printf "%02d" "$CYCLE_NUM")

PARAMETERS=$2
OUTDIR=$3

levels=($6)

TMP_DIR="tmp"
JSON_DATA_STORAGE="data/raw"

# CREATE DIRS
if [ ! -d $TMP_DIR ]; then
    mkdir $TMP_DIR
fi

if [ ! -d "data" ]; then
    mkdir "data"
fi

if [ ! -d $JSON_DATA_STORAGE ]; then
    mkdir $JSON_DATA_STORAGE
fi

# HANDLE WITH GRIB
GFS_JSON_PATH="${JSON_DATA_STORAGE}/gfs/${OUTDIR}"

if [ ! -d $GFS_JSON_PATH ]; then
    mkdir "${JSON_DATA_STORAGE}/gfs"
    mkdir $GFS_JSON_PATH
fi

for forecast in {0..3}
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
        
        FILE_PATH="${GFS_JSON_PATH}/${GFS_EXIBITION_DATE}-${GFS_CYCLE}-${forecast}-${level}.json"
        SIMPLE_TMP_FILE="${TMP_DIR}/simple_tmp_${level}.grib"
        
        grib_set -r -s packingType=grid_simple "${TMP_GRIB}" "${SIMPLE_TMP_FILE}"
        printf "{ \"data\": `grib_dump -j "${SIMPLE_TMP_FILE}"` }" > $FILE_PATH
        
        # REMOVE TMP FILES
        rm $TMP_GRIB $SIMPLE_TMP_FILE
        
        echo "======================================"
        echo "DOWNLOAD COMPLETED"
        echo "======================================"
    done
    
done