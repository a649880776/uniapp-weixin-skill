# uniapp-weixin-skill

uni-app 编译到微信小程序（mp-weixin）的排错指南。涵盖双线程架构、生命周期、样式布局、API 差异、真机调试等场景的系统化排查方案。

## 技能能力

| 章节 | 内容 |
|---|---|
| 一、架构级认知 | 双线程模型、状态驱动 vs 命令式操作、高频踩坑现象 |
| 二、生命周期与时序 | onLoad/onShow/onReady/mounted 执行顺序、网络监听 |
| 三、样式与布局坑 | 全屏覆盖、iOS margin 失效、时间格式化、rpx/px 计算、checkbox/radio、backdrop-filter |
| 四、API 与运行时差异 | fetch/DOM 不可用、存储限制、动态引入、disabled 布尔值陷阱、AppSecret 安全 |
| 五、编译与环境 | Node.js 版本、条件编译、环境变量注入、dev/prod API 地址分离 |
| 六、真机调试专项 | iOS 白屏、AppSecret 暴露、HTTP 证书 |
| 七、样式安全规则（编码约束） | 选择器白名单、@font-face、var() 换肤、::v-deep 穿透、原子化 CSS 转义、平台条件编译 |
| 八、构建兜底与主动防御 | WXSS/WXML 构建修复脚本、styleIsolation 配置 |
| 九、排查与自查工作流 | 排查顺序、AI 自查 6 项清单、主动预警话术 |

## 安装

```bash
npm install uniapp-weixin-skill
```

### 项目安装（OpenCode 自动发现）

```bash
npm install uniapp-weixin-skill
```

OpenCode 自动从 `node_modules` 发现并加载本 skill，无需额外配置。

### 全局安装（供多个工具使用）

```bash
npm install -g uniapp-weixin-skill
```

再用 CLI 部署到对应工具：

```bash
# OpenCode → ~/.config/opencode/skills/
npx uniapp-weixin-skill install opencode

# Cursor → 项目 .cursor/rules/
npx uniapp-weixin-skill install cursor

# Claude Code (Codex) → ~/.claude/plugins/
npx uniapp-weixin-skill install codex
```

## 构建修复脚本

在 `package.json` 中串联执行：

```json
{
  "scripts": {
    "build:mp-weixin": "uni build -p mp-weixin && node scripts/fix-wxss.js && node scripts/fix-wxml.js"
  }
}
```

需要安装 `glob` 依赖：

```bash
npm install --save-dev glob
```

## License

MIT
