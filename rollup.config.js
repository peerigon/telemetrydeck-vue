import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: "index.ts",
    external: ["@telemetrydeck/sdk"],
    output: [
      {
        format: "esm",
        file: "dist/index.mjs",
        exports: "named",
        plugins: [terser()],
      },
      {
        format: "cjs",
        file: "dist/index.cjs",
        exports: "named",
        plugins: [terser()],
      },
    ],
    plugins: [
      del({ targets: "dist/*" }),
      peerDepsExternal(),
      typescript({
        tsconfig: "tsconfig.build.json",
        check: false,
        useTsconfigDeclarationDir: true,
      }),
      nodeResolve(),
      commonjs(),
    ],
  },
];
