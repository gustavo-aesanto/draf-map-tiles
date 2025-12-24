import { Variable } from ".";
import chroma from "chroma-js";

type CreateImageGradientParams = {
  width: number;
  height: number;
  data: Variable;
};

export const channels = 3;

const colorGradient = chroma
  .scale(["#760f13", "#e81416", "#faeb36", "#79c314", "#487de7", "#4b369d", "#70369d"])
  .domain([328, 215]);

export function createImageGradient({
  width,
  height,
  data,
}: CreateImageGradientParams) {
  const colorsRGBAPixelByPixel = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const k = y * width + ((x + width / 2) % width);

      const point = data.values[k];

      const RGB = colorGradient(point).rgb();

      colorsRGBAPixelByPixel[i + 0] = RGB[0];
      colorsRGBAPixelByPixel[i + 1] = RGB[1];
      colorsRGBAPixelByPixel[i + 2] = RGB[2];
    }
  }

  return new Uint8Array(colorsRGBAPixelByPixel);
}
