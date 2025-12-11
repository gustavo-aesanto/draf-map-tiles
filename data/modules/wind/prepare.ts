/* Sharp */
import sharp from "sharp";

/* Node */
import fs from "fs";

import {
  transformEntriesToObject,
  Field,
} from "../../sanitize/clean-grib-data";
import { createImageGradient } from "./create-image-gradient";

type Data = Array<Array<Field>>;

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
const filePath = `${tmpDir}/tmp.json`;

const tmpJson = fs.readFileSync(filePath, "utf8");
const rawData = JSON.parse(tmpJson);

function findByParameterName(data: Data, parameterName: string) {
  return data.find((messages) =>
    messages.some(({ value }) => value === parameterName)
  );
}

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
    channels: 4,
  },
});

await image.toFile(`${tmpDir}/image-test.jpeg`);
