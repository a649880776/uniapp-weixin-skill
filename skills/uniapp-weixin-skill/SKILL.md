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


## 七、排查工作流


收到报错时，按此顺序排查：
1. 看控制台报错 → 定位文件行号
2. 判断是否使用了浏览器专有 API（fetch/window/document）
3. 判断是否 H5 代码未用 #ifdef MP-WEIXIN 隔离
4. 检查 pages.json 路径、组件注册
5. 用真机调试抓运行时堆栈
6. 逐个注释可疑代码块缩小范围


给出修复方案时，优先提供**状态驱动**的写法，避免命令式 DOM/ref 操作；
涉及样式的，提醒用户**真机验证**（很多 bug 模拟器不出现）。