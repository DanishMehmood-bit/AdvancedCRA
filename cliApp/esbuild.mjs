#!/usr/bin/env mode

import * as esbuild from "esbuild";
import * as fs from "fs";

const pkgJson = JSON.parse(fs.readFileSync("./package.json"));

await Promise.all([
  esbuild.build({
    entryPoints: ["advanced-cra.js"],
    bundle: true,
    outfile: "bin/advanced-cra-bundle.js",
    platform: "node",
    external: Object.keys(pkgJson.dependencies),
  }),
  esbuild.build({
    entryPoints: ["appReturns.js"],
    bundle: true,
    outfile: "bin/appReturns.js",
    platform: "node",
    external: Object.keys(pkgJson.dependencies),
  })
]);

