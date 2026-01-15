import zlib from "node:zlib";
import fs from "fs";

export class Compress {
  public async compressJsonWithBrotli(json: any, fileName: string) {
    const compressed = zlib.brotliCompressSync(JSON.stringify(json), {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 8,
      },
    });

    fs.writeFileSync(`data/clean/${fileName}.json.br`, compressed);
  }
}
