// Tiny static file server for the deal finder app/ directory.
// Serves app/ at http://localhost:8080 (use --port for another port).
// Standard library only; no logging of requests, no directory listing.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(join(fileURLToPath(new URL(".", import.meta.url)), "app"));

const portArg = process.argv.indexOf("--port");
const port = portArg === -1 ? 8080 : Number(process.argv[portArg + 1]) || 8080;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const joined = resolve(join(appDir, normalize(decoded).replace(/^(\.\.[/\\])+/, "")));
  if (joined !== appDir && !joined.startsWith(appDir + sep)) return null;
  return joined;
}

const server = createServer((request, response) => {
  let path = safePath(request.url || "/");
  if (path === null) {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }
  if (existsSync(path) && statSync(path).isDirectory()) {
    path = join(path, "index.html");
  }
  if (!existsSync(path) || !statSync(path).isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type":
      CONTENT_TYPES[extname(path).toLowerCase()] || "application/octet-stream",
  });
  createReadStream(path).pipe(response);
});

server.listen(port, () => {
  console.log(`Serving app/ at http://localhost:${port}`);
});
