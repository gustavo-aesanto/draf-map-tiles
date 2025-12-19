import L from "leaflet";
import "leaflet-rastercoords";

import { onMounted, reactive } from "vue";

export function useMap({ url, dimensions }) {
  const state = reactive({
    date: "20251216",
    level: "lev_10_m_above_ground=on",
    forecast: "f000",
  });

  const imageDimensions: [number, number] = [
    dimensions.width,
    dimensions.height,
  ];
  const shadedLayer = L.tileLayer(url, {
    ...state,
    minZoom: 3,
    maxZoom: 5,
  });

  function setupLeaflet() {
    const map = L.map("map", {
      center: L.latLng(0, 0),
      crs: L.CRS.Simple,
    });

    shadedLayer.addTo(map);

    const rc = new L.RasterCoords(map, imageDimensions);

    map.setView(rc.unproject(imageDimensions), 1);
  }

  function setLayerOptions({ date, level, forecast }) {
    shadedLayer.setUrl(
      `/tiles/gfs/wind/${date}/${level}/${forecast}/{z}/{x}/{y}.webp`
    );
    console.log(forecast);
  }

  function play() {
    let counter = 0;
    const setLayerOptionsRunnerID = setInterval(() => {
      if (counter === 5) {
        clearInterval(setLayerOptionsRunnerID);
      }

      (state.forecast = `f${counter.toString().padStart(3, "0")}`), update();
      counter++;
    }, 1500);
  }

  function update() {
    setLayerOptions(state);
  }

  onMounted(() => {
    setupLeaflet();
  });

  return { setLayerOptions, state, play, update };
}
