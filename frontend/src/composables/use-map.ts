import L from "leaflet";
import "leaflet-rastercoords";

import { onMounted, reactive } from "vue";

export function useMap({ url, dimensions }) {
  const state = reactive({
    date: "20251216",
    level: "lev_925_mb=on",
    forecast: "f000",
  });

  const imageDimensions: [number, number] = [
    dimensions.width,
    dimensions.height,
  ];
  let shadedLayer = null;

  function setupLeaflet() {
    const map = L.map("map", {
      center: L.latLng(0, 0),
      crs: L.CRS.Simple,
    });

    const rc = new L.RasterCoords(map, imageDimensions);
    var marker = new L.Marker(rc.unproject([1440, 720]));
    marker.addTo(map);

    shadedLayer = L.tileLayer(url, {
      ...state,
      minZoom: 4,
      maxZoom: 5,
      noWrap: true,
      bounds: rc.getMaxBounds(),
      maxNativeZoom: rc.zoomLevel(),
    });

    shadedLayer.addTo(map);

    map.setView(rc.unproject([90, 460]), 4);
  }

  function setLayerOptions({ date, level, forecast }) {
    console.log(date, level, forecast)
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
