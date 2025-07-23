# 贡献指南

欢迎来到 Astral 3D 社区！以下是参与贡献的指南：

## 🛠️ 开发流程

### 环境要求
- Node.js 18+
- Yarn

### 代码规范
1. Git 提交信息格式：
   ```
    <type>(<scope>): <subject>
   - type: feat|fix|docs|style|refactor|test|chore
   - scope: Editor|Preview|Home|SDK 等模块范围
   - subject: 50字内简明描述
   ```

2. 前端规范：
   - Vue 组件使用 Composition API
   - TypeScript 严格模式
   - CSS 使用 UnoCSS 原子化方案

## 🐛 问题报告
使用 [GitHub Issues](https://github.com/mlt131220/Astral3DEditor/issues) 时请包含：
1. 环境信息（OS/浏览器/Node版本）
2. 重现步骤
3. 预期与实际行为
4. 相关截图/日志

## ✨ 功能建议
1. 在 Discussions 发起提案讨论
2. 提供使用场景描述
3. 如有原型设计请附示意图

## 🌐 国际化
添加新语言请按以下步骤：
1. 在 `src/language` 创建语言文件
2. 会以文件名作为语言标识符 注册新语言
3. 在 `src/components/setting/common/Locale.vue` 中添加新语言选项
4. 提交 Pull Request 并 @ 维护者

## 🔄 代码提交
1. Fork 仓库并创建特性分支
2. 编写单元测试（重要功能必须包含）
3. 执行代码检查：
   ```bash
   yarn lint
   ```
4. 发起 Pull Request 至 dev 分支

## 🏅 贡献者公约
请遵守 [贡献者公约](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)，我们承诺：
- 友好包容的交流环境
- 尊重不同的开发经验
- 建设性的技术讨论

## 💼 代码所有权
所有贡献代码默认遵循项目 Apache-2.0 协议，作者保留对代码库的最终管理权限。