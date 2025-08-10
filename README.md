# 交易一体化监控系统

## 功能概述

本系统是一个完整的交易监控平台，包含以下主要功能：

### 1. 价格监控
- 实时BTC和ETH价格显示
- 自动刷新（10秒间隔）

### 2. 趋势分析
#### 短线趋势分析（A类型）
- 时间框架：5分钟、15分钟、1小时
- 5M和15M：使用EMA指标（金叉/死叉）
- 1H：使用趋势方向（多/空/盘整）
- 自动刷新（1分钟间隔）

#### 长线趋势分析（C类型）
- 时间框架：4小时、1天、3天
- 支持EMA指标（金叉/死叉）和趋势方向（多/空/盘整）
- 自动刷新（5分钟间隔）

### 3. 交易监控
- CEX交易列表
- DEX交易列表
- DEX信息面板

## 技术架构

### 前端技术栈
- Vue 3 + TypeScript
- Pinia状态管理
- Vite构建工具

### 后端API
- 价格API：`http://127.0.0.1:8081/api/price/{symbol}?format=text`
- 趋势API：`http://127.0.0.1:8080/api/trend/{symbol}?interval={interval}&format=text`

### 数据流
1. API服务层（`src/services/api.ts`）
2. 状态管理（`src/stores/market.ts`）
3. 组件展示（`src/components/TrendPanel.vue`）

## 趋势分析实现

### 短线趋势（5M、15M、1H）
- 5M和15M：使用EMA指标，返回UPEMA/DOWNEMA，映射为golden/dead（金叉/死叉）
- 1H：使用趋势方向，返回UP/DOWN/RANGE，映射为bull/bear/flat（多/空/盘整）

### 长线趋势（4H、1D、3D）
- 所有时间框架：支持EMA指标和趋势方向
- EMA指标：UPEMA→golden（金叉），DOWNEMA→dead（死叉）
- 趋势方向：UP→bull（多），DOWN→bear（空），RANGE→flat（盘整）
- 状态映射优先级：EMA指标 > 趋势方向

## 使用方法

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 配置说明

### API配置
- 开发环境：`http://127.0.0.1:8081/api`
- 生产环境：可配置

### 轮询间隔
- 价格：10秒
- 短线趋势：1分钟
- 长线趋势：5分钟
- 状态检查：30秒

## 注意事项

1. 确保后端API服务正常运行
2. 短线趋势和长线趋势都支持EMA指标（金叉/死叉）
3. 系统会自动降级到模拟数据作为备用
4. 支持BTC和ETH两个主要交易对