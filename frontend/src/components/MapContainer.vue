<template>
  <main class="map-container">
    <canvas class="map-shaded" id="map-container"></canvas>
    <canvas class="map-borders"></canvas>
    <MapControl @zoom-in="zoomIn" @zoom-out="zoomOut" />
  </main>
</template>

<script lang="ts" setup>
import { useMap } from '@/composables/use-map'
import MapControl from './MapControl.vue'

const { zoomIn, zoomOut } = useMap('#map-container')
</script>

<style scoped lang="css">
.map-container {
  width: 100dvw;
  height: 100dvh;
  overflow-y: hidden;
}
</style>
