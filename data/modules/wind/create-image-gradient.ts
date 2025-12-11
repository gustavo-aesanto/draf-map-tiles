import { Variable } from "./prepare";

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

function generateColorGradient({
  point,
  phaseRed,
  phaseGreen,
  phaseBlue,
}: GenerateColorGradientParams) {
  const frequency = {
    red: 0.05,
    green: 0.18,
    blue: 0.2
  };
  const width = 255 / 2;
  const center = 255 / 2;

  const red = Math.sin(frequency.red * point + phaseRed) * width + center;
  const green = Math.sin(frequency.green * point + phaseGreen) * width + center;
  const blue = 255;

  return [red, green, blue];
}

export function createImageGradient({
  width,
  height,
  data,
}: CreateImageGradientParams) {
  const { u, v } = data;
  const colorsRGBAPixelByPixel = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const k = y * width + ((x + width / 2) % width);

      const point = Math.sqrt(u.values[k] ** 2 + v.values[k] ** 2);
      const RGBA = generateColorGradient({
        point,
        phaseRed: 0,
        phaseBlue: 0,
        phaseGreen: 5.9,
      });

      colorsRGBAPixelByPixel[i + 0] = RGBA[0];
      colorsRGBAPixelByPixel[i + 1] = RGBA[1];
      colorsRGBAPixelByPixel[i + 2] = RGBA[2];
      colorsRGBAPixelByPixel[i + 3] = 255;
    }
  }

  return new Uint8Array(colorsRGBAPixelByPixel);
}
