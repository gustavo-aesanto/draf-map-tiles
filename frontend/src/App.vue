<template>
  <nav class="control">
    <div class="form-field">
      <label for="level">Level</label>
      <select v-model="map.state.level" id="level">
        <option v-for="value in SELECT_OPTIONS.level" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>

    <div class="form-field">
      <label for="date">Data</label>
      <select v-model="map.state.date" id="date">
        <option v-for="value in SELECT_OPTIONS.date" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>
    
    <div class="form-field">
      <label for="forecast">Horário de Exibição</label>
      <select v-model="map.state.forecast" id="forecast">
        <option v-for="value in SELECT_OPTIONS.forecast" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>

    <button @click="map.update">Atualizar</button>
    <button @click="map.play">Play</button>
  </nav>
  <div id="map"></div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { useMap } from "@/composables/use-map";


const map = useMap({
  url: `/tiles/gfs/wind/{date}/{level}/{forecast}/{z}/{x}/{y}.webp`,
  dimensions: {
    width: 1440,
    height: 720
  }
})

const SELECT_OPTIONS = {
  date: ["20251217", "20251216"],
  level: ["lev_950_mb=on", "lev_800_mb=on", "lev_250_mb=on", "lev_10_m_above_ground=on"],
  forecast: Array.from({length: 6}, (_, key) => `f${key.toString().padStart(3, "0")}`)
}
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
  height: fit-content;
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
