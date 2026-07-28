---
name: uni-mp-troubleshoot
description: >-
  当项目是 uni-app 且目标平台包含 mp-weixin（微信小程序）时使用；
  在遇到编译报错、真机白屏、样式错乱、API 不生效、
  iOS/Android 差异、生命周期时序问题时加载本 skill 进行排查。
metadata:
  opencode/slash: "true"
---


# uni-app 微信小程序排错 Skill


uni-app 编译到微信小程序时，由于**小程序双线程架构**
（逻辑层 JS ↔ 视图层 WXML，通过 setData 通信，禁用 DOM），
H5 正常的代码在小程序端经常翻车。排查任何问题前，先确认属于哪一类：


## 一、架构级认知（解释 80% 的怪现象）


小程序是"请求页面帮我变"，不是"命令页面怎么变"：
- 逻辑层和视图层完全隔离，只能通过 setData 传 JSON 数据
- JS 不能直接操作 DOM，UI 更新是异步的
- **能用状态驱动就用状态驱动，避免命令式 ref 调用子组件方法**


由此引发的高频现象：
| 现象 | 根因 |
|---|---|
| v-show 在 table 的 th/td 不生效 | 视图结构不重算，改用 v-if |
| $refs 调用子组件方法无效 | 组件实例未 ready，$nextTick 也不够；改用 :visible + @close |
| input 值回写失败 | 组件内部 state 优先，需 :controlled="true" |
| 深层对象属性更新不生效 | 用 this.$set 或不可变更新 this.list = this.list.map(...) |


## 二、生命周期与时序


- **网络状态监听** wx/uni.onNetworkStatusChange 必须写在 onLoad，不能写 mounted；且只能在真机验证，开发者工具不生效
- **接口请求放在 onShow 最佳**（返回页面需刷新数据的场景）；如果依赖 onLoad 参数，先存起来，在 onShow 里发起请求
- onLoad 与 onShow 执行顺序：onLoad 在页面创建时触发，onShow 在每次页面显示时触发
- 组件 mounted 可能早于页面 onReady，操作 DOM/Canvas 需用 this.$nextTick


## 三、样式与布局坑


- **全屏覆盖**：设 100% 无效，需要在里面加一层 view 并设置宽高为 vw/vh
- **margin-bottom 在 iOS 失效**：position:fixed 元素遮挡场景下，底部加一个空白 view 撑高度
- **iOS 时间格式化 Invalid Date**：时间格式带 "-" 号会挂，先转成 "MM/DD HH:mm" 等格式再 dayjs 处理
- **px 和 rpx 相加计算不准**（吸顶场景）：用 calc 动态计算，结合 statusBarHeight
- **checkbox/radio 样式**：原生组件，样式只能在 App.vue 里全局改
- **text-align:end 在真机失效**：input 输入框改用其他对齐方式确保输入时光标位置正确
- **uni-popup 遮罩下页面滚动**：需在真机上验证修复效果
- **backdrop-filter 不渲染**：微信小程序渲染引擎不支持，用 `background: rgba(...)` 替代玻璃拟态效果


## 四、API 与运行时差异


- **fetch / FormData / window / document 在小程序里不存在**，静默失败，必须用 uni.request 等
- 微信小程序本地存储：单个 key 上限 1MB，总空间 10MB，超限同步 API 直接报错
- **动态引入 JS 脚本不支持**（不能像 web 端一样写 script 标签引入）
- button 的 :disabled="arr.length === 0" 写法在小程序无效，需用计算属性返回布尔值
- AppSecret 绝不能写前端，必须通过后端 code 换 openid/session_key；所有请求走 HTTPS


## 五、编译与环境


- Node.js 建议 14.x–18.x LTS；依赖用 rm -rf node_modules && npm install 重装
- 微信开发者工具需开启"服务端口"，并在 HBuilderX 配置正确路径
- 条件编译嵌套不要超 5 层；静态资源用相对路径，不要用 /static/xxx 绝对路径
- 读取 package.json 中声明的环境变量：必须通过自定义命令运行（如 npm run weixin-test），不能用"运行到小程序模拟器"菜单，否则 process.env.VUE_APP_* 为 undefined


## 六、真机调试专项


真机调试报错常见于三类：
1. **iOS 白屏**：真机调试版本过旧 / WXML 渲染异常 / 缓存残留 → 升级调试工具、检查数据绑定、清缓存
2. **AppSecret 明文暴露**：敏感操作必须移到服务端
3. **HTTP 协议不合规**：自定义域名配有效 SSL 证书


## 七、样式安全规则（编码约束）

### 选择器白名单
- **只允许**使用 Class 选择器（`.header`、`.btn-primary`）
- **禁止**以下选择器：ID 选择器 `#id`、标签选择器 `div`/`span`/`p`、属性选择器 `[type=text]`、通用选择器 `*`
- 旧代码中见到上述选择器，必须主动警告并重写为 Class

### @font-face
- **禁止**直接使用 `@font-face`（WXSS 不支持）
- 替代方案：图标字体转 Base64 内联到 CSS；艺术字体用 `uni.loadFontFace({ family, source: 'url(...)' })` 动态加载

### 全局主题/换肤
- **禁止**使用 CSS 变量 `var(--xxx)` 做全局主题（低版本微信客户端不兼容）
- 替代方案：动态 Class + 条件样式。`App.vue` 绑定 `:class="['app-root', 'theme-' + theme]"`，样式文件定义 `.theme-light .header {}` / `.theme-dark .header {}`

### ::v-deep 样式穿透
- 修改子组件（尤其是第三方 UI 库）样式时**必须使用** `::v-deep`
- 禁止使用 `>>>`、`/deep/`

### 原子化 CSS 类名转义
- 若使用 Tailwind / UnoCSS 原子化类名（如 `w-[30px]`），必须配置转义工具：
  - `weapp-tailwindcss` 或 `unocss-preset-weapp`
- **未安装时**主动提示安装并给出配置指令

### 平台特有样式与路径
- 平台特有样式必须放在条件编译块内：
  ```scss
  /* #ifdef MP-WEIXIN */
  ...
  /* #endif */
  ```
- 样式文件引用路径统一以 `~@/` 别名开头

## 八、构建兜底与主动防御

### 构建修复脚本二件套（必须主动生成）

检测到项目使用了 Tailwind 任意值或原子化 CSS 时，**必须主动生成**以下两个脚本，并**提示用户修改** `package.json` 的 `build:mp-weixin` 命令，串联执行：

| 脚本 | 作用范围 | 修复内容 |
|---|---|---|
| [`scripts/fix-wxss.js`](scripts/fix-wxss.js) | `.wxss` | `*` 选择器、`@font-face`、`var()`、转义类名 |
| [`scripts/fix-wxml.js`](scripts/fix-wxml.js) | `.wxml` | 非法转义双引号 `\"` |

```json
{
  "scripts": {
    "build:mp-weixin": "uni build -p mp-weixin && node scripts/fix-wxss.js && node scripts/fix-wxml.js"
  }
}
```

> 脚本位置：`scripts/fix-wxss.js`、`scripts/fix-wxml.js`（与 SKILL.md 同目录）

### styleIsolation 配置
频繁遇到样式穿透问题时，可配置 `styleIsolation` 来减少穿透代码量：
```json
// pages.json
{
  "globalStyle": {
    "styleIsolation": "shared"
  }
}
```
注意：这会放宽样式隔离，需谨慎使用。

## 九、排查与自查工作流

### 排查顺序
收到报错时，按此顺序排查：
1. 看控制台报错 → 定位文件行号
2. 判断是否使用了浏览器专有 API（fetch/window/document）
3. 判断是否 H5 代码未用 #ifdef MP-WEIXIN 隔离
4. 检查 pages.json 路径、组件注册
5. 用真机调试抓运行时堆栈
6. 逐个注释可疑代码块缩小范围

### AI 交付代码前自查 6 项
- □ 选择器：是否只有 Class？有没有 ID / 标签 / 属性 / 通配符？
- □ 主题：是否意外使用了 `var()` 做全局换肤？
- □ 字体：是否写了 `@font-face`？是否改用了 `uni.loadFontFace` 或 Base64？
- □ 穿透：修改子组件样式时，是否加了 `::v-deep`？
- □ 类名转义：如果用了原子化类名，是否配置了转义工具？
- □ 构建脚本：是否需要在 `package.json` 中添加 WXML 修复钩子？

### 主动预警话术
| 场景 | 预警 |
|---|---|
| 标签选择器 | ⚠️ 检测到 `div` 标签选择器，这在 WXSS 中不合法，建议改为 Class 选择器如 `.container` |
| @font-face | ⚠️ `@font-face` 在小程序中不支持，建议用 `uni.loadFontFace()` 或 Base64 |
| 换肤 | ⚠️ 请不要在小程序中使用 `var()` 做全局主题，我将生成动态 Class 换肤方案 |
| 构建前/原子类 | ⚠️ 检测到使用了 Tailwind 任意值，将自动生成 WXML 修复脚本配置到构建流程 |
