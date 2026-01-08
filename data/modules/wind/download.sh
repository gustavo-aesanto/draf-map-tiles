#! /bin/bash

# SETUP
GFS_EXHIBITION_DATE="20260107"
GFS_RESOLUTION="0p25"
GFS_CYCLE="00"

PARAMETERS="&var_VGRD=on&var_UGRD=on"
OUTDIR="wind"

levels='lev_925_mb=on lev_850_mb=on lev_500_mb=on lev_250_mb=on lev_10_m_above_ground=on'


./data/modules/download-from-gfs.sh $GFS_EXHIBITION_DATE  $GFS_RESOLUTION $GFS_CYCLE $PARAMETERS $OUTDIR "${levels}"