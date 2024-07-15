import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'esm',
        file: 'dist/index.mjs',
        plugins: [terser()]
      },
      {
        format: 'cjs',
        file: 'dist/index.cjs',
        plugins: [terser()]
      }
    ],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.node.json',
        check: false,
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: true,
            declaration: true,
            declarationMap: true,
          }
        }
      }),
      peerDepsExternal(),
      nodeResolve(),
      commonjs(),
      del({ targets: 'dist/*' })
    ]
  }
]