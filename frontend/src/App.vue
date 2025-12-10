<script setup></script>

<template>
  <div id="map"></div>
</template>

<script setup>
import L from "leaflet";
import "leaflet-rastercoords";
import { reactive, onMounted } from "vue";

const width = 1440;
const height = 720;
const imageDimensions = [width, height];

function setupLeaflet() {
  const map = L.map("map", {
    center: L.latLng(0, 0),
    noWrap: true,
  });

  L.tileLayer("/tiles/gfs/wind/current/{z}/{x}/{y}.png", {
    minZoom: 3,
    maxZoom: 4,
    crs: L.CRS.Simple,
  }).addTo(map);

  const rc = new L.RasterCoords(map, imageDimensions);

  map.setView(rc.unproject([width, height]), 1);
}

onMounted(() => {
  setupLeaflet();
});
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}

body {
  margin: 0;
}

.leaflet-tile-pane {
  filter: hue-rotate(45deg) !important;
}
</style>
