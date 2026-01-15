import data from "../data/raw/gfs/wind/20260107-00-f002-lev_500_mb=on.json";
import { jsonToProtobuf, protobufToJson } from "./wind-data-converter.js";
import { Clean } from "./clean-data";
import { Compress } from "./compress";

const clean = new Clean();
const convert = new Compress();

// await convert.compressJsonWithBrotli(clean.formatVector(data.data.messages), 'wind-20260107-00-f002-500-mb');

await jsonToProtobuf(clean.formatVector(data.data.messages), "wind.pb.gz", {
  compress: true, // gzip
  quantize: true, // int16
});

// Carregar
const loaded = await protobufToJson("wind.pb.gz", {
  compressed: true,
  quantized: true,
});

console.log(loaded);
