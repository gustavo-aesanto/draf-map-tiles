import { create as wind } from "./modules/wind/index";
import { create as temperature } from "./modules/temperature/index";

const outDir = process.argv[2];
const filePath = process.argv[3];

const variables = {
  wind,
  temperature,
};

await variables[outDir](filePath);
