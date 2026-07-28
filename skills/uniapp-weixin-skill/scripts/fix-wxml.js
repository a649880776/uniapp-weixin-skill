// 构建后修复 WXML 中转义双引号，配合 package.json 中 build:mp-weixin 命令使用
// 使用 Tailwind 任意值 + 动态 :class 时，产物可能含非法 \"，导致真机报错
const fs = require('fs')
const glob = require('glob')

const wxmlFiles = glob.sync('dist/build/mp-weixin/**/*.wxml')
wxmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8')
  content = content.replace(/\\"/g, "'")
  fs.writeFileSync(file, content)
})
console.log('WXML 转义修复完成！')
