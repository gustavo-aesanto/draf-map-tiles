import axios from "axios";
import L from "leaflet";
import "leaflet-rastercoords";

import { computed, onMounted, reactive, ref } from "vue";

type Options = Record<
  "temperature" | "wind",
  Array<{
    date: string;
    level: string;
    forecasts: string[];
  }>
>;

export function useMap({ dimensions }) {
  const API_URL = import.meta.env.VITE_TILES_URL;
  const options = ref<Options>({
    temperature: [
      {
        date: "",
        forecasts: [],
        level: "",
      },
    ],
    wind: [
      {
        date: "",
        forecasts: [],
        level: "",
      },
    ],
  });

  async function getOptions() {
    const { data } = await axios.get(`${API_URL}/options`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    });
    options.value = data;
  }

  const state = reactive({
    variable: "wind",
    date: "20251216",
    level: "lev_925_mb=on",
    forecast: "f000",
    animationTime: 1500,
  });

  const imageDimensions: [number, number] = [
    dimensions.width,
    dimensions.height,
  ];

  let map = null;
  let shadedLayer = null;
  let rc = null;

  const layerOptions = {
    minZoom: 4,
    maxZoom: 5,
    noWrap: true,
  };

  const url = `${API_URL}/tiles/gfs/{variable}/{date}/{level}/{forecast}/{z}/{x}/{y}.webp`;

  function setupLeaflet() {
    map = L.map("map", {
      center: L.latLng(0, 0),
      crs: L.CRS.Simple,
    });

    rc = new L.RasterCoords(map, imageDimensions);
    layerOptions['bounds'] = rc.getMaxBounds();

    var marker = new L.Marker(rc.unproject([1440, 720]));
    marker.addTo(map);

    shadedLayer = L.tileLayer(url, {
      ...state,
      ...layerOptions,
    });

    shadedLayer.addTo(map);

    map.setView(rc.unproject([90, 460]), 1);
  }

  function setLayerOptions(state) {
    const layer = L.tileLayer(url, {
      ...state,
      ...layerOptions,
    });

    map.addLayer(layer);

    if (shadedLayer) {
      map.once("rendercomplete", () => {
        map.removeLayer(shadedLayer);
        shadedLayer = layer;
      });
    }
  }

  function play() {
    let counter = 0;
    const setLayerOptionsRunnerID = setInterval(() => {
      if (counter === options.value[state.variable][0].forecasts.length - 1) {
        clearInterval(setLayerOptionsRunnerID);
      }

      (state.forecast = `f${counter.toString().padStart(3, "0")}`), update();
      counter++;
    }, state.animationTime);
  }

  function update() {
    setLayerOptions(state);
  }

  onMounted(() => {
    setupLeaflet();
    getOptions();
  });

  return { setLayerOptions, state, play, update, options };
}
