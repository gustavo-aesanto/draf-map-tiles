<template>
  <div class="map-control">
    <button @click="$emit('zoomIn')">Zoom In</button>
    <button @click="$emit('zoomOut')">Zoom Out</button>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  zoomIn: [value: void]
  zoomOut: [value: void]
}>()
</script>

<style lang="css" scoped>
.map-control {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 10;

  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border: 1px solid gray;
}
</style>
