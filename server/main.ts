import fastify from "fastify";
import path from "node:path";
import { readdir } from "fs/promises";
import { PathLike } from "node:fs";
import cors from "@fastify/cors";

type Options = any;

const app = fastify({ logger: true });
app.register(cors, {
  origin: true,
});

// Source - https://stackoverflow.com/a
// Posted by Nicky McCurdy, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-23, License - CC BY-SA 4.0

const getDirectories = async (source: PathLike) =>
  (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

app.get("/options", async (_, reply) => {
  const baseUrl = "tiles/gfs";
  let response: Options = {};

  try {
    const variables = await getDirectories(baseUrl);

    for (let variable of variables) {
      const dates = await getDirectories(baseUrl + `/${variable}`);

      response[variable] = [];

      for (let date of dates) {
        const levels = await getDirectories(baseUrl + `/${variable}/${date}`);

        for (let level of levels) {
          const forecasts = await getDirectories(
            baseUrl + `/${variable}/${date}/${level}`
          );

          response[variable].push({
            date,
            level,
            forecasts,
          });
        }
      }
    }
  } catch (err) {
    throw err;
  }

  console.log(response);
  return reply.send(response);
});

app.register(require("@fastify/static"), {
  root: path.join(__dirname, "tiles"),
  prefix: "/tiles/",
  constraints: {},
});

app.listen({ port: 8000 }, (err: any, address: string) => {
  if (err) throw err;
  console.log(`Server is now listening ${address}`);
});
