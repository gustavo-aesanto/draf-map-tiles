import { create as wind } from "./modules/wind/index";

const outDir = process.argv[2];
const filePath = process.argv[3];

const variables = {
  wind,
};

await variables[outDir](filePath);
