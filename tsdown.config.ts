import { defineConfig } from "tsdown/config";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  tsconfig: "tsconfig.build.json",
  sourcemap: false,
  clean: true,
  minify: true,
  target: "es2020",
  deps: {
    neverBundle: ["@telemetrydeck/sdk", "vue"],
  },
  outputOptions: {
    exports: "named",
  },
  outExtensions({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".mjs",
    };
  },
});
