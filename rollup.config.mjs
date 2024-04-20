import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }
export default {
  input: 'src/index.ts',
  output: [
    // 1.cjs ->commonJs规范
    {
      format: 'cjs',
      file: pkg.main
    },
    // 2.esm ->esModule规范
    {
      format: 'es',
      file: pkg.module
    }
  ],
  plugins: [typescript()]
}
