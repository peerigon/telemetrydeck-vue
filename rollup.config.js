import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';

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
        file: 'dist/index.js',
        plugins: [terser()]
      }
    ],
    plugins: [
      typescript({
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
      del({ targets: 'dist/*' })
    ]
  }
]