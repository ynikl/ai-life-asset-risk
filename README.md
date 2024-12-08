# AI Life Asset Risk Calculator

利用AI编写的一个基于 Vue 3 的智能资产规划工具，帮助你合理规划人生资产配置。

## ✨ 特性

- 📊 直观的资产趋势图表展示
- 💰 多样化的收入支出管理
- 📈 考虑通货膨胀的实际收益率计算
- 🎯 灵活的目标年龄设定
- 💾 自动保存设置到本地

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 克隆项目
git clone https://github.com/ynikl/ai-life-asset-risk.git

# 进入项目目录
cd ai-life-asset-risk

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🛠️ 技术栈

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Chart.js](https://www.chartjs.org/) - 强大的图表库
- [Element Plus](https://element-plus.org/) - Vue 3 UI 组件库
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

## 📝 主要功能

### 基础设置
- 当前资产设置
- 当前年龄和目标年龄设置
- 预期年化收益率设置
- 预期通货膨胀率设置

### 收入管理
- 工资收入（支持年度增长率）
- 兼职收入
- 自定义收入类型

### 支出管理
- 生活开支（考虑通货膨胀）
- 大额支出
- 购房支出
- 育儿支出

## 📈 收益率计算

资产增值计算采用实际收益率，计算公式：
```javascript
实际年化收益率 = 名义年化收益率 - 通货膨胀率
月度收益率 = (1 + 实际年化收益率)^(1/12) - 1
```

## 📄 许可证

[MIT](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
