<template>
  <nav class="control">
    <FormField
      id="variable"
      label="Variável"
      :options="SELECT_OPTIONS.variables"
      v-model="map.state.variable"
    />

    <FormField
      id="level"
      label="Nível"
      :options="SELECT_OPTIONS.levels"
      v-model="map.state.level"
    />

    <FormField
      id="date"
      label="Data"
      :options="SELECT_OPTIONS.dates"
      v-model="map.state.date"
    />

    <FormField
      id="forecast"
      label="Horário de Exibição"
      :options="SELECT_OPTIONS.forecasts"
      v-model="map.state.forecast"
    />

    <FormField
      id="speed"
      label="Delay de animação (ms)"
      :options="SELECT_OPTIONS.speeds"
      v-model="map.state.animationTime"
    />

    <button @click="map.update">Atualizar</button>
    <button @click="map.play">Play</button>
  </nav>
  <div id="map"></div>
</template>

<script setup>
import { useMap } from "@/composables/use-map";

import FormField from "./components/FormField.vue";
import { computed } from "vue";

const map = useMap({
  dimensions: {
    width: 1440,
    height: 720,
  },
});

  const SELECT_OPTIONS = computed(() => {
    const selectedVariableOptions = map.options.value[map.state.variable];

    const variables = Object.keys(map.options.value);
    const dates = selectedVariableOptions.reduce((acc, curr) => {
      if (acc.includes(curr.date)) return acc;
      return [...acc, curr.date];
    }, []);
    const levels = selectedVariableOptions.map((option) => option.level);
    const forecasts = selectedVariableOptions[0]
      ? selectedVariableOptions[0].forecasts
      : [];

    return {
      variables,
      dates,
      levels,
      forecasts,
      speeds: [1500, 750, 325],
    };
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
