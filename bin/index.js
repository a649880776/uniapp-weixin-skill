#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const os = require('os')

const SKILL_FILE = path.join(__dirname, '..', 'skills', 'uniapp-weixin-skill', 'SKILL.md')
const CURSOR_RULES = path.join(process.cwd(), '.cursor', 'rules')
const CODEX_PLUGINS = path.join(os.homedir(), '.claude', 'plugins')
const OPENCODE_SKILLS = path.join(process.cwd(), '.opencode', 'skills')

const tool = process.argv[3]
const action = process.argv[2]

if (action !== 'install') {
  console.log(`Usage: npx uniapp-weixin-skill install <tool>
Tools: cursor, codex, opencode-local`)
  process.exit(1)
}

switch (tool) {
  case 'cursor': {
    const dest = path.join(CURSOR_RULES, 'uni-mp-troubleshoot.mdc')
    fs.mkdirSync(CURSOR_RULES, { recursive: true })
    let skill = fs.readFileSync(SKILL_FILE, 'utf-8')
    skill = skill.replace(/^---[\s\S]*?---\s*/, '')
    const mdc = `---
description: UniApp 微信小程序排错指南 — 架构、生命周期、样式、API、真机调试
globs: "**/*.{vue,css,scss,less,wxss,wxml}"
---
${skill}`
    fs.writeFileSync(dest, mdc)
    console.log(`Installed → ${dest}`)
    break
  }
  case 'codex': {
    const dest = path.join(CODEX_PLUGINS, 'uniapp-weixin-skill', 'SKILL.md')
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(SKILL_FILE, dest)
    console.log(`Installed → ${dest}`)
    break
  }
  case 'opencode-local': {
    const dest = path.join(OPENCODE_SKILLS, 'uniapp-weixin-skill', 'SKILL.md')
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(SKILL_FILE, dest)
    console.log(`Installed → ${dest}`)
    break
  }
  default:
    console.log(`Unknown tool: ${tool}
Available: cursor, codex, opencode-local`)
    process.exit(1)
}
