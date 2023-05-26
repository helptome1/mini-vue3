// minimist解析命令行参数
const minimist = require('minimist');
// execa开启进程
const execa = require('execa');

// 获取执行命令时 打包的参数
const argv = minimist(process.argv.slice(2));
const target = argv._.length ? argv._[0] : 'reactivity';
const formats = argv.f || 'global'; // esm-bunlder, global cjs
const sourcemap = argv.s || false;

// 开启一个进程，执行脚本
execa(
  'rollup',
  [
    '--bundleConfigAsCjs', // 把es6转为CommonJS
    '-wc', //--watch --config
    '--environment',
    [`TARGET:${target}`, `FORMATS:${formats}`, sourcemap ? 'SOURCE_MAP:true' : ``].filter(Boolean).join(','),
  ],
  {
    stdio: `inherit` // 这个子进程的输出是在我们当前命令行中输出的
  }
);

// 执行流程 pnpm run dev -> node dev.js -> dev.js -> rollup打包 -> rollup.config.js
