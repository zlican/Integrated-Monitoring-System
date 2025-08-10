# 交易监控仪表板

一个基于 Vue 3 + TypeScript + Pinia 的实时交易监控系统，支持 CEX 和 DEX 交易数据展示。

## 功能特性

### 🚀 价格监控

- **实时价格数据**: 集成后端 API 获取 BTC 和 ETH 实时价格
- **价格变化指示器**: 显示价格涨跌趋势（↗↘→）
- **自动刷新**: 每 10 秒自动更新价格数据
- **手动刷新**: 支持手动刷新按钮
- **错误处理**: API 失败时自动降级到模拟数据
- **连接状态**: 实时显示后端 API 连接状态

### 📊 趋势分析

- **多时间框架**: 支持 5 分钟、15 分钟、1 小时、4 小时、1 天趋势
- **趋势状态**: 金叉、死叉、多头、空头、盘整等状态显示
- **多币种支持**: BTC、ETH、BNB、SOL、ADA 等主流币种

### 💱 交易监控

- **CEX 交易**: 中心化交易所交易数据
- **DEX 交易**: 去中心化交易所交易数据
- **实时更新**: 模拟实时交易数据流
- **交易详情**: 价格、数量、地址、交易哈希等信息

### 🔧 系统功能

- **响应式设计**: 支持移动端和桌面端
- **状态管理**: 使用 Pinia 进行状态管理
- **错误处理**: 完善的错误处理和用户提示
- **配置管理**: 环境配置和 API 配置分离

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **状态管理**: Pinia
- **构建工具**: Vite
- **样式**: CSS3 + 现代设计

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置后端 API

确保后端服务运行在 `http://127.0.0.1:8081`，并提供以下 API 端点：

- `GET /api/price/btc?format=text` - 获取 BTC 价格
- `GET /api/price/eth?format=text` - 获取 ETH 价格

API 返回格式示例：

```
BTC Price: 118253.20
ETH Price: 3250.45
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/          # Vue组件
│   ├── PriceCard.vue   # 价格监控卡片
│   ├── TrendPanel.vue  # 趋势分析面板
│   ├── TradeList.vue   # 交易列表
│   └── DexInfoPanel.vue # DEX信息面板
├── stores/              # Pinia状态管理
│   ├── market.ts       # 市场数据存储
│   └── trades.ts       # 交易数据存储
├── services/            # API服务
│   └── api.ts          # 价格API服务
├── config/              # 配置文件
│   └── api.ts          # API配置
├── composables/         # 组合式函数
│   ├── usePolling.ts   # 轮询钩子
│   └── useWebSocket.ts # WebSocket钩子
├── utils/               # 工具函数
│   ├── format.ts       # 格式化工具
│   └── color.ts        # 颜色工具
└── types/               # TypeScript类型定义
    └── index.ts        # 类型定义文件
```

## 配置说明

### API 配置 (`src/config/api.ts`)

```typescript
export const API_CONFIG = {
  BASE_URL: "http://127.0.0.1:8081/api",
  REQUEST: {
    TIMEOUT: 10000, // 请求超时时间
    RETRY_ATTEMPTS: 3, // 重试次数
    RETRY_DELAY: 1000, // 重试延迟
  },
  POLLING: {
    PRICE_INTERVAL: 10000, // 价格更新间隔
    STATUS_CHECK_INTERVAL: 30000, // 状态检查间隔
  },
};
```

### 环境配置

系统自动根据 `import.meta.env.DEV` 判断环境：

- **开发环境**: 启用模拟数据作为备用
- **生产环境**: 禁用模拟数据，仅使用真实 API

## 使用说明

### 价格监控

1. **自动更新**: 系统每 10 秒自动从后端 API 获取最新价格
2. **手动刷新**: 点击价格卡片右上角的刷新按钮
3. **价格变化**: 绿色箭头表示上涨，红色箭头表示下跌
4. **连接状态**: 头部显示 API 连接状态和响应时间

### 趋势分析

1. **短线趋势**: 显示 5 分钟、15 分钟、1 小时趋势
2. **长线趋势**: 显示 4 小时、1 天趋势
3. **趋势状态**: 不同颜色表示不同趋势状态

### 交易监控

1. **实时交易**: 系统每 3 秒模拟生成新的交易数据
2. **手动添加**: 使用右下角控制面板添加模拟交易
3. **数据刷新**: 点击"刷新所有数据"按钮

## 开发说明

### 添加新的价格币种

1. 在 `src/types/index.ts` 中扩展 `PriceResp` 接口
2. 在 `src/services/api.ts` 中添加新的价格获取方法
3. 在 `src/stores/market.ts` 中更新价格获取逻辑
4. 在 `src/components/PriceCard.vue` 中添加新的价格显示

### 自定义轮询间隔

修改 `src/config/api.ts` 中的 `POLLING` 配置：

```typescript
POLLING: {
  PRICE_INTERVAL: 5000,  // 改为5秒
  STATUS_CHECK_INTERVAL: 60000,  // 改为1分钟
}
```

### 错误处理

系统内置了完善的错误处理机制：

- API 请求失败时自动降级到模拟数据
- 网络超时自动重试
- 用户友好的错误提示
- 重试按钮支持

## 故障排除

### 常见问题

1. **价格数据不更新**

   - 检查后端 API 是否正常运行
   - 查看浏览器控制台是否有错误信息
   - 确认 API 端点格式正确

2. **API 连接失败**

   - 检查后端服务地址和端口
   - 确认防火墙设置
   - 查看网络连接状态

3. **数据解析错误**
   - 确认 API 返回格式符合预期
   - 检查正则表达式匹配规则
   - 查看后端日志

### 调试模式

开发环境下，系统会输出详细的调试信息：

- API 请求/响应日志
- 错误详情
- 状态变化日志

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
