# uniapp-weixin-skill

uni-app 编译到微信小程序（mp-weixin）的排错 Skill。

## 解决的问题

uni-app 编译到微信小程序时，由于小程序的**双线程架构**（逻辑层 JS ↔ 视图层 WXML，通过 setData 通信，禁用 DOM），H5 正常的代码在小程序端经常出现问题。本 skill 提供系统化的排查指南，覆盖：

- **架构级认知** — 双线程模型、状态驱动 vs 命令式操作
- **生命周期与时序** — onLoad/onShow/onReady/mounted 执行顺序
- **样式与布局坑** — 全屏覆盖、iOS margin-bottom、时间格式化、rpx/px 计算等
- **API 与运行时差异** — fetch/DOM 不可用、存储限制、动态引入、条件编译
- **真机调试专项** — iOS 白屏、AppSecret 泄露、HTTP 协议合规
- **排查工作流** — 按步骤定位问题

## 安装

```bash
npm install uniapp-weixin-skill
```

opencode 会自动发现已安装 npm 包中的 skill。

## 使用

在 opencode 中加载本 skill 后，当遇到以下问题时自动启用：

- 编译报错
- 真机白屏
- 样式错乱
- API 不生效
- iOS/Android 差异
- 生命周期时序问题

## 命令

```
/uni-mp-troubleshoot   手动触发微信小程序排错
```

## License

MIT