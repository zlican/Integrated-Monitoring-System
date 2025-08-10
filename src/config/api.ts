// API配置文件
export const API_CONFIG = {
  // 基础URL
  BASE_URL: 'http://127.0.0.1:8081/api',
  
  // 价格API端点
  PRICE: {
    BTC: '/price/btc',
    ETH: '/price/eth'
  },
  
  // 趋势分析API端点
  TREND: {
    BTC: {
      '1h': '/trend/btc?interval=1h&format=text',
      '15m': '/trend/btc?interval=15m&format=text',
      '5m': '/trend/btc?interval=5m&format=text'
    },
    ETH: {
      '1h': '/trend/eth?interval=1h&format=text',
      '15m': '/trend/eth?interval=15m&format=text',
      '5m': '/trend/eth?interval=5m&format=text'
    }
  },
  
  // 请求配置
  REQUEST: {
    TIMEOUT: 10000, // 10秒超时
    RETRY_ATTEMPTS: 3, // 重试次数
    RETRY_DELAY: 1000, // 重试延迟（毫秒）
  },
  
  // 轮询配置
  POLLING: {
    PRICE_INTERVAL: 10000, // 价格更新间隔（10秒）
    TREND_INTERVAL: 5000,  // 趋势更新间隔（5秒）
    STATUS_CHECK_INTERVAL: 30000, // 状态检查间隔（30秒）
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    NETWORK_ERROR: '网络连接失败',
    TIMEOUT_ERROR: '请求超时',
    PARSE_ERROR: '数据解析失败',
    API_ERROR: 'API服务错误',
    UNKNOWN_ERROR: '未知错误'
  }
};

// 环境配置
export const ENV_CONFIG = {
  // 开发环境
  DEVELOPMENT: {
    API_BASE_URL: 'http://127.0.0.1:8081/api',
    ENABLE_MOCK: true, // 启用模拟数据作为备用
    LOG_LEVEL: 'debug'
  },
  
  // 生产环境
  PRODUCTION: {
    API_BASE_URL: 'https://your-production-api.com/api',
    ENABLE_MOCK: false, // 生产环境禁用模拟数据
    LOG_LEVEL: 'error'
  }
};

// 获取当前环境配置
export const getCurrentConfig = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? ENV_CONFIG.DEVELOPMENT : ENV_CONFIG.PRODUCTION;
};
