import typescript from 'rollup-plugin-typescript2';
// import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import path from 'path';
// 配置
const packageFormats = process.env.FORMATS && process.env.FORMATS.split(',');
const sourcemap = process.env.SOURCE_MAP;

// 1.需要根据target找到要打包的目录
const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET); // 打包的入口
const resolve = (p) => path.resolve(packageDir, p); // 以打包的目录解析文件
const name = path.basename(packageDir);

// 拿到packages目录下的package.json文件
const pkg = require(resolve('package.json'));

// 打包配置
const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife'
  }
};
// ------------------ 打包的文件类型，global，cmj等。
// 稍后打包所有文件可能不会有packageFormats的值。
const packageConfigs = packageFormats || pkg.buildOptions.formats;

// 创建config打包文件。
function createConfig(format, output) {
  output.sourcemap = sourcemap; // 添加sourcemap
  output.exports = 'named';
  let external = []; // 哪些模块不需要打包
  if (format === 'global') {
    output.name = pkg.buildOptions.name;
  } else {
    external = [...Object.keys(pkg.dependencies)];
  }
  return {
    input: resolve(`src/index.ts`),
    output,
    external,
    plugins: [json(), typescript(), nodeResolve(), commonjs()]
  };
}

// 返回数组，会进行依次打包
export default packageConfigs.map((format) => createConfig(format, outputConfig[format]));
