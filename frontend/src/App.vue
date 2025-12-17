<template>
  <nav class="control">
    <div class="form-field">
      <label for="level">Level</label>
      <select v-model="form.level" id="level">
        <option v-for="value in SELECT_OPTIONS.level" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>

    <div class="form-field">
      <label for="date">Data</label>
      <select v-model="form.date" id="date">
        <option v-for="value in SELECT_OPTIONS.date" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>
  </nav>
  <div id="map"></div>
</template>

<script setup>
import L from "leaflet";
import "leaflet-rastercoords";
import { reactive, onMounted } from "vue";

const width = 1440;
const height = 720;
const imageDimensions = [width, height];

const form = reactive({
  date: "20251216",
  level: "lev_800_mb=on"
})

const SELECT_OPTIONS = {
  date: ["20251217", "20251216"],
  level: ["lev_950_mb=on", "lev_800_mb=on", "lev_250_mb=on", "lev_10_m_above_ground=on"]
}



function setupLeaflet() {
  const map = L.map("map", {
    center: L.latLng(0, 0),
    noWrap: true,
  });

  L.tileLayer(`/tiles/gfs/wind/${form.date}/${form.level}/{z}/{x}/{y}.webp`, {
    minZoom: 3,
    maxZoom: 5,
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

.control {
  width: 200px;
  height: 100px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10000;
  background-color: azure;
  border: 1px solid gray;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px;
  padding: 10px;
}
.form-field {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
