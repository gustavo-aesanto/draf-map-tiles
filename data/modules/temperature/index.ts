/* Sharp */
import sharp from "sharp";

/* Node */
import fs from "fs";

import { transformEntriesToObject } from "../../sanitize/clean-grib-data";
import { createImageGradient, channels } from "./create-image";
import { findByParameterName } from "../../sanitize/find-by-parameter-name";

export type Variable = {
  Ni: number;
  Nj: number;
  values: Array<number>;
  minimum: number;
  maximum: number;
};

/* ENV */
const tmpDir = process.env.TMP_DIR;

export async function create(filePath: string) {
  const tmpJson = fs.readFileSync("../" + filePath, "utf8");
  const rawData = JSON.parse(tmpJson);

  const temperature: Variable = transformEntriesToObject(
    findByParameterName(rawData.data.messages, "Temperature ")
  );

  /* SETUP IMAGE */
  const imageDimensions = {
    width: temperature.Ni,
    height: temperature.Nj - 1,
  };

  const RGBA = createImageGradient({
    ...imageDimensions,
    data: temperature,
  });

  const image = sharp(RGBA, {
    raw: {
      ...imageDimensions,
      channels,
    },
  });

  await image
    .resize({
      width: imageDimensions.width * 4,
      height: imageDimensions.height * 4,
      fit: "contain",
    })
    .toFile(`${tmpDir}/image-tmp.webp`);
}
