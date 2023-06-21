#!/usr/bin/env mode

import * as esbuild from "esbuild";
import * as fs from "fs";

const pkgJson = JSON.parse(fs.readFileSync("./package.json"));

await esbuild.build({
  entryPoints: ["advanced-cra.js"],
  bundle: true,
  outfile: "bin/advanced-cra-bundle.js",
  platform: "node",
  external: Object.keys(pkgJson.dependencies),
});
