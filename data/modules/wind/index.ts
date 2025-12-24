/* Sharp */
import sharp from "sharp";

/* Node */
import fs from "fs";

import { transformEntriesToObject } from "../../sanitize/clean-grib-data";
import { createImageGradient, channels } from "./create-image";
import { findByParameterName } from "../../sanitize/find-by-parameter-name";

type WindComponent = {
  Ni: number;
  Nj: number;
  values: Array<number>;
  minimum: number;
  maximum: number;
};

export type Variable = {
  u: WindComponent;
  v: WindComponent;
};

/* ENV */
const tmpDir = process.env.TMP_DIR;

export async function create(filePath: string) {
  const tmpJson = fs.readFileSync("../" + filePath, "utf8");
  const rawData = JSON.parse(tmpJson);

  const wind: Variable = {
    u: transformEntriesToObject(
      findByParameterName(rawData.data.messages, "u-component of wind ")
    ),
    v: transformEntriesToObject(
      findByParameterName(rawData.data.messages, "v-component of wind ")
    ),
  };

  /* SETUP IMAGE */
  const imageDimensions = {
    width: wind.u.Ni,
    height: wind.u.Nj - 1,
  };

  const RGBA = createImageGradient({
    ...imageDimensions,
    data: wind,
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
