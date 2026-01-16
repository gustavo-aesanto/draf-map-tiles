import fs from "fs";
import { readdir } from "node:fs/promises";

export class Compress {
  private async compressFunction(buffer: Buffer, filename: string) {}
  private toDir: string;

  constructor(
    toDir: string,
    compressFunction: (buffer: Buffer, filename: string) => Promise<void>
  ) {
    this.compressFunction = compressFunction;
    this.toDir = toDir;
  }

  private stats = {
    successful: [],
    failed: [],
  };

  public async start(fromDir: string) {
    const fromDirPathArray = fromDir.split("/");
    const prefix = fromDirPathArray[fromDirPathArray.length - 1];
    const rootDirname = import.meta.dirname.split("/").slice(0, -1).join("/");
    const dirname = `${rootDirname}/${fromDir}`;
    const filenames = await this.getFilenamesFromDir(dirname);

    for (let filename of filenames) {
      const newFilename = this.createFilename(filename, prefix);
      const outputPath = `${this.toDir}/${newFilename}`;
      try {
        const jsonBuffer = fs.readFileSync(`${dirname}/${filename}`);
        await this.compressFunction(jsonBuffer, outputPath);
        this.stats.successful.push({
          filename: newFilename,
          path: outputPath,
        });
      } catch (error) {
        this.stats.failed.push({ filename, path: `${fromDir}/${filename}` });
        console.log(error);
      }
    }

    fs.writeFileSync("tmp/20260116-1437.json", JSON.stringify(this.stats));
  }

  private createFilename(filename: string, prefix: string) {
    let [date, cycle, exhibitionHour, level] = filename.split("-");

    exhibitionHour = exhibitionHour.slice(1);
    level = level.slice(3).replace("=on", "");

    if (level.includes("10_m_above")) {
      level = "surface";
    }

    if (level.includes("_")) {
      level = level.replace(/_/g, "");
    }

    if (level.includes(".json")) {
      level = level.replace(".json", "");
    }

    return `${prefix}-${date}-${cycle}-${exhibitionHour}-${level}.pb.gz`;
  }

  private async getFilenamesFromDir(dir: string) {
    let filenames = [];
    try {
      const files = await readdir(dir);
      for (let file of files) {
        filenames.push(file);
      }
    } catch (err) {
      console.error(err);
    }

    return filenames;
  }
}
