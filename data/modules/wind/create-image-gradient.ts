import { Variable } from "./prepare";

type CreateImageGradientParams = {
  width: number;
  height: number;
  data: Variable;
};

let τ = 2 * Math.PI;

function colorInterpolator(start, end) {
  let r = start[0],
    g = start[1],
    b = start[2];
  let Δr = end[0] - r,
    Δg = end[1] - g,
    Δb = end[2] - b;
  return function (i, a) {
    return [
      Math.floor(r + i * Δr),
      Math.floor(g + i * Δg),
      Math.floor(b + i * Δb),
      a,
    ];
  };
}

/**
 * Produces a color style in a rainbow-like trefoil color space. Not quite HSV, but produces a nice
 * spectrum. See http://krazydad.com/tutorials/makecolors.php.
 *
 * @param hue the hue rotation in the range [0, 1]
 * @param a the alpha value in the range [0, 255]
 * @returns {Array} [r, g, b, a]
 */
function sinebowColor(hue, a) {
  // Map hue [0, 1] to radians [0, 5/6τ]. Don't allow a full rotation because that keeps hue == 0 and
  // hue == 1 from mapping to the same color.
  let rad = (hue * τ * 5) / 6;
  rad *= 0.75; // increase frequency to 2/3 cycle per rad

  let s = Math.sin(rad);
  let c = Math.cos(rad);
  let r = Math.floor(Math.max(0, -c) * 255);
  let g = Math.floor(Math.max(s, 0) * 255);
  let b = Math.floor(Math.max(c, 0, -s) * 255);
  return [r, g, b, a];
}

let BOUNDARY = 0.45;
let fadeToWhite = colorInterpolator(sinebowColor(1.0, 0), [255, 255, 255]);

/**
 * Interpolates a sinebow color where 0 <= i <= j, then fades to white where j < i <= 1.
 *
 * @param i number in the range [0, 1]
 * @param a alpha value in range [0, 255]
 * @returns {Array} [r, g, b, a]
 */
function extendedSinebowColor(i, a) {
  return i <= BOUNDARY
    ? sinebowColor(i / BOUNDARY, a)
    : fadeToWhite((i - BOUNDARY) / (1 - BOUNDARY), a);
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
      const i = (y * width + x) * 3;
      const k = y * width + ((x + width / 2) % width);

      const RGBA = extendedSinebowColor(Math.min(u.values[k], 100) / 100, 255);

      colorsRGBAPixelByPixel[i + 0] = RGBA[0];
      colorsRGBAPixelByPixel[i + 1] = RGBA[1];
      colorsRGBAPixelByPixel[i + 2] = RGBA[2];
    }
  }

  return new Uint8Array(colorsRGBAPixelByPixel);
}
