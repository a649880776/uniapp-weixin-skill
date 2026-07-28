const fs = require('fs')
const path = require('path')
const glob = require('glob')

const wxssDir = process.argv[2] || 'dist/build/mp-weixin'
const appWxss = path.join(wxssDir, 'app.wxss')
if (!fs.existsSync(appWxss)) {
  console.error(`app.wxss not found at ${appWxss}`)
  process.exit(1)
}

let appContent = fs.readFileSync(appWxss, 'utf-8')

// 1. build var map from :root{}
const varMap = {}
const rootMatch = appContent.match(/:root\{(.*?)\}/s)
if (rootMatch) {
  rootMatch[1].split(';').forEach(decl => {
    decl = decl.trim()
    if (decl.startsWith('--')) {
      const parts = decl.split(':', 1)
      const val = decl.slice(parts[0].length + 1).trim()
      varMap[parts[0].trim()] = val
    }
  })
}
console.log(`Found ${Object.keys(varMap).length} CSS variables in :root`)

// 2. remove @font-face blocks
let count = 0
while (appContent.includes('@font-face{')) {
  const start = appContent.indexOf('@font-face{')
  let depth = 1
  let i = start + '@font-face{'.length
  while (depth > 0 && i < appContent.length) {
    if (appContent[i] === '{') depth++
    else if (appContent[i] === '}') depth--
    i++
  }
  appContent = appContent.slice(0, start) + appContent.slice(i)
  count++
}
console.log(`Removed ${count} @font-face block(s)`)

// 3. replace var(--xxx) in app.wxss
const replaceVar = (css) => css.replace(/var\(--([\w-]+)(?:\s*,\s*([^)]+))?\)/g, (m, name, fallback) => {
  const full = '--' + name
  if (varMap[full]) return varMap[full]
  if (fallback) return fallback.trim()
  return m
})
appContent = replaceVar(appContent)

// 4. replace * selectors
appContent = appContent.replace(/\*\+\*/g, 'view+view')
appContent = appContent.replace(/\*\{box-sizing:border-box\}/g, 'view,scroll-view,swiper,page{box-sizing:border-box}')

fs.writeFileSync(appWxss, appContent)
console.log(`app.wxss size after fixes: ${fs.statSync(appWxss).size} bytes`)

// 5. fix all .wxss files
glob.sync(`${wxssDir}/**/*.wxss`).forEach(fpath => {
  let css = fs.readFileSync(fpath, 'utf-8')
  css = css.replace(/\.([\w-]+)\x5c\.([\w-]+)/g, '[class*="$1.$3"]')
  css = css.replace(/\.([\w-]+)\x5c\[(\w+)\x5c\]/g, '[class*="$1[$3]"]')
  css = css.replace(/\\/g, '')
  css = replaceVar(css)
  css = css.replace(/\*\+\*/g, 'view+view')
  css = css.replace(/\*\{box-sizing:border-box\}/g, 'view,scroll-view,swiper,page{box-sizing:border-box}')
  fs.writeFileSync(fpath, css)
})

console.log('WXSS 兼容修复完成！')
