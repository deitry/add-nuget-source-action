// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = [{
  input: 'src/main.ts',

  output: {
    esModule: true,
    file: 'dist/main.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [typescript(), nodeResolve({ preferBuiltins: true }), commonjs()]
},
{
  input: 'src/post.ts',

  output: {
    esModule: true,
    file: 'dist/post.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [typescript(), nodeResolve({ preferBuiltins: true }), commonjs()]
},
{
  input: 'src/common.ts',

  output: {
    esModule: true,
    file: 'dist/common.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [typescript(), nodeResolve({ preferBuiltins: true }), commonjs()]
},
{
  input: 'src/dotnet.ts',

  output: {
    esModule: true,
    file: 'dist/dotnet.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [typescript(), nodeResolve({ preferBuiltins: true }), commonjs()]
}]

export default config
