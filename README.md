# uniapp-weixin-skill

uni-app 编译到微信小程序（mp-weixin）的排错指南。涵盖双线程架构、生命周期、样式布局、API 差异、真机调试等场景的系统化排查方案。

## 安装

```bash
npm install uniapp-weixin-skill
```

包内容：

| 路径 | 用途 |
|---|---|
| `skills/uniapp-weixin-skill/SKILL.md` | 主技能文件 |
| `scripts/fix-wxss.js` | 构建后修复 WXSS 兼容性（\*、@font-face、var()、转义类名） |
| `scripts/fix-wxml.js` | 构建后修复 WXML 中转义双引号 |
| `bin/index.js` | 多工具安装 CLI `npx uniapp-weixin-skill install <tool>` |

## 各工具安装方式

### OpenCode（自动发现）

安装后 OpenCode 自动从 `node_modules` 发现并加载本 skill，无需额外操作。

### Cursor

```bash
npx uniapp-weixin-skill install cursor
```

在项目 `.cursor/rules/` 下生成 `uni-mp-troubleshoot.mdc`，编辑 `.vue`/`.css`/`.scss`/`.less`/`.wxss`/`.wxml` 文件时自动激活。

### Claude Code (Codex)

```bash
npx uniapp-weixin-skill install codex
```

复制到 `~/.claude/plugins/uniapp-weixin-skill/SKILL.md`。

### OpenCode（项目本地副本）

```bash
npx uniapp-weixin-skill install opencode-local
```

复制到项目 `.opencode/skills/uniapp-weixin-skill/SKILL.md`，用于不依赖 npm 的场景。

## 用法

本 skill 在检测到 `uni-app` / `mp-weixin` / `小程序` 相关上下文时自动激活。包含：

- **七、样式安全规则** — CSS/SCSS/Less 编码约束（选择器白名单、字体、主题、穿透、原子化 CSS 转义）
- **八、构建兜底与主动防御** — `fix-wxss.js` + `fix-wxml.js` 构建脚本、`styleIsolation` 配置
- **九、排查与自查工作流** — 排查顺序、AI 自查 6 项清单、主动预警话术

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
