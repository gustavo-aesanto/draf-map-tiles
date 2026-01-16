import { jsonToProtobuf, protobufToJson } from "./wind-data-converter.js";
import { Clean, Field } from "./clean-data";
import { Compress } from "./compress";

type Data = {
  data: {
    messages: Array<Array<Field>>;
  };
};

const clean = new Clean();
const compress = new Compress(
  "data/cleaned/gfs/wind",
  async (buffer, filename) => {
    const json = JSON.parse(buffer.toString());
    const cleanedJson = clean.formatVector(json.data.messages);
    await jsonToProtobuf(cleanedJson, filename);
  }
);
compress.start("data/raw/gfs/wind");
