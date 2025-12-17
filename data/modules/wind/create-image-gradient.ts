import { Variable } from "./prepare";
import chroma from "chroma-js"

type CreateImageGradientParams = {
  width: number;
  height: number;
  data: Variable;
};

type GenerateColorGradientParams = {
  point: number;
  phaseRed: number;
  phaseGreen: number;
  phaseBlue: number;
};

export const channels = 3;

const colorGradient = chroma.scale("Spectral").domain([1,0]);

export function createImageGradient({
  width,
  height,
  data,
}: CreateImageGradientParams) {
  const { u, v } = data;
  const colorsRGBAPixelByPixel = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const k = y * width + ((x + width / 2) % width);

      const point = Math.sqrt(u.values[k] ** 2 + v.values[k] ** 2) / Math.sqrt(u.maximum**2 + v.maximum**2);
      
      const RGB = colorGradient(point).rgb();
      
      colorsRGBAPixelByPixel[i + 0] = RGB[0];
      colorsRGBAPixelByPixel[i + 1] = RGB[1];
      colorsRGBAPixelByPixel[i + 2] = RGB[2];
    }
  }

  return new Uint8Array(colorsRGBAPixelByPixel);
}
